"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, getInterviewHistory, Interview } from "@/firebase/firebase";
import { useToast } from "@/components/ToastProvide";
import Sidebar from "@/components/Sidebar";
import {
    Home,
    FileText,
    Search,
    MessageCircle,
    History,
    Clock,
    Trophy,
    Calendar,
    User,
    ChevronRight,
    Menu,
    X,
    Star,
    Target,
    Zap
} from "lucide-react";
import ResultsSummary from "@/components/ResultsSummary";
import { Timestamp } from "firebase/firestore";

export default function HistoryPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [history, setHistory] = useState<Interview[]>([]);
    const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
        if (score >= 8) return "from-emerald-500 to-green-500";
        if (score >= 6) return "from-amber-500 to-orange-500";
        return "from-red-500 to-rose-500";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 8) return "Excellent";
        if (score >= 6) return "Average";
        return "Poor";
    };

    const getScoreIcon = (score: number) => {
        if (score >= 8) return Trophy;
        if (score >= 6) return Star;
        return Target;
    };

    const formatDate = (createdAt: string | Timestamp) => {
        const date = typeof createdAt === "string" ? new Date(createdAt) : createdAt.toDate();
        return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (createdAt: string | Timestamp) => {
        const date = typeof createdAt === "string" ? new Date(createdAt) : createdAt.toDate();
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoadingAuth) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <Clock className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-gray-400 text-lg">Loading your history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#ADBBD4] via-[#DDD3E8] to-[#8697C4] flex relative">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-gray-800/80 backdrop-blur-xl shadow-lg border-b border-gray-700/50">
                    <div className="flex items-center justify-between px-4 py-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="md:hidden text-gray-400 hover:text-white transition-colors"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-base md:text-2xl font-bold text-white">Interview History</h1>
                                <p className="hidden md:block text-gray-400 text-sm">Review your interview performance and track your progress</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-6">
                    {history.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-32 h-32 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-700/50">
                                <History className="w-16 h-16 text-gray-600" />
                            </div>
                            <p className="text-gray-300 text-xl font-semibold">No interviews yet</p>
                            <p className="text-gray-500 mt-2">Complete your first interview to see it here</p>
                            <button
                                onClick={() => router.push("/mock-interview")}
                                className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Start Interview
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {history.map((interview) => {
                                const avgScore = getAvgScore(interview.scores);
                                const scoreLabel = getScoreLabel(avgScore);
                                const scoreGradient = getScoreColor(avgScore);
                                const isSelected = selectedInterview?.id === interview.id;

                                return (
                                    <div
                                        key={interview.id}
                                        className={`group relative bg-gray-800/50 backdrop-blur-xl rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer transform hover:-translate-y-2 hover:shadow-2xl ${isSelected
                                            ? 'ring-2 ring-blue-500/50 shadow-blue-500/20 shadow-2xl border-blue-500/30'
                                            : 'border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/70'
                                            }`}
                                        onClick={() => setSelectedInterview(interview)}
                                    >
                                        {/* Header with gradient background */}
                                        <div className="relative bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-4 border-b border-gray-700/50">
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                                            <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full translate-y-6 -translate-x-6"></div>

                                            <div className="relative z-10">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-lg text-white leading-tight">{interview.interviewRole}</h3>
                                                            <p className="text-blue-300 text-sm font-medium">{interview.interviewType} Interview</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">

                                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2 text-gray-400">
                                                        <Calendar className="w-4 h-4" />
                                                        <span className="text-sm font-medium">{formatDate(interview.createdAt)}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-gray-400">
                                                        <Clock className="w-4 h-4" />
                                                        <span className="text-sm font-medium">{formatTime(interview.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            {/* Score Display */}
                                            <div className="flex items-center justify-between mb-4 p-3 bg-gray-700/30 rounded-xl border border-gray-600/30">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${scoreGradient} flex items-center justify-center shadow-lg`}>
                                                        <span className="text-white font-bold text-xs md:text-lg">{avgScore.toFixed(1)}</span>
                                                    </div>
                                                    <div>
                                                        <div className="text-gray-300 font-semibold">Overall Score</div>
                                                        <div className={`text-sm font-bold ${avgScore >= 8 ? 'text-green-400' :
                                                            avgScore >= 6 ? 'text-orange-400' : 'text-red-400'
                                                            }`}>
                                                            {scoreLabel}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-sm md:text-xl text-white`}>
                                                        {avgScore.toFixed(1)}
                                                    </div>
                                                    <div className="text-xs text-gray-400">/ 10</div>
                                                </div>
                                            </div>

                                            {/* Skills Section */}
                                            {interview.skills && interview.skills.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                                                        <Zap className="w-4 h-4 mr-1 text-yellow-400" />
                                                        Skills Assessed
                                                    </h4>
                                                    <div className="flex flex-wrap gap-1">
                                                        {interview.skills.split(',').slice(0, 3).map((skill, index) => (
                                                            <span key={index} className="px-1 py-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-300 rounded-lg text-xs border border-blue-500/30">
                                                                {skill.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {/* Hover effect overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>

            {/* Detailed Analysis Modal/Panel */}
            {selectedInterview && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:hidden">
                    <div className="bg-gray-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700/50 shadow-2xl">
                        <div className="p-6 border-b border-gray-700/50 bg-gray-900/50">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">Detailed Interview Analysis</h2>
                                <button
                                    onClick={() => setSelectedInterview(null)}
                                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 text-white">
                            <ResultsSummary
                                questions={selectedInterview.questions}
                                answers={selectedInterview.answers}
                                feedbacks={selectedInterview.feedbacks}
                                scores={selectedInterview.scores}
                                interviewrole={selectedInterview.interviewRole}
                                interviewtype={selectedInterview.interviewType}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Details Panel */}
            {selectedInterview && !isMobile && (
                <div className="hidden md:block fixed right-0 top-0 h-full w-1/2 bg-gray-800/95 backdrop-blur-xl shadow-2xl z-40 overflow-y-auto border-l border-gray-700/50">
                    <div className="p-6 border-b border-gray-700/50 bg-gray-900/50">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Detailed Interview Analysis</h2>
                            <button
                                onClick={() => setSelectedInterview(null)}
                                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                    <div className="p-6 text-white">
                        <ResultsSummary
                            questions={selectedInterview.questions}
                            answers={selectedInterview.answers}
                            feedbacks={selectedInterview.feedbacks}
                            scores={selectedInterview.scores}
                            interviewrole={selectedInterview.interviewRole}
                            interviewtype={selectedInterview.interviewType}
                        />
                    </div>
                </div>
            )}

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}