"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, getInterviewHistory, Interview } from "@/firebase/firebase";
import { useToast } from "@/components/ToastProvide";
import { ArrowLeft, Briefcase, Clock, Trophy, Calendar, TrendingUp, User, ChevronRight } from "lucide-react";
import ResultsSummary from "@/components/ResultsSummary";
import { Timestamp } from "firebase/firestore";

export default function HistoryPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [history, setHistory] = useState<Interview[]>([]);
    const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const fetchHistory = async () => {
            const user = auth.currentUser;
            console.log("History page user:", user ? `User ${user.uid} ` : "No user");
            if (!user) {
                showToast("❌ Please sign in to view history.", "error");
                router.push("/auth");
                setIsLoadingAuth(false);
                return;
            }

            try {
                const interviews = await getInterviewHistory(user.uid);
                console.log("Fetched interviews:", interviews);
                setHistory(interviews);
                if (interviews.length > 0 && !selectedInterview) {
                    setSelectedInterview(interviews[interviews.length - 1]);
                }
            } catch (error) {
                showToast("❌ Failed to load interview history.", "error");
                console.error("Error loading history:", error);
            } finally {
                setIsLoadingAuth(false);
            }
        };

        fetchHistory();
    }, [router, showToast]);

    const getAvgScore = (scores: { [key: number]: number }) => {
        const values = Object.values(scores);
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    };

    const getScoreColor = (score: number) => {
        if (score >= 8) return "from-emerald-500 to-green-600";
        if (score >= 6) return "from-yellow-400 to-orange-500";
        return "from-red-400 to-red-600";
    };

    const getScoreTextColor = (score: number) => {
        if (score >= 8) return "text-emerald-600";
        if (score >= 6) return "text-yellow-600";
        return "text-red-600";
    };

    // Convert createdAt to Date object
    const formatDate = (createdAt: string | Timestamp) => {
        const date = typeof createdAt === "string" ? new Date(createdAt) : createdAt.toDate();
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatDateTime = (createdAt: string | Timestamp) => {
        const date = typeof createdAt === "string" ? new Date(createdAt) : createdAt.toDate();
        return date.toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTime = (createdAt: string | Timestamp) => {
        const date = typeof createdAt === "string" ? new Date(createdAt) : createdAt.toDate();
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getOverallStats = () => {
        if (history.length === 0) return { avgScore: 0, totalInterviews: 0, bestScore: 0 };

        const scores = history.map(interview => getAvgScore(interview.scores));
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const bestScore = Math.max(...scores);

        return {
            avgScore: avgScore,
            totalInterviews: history.length,
            bestScore: bestScore
        };
    };

    const stats = getOverallStats();

    if (isLoadingAuth) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 max-w-md w-full text-center">
                    <div className="relative mb-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-full shadow-lg">
                            <Clock className="w-10 h-10 text-white animate-spin" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-full opacity-20 animate-pulse scale-110"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Loading Your History</h2>
                    <p className="text-gray-600">Fetching your interview records...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Enhanced Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push("/")}
                                className="group p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-2xl transition-all duration-300 transform hover:scale-105"
                                aria-label="Go back"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                                        <Briefcase className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                        Interview History
                                    </h1>
                                    <p className="text-sm text-gray-600 hidden sm:block">Track your progress and improvements</p>
                                </div>
                            </div>
                        </div>

                        {/* Stats Overview */}
                        <div className="hidden lg:flex items-center space-x-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{stats.totalInterviews}</div>
                                <div className="text-xs text-gray-500">Total</div>
                            </div>
                            <div className="text-center">
                                <div className={`text-2xl font-bold ${getScoreTextColor(stats.avgScore)}`}>
                                    {stats.avgScore.toFixed(1)}
                                </div>
                                <div className="text-xs text-gray-500">Average</div>
                            </div>
                            <div className="text-center">
                                <div className={`text-2xl font-bold ${getScoreTextColor(stats.bestScore)}`}>
                                    {stats.bestScore.toFixed(1)}
                                </div>
                                <div className="text-xs text-gray-500">Best</div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                {/* Mobile Stats */}
                <div className="lg:hidden mb-6">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-4 sm:p-6">
                        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                            <div className="min-w-0">
                                <div className="text-lg sm:text-2xl font-bold text-blue-600">{stats.totalInterviews}</div>
                                <div className="text-xs text-gray-500 truncate">Total Interviews</div>
                            </div>
                            <div className="min-w-0">
                                <div className={`text-lg sm:text-2xl font-bold ${getScoreTextColor(stats.avgScore)}`}>
                                    {stats.avgScore.toFixed(1)}
                                </div>
                                <div className="text-xs text-gray-500 truncate">Average Score</div>
                            </div>
                            <div className="min-w-0">
                                <div className={`text-lg sm:text-2xl font-bold ${getScoreTextColor(stats.bestScore)}`}>
                                    {stats.bestScore.toFixed(1)}
                                </div>
                                <div className="text-xs text-gray-500 truncate">Best Score</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6">
                    {/* Interview List */}
                    <div className="w-full lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-gray-100">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
                                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                                Interview Sessions
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {history.length} session{history.length !== 1 ? 's' : ''} recorded
                            </p>
                        </div>

                        <div className="max-h-[300px] sm:max-h-[400px] lg:max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
                            {history.length === 0 ? (
                                <div className="p-6 sm:p-8 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Briefcase className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500">No interviews yet</p>
                                    <p className="text-sm text-gray-400 mt-1">Complete your first interview to see it here</p>
                                </div>
                            ) : (
                                <div className="space-y-2 p-3 sm:p-4">
                                    {history.map((interview, index) => {
                                        const avgScore = getAvgScore(interview.scores);
                                        const isSelected = selectedInterview?.id === interview.id;

                                        return (
                                            <button
                                                key={interview.id}
                                                onClick={() => setSelectedInterview(interview)}
                                                className={`w-full text-left p-3 sm:p-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.01] sm:hover:scale-[1.02] group ${isSelected
                                                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl scale-[1.01] sm:scale-[1.02]"
                                                    : "bg-white/60 text-gray-700 hover:bg-white/80 hover:shadow-lg border border-gray-100"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-2 sm:mb-3">
                                                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? "bg-white/20" : "bg-gray-100"
                                                            }`}>
                                                            <User className={`w-4 h-4 sm:w-5 sm:h-5 ${isSelected ? "text-white" : "text-gray-600"
                                                                }`} />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className={`font-semibold text-sm sm:text-base truncate ${isSelected ? "text-white" : "text-gray-800"
                                                                }`}>
                                                                {formatDate(interview.createdAt)}
                                                            </div>
                                                            <div className={`text-xs sm:text-sm ${isSelected ? "text-white/80" : "text-gray-500"
                                                                }`}>
                                                                {formatTime(interview.createdAt)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 shrink-0 ${isSelected ? "text-white rotate-90" : "text-gray-400 group-hover:rotate-90"
                                                        }`} />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className={`flex items-center space-x-1 sm:space-x-2 min-w-0 flex-1 ${isSelected ? "text-white/90" : "text-gray-600"
                                                        }`}>
                                                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                                                        <span className="text-xs sm:text-sm truncate">
                                                            {interview.questions.length} question{interview.questions.length !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                    <div className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold shrink-0 ${isSelected
                                                        ? "bg-white/20 text-white"
                                                        : `bg-gradient-to-r ${getScoreColor(avgScore)} text-white`
                                                        }`}>
                                                        {avgScore.toFixed(1)}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Interview Details */}
                    <div className="w-full lg:col-span-3">
                        {selectedInterview ? (
                            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                                <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-100">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                                        <h2 className="text-base md:text-3xl font-bold text-gray-800 flex items-center">
                                            <Trophy className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-yellow-500" />
                                            <span className="truncate">Interview Details</span>
                                        </h2>
                                        <div className={`px-2 py-1 md:px-4 sm:py-2 rounded-full text-sm md:text-lg font-bold bg-gradient-to-r ${getScoreColor(getAvgScore(selectedInterview.scores))} text-white shadow-lg self-start`}>
                                            {getAvgScore(selectedInterview.scores).toFixed(1)}/10
                                        </div>
                                    </div>
                                    <p className="text-gray-600 flex items-center text-sm md:text-base">
                                        <Calendar className="w-4 h-4 mr-2 shrink-0" />
                                        <span className="truncate">{formatDateTime(selectedInterview.createdAt)}</span>
                                    </p>
                                </div>

                                <div className="p-2 md:p-6 lg:p-8 text-sm">
                                    <ResultsSummary
                                        questions={selectedInterview.questions}
                                        answers={selectedInterview.answers}
                                        feedbacks={selectedInterview.feedbacks}
                                        scores={selectedInterview.scores}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8 lg:p-12 text-center">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Select an Interview</h3>
                                <p className="text-gray-600 text-sm sm:text-base">Choose an interview from the list to view detailed results and feedback.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(99, 102, 241, 0.3);
                    border-radius: 2px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(99, 102, 241, 0.5);
                }
            `}</style>
        </div>
    );
}