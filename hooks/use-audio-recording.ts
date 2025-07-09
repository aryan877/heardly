"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAudioDevices } from "./use-audio-devices";

export interface AudioRecordingHook {
  isRecording: boolean;
  isPaused: boolean;
  transcript: string;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  duration: number;
}

interface UseAudioRecordingOptions {
  onRecordingStop?: (transcript: string, duration: number) => void;
}

export const useAudioRecording = (options: UseAudioRecordingOptions = {}) => {
  const { onRecordingStop } = options;
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [duration, setDuration] = useState(0);

  const { selectedDeviceId } = useAudioDevices();

  const socketRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<AudioWorkletNode | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (processorRef.current) {
        processorRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      console.log(
        "Attempting to start recording with device:",
        selectedDeviceId
      );
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      setTranscript("");

      const response = await fetch("/api/assemblyai-token");
      const { token } = await response.json();

      // Create WebSocket connection to Universal Streaming API v3
      const socket = new WebSocket(
        `wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&encoding=pcm_s16le&token=${token}`
      );

      socketRef.current = socket;

      let runningTranscript = "";

      socket.onopen = async () => {
        console.log("WebSocket connection opened");

        // Get microphone access with selected device
        const constraints = {
          audio: {
            deviceId: selectedDeviceId
              ? { exact: selectedDeviceId }
              : undefined,
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        };

        console.log("Using audio constraints:", constraints);

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        // Log which device is actually being used
        const track = stream.getAudioTracks()[0];
        console.log("Using audio device:", track.label, track.getSettings());

        // Create AudioContext and processor
        const audioContext = new AudioContext({ sampleRate: 16000 });
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        await audioContext.audioWorklet.addModule("/audio-processor.js");
        const processor = new AudioWorkletNode(audioContext, "audio-processor");
        processorRef.current = processor;

        processor.port.onmessage = (event) => {
          if (socket.readyState === WebSocket.OPEN && !isPaused) {
            console.log("Sending audio data to WebSocket");
            // Send the raw binary data directly
            socket.send(event.data.audioData);
          }
        };

        source.connect(processor);
        processor.connect(audioContext.destination);

        // Start duration timer
        const startTime = Date.now();
        intervalRef.current = setInterval(() => {
          if (!isPaused) {
            setDuration(Math.floor((Date.now() - startTime) / 1000));
          }
        }, 1000);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received message:", data);

          if (data.type === "Begin") {
            console.log(`Session started: ${data.id}`);
            return;
          }

          if (data.type === "Turn") {
            const currentTranscript = data.transcript || "";

            if (data.end_of_turn) {
              // Final transcript - add to running transcript
              runningTranscript +=
                (runningTranscript ? " " : "") + currentTranscript;
              setTranscript(runningTranscript);
              console.log("Final transcript:", runningTranscript);
            } else {
              // Partial transcript - show live updates
              const liveTranscript =
                runningTranscript +
                (runningTranscript ? " " : "") +
                currentTranscript;
              setTranscript(liveTranscript);
              console.log("Partial transcript:", liveTranscript);
            }
            return;
          }

          if (data.type === "Termination") {
            console.log("Session terminated");
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socket.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        socketRef.current = null;
      };
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
    }
  }, [isPaused, selectedDeviceId]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setIsPaused(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (socketRef.current) {
      // Send termination message before closing
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "Terminate" }));
      }
      socketRef.current.close();
      socketRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (onRecordingStop) {
      onRecordingStop(transcript, duration);
    }
  }, [transcript, duration, onRecordingStop]);

  const pauseRecording = useCallback(() => {
    if (isRecording && !isPaused) {
      setIsPaused(true);
      if (audioContextRef.current) {
        audioContextRef.current.suspend();
      }
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(() => {
    if (isRecording && isPaused) {
      setIsPaused(false);
      if (audioContextRef.current) {
        audioContextRef.current.resume();
      }
    }
  }, [isRecording, isPaused]);

  return {
    isRecording,
    isPaused,
    transcript,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    duration,
  };
};
