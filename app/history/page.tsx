"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, getInterviewHistory, Interview } from "@/firebase/firebase";
import { useToast } from "@/components/ToastProvide";
import {
    Home,
    FileText,
    Search,
    MessageCircle,
    History,
    Clock,
    Trophy,
    Calendar,
    TrendingUp,
    User,
    ChevronRight,
    Menu,
    X,
    Filter
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
        if (score >= 8) return "bg-green-500";
        if (score >= 6) return "bg-orange-500";
        return "bg-red-500";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 8) return "Excellent";
        if (score >= 6) return "Average";
        return "Poor";
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

    const sidebarItems = [
        { name: "Dashboard", icon: Home, path: "/" },
        { name: "ATS Scan", icon: FileText, path: "/ats-scan" },
        { name: "Job Finder", icon: Search, path: "/job-finder" },
        { name: "Mock Interview", icon: MessageCircle, path: "/mock-interview" },
        { name: "History", icon: History, path: "/history", active: true },
    ];

    if (isLoadingAuth) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Clock className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading your history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0`}>
                <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">IP</span>
                        </div>
                        <span className="text-white font-bold text-lg">aiInterPrep</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden text-gray-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="mt-8">
                    <div className="px-4 mb-4">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Main Menu</h3>
                    </div>
                    {sidebarItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => router.push(item.path)}
                            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${item.active
                                ? 'bg-gray-800 text-white border-r-2 border-blue-600'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="flex items-center justify-between px-4 py-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="md:hidden text-gray-600 hover:text-gray-900"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-base md:text-2xl font-semibold text-gray-900">History</h1>
                                <p className="hidden md:block text-gray-500 text-sm">Showing your all histories with a clear view.</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-6">
                    {history.length === 0 ? (
                        <div className="text-center py-12">
                            <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No interviews yet</p>
                            <p className="text-sm text-gray-400 mt-1">Complete your first interview to see it here</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {history.map((interview) => {
                                const avgScore = getAvgScore(interview.scores);
                                const scoreLabel = getScoreLabel(avgScore);
                                const scoreColor = getScoreColor(avgScore);
                                const isSelected = selectedInterview?.id === interview.id;

                                return (
                                    <div
                                        key={interview.id}
                                        className={`group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${isSelected ? 'ring-2 ring-blue-500 shadow-blue-100' : ''
                                            }`}
                                        onClick={() => setSelectedInterview(interview)}
                                    >
                                        {/* Header with gradient background */}
                                        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                                            <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full translate-y-6 -translate-x-6"></div>

                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                                            <User className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-lg leading-tight">{interview.interviewRole}</h3>
                                                            <p className="text-blue-100 text-sm font-medium">{interview.interviewType} Interview</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Performance Badge */}
                                                <div className="flex justify-between items-center">
                                                    <div className="bg-transparent rounded-xl p-1">
                                                        <div className="flex items-center space-x-2 text-gray-600 mb-1">
                                                            <Calendar className="w-4 h-4 text-white" />
                                                            <span className="text-xs font-medium text-white">Date</span>
                                                        </div>
                                                        <div className="text-sm font-semibold text-white">{formatDate(interview.createdAt)}</div>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-3 md:p-6 ">
                                            <div className="flex items-center justify-between border-t border-gray-100">
                                                <div className="flex items-center space-x-2 text-gray-500">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="text-sm font-medium">{formatTime(interview.createdAt)}</span>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${scoreColor} text-white shadow-lg`}>
                                                        {scoreLabel}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Statistics Grid */}
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="bg-gray-50 rounded-xl p-1">
                                                    <div className="flex items-center space-x-2 text-gray-600 mb-1">
                                                        <TrendingUp className="w-4 h-4" />
                                                        <span className="text-sm font-semibold text-gray-700">Questions</span>
                                                    </div>
                                                    <div className="text-lg font-bold text-gray-900">{interview.questions.length}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold">{avgScore.toFixed(1)}</div>
                                                    <div className="text-xs font-bold text-blue-400">Score</div>
                                                </div>
                                            </div>

                                            {/* Skills Section */}
                                            {interview.skills && interview.skills.length > 0 && (
                                                <div className="mb-4">
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Skills Assessed</h4>
                                                    <div className="flex flex-wrap gap-1">
                                                        {interview.skills.split(',').slice(0, 3).map((skill, index) => (
                                                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                                                                {skill.trim()}
                                                            </span>
                                                        ))}
                                                        {interview.skills.split(',').length > 3 && (
                                                            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs">
                                                                +{interview.skills.split(',').length - 3} more
                                                            </span>
                                                        )}
                                                    </div>

                                                </div>
                                            )}

                                        </div>

                                        {/* Hover effect overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>

            {/* Interview Details Modal/Panel */}
            {selectedInterview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 md:hidden">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">Interview Details</h2>
                                <button
                                    onClick={() => setSelectedInterview(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
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
                <div className="hidden md:block fixed right-0 top-0 h-full w-1/2 bg-white shadow-xl z-40 overflow-y-auto">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Interview Details</h2>
                            <button
                                onClick={() => setSelectedInterview(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                    <div className="p-6">
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
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}