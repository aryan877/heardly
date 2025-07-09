import { AssemblyAI } from "assemblyai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey) {
      console.error(
        "SERVER ERROR: ASSEMBLYAI_API_KEY environment variable not found."
      );
      return NextResponse.json(
        { error: "Server configuration error: API key not set." },
        { status: 500 }
      );
    }
    console.log(
      "Server: Found ASSEMBLYAI_API_KEY. Proceeding to generate token."
    );

    const client = new AssemblyAI({
      apiKey,
    });

    const token = await client.streaming.createTemporaryToken({
      expires_in_seconds: 600,
    });

    return Response.json({ token });
  } catch (error) {
    console.error("Error creating AssemblyAI token:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create token", details: errorMessage },
      { status: 500 }
    );
  }
}
