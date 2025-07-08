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

  const prompt = `
  Generate 10 ${interviewType} interview questions for the role of ${jobProfileName} at ${experienceLevel} level.
  Focus on the following skills: ${skillsText}.
  ${CompanyName ? `The questions should be suitable for interviewing at ${CompanyName}.` : ""}
  ${topicsText ? `Include questions covering these topics: ${topicsText}.` : ""}
  Write the questions in ${language}.
  Include only the list of questions, one per line.
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

    const isCodingQuestion = /Write.*code|Write.*program|write.*code|write.*program|Write.*SQL|write.*SQL|write.*sql|write.*Sql|Write.*Sql|Write.*sql|Sql.*code|SQL.*code|Provide.*code|provide.*code|implement|code.*for/i.test(question);
    const prompt = `
Evaluate this answer to the question "${question}":
User Answer: "${userAnswer}"
Ignore any meaningless words(can occurs due to transcript),
Provide the response with the following format:
Score: [Number from 0 to 10]
Feedback: [Short feedback here]
Ideal Answer: [Ideal answer here if theory question then keep it simple and short.]
${isCodingQuestion ? "If the question requires writing code, evaluate the correctness, syntax, and efficiency of the code. Ensure the ideal answer includes a correct code example."
 : ""}`.trim();

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

  const isCodingQuestion = /write.*code|write.*program|implement|code.*for/i.test(question);
  const prompt = `
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