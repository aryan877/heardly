"use client"

import { useState, useRef, useCallback } from "react"

export interface AudioRecordingHook {
  isRecording: boolean
  transcript: string
  audioBlob: Blob | null
  startRecording: () => Promise<void>
  stopRecording: () => void
  duration: number
}

export const useAudioRecording = (onTranscriptUpdate?: (text: string) => void): AudioRecordingHook => {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [duration, setDuration] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const durationIntervalRef = useRef<NodeJS.Timeout>()
  const transcriptIntervalRef = useRef<NodeJS.Timeout>()

  // Simulated transcription phrases for demo
  const samplePhrases = [
    "Hello, thank you for joining the call today.",
    "Let's start by reviewing the agenda for this meeting.",
    "I think we should focus on the key deliverables first.",
    "Can you walk us through the current progress?",
    "That's a great point, let me make a note of that.",
    "We'll need to follow up on this action item.",
    "I agree with that approach, it makes sense.",
    "Let's schedule a follow-up meeting next week.",
    "Thank you everyone for your time today.",
    "I'll send out the meeting notes shortly.",
  ]

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })

      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current.start(1000) // Collect data every second
      setIsRecording(true)
      setDuration(0)
      setTranscript("")

      // Start duration counter
      durationIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)

      // Simulate real-time transcription for demo
      transcriptIntervalRef.current = setInterval(() => {
        const randomPhrase = samplePhrases[Math.floor(Math.random() * samplePhrases.length)]
        setTranscript((prev) => {
          const newTranscript = prev + (prev ? " " : "") + randomPhrase
          onTranscriptUpdate?.(randomPhrase)
          return newTranscript
        })
      }, 3000)
    } catch (error) {
      console.error("Error starting recording:", error)
      throw error
    }
  }, [onTranscriptUpdate])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
    }

    if (transcriptIntervalRef.current) {
      clearInterval(transcriptIntervalRef.current)
    }
  }, [isRecording])

  return {
    isRecording,
    transcript,
    audioBlob,
    duration,
    startRecording,
    stopRecording,
  }
}
