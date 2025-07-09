"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { useAISummarization } from "./use-ai-summarization";
import { useAudioRecording } from "./use-audio-recording";

export const useCall = (callId: Id<"calls">) => {
  const call = useQuery(api.calls.get, { id: callId });
  const updateCall = useMutation(api.calls.update);

  const { summary, isGenerating, generateSummary } = useAISummarization();

  const handleRecordingStop = async (transcript: string) => {
    await updateCall({
      id: callId,
      status: "completed",
      duration,
      transcript,
    });
  };

  const { isRecording, transcript, duration, startRecording, stopRecording } =
    useAudioRecording({ onRecordingStop: handleRecordingStop });

  useEffect(() => {
    if (transcript) {
      updateCall({ id: callId, transcript });
    }
  }, [transcript, callId, updateCall]);

  const handleStartRecording = async () => {
    await startRecording();
    await updateCall({ id: callId, status: "recording" });
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleGenerateSummary = async () => {
    if (!call?.transcript) return;
    const fullSummary = await generateSummary(call.transcript);
    await updateCall({ id: callId, summary: fullSummary });
  };

  return {
    call,
    isRecording,
    transcript: call?.transcript || transcript,
    duration,
    summary: call?.summary || summary,
    isGeneratingSummary: isGenerating,
    handleStartRecording,
    handleStopRecording,
    handleGenerateSummary,
  };
};
