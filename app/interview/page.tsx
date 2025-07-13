"use client";
import { useEffect, useState, useRef } from "react";
import InterviewQuestion from "@/components/InterviewQuestion";
import { useRouter } from "next/navigation";
import { evaluateAnswer, getIdealAnswer } from "@/lib/gemini";
import { auth, saveInterview } from "@/firebase/firebase";
import { Briefcase, Clock, MessageSquare, User, ArrowLeft, CheckCircle, Camera, CameraOff, Menu, X, Volume2, VolumeX } from "lucide-react";
import WebcamPreview from "@/components/WebcamPreview";
import { useToast } from "@/components/ToastProvide";

export default function InterviewPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [questions, setQuestions] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [feedbacks, setFeedbacks] = useState<Record<number, string>>({});
    const [scores, setScores] = useState<Record<number, number>>({});
    const [interviewType, setInterviewType] = useState<string>("");
    const [interviewRole, setInterviewRole] = useState<string>("");
    const [skills, setSkills] = useState<string>("");
    const [timer, setTimer] = useState(0);
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [isWebcamVisible, setIsWebcamVisible] = useState(false);
    const [isWebcamMinimized, setIsWebcamMinimized] = useState(true);
    const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTtsEnabled, setIsTtsEnabled] = useState(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const prefixes = [
        "Let's talk about",
        "Tell me about",
        "Please explain",
        "Could you share",
        "Let's discuss",
        "I'd like to hear about",
        "Can you describe",
        "Please elaborate on",
        "Share your thoughts on",
        "Let's go over",
        "Give me your thoughts on",
        "Please tell me about",
        "Walk me through",
        "Talk to me about",
    ];

    useEffect(() => {
        if (!isTtsEnabled || questions.length === 0 || !questions[currentIndex] || !window.speechSynthesis) {
            if (!window.speechSynthesis) {
                console.warn("Web Speech API not supported in this browser.");
                showToast("❌ Text-to-speech is not supported in your browser.", "error");
            }
            return;
        }

        const playQuestionAudio = () => {
            try {
                window.speechSynthesis.cancel();
                const prefix = prefixes[currentIndex % prefixes.length];
                const utterance = new SpeechSynthesisUtterance(`${prefix}, ${questions[currentIndex]}`);
                utterance.lang = "en-US";
                utterance.rate = 1.0;
                utterance.pitch = 1.0;
                const voices = window.speechSynthesis.getVoices();
                const femaleVoice = voices.find((voice) => voice.lang === "en-US" && (voice.name.includes("female") || voice.name.includes("Google US English")));
                if (femaleVoice) {
                    utterance.voice = femaleVoice;
                }
                window.speechSynthesis.speak(utterance);
                utterance.onerror = (event) => {
                    console.error("Speech synthesis error:", event.error);
                    showToast(`❌ Failed to play audio: ${event.error}. Please check browser settings.`, "error");
                };
            } catch (error) {
                console.error("TTS error:", error);
                showToast(`❌ Failed to generate audio: ${error instanceof Error ? error.message : "Unknown error"}`, "error");
            }
        };

        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                timeoutRef.current = setTimeout(playQuestionAudio, 1000);
            };
        } else {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(playQuestionAudio, 1000);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            window.speechSynthesis.cancel();
        };
    }, [currentIndex, questions, isTtsEnabled, showToast]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            console.log("Auth state in InterviewPage:", user ? `User ${user.uid}` : "No user");
            if (!user) {
                showToast("❌ Please sign in to continue.", "error");
                router.push("/auth");
                setIsLoadingAuth(false);
                return;
            }

            // Only clear localStorage if no valid session exists
            const storedQuestions = localStorage.getItem("questions");
            if (!storedQuestions) {
                localStorage.removeItem("userAnswers");
                localStorage.removeItem("feedbacks");
                localStorage.removeItem("scores");
                localStorage.removeItem("currentQuestionIndex");
                localStorage.removeItem("interviewType");
                localStorage.removeItem("interviewRole");
                localStorage.removeItem("skills");
            }

            // Retrieve and validate data from localStorage
            if (storedQuestions) {
                try {
                    const parsed = JSON.parse(storedQuestions);
                    if (Array.isArray(parsed)) {
                        setQuestions(parsed.length > 10 ? parsed.slice(0, 10) : parsed);
                    }
                } catch (error) {
                    console.error("Error parsing questions from localStorage:", error);
                    showToast("❌ Failed to load questions.", "error");
                }
            }

            const storedInterviewType = localStorage.getItem("interviewType");
            const storedInterviewRole = localStorage.getItem("interviewRole");
            const storedSkills = localStorage.getItem("skills");
            const idx = localStorage.getItem("currentQuestionIndex");

            if (storedInterviewType && ["Technical", "HR", "Managerial", "Mixed"].includes(storedInterviewType)) {
                setInterviewType(storedInterviewType);
            } else if (storedInterviewType) {
                console.warn("Invalid interviewType in localStorage:", storedInterviewType);
                localStorage.removeItem("interviewType");
            }

            if (storedInterviewRole && storedInterviewRole.trim()) {
                setInterviewRole(storedInterviewRole);
            } else if (storedInterviewRole) {
                console.warn("Invalid interviewRole in localStorage:", storedInterviewRole);
                localStorage.removeItem("interviewRole");
            }
            if (storedSkills && storedSkills.trim()) {
                setSkills(storedSkills);
            } else if (storedSkills) {
                console.warn("Invalid skills in localstorage: ", storedSkills);
                localStorage.removeItem("skills");
            }

            if (idx && !isNaN(parseInt(idx))) {
                setCurrentIndex(parseInt(idx));
            }

            setIsLoadingAuth(false);
        });
        return () => unsubscribe();
    }, [router, showToast]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [currentIndex]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const handleNext = async (userAnswer: string) => {
        const user = auth.currentUser;
        console.log("HandleNext user:", user ? `User ${user.uid}` : "No user");
        if (!user) {
            showToast("❌ Authentication required.", "error");
            router.push("/auth");
            return;
        }

        const updatedUserAnswers = { ...userAnswers, [currentIndex]: userAnswer };
        setUserAnswers(updatedUserAnswers);
        localStorage.setItem("userAnswers", JSON.stringify(updatedUserAnswers));

        let updatedFeedbacks = { ...feedbacks };
        let updatedScores = { ...scores };

        if (userAnswer === "Skipped") {
            try {
                console.log(`Fetching ideal answer for question ${currentIndex + 1}: ${questions[currentIndex]}`);
                const idealAnswer = await getIdealAnswer(questions[currentIndex]);
                updatedFeedbacks = {
                    ...feedbacks,
                    [currentIndex]: `Ideal Answer: ${idealAnswer}`,
                };
                setFeedbacks(updatedFeedbacks);
                localStorage.setItem("feedbacks", JSON.stringify(updatedFeedbacks));
                console.log(`Ideal answer saved for question ${currentIndex + 1}`);
            } catch (error) {
                console.error("Error fetching ideal answer:", error);
                showToast("❌ Failed to fetch ideal answer.", "error");
                updatedFeedbacks = {
                    ...feedbacks,
                    [currentIndex]: `Evaluation failed: ${error instanceof Error ? error.message : String(error)}`,
                };
                setFeedbacks(updatedFeedbacks);
                localStorage.setItem("feedbacks", JSON.stringify(updatedFeedbacks));
            }
        } else {
            try {
                console.log(`Evaluating answer for question ${currentIndex + 1}: ${questions[currentIndex]}`);
                const evaluation = await evaluateAnswer(questions[currentIndex], userAnswer);
                const match = evaluation.match(/(?:\*\*)?Score:(?:\*\*)?\s*(\d+)(?:\/10)?/i);
                const score = match ? parseInt(match[1]) : 0;

                updatedFeedbacks = { ...feedbacks, [currentIndex]: evaluation };
                updatedScores = { ...scores, [currentIndex]: score };

                setFeedbacks(updatedFeedbacks);
                setScores(updatedScores);

                localStorage.setItem("feedbacks", JSON.stringify(updatedFeedbacks));
                localStorage.setItem("scores", JSON.stringify(updatedScores));
                console.log(`Evaluation saved for question ${currentIndex + 1}: Score ${score}`);
            } catch (error) {
                console.error("Evaluation error:", error);
                showToast("❌ Failed to evaluate answer.", "error");
                updatedFeedbacks = {
                    ...feedbacks,
                    [currentIndex]: `Evaluation failed: ${error instanceof Error ? error.message : String(error)}`,
                };
                setFeedbacks(updatedFeedbacks);
                localStorage.setItem("feedbacks", JSON.stringify(updatedFeedbacks));
            }
        }

        if (currentIndex < questions.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            setTimer(0);
            localStorage.setItem("currentQuestionIndex", nextIndex.toString());
            console.log(`Moving to question ${nextIndex + 1}`);
        } else {
            setIsSaving(true);
            try {
                console.log("Saving interview to Firebase:", {
                    userId: user.uid,
                    questions,
                    answers: updatedUserAnswers,
                    feedbacks: updatedFeedbacks,
                    scores: updatedScores,
                    interviewType,
                    interviewRole,
                    skills,
                });
                await saveInterview(user.uid, {
                    questions,
                    answers: updatedUserAnswers,
                    feedbacks: updatedFeedbacks,
                    scores: updatedScores,
                    interviewType,
                    interviewRole,
                    skills,
                    createdAt: new Date().toISOString(),
                });
                showToast("✅ Interview saved successfully!", "success");
                // Clear localStorage to prevent stale data
                localStorage.removeItem("questions");
                localStorage.removeItem("userAnswers");
                localStorage.removeItem("feedbacks");
                localStorage.removeItem("scores");
                localStorage.removeItem("currentQuestionIndex");
                localStorage.removeItem("interviewType");
                localStorage.removeItem("interviewRole");
                localStorage.removeItem("skills");
                console.log("Interview saved successfully, redirecting to /results");
                router.push("/results");
            } catch (error) {
                console.error("Error saving interview:", error);
                showToast("❌ Failed to save interview.", "error");
                router.push("/results");
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            setCurrentIndex(prevIndex);
            setTimer(0);
            localStorage.setItem("currentQuestionIndex", prevIndex.toString());
        }
    };

    const toggleSidePanel = () => {
        setIsSidePanelOpen(!isSidePanelOpen);
    };

    const toggleWebcam = () => {
        if (isWebcamVisible) {
            setIsWebcamVisible(false);
            if (webcamStream) {
                webcamStream.getTracks().forEach((track) => track.stop());
                setWebcamStream(null);
            }
        } else {
            setIsWebcamVisible(true);
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: false })
                .then((stream) => {
                    setWebcamStream(stream);
                })
                .catch((error) => {
                    console.error("Error accessing camera:", error);
                    showToast("❌ Error accessing camera.", "error");
                    setIsWebcamVisible(false);
                });
        }
    };

    const toggleWebcamSize = () => {
        setIsWebcamMinimized(!isWebcamMinimized);
    };

    const toggleTts = () => {
        setIsTtsEnabled(!isTtsEnabled);
        if (!isTtsEnabled && questions[currentIndex] && window.speechSynthesis) {
            replayQuestion();
        } else {
            window.speechSynthesis.cancel();
        }
    };

    const replayQuestion = () => {
        if (!questions[currentIndex] || !window.speechSynthesis) {
            if (!window.speechSynthesis) {
                showToast("❌ Text-to-speech is not supported in your browser.", "error");
            }
            return;
        }

        try {
            window.speechSynthesis.cancel();
            const prefix = prefixes[currentIndex % prefixes.length];
            const utterance = new SpeechSynthesisUtterance(`${prefix}, ${questions[currentIndex]}`);
            utterance.lang = "en-US";
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find((voice) => voice.lang === "en-US" && (voice.name.includes("female") || voice.name.includes("Google US English")));
            if (femaleVoice) {
                utterance.voice = femaleVoice;
            }
            window.speechSynthesis.speak(utterance);
            utterance.onerror = (event) => {
                console.error("Speech synthesis error:", event.error);
                showToast(`❌ Failed to play audio: ${event.error}. Please check browser settings.`, "error");
            };
        } catch (error) {
            console.error("TTS replay error:", error);
            showToast(`❌ Failed to replay audio: ${error instanceof Error ? error.message : "Unknown error"}`, "error");
        }
    };

    if (isLoadingAuth) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="bg-white/2 rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center animate-pulse">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-2 border-4 border-purple-600 border-t-transparent rounded-full animate-spin animate-reverse"></div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h2>
                    <p className="text-gray-600">Checking authentication status</p>
                </div>
            </div>
        );
    }

    if (isSaving) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="bg-white/2 rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-2 border-4 border-purple-600 border-t-transparent rounded-full animate-spin animate-reverse"></div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Saving Interview...</h2>
                    <p className="text-gray-600">Please wait while we save your responses</p>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="bg-white/2 rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-2 border-4 border-purple-600 border-t-transparent rounded-full animate-spin animate-reverse"></div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Questions...</h2>
                    <p className="text-gray-600">Preparing your personalized interview</p>
                </div>
            </div>
        );
    }

    const progressPercent = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Subtle animated background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
            </div>

            <header className="fixed top-0 left-0 right-0 z-30 bg-black/90 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 group"
                            >
                                <ArrowLeft className="w-5 h-5 text-white/70 group-hover:text-white" />
                            </button>
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-blue-800 rounded-xl flex items-center justify-center">
                                    <MessageSquare className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-white">Interview Practice</h1>
                                    <p className="text-sm text-white/70">
                                        {interviewType} Interview for {interviewRole}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="hidden sm:flex items-center space-x-4">
                                <div className="flex items-center space-x-3 bg-white/5 rounded-xl px-4 py-2 border border-white/10">
                                    <MessageSquare className="w-4 h-4 text-blue-700" />
                                    <span className="text-sm text-white">Question {currentIndex + 1}/{questions.length}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-700 to-blue-600 transition-all duration-700 ease-out rounded-full"
                                            style={{ width: `${progressPercent}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-white min-w-[3rem]">{Math.round(progressPercent)}%</span>
                                </div>
                            </div>
                            <button
                                onClick={toggleTts}
                                className={`p-3 rounded-xl transition-all duration-200 border ${isTtsEnabled ? "bg-blue-700/20 border-blue-700/30 text-blue-700" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"}`}
                            >
                                {isTtsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={toggleSidePanel}
                                className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200 lg:hidden border border-white/10"
                            >
                                <Menu className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="pt-24 pb-8 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                        <div className="lg:col-span-3 space-y-6">
                            {/* Main Interview Question Card */}
                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/10">
                                <div className="bg-gradient-to-r from-blue-700/10 to-blue-600/10 p-6 ">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-700 to-blue-800 rounded-xl flex items-center justify-center">
                                                <User className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <span className="text-base font-semibold text-white">PreplystHub - AI</span>
                                                <p className="text-sm text-white/70">Question {currentIndex + 1} of {questions.length}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 bg-white/10 rounded-xl px-4 py-2 border border-white/10">
                                            <Clock className="w-4 h-4 text-blue-700" />
                                            <span className="font-mono text-sm text-white">{formatTime(timer)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <InterviewQuestion
                                        question={questions[currentIndex]}
                                        index={currentIndex + 1}
                                        total={questions.length}
                                        onNext={handleNext}
                                    />
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
                                        <button
                                            onClick={handlePrevious}
                                            disabled={currentIndex === 0}
                                            className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${currentIndex === 0 ? "bg-white/5 text-white/40 cursor-not-allowed border border-white/10" : "bg-white/10 text-white hover:bg-white/20 border border-white/20 hover:border-white/30"}`}
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            <span>Previous</span>
                                        </button>
                                        <div className="text-center py-3">
                                            <div className="text-sm text-white/70">
                                                {currentIndex < questions.length - 1 ? "Keep going! You're doing amazing!" : "Final question - finish strong!"}
                                            </div>
                                        </div>
                                        <button
                                            onClick={replayQuestion}
                                            className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-blue-700 text-white hover:bg-blue-600 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
                                        >
                                            <Volume2 className="w-4 h-4" />
                                            <span>Play Question</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Pro Tips Card */}
                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                    <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center mr-3">
                                        <MessageSquare className="w-4 h-4 text-white" />
                                    </div>
                                    Pro Interview Tips
                                </h3>
                                <div className="grid sm:grid-cols-3 gap-6 text-sm">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-700 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className="text-white/80">Take time to think before answering</span>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-700 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className="text-white/80">Use specific examples from experience</span>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-700 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className="text-white/80">Structure answers clearly and concisely</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1 space-y-6">
                            {/* Camera Section */}
                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/10">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-white">Camera</h3>
                                    <button
                                        onClick={toggleWebcam}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium ${isWebcamVisible ? "bg-red-700/20 text-red-400 border border-red-700/30 hover:bg-red-700/30" : "bg-blue-700/20 text-blue-400 border border-blue-700/30 hover:bg-blue-700/30"}`}
                                    >
                                        {isWebcamVisible ? (
                                            <>
                                                <CameraOff className="w-4 h-4" />
                                                <span>Turn Off</span>
                                            </>
                                        ) : (
                                            <>
                                                <Camera className="w-4 h-4" />
                                                <span>Turn On</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                {isWebcamVisible && (
                                    <div className="space-y-4">
                                        <WebcamPreview
                                            onToggleSize={toggleWebcamSize}
                                            isActive={isWebcamVisible}
                                        />
                                        <p className="text-sm text-white/70 text-center">
                                            Practice your body language and expressions
                                        </p>
                                    </div>
                                )}
                                {!isWebcamVisible && (
                                    <div className="aspect-video bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                                        <div className="text-center">
                                            <Camera className="w-12 h-12 text-white/40 mx-auto mb-3" />
                                            <p className="text-sm text-white/60">Camera is off</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Questions List */}
                            <div className="hidden lg:block bg-white/5 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/10">
                                <h3 className="text-lg font-semibold text-white mb-6">All Questions</h3>
                                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                                    {questions.map((question, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setCurrentIndex(index);
                                                setTimer(0);
                                                localStorage.setItem("currentQuestionIndex", index.toString());
                                            }}
                                            className={`w-full text-left p-4 rounded-xl transition-all duration-200 group border ${index === currentIndex ? "bg-blue-700/20 border-blue-700/30 text-white shadow-lg" : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20"}`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-blue-400">Question {index + 1}</span>
                                                {index < currentIndex && (
                                                    <CheckCircle className="w-5 h-5 text-blue-700" />
                                                )}
                                                {index === currentIndex && (
                                                    <div className="w-2 h-2 bg-blue-700 rounded-full animate-pulse"></div>
                                                )}
                                            </div>
                                            <p className="text-sm text-white/70 line-clamp-2 group-hover:text-white/90 transition-colors duration-200">{question}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Side Panel */}
            <div className={`fixed inset-0 z-40 lg:hidden transform transition-transform duration-300 ${isSidePanelOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={toggleSidePanel}></div>
                <div className="absolute right-0 top-0 bottom-0 w-80 bg-black/95 backdrop-blur-xl shadow-2xl border-l border-white/10">
                    <div className="p-6 overflow-y-auto h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white">All Questions</h3>
                            <button
                                onClick={toggleSidePanel}
                                className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {questions.map((question, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setCurrentIndex(index);
                                        setTimer(0);
                                        setIsSidePanelOpen(false);
                                        localStorage.setItem("currentQuestionIndex", index.toString());
                                    }}
                                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 border ${index === currentIndex ? "bg-blue-700/20 border-blue-700/30 text-white shadow-lg" : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20"}`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-blue-400">Question {index + 1}</span>
                                        {index < currentIndex && (
                                            <CheckCircle className="w-5 h-5 text-blue-700" />
                                        )}
                                        {index === currentIndex && (
                                            <div className="w-3 h-3 bg-blue-700 rounded-full animate-pulse"></div>
                                        )}
                                    </div>
                                    <p className="text-sm text-white/70 line-clamp-3">{question}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .animate-fade-in {
                    animation: fadeIn 0.6s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .line-clamp-3 {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(59, 130, 246, 0.3) transparent;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(59, 130, 246, 0.3);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(59, 130, 246, 0.5);
                }
            `}</style>
        </div>
    );
}