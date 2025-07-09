"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Doc } from "@/convex/_generated/dataModel";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface CallHeaderProps {
  call: Doc<"calls">;
  duration: number;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

export const CallHeader = ({ call, duration }: CallHeaderProps) => {
  const router = useRouter();

  const getStatusBadgeVariant = (status: Doc<"calls">["status"]) => {
    switch (status) {
      case "recording":
        return "destructive";
      case "processing":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="sm" onClick={() => router.push("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Badge variant={getStatusBadgeVariant(call.status)}>
          {call.status}
        </Badge>
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-2">{call.title}</h1>
      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4" />
          <span>{new Date(call._creationTime).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4" />
          <span>{new Date(call._creationTime).toLocaleTimeString()}</span>
        </div>
        {(duration > 0 || (call.duration ?? 0) > 0) && (
          <div className="flex items-center space-x-1">
            <span>Duration: {formatTime(duration || call.duration || 0)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
