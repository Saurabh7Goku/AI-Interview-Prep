import { OpenAI } from 'openai';

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

if (!NVIDIA_API_KEY) {
  console.warn("NVIDIA_API_KEY not configured. NVIDIA API fallback will not be available.");
}

const client = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: NVIDIA_API_KEY || '',
});

export async function generateQuestionsNvidia(
  jobProfile: string,
  experienceLevel: string,
  skills: [] | string,
  interviewType: string,
  language: string,
  targetCompany: string,
  focusTopics: [] | string
) {
  if (!NVIDIA_API_KEY) {
    throw new Error("NVIDIA_API_KEY not configured");
  }

  const skillsText = Array.isArray(skills) ? skills.join(", ") : skills;
  const topicsText = Array.isArray(focusTopics) ? focusTopics.join(", ") : focusTopics;
  const CompanyName = Array.isArray(targetCompany) ? targetCompany.join(", ") : targetCompany;

  const prompt = [
    `Generate 5 ${interviewType} interview questions for the role of ${jobProfile} at ${experienceLevel} level.`,
    `If question is of coding then add a tag "Coding Question" after the question.`,
    `Focus on the following skills: ${skillsText}.`,
    CompanyName && `The questions should be suitable for interviewing at ${CompanyName}.`,
    topicsText && `Include questions covering these topics: ${topicsText}.`,
    `Write the questions in ${language}.`,
    `Include only the list of questions, one per line.`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const completion = await client.chat.completions.create({
      model: "minimaxai/minimax-m2.7",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 2048,
    });

    const rawText =
      completion.choices[0]?.message?.content || "";

    return rawText
      .split("\n")
      .map((q: string) => q.replace(/^\d+\.\s*/, "").trim())
      .filter((q: string) => q);
  } catch (error) {
    console.error("NVIDIA API error in generateQuestions:", error);
    throw error;
  }
}

export async function evaluateAnswerNvidia(
  question: string,
  userAnswer: string
) {
  if (!NVIDIA_API_KEY) {
    throw new Error("NVIDIA_API_KEY not configured");
  }

  const isCodingQuestion = /(write|provide|implement|create).*(code|program|sql|python)|sql.*code|\(?\s*Coding Question\s*\)?\s*$/i.test(
    question
  );

  const prompt = `
    Evaluate this answer to the question: "${question}"
    User Answer: "${userAnswer}"
    Ignore any meaningless words (can occur due to transcript).
    
    Provide the response strictly in the following format:
    - Score: [Number from 0 to 10]
    - Feedback: [Very short, one or two sentences, concise, clear, no repetition]
    - Ideal Answer: [Very short, concise, no more than 2-3 sentences or a short code snippet if coding question]
    
    ${
      isCodingQuestion
        ? "If the question requires writing code, ensure the Ideal Answer includes a correct, short, efficient code example (no explanation, just the code)."
        : ""
    }
    
    **Keep your response concise and to the point.**
    `.trim();

  try {
    const completion = await client.chat.completions.create({
      model: "minimaxai/minimax-m2.7",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 1024,
    });

    const rawText =
      completion.choices[0]?.message?.content || "";

    if (!rawText.includes("Score:")) {
      return `Ideal Answer: Not available\nScore: 0\nFeedback: Unable to parse evaluation response from API.`;
    }

    return rawText;
  } catch (error) {
    console.error("NVIDIA API error in evaluateAnswer:", error);
    throw error;
  }
}

export async function getIdealAnswerNvidia(question: string) {
  if (!NVIDIA_API_KEY) {
    throw new Error("NVIDIA_API_KEY not configured");
  }

  const isCodingQuestion = /(write|provide|implement|create).*(code|program|sql|python)|sql.*code|\(?\s*Coding Question\s*\)?\s*$/i.test(
    question
  );

  const prompt = `
Whatever you provide make sure to the Answer is very short(concise) not very detailed. no need to provide codes if not a coding question.
Provide the ideal answer for the following interview question: "${question}"
Return only the ideal answer.
${
  isCodingQuestion
    ? "If the question requires writing code, provide a correct and efficient code example."
    : ""
}`.trim();

  try {
    const completion = await client.chat.completions.create({
      model: "minimaxai/minimax-m2.7",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 512,
    });

    const rawText =
      completion.choices[0]?.message?.content || "";
    return rawText.trim() || "Ideal answer not available.";
  } catch (error) {
    console.error("NVIDIA API error in getIdealAnswer:", error);
    throw error;
  }
}

export async function scanResumeNvidia(
  resumeText: string,
  jobDescription: string,
  yearsOfExperience: number
) {
  if (!NVIDIA_API_KEY) {
    throw new Error("NVIDIA_API_KEY not configured");
  }

  const prompt = `
    You are an ATS (Applicant Tracking System) resume scanner similar to Jobscan or ResumeWorded.
    Analyze the provided resume text against the job description and the user's years of experience (${yearsOfExperience} years).
    Return a JSON object with:
    - **matchScore (number, 1-100)**
    - **missingKeywords**: Array of keywords from the job description missing in the resume
    - **formattingIssues**: Array of ATS-related formatting issues
    - **skills.score**: A number (1-100) assessing the match of hard and soft skills to the job description.
    - **skills.tips**: Array of tips with type, tip, and explanation (e.g., { type: "improve", tip: "Add 'Agile methodology' skill", explanation: "The job description emphasizes Agile experience, which is missing in your resume." }).
    - **softSkillsMatch**: Array of soft skills from the job description and whether they are present
    - **hardSkillsMatch**: Array of hard skills from the job description and whether they are present
    - **experienceAlignment**: String describing how well the years of experience align with job requirements
    - **toneAndStyle.score**: A number (1-100) evaluating the tone and style suitability for the job.
    - **toneAndStyle.tips**: Array of tips with type, a concise tip, and an explanation (e.g., { type: "improve", tip: "Use more action verbs", explanation: "Action verbs like 'led' or 'developed' make your resume more dynamic." }).
    - **content.score**: A number (1-100) assessing the quality and relevance of content.
    - **content.tips**: Array of tips with type, tip, and explanation (e.g., { type: "improve", tip: "Quantify achievements", explanation: "Add metrics like 'increased sales by 20%' to demonstrate impact." }).
    - **structure.score**: A number (1-100) evaluating the resume's organization and readability.
    - **structure.tips**: Array of tips with type, tip, and explanation (e.g., { type: "improve", tip: "Use consistent formatting", explanation: "Inconsistent bullet points or fonts can confuse ATS systems." }).
    - **contentSuggestions**: Array of actionable suggestions to improve ATS compatibility
    - **ATS.tips**: Array of tips with type ("good" or "improve") and a concise tip (e.g., "Include more keywords like 'Python'").
    Ensure suggestions are specific, actionable, and mimic the detailed feedback provided by Jobscan or ResumeWorded.

    Resume: ${resumeText}
    Job Description: ${jobDescription}
  `;

  try {
    const completion = await client.chat.completions.create({
      model: "minimaxai/minimax-m2.7",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 4096,
    });

    const rawText =
      completion.choices[0]?.message?.content || "";

    // 🧹 Clean the response: remove markdown code blocks
    const jsonStartIndex = rawText.indexOf("{");
    const jsonEndIndex = rawText.lastIndexOf("}");
    const jsonString = rawText.slice(jsonStartIndex, jsonEndIndex + 1);

    const json = JSON.parse(jsonString);
    return json;
  } catch (error) {
    console.error("NVIDIA API error in scanResume:", error);
    throw error;
  }
}
