"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

interface ResultsSummaryProps {
    questions: string[];
    answers: { [key: number]: string };
    feedbacks: { [key: number]: string };
    scores: { [key: number]: number };
    interviewrole: string;
    interviewtype: string;
}

export default function ResultsSummary({
    questions,
    answers,
    feedbacks,
    scores,
    interviewrole,
    interviewtype,
}: ResultsSummaryProps) {
    return (
        <div className="space-y-8">
            {questions.map((question, index) => {
                const userAnswer = answers[index];
                const feedback = feedbacks[index];
                const cleanedFeedback = feedback?.replace(/^Ideal Answer:\s*/i, '').trim();
                const score = scores[index];

                return (
                    <div key={index} className="border-b pb-6 border-gray-200 last:border-0">
                        <h2 className="text-base md:text-xl font-semibold text-white mb-3">
                            Q{index + 1}: {question}
                        </h2>

                        {/* Skipped Question */}
                        {userAnswer === "Skipped" ? (
                            <>
                                <p className="text-red-600 font-medium mb-3">You skipped this question.</p>
                                <div className="bg-transparent p-4 rounded-lg border border-gray-200">
                                    <strong className="text-white block mb-2">Ideal Answer</strong>
                                    <div className="prose max-w-full break-words overflow-x-auto">
                                        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                                            {cleanedFeedback || "Ideal answer not available."}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Score */}
                                <div className="py-2">
                                    <strong className="text-white">
                                        Score: {score !== undefined ? `${score}/10` : "Not evaluated"}
                                    </strong>
                                </div>
                                {/* User's Answer */}
                                <div className="mb-4">
                                    <strong className="text-white">Your Answer:</strong>
                                    <p className="mt-1 text-white">{userAnswer || "No answer recorded"}</p>
                                </div>

                                {/* Feedback */}
                                <div className="mb-3">
                                    <strong className="text-white">Feedback:</strong>
                                    <div className="prose max-w-full break-words overflow-x-auto">
                                        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                                            {feedback || "No feedback available."}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}