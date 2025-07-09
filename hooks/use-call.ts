"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect } from "react";
import { useAISummarization } from "./use-ai-summarization";
import { useAudioDevices } from "./use-audio-devices";
import { useAudioRecording } from "./use-audio-recording";

export const useCall = (callId: Id<"calls">) => {
  const call = useQuery(api.calls.get, { id: callId });
  const updateCall = useMutation(api.calls.update);

  const { summary, isGenerating, generateSummary } = useAISummarization();
  const { availableDevices, selectedDeviceId, setSelectedDevice } =
    useAudioDevices();

  const {
    isRecording,
    transcript,
    duration,
    startRecording,
    stopRecording,
    isPaused,
    pauseRecording,
    resumeRecording,
  } = useAudioRecording({
    onRecordingStop: useCallback(
      (transcript: string, duration: number) => {
        updateCall({
          id: callId,
          status: "completed",
          duration,
          transcript,
        });
      },
      [callId, updateCall]
    ),
  });

  useEffect(() => {
    if (summary && !isGenerating) {
      updateCall({ id: callId, summary });
    }
  }, [summary, isGenerating, callId, updateCall]);

  const handleStartRecording = async () => {
    await startRecording();
    await updateCall({ id: callId, status: "recording" });
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleTogglePause = () => {
    if (isPaused) {
      resumeRecording();
    } else {
      pauseRecording();
    }
  };

  const handleGenerateSummary = async () => {
    if (!call?.transcript) return;
    await generateSummary(call.transcript);
  };

  return {
    call,
    isRecording,
    isPaused,
    transcript: transcript || call?.transcript,
    duration,
    summary: summary || call?.summary,
    isGeneratingSummary: isGenerating,
    availableDevices,
    selectedDeviceId,
    setSelectedDevice,
    handleStartRecording,
    handleStopRecording,
    handleGenerateSummary,
    handleTogglePause,
  };
};
