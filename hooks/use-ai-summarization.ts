"use client";

import { useState } from "react";

export const useAISummarization = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState("");

  const generateSummary = async (transcript: string): Promise<string> => {
    if (!transcript.trim()) return "";

    setIsGenerating(true);
    setSummary("");

    let fullSummary = "";

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response reader available");
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullSummary += chunk;
        setSummary(fullSummary);
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
    return fullSummary;
  };

  return {
    isGenerating,
    summary,
    generateSummary,
  };
};
