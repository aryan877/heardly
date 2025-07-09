"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AudioDevice } from "@/hooks/use-audio-devices";
import { Headphones, Mic, Pause, Play, StopCircle } from "lucide-react";

interface RecordingCardProps {
  callStatus: "draft" | "recording" | "processing" | "completed";
  isRecording: boolean;
  duration: number;
  transcript: string;
  availableDevices: AudioDevice[];
  selectedDeviceId: string;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  onDeviceSelect: (deviceId: string) => void;
  isPaused: boolean;
}

export function RecordingCard({
  callStatus,
  isRecording,
  duration,
  transcript,
  availableDevices,
  selectedDeviceId,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onDeviceSelect,
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
            {/* Audio Device Selector */}
            <div className="w-full max-w-md space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Headphones className="h-4 w-4" />
                Audio Input Device
              </label>
              <Select value={selectedDeviceId} onValueChange={onDeviceSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select microphone..." />
                </SelectTrigger>
                <SelectContent>
                  {availableDevices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Supports headphones, earbuds, external mics, and built-in
                microphones
              </p>
            </div>

            <p className="text-muted-foreground text-center">
              Click the button to start recording your conversation for
              transcription and analysis.
            </p>
            <Button onClick={onStartRecording} disabled={!selectedDeviceId}>
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          </div>
        )}

        {isRecording && (
          <div className="flex flex-col items-center gap-6">
            {/* Show selected device info */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Headphones className="h-3 w-3" />
                {availableDevices.find((d) => d.deviceId === selectedDeviceId)
                  ?.label || "Unknown Device"}
              </p>
            </div>

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
                  {isPaused ? "Paused" : "Recording"}
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
            {transcript ? (
              <div className="w-full text-center text-muted-foreground p-4 bg-muted rounded-md">
                <p className="leading-relaxed">{transcript}</p>
              </div>
            ) : (
              <div className="w-full text-center text-muted-foreground p-4 bg-muted rounded-md">
                <p className="italic">Listening...</p>
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
