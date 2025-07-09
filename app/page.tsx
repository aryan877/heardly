"use client";

import { AuthSignIn } from "@/components/auth-signin";
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
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useConvexAuth, useQuery } from "convex/react";
import {
  Calendar,
  Clock,
  FileText,
  Mic,
  MicOff,
  Phone,
  Play,
  Plus,
  Square,
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeCallId, setActiveCallId] = useState<Id<"calls"> | null>(null);

  // Check authentication status first
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();

  // Only run the query if authenticated
  const calls = useQuery(
    api.calls.getCalls,
    isAuthenticated ? undefined : "skip"
  );

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, the middleware should have redirected.
  // This is a fallback.
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <AuthSignIn />
      </div>
    );
  }

  // If calls query is still loading after auth is checked
  if (calls === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading calls...</p>
        </div>
      </div>
    );
  }

  const handleStartRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    // Start recording logic here
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    // Stop recording logic here
  };

  const handlePauseRecording = () => {
    setIsPaused(!isPaused);
    // Pause/resume recording logic here
  };

  const handleCallSelect = (callId: Id<"calls">) => {
    setActiveCallId(callId);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const recentCalls = calls.slice(0, 3);

  return (
    <div className="flex h-full bg-background">
      <CallHistorySidebar
        activeCallId={activeCallId}
        onCallSelect={handleCallSelect}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back
              </h1>
              <p className="text-muted-foreground">
                Record and analyze your conversations with AI-powered insights
              </p>
            </div>

            {/* Recording Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Voice Recording
                </CardTitle>
                <CardDescription>
                  Start recording your conversation for transcription and
                  analysis
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
                            <MicOff className="h-5 w-s" />
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
                          {formatTime(recordingTime)}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        Click the microphone to start recording
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Calls */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Recent Calls
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentCalls.length === 0 ? (
                  <div className="text-center py-8">
                    <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No calls yet</p>
                    <p className="text-sm text-muted-foreground">
                      Start recording to see your calls here
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {recentCalls.map((call) => (
                      <li
                        key={call._id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {call.summary || "Call Summary"}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(
                                  call._creationTime
                                ).toLocaleDateString()}
                              </span>
                              <Clock className="h-4 w-4" />
                              <span>
                                {new Date(
                                  call._creationTime
                                ).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCallSelect(call._id)}
                        >
                          View
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
