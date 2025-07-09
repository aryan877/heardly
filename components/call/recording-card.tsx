"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Doc } from "@/convex/_generated/dataModel";
import { Mic, MicOff, Play, Square } from "lucide-react";

interface RecordingCardProps {
  callStatus: Doc<"calls">["status"];
  isRecording: boolean;
  duration: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPauseRecording: () => void; // Assuming a pause feature might be added later
  isPaused: boolean;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

export const RecordingCard = ({
  callStatus,
  isRecording,
  duration,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  isPaused,
}: RecordingCardProps) => {
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
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center space-x-4">
            {!isRecording ? (
              <Button
                onClick={onStartRecording}
                size="lg"
                className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 text-white"
                disabled={callStatus === "completed"}
              >
                <Mic className="h-6 w-6" />
              </Button>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  onClick={onPauseRecording}
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
                  onClick={onStopRecording}
                  size="lg"
                  className="h-12 w-12 rounded-full bg-gray-500 hover:bg-gray-600 text-white"
                >
                  <Square className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
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
            ) : callStatus === "completed" ? (
              <p className="text-muted-foreground">Recording completed</p>
            ) : (
              <p className="text-muted-foreground">
                Click the microphone to start recording
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
