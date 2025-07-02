// app/api/generateQuestions/route.ts
import { NextRequest } from "next/server";
import { generateQuestions } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { jobProfile, experienceLevel } = await req.json();
    const questions = await generateQuestions(jobProfile, experienceLevel);
    return Response.json({ questions });
  } catch (error) {
    console.error(error);
    return new Response("Failed to generate questions", { status: 500 });
  }
}