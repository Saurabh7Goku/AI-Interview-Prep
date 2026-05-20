// app/api/generateQuestions/route.ts
import { NextRequest } from "next/server";
import * as nvidiaApi from "@/lib/nvidia";

export async function POST(req: NextRequest) {
  try {
    const { jobProfile, experienceLevel, skills, interviewType, language, targetCompany, focusTopics } = await req.json();
    const questions = await nvidiaApi.generateQuestionsNvidia(jobProfile, experienceLevel, skills, interviewType, language, targetCompany, focusTopics)
    return Response.json({ questions });
  } catch (error) {
    console.error(error);
    return new Response("Failed to generate questions", { status: 500 });
  }
}