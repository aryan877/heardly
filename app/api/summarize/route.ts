import { openai } from "@ai-sdk/openai";
import { auth } from "@clerk/nextjs/server";
import { streamText } from "ai";

export async function POST(req: Request) {
  try {
    // Verify authentication with Clerk
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { transcript }: { transcript: string } = await req.json();

    if (!transcript || transcript.trim().length === 0) {
      return new Response("Transcript is required", { status: 400 });
    }

    const result = streamText({
      model: openai("gpt-4o"),
      system: `You are an expert at analyzing call transcripts. Provide a structured summary with:

1. **Key Discussion Points** - Main topics covered
2. **Decisions Made** - Any concrete decisions or agreements
3. **Action Items** - Tasks assigned with owners if mentioned
4. **Next Steps** - Follow-up actions or meetings planned
5. **Important Mentions** - Key commitments, dates, or numbers

Format the response using markdown with clear sections and bullet points. Be concise but comprehensive.`,
      prompt: `Please analyze and summarize this call transcript:

${transcript}`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error in summarize API:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
