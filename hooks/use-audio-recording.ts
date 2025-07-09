"use client";

import { StreamingTranscriber } from "assemblyai";
import { useCallback, useRef, useState } from "react";

export interface AudioRecordingHook {
  isRecording: boolean;
  transcript: string;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  duration: number;
}

interface UseAudioRecordingOptions {
  onRecordingStop?: (transcript: string) => void;
}

export const useAudioRecording = (
  options: UseAudioRecordingOptions = {}
): AudioRecordingHook => {
  const { onRecordingStop } = options;
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const transcriberRef = useRef<StreamingTranscriber | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fullTranscriptRef = useRef<string>("");

  const stopTranscriptionService = useCallback(() => {
    if (transcriberRef.current) {
      transcriberRef.current.close();
      transcriberRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (isRecording) {
      console.warn("Recording is already in progress.");
      return;
    }

    setTranscript("");
    fullTranscriptRef.current = "";

    try {
      const response = await fetch("/api/assemblyai-token");
      const data = await response.json();

      if (!data.token) {
        throw new Error("Failed to get AssemblyAI token");
      }

      const transcriber = new StreamingTranscriber({
        token: data.token,
        sampleRate: 16000,
      });

      transcriber.on("open", ({ id, expires_at }) => {
        console.log(
          `AssemblyAI session opened with ID: ${id}`,
          "Expires at:",
          expires_at
        );
      });

      transcriber.on("error", (error: Error) => {
        console.error("AssemblyAI Error:", error);
        stopTranscriptionService();
      });

      transcriber.on("close", (code: number, reason: string) => {
        console.log("AssemblyAI session closed:", code, reason);
      });

      transcriber.on("turn", ({ transcript }) => {
        if (transcript) {
          fullTranscriptRef.current = transcript;
          setTranscript(transcript);
        }
      });

      await transcriber.connect();
      transcriberRef.current = transcriber;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (event.data.size > 0 && transcriberRef.current) {
          const buffer = await event.data.arrayBuffer();
          transcriber.sendAudio(buffer);
        }
      };

      mediaRecorderRef.current.start(250);

      setIsRecording(true);
      setDuration(0);

      durationIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      stopTranscriptionService();
      throw error;
    }
  }, [isRecording, stopTranscriptionService]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
    }

    stopTranscriptionService();

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    onRecordingStop?.(fullTranscriptRef.current);
  }, [isRecording, stopTranscriptionService, onRecordingStop]);

  return {
    isRecording,
    transcript,
    duration,
    startRecording,
    stopRecording,
  };
};
