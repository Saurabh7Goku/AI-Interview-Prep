import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const piperApiUrl = process.env.PIPER_API_URL || "https://huggingface.co/spaces/Saurabhgk2303/interviewpPrep/tts";
    const piperApiToken = process.env.HF_API_TOKEN;

    const response = await fetch(piperApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(piperApiToken && { Authorization: `Bearer ${piperApiToken}` }),
      },
      body: JSON.stringify({
        text: `OK, tell me, ${text}`, 
        voice: "en_US-libritts_r-medium", 
        language: "en",
      }),
    });

    if (!response.ok) {
      throw new Error(`Piper API error: ${response.statusText}`);
    }

    const audio = await response.arrayBuffer();
    return new NextResponse(audio, {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "Failed to generate audio", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}