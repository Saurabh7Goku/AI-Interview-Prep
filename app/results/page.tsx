"use client";
import { useEffect, useState } from "react";
import ResultsSummary from "@/components/ResultsSummary";
import { auth, getInterviewHistory, Interview } from "@/firebase/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvide";
import { ArrowLeft, Trophy, Target, Award, Download, RotateCcw, CheckCircle, Briefcase, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { Timestamp } from "firebase/firestore";

export default function ResultsPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [results, setResults] = useState<Interview>({
        id: "",
        userId: "",
        questions: [],
        answers: {},
        feedbacks: {},
        scores: {},
        interviewType: "",
        interviewRole: "",
        skills: "",
        createdAt: "",
    });
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [isLoadingResults, setIsLoadingResults] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            const user = auth.currentUser;
            console.log("Results page user:", user ? `User ${user.uid}` : "No user");
            if (!user) {
                showToast("❌ Please sign in to view results.", "error");
                router.push("/auth");
                setIsLoadingAuth(false);
                setIsLoadingResults(false);
                return;
            }

            try {
                const history = await getInterviewHistory(user.uid);
                console.log("Fetched history:", history); // Debug log
                if (history.length > 0) {
                    // Sort by createdAt to ensure latest interview
                    const latestInterview = history.sort((a, b) => {
                        const dateA = typeof a.createdAt === "string" ? new Date(a.createdAt).getTime() : a.createdAt.toDate().getTime();
                        const dateB = typeof b.createdAt === "string" ? new Date(b.createdAt).getTime() : b.createdAt.toDate().getTime();
                        return dateB - dateA; // Descending order
                    })[0];
                    console.log("Latest interview:", latestInterview); // Debug log
                    setResults(latestInterview);
                } else {
                    showToast("⚠️ No interview results found.", "warning");
                }
            } catch (error) {
                showToast("❌ Failed to load results.", "error");
                console.error("Error loading results:", error);
            } finally {
                setIsLoadingAuth(false);
                setIsLoadingResults(false);
            }
        };

        fetchResults();
    }, [router, showToast]);

    const avgScore =
        results.questions.length > 0
            ? Object.values(results.scores).reduce((a, b) => a + b, 0) / results.questions.length
            : 0;

    const getScoreColor = (score: number) => {
        if (score >= 8) return "text-green-600";
        if (score >= 6) return "text-yellow-600";
        return "text-red-600";
    };

    const getPerformanceLevel = (score: number) => {
        if (score >= 8)
            return { level: "Excellent", icon: <Trophy className="w-5 h-5" />, color: "text-green-600" };
        if (score >= 6)
            return { level: "Good", icon: <Target className="w-5 h-5" />, color: "text-yellow-600" };
        return { level: "Needs Improvement", icon: <TrendingDown className="w-5 h-5" />, color: "text-red-600" };
    };

    const performance = getPerformanceLevel(avgScore);

    const formatDate = (createdAt: string | Timestamp) => {
        const date = typeof createdAt === "string" ? new Date(createdAt) : createdAt.toDate();
        return date.toLocaleString();
    };

    const handleRetakeInterview = async () => {
        try {
            localStorage.removeItem("questions");
            localStorage.removeItem("userAnswers");
            localStorage.removeItem("feedbacks");
            localStorage.removeItem("scores");
            localStorage.removeItem("currentQuestionIndex");
            router.push("/homeform");
        } catch (error) {
            showToast("❌ Failed to clear results.", "error");
            console.error("Error clearing results:", error);
        }
    };

    const handleDownloadResults = () => {
        try {
            const summary = `Interview Results Summary
Date: ${formatDate(results.createdAt)}
Average Score: ${avgScore.toFixed(1)}/10
Performance Level: ${performance.level}
Questions and Answers:
${results.questions
                    .map((q, i) => {
                        return `
Question ${i + 1}: ${q}
Your Answer: ${results.answers[i] || "No answer recorded"}
Score: ${results.scores[i] || 0}/10
Feedback: ${results.feedbacks[i] || "No feedback available"}
`;
                    })
                    .join("\n")}`;

            const blob = new Blob([summary], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `interview-results-${formatDate(results.createdAt).split(",")[0].replace(/\//g, "-")}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            showToast("❌ Failed to download results.", "error");
            console.error("Error downloading results:", error);
        }
    };

    if (isLoadingAuth || isLoadingResults) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full mx-4 text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-2 border-4 border-purple-600 border-t-transparent rounded-full animate-spin animate-reverse"></div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Results...</h2>
                    <p className="text-gray-600">Fetching your interview performance</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
            <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push("/history")}
                            className="p-2 hover:bg-blue-50 rounded-xl transition-colors duration-200"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                                <Award className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">Interview Results</h1>
                                <p className="text-sm text-gray-600">Your Performance Summary</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleDownloadResults}
                            className="flex items-center space-x-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors duration-200"
                            aria-label="Download results"
                        >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                        </button>
                        <button
                            onClick={handleRetakeInterview}
                            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                            aria-label="Retake interview"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span>Retake Interview</span>
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Trophy className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Overall Score</h3>
                            <div className={`text-3xl font-bold ${getScoreColor(avgScore)} mb-1`}>
                                {avgScore.toFixed(1)}
                            </div>
                            <div className="text-sm text-gray-600">out of 10</div>
                        </div>
                    </div>
                    <div
                        className={`backdrop-blur-sm rounded-3xl shadow-xl border p-6 ${avgScore >= 8
                            ? "bg-green-50 border-green-200"
                            : avgScore >= 6
                                ? "bg-yellow-50 border-yellow-200"
                                : "bg-red-50 border-red-200"
                            }`}
                    >
                        <div className="text-center">
                            <div
                                className={`w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 ${avgScore >= 8
                                    ? "text-green-600"
                                    : avgScore >= 6
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                    }`}
                            >
                                {performance.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Performance</h3>
                            <div className={`text-xl font-bold ${getScoreColor(avgScore)}`}>
                                {performance.level}
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Completed</h3>
                            <div className="text-3xl font-bold text-green-600 mb-1">
                                {results.questions.length}
                            </div>
                            <div className="text-sm text-gray-600">questions</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <Briefcase className="w-6 h-6 mr-3 text-blue-600" />
                        Detailed Feedback
                    </h2>
                    <ResultsSummary
                        questions={results.questions}
                        answers={results.answers}
                        feedbacks={results.feedbacks}
                        scores={results.scores}
                        interviewtype={results.interviewType}
                        interviewrole={results.interviewRole}
                    />
                </div>
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleRetakeInterview}
                        className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                    >
                        <RotateCcw className="w-5 h-5" />
                        <span>Take Another Interview</span>
                    </button>
                    <button
                        onClick={() => {
                            localStorage.removeItem("questions");
                            localStorage.removeItem("userAnswers");
                            localStorage.removeItem("feedbacks");
                            localStorage.removeItem("scores");
                            localStorage.removeItem("currentQuestionIndex");
                            router.push("/history");
                        }}
                        className="flex items-center justify-center space-x-2 px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 font-semibold rounded-2xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-300"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>View History</span>
                    </button>
                </div>
            </main>
            <style jsx>{`
        .animate-reverse {
          animation-direction: reverse;
        }
      `}</style>
        </div>
    );
}