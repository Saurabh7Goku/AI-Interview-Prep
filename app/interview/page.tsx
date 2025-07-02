"use client";
import { useEffect, useState } from "react";
import InterviewQuestion from "@/components/InterviewQuestion";
import { useRouter } from "next/navigation";
import { evaluateAnswer } from "@/lib/gemini";
import { Briefcase, Clock, MessageSquare, User, ArrowLeft, CheckCircle } from "lucide-react";

export default function InterviewPage() {
    const router = useRouter();
    const [questions, setQuestions] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [feedbacks, setFeedbacks] = useState<Record<number, string>>({});
    const [scores, setScores] = useState<Record<number, number>>({});

    // Load questions from localStorage
    useEffect(() => {
        const storedQuestions = localStorage.getItem("questions");
        if (storedQuestions) {
            const parsed = JSON.parse(storedQuestions);
            setQuestions(parsed.length > 5 ? parsed.slice(0, 5) : parsed);
        }

        const idx = localStorage.getItem("currentQuestionIndex");
        if (idx) setCurrentIndex(parseInt(idx));
    }, []);

    const handleNext = async (userAnswer: string) => {
        const updatedUserAnswers = {
            ...userAnswers,
            [currentIndex]: userAnswer,
        };
        setUserAnswers(updatedUserAnswers);

        // Save immediately to localStorage
        localStorage.setItem("userAnswers", JSON.stringify(updatedUserAnswers));

        // Skip evaluation if the question was skipped
        if (userAnswer === "Skipped") {
            if (currentIndex < questions.length - 1) {
                const nextIndex = currentIndex + 1;
                setCurrentIndex(nextIndex);
                localStorage.setItem("currentQuestionIndex", nextIndex.toString());
            } else {
                await new Promise((resolve) => setTimeout(resolve, 50));
                router.push("/results");
            }
            return;
        }

        // Evaluate only if user provided an answer
        try {
            const evaluation = await evaluateAnswer(questions[currentIndex], userAnswer);
            console.log("Evaluation response:", evaluation); // Debug log
            const match = evaluation.match(/(?:\*\*)?Score:(?:\*\*)?\s*(\d+)(?:\/10)?/i);
            const score = match ? parseInt(match[1]) : 0;

            const updatedFeedbacks = {
                ...feedbacks,
                [currentIndex]: evaluation || "No feedback provided",
            };

            const updatedScores = {
                ...scores,
                [currentIndex]: score,
            };

            setFeedbacks(updatedFeedbacks);
            setScores(updatedScores);

            localStorage.setItem("feedbacks", JSON.stringify(updatedFeedbacks));
            localStorage.setItem("scores", JSON.stringify(updatedScores));

            if (currentIndex < questions.length - 1) {
                const nextIndex = currentIndex + 1;
                setCurrentIndex(nextIndex);
                localStorage.setItem("currentQuestionIndex", nextIndex.toString());
            } else {
                await new Promise((resolve) => setTimeout(resolve, 50));
                router.push("/results");
            }
        } catch (error) {
            console.error("Evaluation error:", error);
            let errorMessage = "Unknown error";
            if (error instanceof Error) {
                errorMessage = error.message;
            } else {
                errorMessage = String(error);
            }

            const updatedFeedbacks = {
                ...feedbacks,
                [currentIndex]: `Evaluation failed: ${errorMessage}`,
            };

            setFeedbacks(updatedFeedbacks);
            localStorage.setItem("feedbacks", JSON.stringify(updatedFeedbacks));

            if (currentIndex >= questions.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, 500));
                router.push("/results");
            }
        }
    };

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-100 p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl mb-4">
                            <Clock className="w-8 h-8 text-white animate-spin" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Questions...</h2>
                        <p className="text-gray-600">Preparing your personalized interview</p>
                    </div>
                </div>
            </div>
        );
    }

    const progressPercent = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-600 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-blue-300 rounded-full blur-2xl"></div>
            </div>

            {/* Header */}
            <div className="relative z-10">
                <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 shadow-sm">
                    <div className="max-w-4xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => router.back()}
                                    className="p-2 hover:bg-blue-50 rounded-xl transition-colors duration-200"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                                </button>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                                        <Briefcase className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold text-gray-800">Interview Simulation</h1>
                                        <p className="text-sm text-gray-600">AI-Powered Assessment</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Question {currentIndex + 1} of {questions.length}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
                                            style={{ width: `${progressPercent}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{Math.round(progressPercent)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="max-w-4xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-center space-x-4">
                        {questions.map((_, index) => (
                            <div key={index} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${index < currentIndex
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : index === currentIndex
                                        ? 'bg-blue-600 border-blue-600 text-white animate-pulse'
                                        : 'bg-white border-gray-300 text-gray-400'
                                    }`}>
                                    {index < currentIndex ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <span className="text-sm font-medium">{index + 1}</span>
                                    )}
                                </div>
                                {index < questions.length - 1 && (
                                    <div className={`w-12 h-0.5 mx-2 transition-all duration-300 ${index < currentIndex ? 'bg-green-400' : 'bg-gray-300'
                                        }`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="relative z-10 max-w-4xl mx-auto px-6 pb-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
                    {/* Question Header */}
                    <div className="grid grid-cols-2 bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                        <div className="flex items-center space-x-3 mb-2">
                            <User className="w-6 h-6" />
                            <span className="text-sm font-medium opacity-90">Interviewer</span>
                        </div>
                        <h2 className="text-lg font-semibold">Question {currentIndex + 1}</h2>
                    </div>

                    {/* Question Content */}
                    <div className="p-8">
                        <InterviewQuestion
                            question={questions[currentIndex]}
                            index={currentIndex + 1}
                            total={questions.length}
                            onNext={handleNext}
                        />
                    </div>
                </div>

                {/* Tips Section */}
                <div className="mt-6 bg-blue-50/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-100">
                    <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Interview Tips
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-700">
                        <div className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Take your time to think before answering</span>
                        </div>
                        <div className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Use specific examples from your experience</span>
                        </div>
                        <div className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Structure your answers clearly and concisely</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}