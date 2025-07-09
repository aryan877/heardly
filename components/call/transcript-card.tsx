"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";

interface TranscriptCardProps {
  transcript: string;
}

export const TranscriptCard = ({ transcript }: TranscriptCardProps) => {
  if (!transcript) return null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Transcript
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={transcript}
          readOnly
          className="min-h-[200px] resize-none"
          placeholder="Transcript will appear here as you speak..."
        />
      </CardContent>
    </Card>
  );
};
