"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mic, Pause, Play, StopCircle } from "lucide-react";

interface RecordingCardProps {
  callStatus: "draft" | "recording" | "processing" | "completed";
  isRecording: boolean;
  duration: number;
  transcript: string;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  isPaused: boolean;
}

export function RecordingCard({
  callStatus,
  isRecording,
  duration,
  transcript,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  isPaused,
}: RecordingCardProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
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
        {callStatus === "draft" && !isRecording && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground">
              Click the button to start recording your conversation for
              transcription and analysis.
            </p>
            <Button onClick={onStartRecording}>
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          </div>
        )}

        {isRecording && (
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-6">
              <Button
                variant={isPaused ? "outline" : "secondary"}
                size="icon"
                className="rounded-full h-16 w-16"
                onClick={onPauseRecording}
              >
                {isPaused ? (
                  <Play className="h-6 w-6" />
                ) : (
                  <Pause className="h-6 w-6" />
                )}
              </Button>
              <div className="text-center">
                <p className="text-sm text-red-500 font-semibold mb-1">
                  Recording
                </p>
                <p className="text-4xl font-bold tracking-wider">
                  {formatTime(duration)}
                </p>
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="rounded-full h-16 w-16"
                onClick={onStopRecording}
              >
                <StopCircle className="h-6 w-6" />
              </Button>
            </div>
            {transcript && (
              <div className="w-full text-center text-muted-foreground p-4 bg-muted rounded-md">
                <p className="leading-relaxed">{transcript}</p>
              </div>
            )}
          </div>
        )}

        {callStatus === "completed" && (
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-muted-foreground">Recording completed.</p>
          </div>
        )}

        {callStatus === "processing" && (
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-muted-foreground">Recording completed.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
