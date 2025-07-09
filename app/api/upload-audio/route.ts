import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = await convexAuthNextjsToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const callId = formData.get("callId") as string;

    if (!audioFile || !callId) {
      return NextResponse.json(
        { error: "Audio file and call ID are required" },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Upload to Convex storage
    // 2. Update the call record with the storage ID
    // 3. Potentially trigger additional processing

    // For demo purposes, we'll simulate success
    console.log(
      `Received audio file: ${audioFile.name}, size: ${audioFile.size} bytes for call: ${callId}`
    );

    return NextResponse.json({
      success: true,
      message: "Audio uploaded successfully",
      audioSize: audioFile.size,
    });
  } catch (error) {
    console.error("Error uploading audio:", error);
    return NextResponse.json(
      { error: "Failed to upload audio" },
      { status: 500 }
    );
  }
}
