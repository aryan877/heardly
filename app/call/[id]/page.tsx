"use client";

import { CallHistorySidebar } from "@/components/call-history-sidebar";
import { RecordingCard } from "@/components/call/recording-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import type { Id } from "@/convex/_generated/dataModel";
import { useCall } from "@/hooks/use-call";
import { useConvexAuth } from "convex/react";
import { ArrowLeft, Calendar, Clock, FileText, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { use } from "react";

interface CallPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CallPage({ params }: CallPageProps) {
  const router = useRouter();
  const { id: callId } = use(params);
  const activeCallId = callId as Id<"calls">;

  // Check authentication status first
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();

  // If not authenticated, redirect
  if (!isAuthenticated && !authLoading) {
    router.push("/auth");
    return null;
  }

  // Custom hook for call logic
  const {
    call,
    isRecording,
    isPaused,
    transcript,
    duration,
    summary,
    isGeneratingSummary,
    availableDevices,
    selectedDeviceId,
    setSelectedDevice,
    handleStartRecording,
    handleStopRecording,
    handleGenerateSummary,
    handleTogglePause,
  } = useCall(activeCallId);

  // Show loading for auth or if call is initially loading
  if (authLoading || call === undefined) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">Loading call...</p>
        </div>
      </div>
    );
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

  const handleCallSelect = (selectedCallId: Id<"calls">) => {
    router.push(`/call/${selectedCallId}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const displayTranscript = transcript || "";
  const displaySummary = summary || "";

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
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {call.title}
              </h1>
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
                {(duration > 0 ||
                  (call && call.duration && call.duration > 0)) && (
                  <div className="flex items-center space-x-1">
                    <span>
                      Duration: {formatTime(duration || call.duration || 0)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <RecordingCard
              callStatus={call.status}
              isRecording={isRecording}
              duration={duration}
              transcript={displayTranscript}
              availableDevices={availableDevices}
              selectedDeviceId={selectedDeviceId}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              onPauseRecording={handleTogglePause}
              onDeviceSelect={setSelectedDevice}
              isPaused={isPaused}
            />

            {/* Transcript Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Transcript
                </CardTitle>
              </CardHeader>
              <CardContent>
                {displayTranscript ? (
                  <Textarea
                    value={displayTranscript}
                    readOnly
                    className="min-h-[200px] resize-none"
                    placeholder="Transcript will appear here as you speak..."
                  />
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    {isRecording
                      ? "Listening..."
                      : "Your transcript will appear here after the recording."}
                  </p>
                )}
              </CardContent>
            </Card>

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
                    disabled={!displayTranscript || isGeneratingSummary}
                    size="sm"
                  >
                    {isGeneratingSummary ? (
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
                {isGeneratingSummary && !displaySummary ? (
                  <p className="text-muted-foreground text-center py-8">
                    Generating your summary...
                  </p>
                ) : displaySummary ? (
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
