
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, getInterviewHistory, Interview } from "@/firebase/firebase";
import { useToast } from "@/components/ToastProvide";
import { ArrowLeft, Briefcase, Clock, Trophy } from "lucide-react";
import ResultsSummary from "@/components/ResultsSummary";
import { Timestamp } from "firebase/firestore";

export default function HistoryPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [history, setHistory] = useState<Interview[]>([]);
    const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

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

    // Convert createdAt to Date object
    const formatDate = (createdAt: string | Timestamp) => {
        const date = typeof createdAt === "string" ? new Date(createdAt) : createdAt.toDate();
        return date.toLocaleDateString();
    };

    const formatDateTime = (createdAt: string | Timestamp) => {
        const date = typeof createdAt === "string" ? new Date(createdAt) : createdAt.toDate();
        return date.toLocaleString();
    };

    if (isLoadingAuth) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full mx-4 text-center animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
                        <Clock className="w-8 h-8 text-white animate-spin" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h2>
                    <p className="text-gray-600">Fetching your history</p>
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
                            onClick={() => router.push("/")}
                            className="p-2 hover:bg-blue-50 rounded-xl transition-colors duration-200"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                                <Briefcase className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">Interview History</h1>
                                <p className="text-sm text-gray-600">Your Past Interviews</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Past Interviews</h2>
                        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                            {history.map((interview) => (
                                <button
                                    key={interview.id}
                                    onClick={() => setSelectedInterview(interview)}
                                    className={`w - full text - left p - 4 rounded - xl transition - all duration - 200
                    ${selectedInterview?.id === interview.id
                                            ? "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 shadow-lg"
                                            : "bg-slate-50 text-slate-700 hover:bg-slate-100 hover:shadow-md"
                                        } `}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">
                                            {formatDate(interview.createdAt)}
                                        </span>
                                        <span className="text-xs text-gray-600">
                                            Score: {getAvgScore(interview.scores).toFixed(1)}/10
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 line-clamp-2">
                                        {interview.questions[0] || "No questions available"}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        {selectedInterview ? (
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 p-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                    <Trophy className="w-6 h-6 mr-3 text-blue-600" />
                                    Interview from {formatDateTime(selectedInterview.createdAt)}
                                </h2>
                                <ResultsSummary
                                    questions={selectedInterview.questions}
                                    answers={selectedInterview.answers}
                                    feedbacks={selectedInterview.feedbacks}
                                    scores={selectedInterview.scores}
                                />
                            </div>
                        ) : (
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100 p-8 text-center">
                                <p className="text-gray-600">Select an interview to view details.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
