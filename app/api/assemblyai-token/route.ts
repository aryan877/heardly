import { AssemblyAI } from "assemblyai";
import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "AssemblyAI API key is not set" },
      { status: 500 }
    );
  }

  const client = new AssemblyAI({ apiKey });

  try {
    const token = await client.streaming.createTemporaryToken({
      expires_in_seconds: 3600, // Token valid for 1 hour
    });
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error creating AssemblyAI token:", error);
    return NextResponse.json(
      { error: "Failed to create AssemblyAI token" },
      { status: 500 }
    );
  }
}
