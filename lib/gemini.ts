// lib/gemini.ts

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

export async function generateQuestions(jobProfile: string, experienceLevel: string) {
  const prompt = `
Generate 5 technical interview questions for a ${jobProfile} at the ${experienceLevel} level.
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

    const isCodingQuestion = /write.*code|write.*program|implement|code.*for/i.test(question);
    const prompt = `
Evaluate this answer to the question "${question}":
User Answer: "${userAnswer}"
Provide the response in plain text with the following format:
Ideal Answer: [Ideal answer here]
Score: [Number from 0 to 10]
Feedback: [Short feedback here]
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
    console.log("Raw Gemini response:", rawText); // Debug log

    if (!rawText.includes("Score:")) {
        return `Ideal Answer: Not available\nScore: 0\nFeedback: Unable to parse evaluation response from API.`;
    }

    return rawText;
}