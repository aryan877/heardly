"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2 } from "lucide-react";

interface SummaryCardProps {
  summary: string;
  transcript: string;
  isGenerating: boolean;
  onGenerateSummary: () => void;
}

export const SummaryCard = ({
  summary,
  transcript,
  isGenerating,
  onGenerateSummary,
}: SummaryCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Summary
          </CardTitle>
          <Button
            onClick={onGenerateSummary}
            disabled={!transcript || isGenerating}
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
                {summary ? "Regenerate" : "Generate"} Summary
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {summary ? (
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-sm">{summary}</div>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            {!transcript
              ? "Complete your recording to generate a summary"
              : "Click 'Generate Summary' to analyze your conversation"}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
