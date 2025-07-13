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
        if (score >= 8) return "text-blue-400";
        if (score >= 6) return "text-blue-300";
        return "text-blue-200";
    };

    const getPerformanceLevel = (score: number) => {
        if (score >= 8)
            return { level: "Excellent", icon: <Trophy className="w-5 h-5" />, color: "text-blue-400" };
        if (score >= 6)
            return { level: "Good", icon: <Target className="w-5 h-5" />, color: "text-blue-300" };
        return { level: "Needs Improvement", icon: <TrendingDown className="w-5 h-5" />, color: "text-blue-200" };
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
            localStorage.removeItem("interviewRole");
            localStorage.removeItem("interviewType")
            localStorage.removeItem('skills')
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
            <div className="min-h-screen bg-black flex items-center justify-center">
                {/* Animated background */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-blue-800/30"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 max-w-md w-full mx-4 text-center relative">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-2 border-4 border-blue-600 border-t-transparent rounded-full animate-spin animate-reverse"></div>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">Loading Results...</h2>
                    <p className="text-white/70">Fetching your interview performance</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-blue-800/20"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
            </div>

            {/* Header */}
            <div className="bg-black/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push("/history")}
                            className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </button>
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-700 to-blue-800 rounded-xl flex items-center justify-center">
                                <Award className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Interview Results</h1>
                                <p className="text-sm text-white/70">Your Performance Summary</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleDownloadResults}
                            className="flex items-center space-x-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-200"
                            aria-label="Download results"
                        >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                        </button>
                        <button
                            onClick={handleRetakeInterview}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-700 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-lg"
                            aria-label="Retake interview"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span>Retake Interview</span>
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* Overall Score Card */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-700 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Trophy className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Overall Score</h3>
                            <div className={`text-4xl font-bold ${getScoreColor(avgScore)} mb-2`}>
                                {avgScore.toFixed(1)}
                            </div>
                            <div className="text-sm text-white/70">out of 10</div>
                        </div>
                    </div>

                    {/* Performance Level Card */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-700 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <div className="text-white">
                                    {performance.icon}
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Performance</h3>
                            <div className={`text-xl font-bold ${getScoreColor(avgScore)}`}>
                                {performance.level}
                            </div>
                        </div>
                    </div>

                    {/* Questions Completed Card */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-700 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Completed</h3>
                            <div className="text-4xl font-bold text-blue-400 mb-2">
                                {results.questions.length}
                            </div>
                            <div className="text-sm text-white/70">questions</div>
                        </div>
                    </div>
                </div>

                {/* Interview Details */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 mb-8">
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <div className="flex items-center space-x-3 mb-3">
                                <Briefcase className="w-5 h-5 text-blue-700" />
                                <span className="text-sm font-medium text-white/80">Interview Type</span>
                            </div>
                            <p className="text-white font-semibold">{results.interviewType}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <div className="flex items-center space-x-3 mb-3">
                                <Target className="w-5 h-5 text-blue-700" />
                                <span className="text-sm font-medium text-white/80">Role</span>
                            </div>
                            <p className="text-white font-semibold">{results.interviewRole}</p>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-8">
                        <div className="flex items-center space-x-3 mb-3">
                            <Clock className="w-5 h-5 text-blue-700" />
                            <span className="text-sm font-medium text-white/80">Interview Date</span>
                        </div>
                        <p className="text-white font-semibold">{formatDate(results.createdAt)}</p>
                    </div>

                    {/* Detailed Feedback Section */}
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                        <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center mr-3">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        Detailed Feedback
                    </h2>
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <ResultsSummary
                            questions={results.questions}
                            answers={results.answers}
                            feedbacks={results.feedbacks}
                            scores={results.scores}
                            interviewtype={results.interviewType}
                            interviewrole={results.interviewRole}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleRetakeInterview}
                        className="flex items-center justify-center space-x-2 px-8 py-4 bg-blue-700 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
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
                            localStorage.removeItem("interviewRole");
                            localStorage.removeItem("interviewType")
                            localStorage.removeItem('skills')
                            router.push("/history");
                        }}
                        className="flex items-center justify-center space-x-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
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