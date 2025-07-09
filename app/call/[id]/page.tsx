"use client";

import { CallHistorySidebar } from "@/components/call-history-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarInset } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAISummarization } from "@/hooks/use-ai-summarization";
import { useAudioRecording } from "@/hooks/use-audio-recording";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Mic,
  MicOff,
  Play,
  Square,
  Wand2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CallPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CallPage({ params }: CallPageProps) {
  const router = useRouter();
  const [callId, setCallId] = useState<string | null>(null);
  const [activeCallId, setActiveCallId] = useState<Id<"calls"> | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Handle async params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setCallId(resolvedParams.id);
      setActiveCallId(resolvedParams.id as Id<"calls">);
    };
    getParams();
  }, [params]);

  // Check authentication status first
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();

  // Get the specific call
  const call = useQuery(
    api.calls.get,
    isAuthenticated && callId ? { id: callId as Id<"calls"> } : "skip"
  );

  const updateCall = useMutation(api.calls.update);

  // Custom hooks
  const { summary, isGenerating, generateSummary } = useAISummarization();
  const { isRecording, transcript, duration, startRecording, stopRecording } =
    useAudioRecording();

  // Save summary when generated
  useEffect(() => {
    if (summary && !isGenerating && activeCallId) {
      updateCall({
        id: activeCallId,
        summary,
      }).catch(console.error);
    }
  }, [summary, isGenerating, activeCallId, updateCall]);

  // Show loading for auth or params resolution
  if (authLoading || !callId) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">Loading call...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect
  if (!isAuthenticated) {
    router.push("/auth");
    return null;
  }

  // If call not found
  if (call === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <div className="text-center">
          <p className="text-muted-foreground mb-4 text-lg">Call not found</p>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Show a minimal loading state while call is being fetched, but still show the basic layout
  const isLoading = call === undefined;

  const handleCallSelect = (callId: Id<"calls">) => {
    setActiveCallId(callId);
    router.push(`/call/${callId}`);
  };

  const handleStartRecording = async () => {
    if (!activeCallId) return;

    try {
      await startRecording();
      await updateCall({
        id: activeCallId,
        status: "recording",
      });
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const handleStopRecording = async () => {
    if (!activeCallId) return;

    stopRecording();
    setIsPaused(false);

    if (transcript) {
      try {
        await updateCall({
          id: activeCallId,
          transcript,
          duration,
          status: "completed",
        });
      } catch (error) {
        console.error("Failed to update call:", error);
      }
    }
  };

  const handlePauseRecording = () => {
    setIsPaused(!isPaused);
  };

  const handleGenerateSummary = async () => {
    const textToSummarize = transcript || call?.transcript;
    if (!textToSummarize) return;

    await generateSummary(textToSummarize);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const displayTranscript = transcript || call?.transcript || "";
  const displaySummary = summary || call?.summary || "";

  return (
    <>
      <CallHistorySidebar
        activeCallId={activeCallId}
        onCallSelect={handleCallSelect}
      />

      <SidebarInset>
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                {!isLoading && (
                  <Badge
                    variant={
                      call.status === "draft"
                        ? "secondary"
                        : call.status === "recording"
                        ? "destructive"
                        : call.status === "processing"
                        ? "secondary"
                        : "default"
                    }
                  >
                    {call.status}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {isLoading ? "Loading call..." : call.title}
              </h1>
              {!isLoading && (
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(call._creationTime).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(call._creationTime).toLocaleTimeString()}
                    </span>
                  </div>
                  {(duration > 0 || call.duration) && (
                    <div className="flex items-center space-x-1">
                      <span>
                        Duration: {formatTime(duration || call.duration || 0)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recording Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Voice Recording
                </CardTitle>
                <CardDescription>
                  Record your conversation for transcription and analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-6">
                  {/* Recording Controls */}
                  <div className="flex items-center space-x-4">
                    {!isRecording ? (
                      <Button
                        onClick={handleStartRecording}
                        size="lg"
                        className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 text-white"
                        disabled={call?.status === "completed" || isLoading}
                      >
                        <Mic className="h-6 w-6" />
                      </Button>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <Button
                          onClick={handlePauseRecording}
                          size="lg"
                          variant="outline"
                          className="h-12 w-12 rounded-full"
                        >
                          {isPaused ? (
                            <Play className="h-5 w-5" />
                          ) : (
                            <MicOff className="h-5 w-5" />
                          )}
                        </Button>
                        <Button
                          onClick={handleStopRecording}
                          size="lg"
                          className="h-12 w-12 rounded-full bg-gray-500 hover:bg-gray-600 text-white"
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Recording Status */}
                  <div className="text-center">
                    {isRecording ? (
                      <div className="space-y-2">
                        <Badge variant={isPaused ? "secondary" : "destructive"}>
                          {isPaused ? "Paused" : "Recording"}
                        </Badge>
                        <div className="text-2xl font-mono text-foreground">
                          {formatTime(duration)}
                        </div>
                      </div>
                    ) : call?.status === "completed" ? (
                      <p className="text-muted-foreground">
                        Recording completed
                      </p>
                    ) : (
                      <p className="text-muted-foreground">
                        Click the microphone to start recording
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transcript Card */}
            {displayTranscript && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Transcript
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={displayTranscript}
                    readOnly
                    className="min-h-[200px] resize-none"
                    placeholder="Transcript will appear here as you speak..."
                  />
                </CardContent>
              </Card>
            )}

            {/* Summary Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    AI Summary
                  </CardTitle>
                  <Button
                    onClick={handleGenerateSummary}
                    disabled={!displayTranscript || isGenerating}
                    size="sm"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        {displaySummary ? "Regenerate" : "Generate"} Summary
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {displaySummary ? (
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-sm">
                      {displaySummary}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    {!displayTranscript
                      ? "Complete your recording to generate a summary"
                      : "Click 'Generate Summary' to analyze your conversation"}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </>
  );
}
