import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

export async function generateQuestions(
  jobProfile: string, 
  experienceLevel: string,
  skills: [] | string,
  interviewType: string,
  language: string,
  targetCompany: string,
  focusTopics:[]|string
) {

  const jobProfileName = Array.isArray(jobProfile)?jobProfile.join(", ") : jobProfile
  const skillsText = Array.isArray(skills) ? skills.join(", ") : skills;
  const topicsText = Array.isArray(focusTopics) ? focusTopics.join(", ") : focusTopics;
  const CompanyName = Array.isArray(targetCompany) ? targetCompany.join(", ") : targetCompany;

  const prompt = [
    `Generate 5 ${interviewType} interview questions for the role of ${jobProfileName} at ${experienceLevel} level.`,
    `If question is of coding then add a tag "Coding Question" after the question.`,
    `Focus on the following skills: ${skillsText}.`,
    CompanyName && `The questions should be suitable for interviewing at ${CompanyName}.`,
    topicsText && `Include questions covering these topics: ${topicsText}.`,
    `Write the questions in ${language}.`,
    `Include only the list of questions, one per line.`
  ]
  .filter(Boolean)
  .join('\n');
  
  

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return rawText
    .split("\n")
    .map((q: string) => q.replace(/^\d+\.\s*/, "").trim())
    .filter((q: string) => q);
}

export async function evaluateAnswer(question: string, userAnswer: string) {
    if (!API_KEY) {
        throw new Error("Missing GEMINI_API_KEY environment variable");
    }

    const isCodingQuestion = /(write|provide|implement|create).*(code|program|sql|python)|sql.*code|\(?\s*Coding Question\s*\)?\s*$/i.test(question);
    
    const prompt = `
    Evaluate this answer to the question: "${question}"
    User Answer: "${userAnswer}"
    Ignore any meaningless words (can occur due to transcript).
    
    Provide the response strictly in the following format:
    - Score: [Number from 0 to 10]
    - Feedback: [Very short, one or two sentences, concise, clear, no repetition]
    - Ideal Answer: [Very short, concise, no more than 2-3 sentences or a short code snippet if coding question]
    
    ${isCodingQuestion ? "If the question requires writing code, ensure the Ideal Answer includes a correct, short, efficient code example (no explanation, just the code)." : ""}
    
    **Keep your response concise and to the point.**
    `.trim();
    
    const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }],
                },
            ],
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!rawText.includes("Score:")) {
        return `Ideal Answer: Not available\nScore: 0\nFeedback: Unable to parse evaluation response from API.`;
    }

    return rawText;
}

export async function getIdealAnswer(question: string) {
  if (!API_KEY) {
      throw new Error("Missing GEMINI_API_KEY environment variable");
  }

  const isCodingQuestion = /(write|provide|implement|create).*(code|program|sql|python)|sql.*code|\(?\s*Coding Question\s*\)?\s*$/i.test(question);
    
  const prompt = `
Whatever you provide make sure to the Answer is very short(concise) not very detailed. no need to provide codes if not a coding question.
Provide the ideal answer for the following interview question: "${question}"
Return only the ideal answer.
${isCodingQuestion ? "If the question requires writing code, provide a correct and efficient code example." : ""}`.trim();

  const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
          contents: [
              {
                  role: "user",
                  parts: [{ text: prompt }],
              },
          ],
      }),
  });

  if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return rawText.trim() || "Ideal answer not available.";
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function scanResume(
  resumeText: string,
  jobDescription: string,
  yearsOfExperience: number
) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    // 🧹 Clean the response: remove markdown code blocks
    const jsonStartIndex = rawText.indexOf('{');
    const jsonEndIndex = rawText.lastIndexOf('}');
    const jsonString = rawText.slice(jsonStartIndex, jsonEndIndex + 1);

    const json = JSON.parse(jsonString);
    return json;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to scan resume');
  }
}