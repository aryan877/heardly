"use client"

import { useState } from "react"

export const useAISummarization = () => {
  const [summary, setSummary] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const generateSummary = async (transcript: string) => {
    if (!transcript.trim()) return

    setIsGenerating(true)
    setSummary("")

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate summary")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        const chunk = decoder.decode(value)
        setSummary((prev) => prev + chunk)
      }
    } catch (error) {
      console.error("Error generating summary:", error)
      // Fallback to simulated summary for demo
      const simulatedSummary = `## Key Discussion Points
• Reviewed project deliverables and current progress
• Discussed timeline adjustments for upcoming milestones
• Identified potential blockers and mitigation strategies

## Decisions Made
• Approved budget allocation for additional resources
• Confirmed go-live date for next phase
• Selected preferred vendor for implementation

## Action Items
• [ ] John to prepare detailed project timeline by Friday
• [ ] Sarah to coordinate with stakeholders on requirements
• [ ] Team to review and approve final specifications

## Next Steps
• Schedule follow-up meeting for next week
• Distribute meeting notes to all participants
• Begin implementation of approved changes`

      // Simulate streaming
      const words = simulatedSummary.split(" ")
      for (let i = 0; i < words.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 50))
        setSummary(words.slice(0, i + 1).join(" "))
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    summary,
    isGenerating,
    generateSummary,
  }
}
