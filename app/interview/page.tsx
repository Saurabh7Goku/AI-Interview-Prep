"use client";
import { useEffect, useState } from "react";
import InterviewQuestion from "@/components/InterviewQuestion";
import { useRouter } from "next/navigation";
import { evaluateAnswer } from "@/lib/gemini";
import { Briefcase, Clock, MessageSquare, User, ArrowLeft, CheckCircle, Mic, Video, ChevronLeft, ChevronRight, Check, Camera, CameraOff, Menu, X } from "lucide-react";
import WebcamPreview from "@/components/WebcamPreview"; // Import WebcamPreview component

export default function InterviewPage() {
    const router = useRouter();
    const [questions, setQuestions] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [feedbacks, setFeedbacks] = useState<Record<number, string>>({});
    const [scores, setScores] = useState<Record<number, number>>({});
    const [timer, setTimer] = useState(0);
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [isWebcamVisible, setIsWebcamVisible] = useState(false);
    const [isWebcamMinimized, setIsWebcamMinimized] = useState(true);
    const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);

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

    // Timer logic
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
                setTimer(0);
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
                setTimer(0);
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
            // Turn off the camera
            setIsWebcamVisible(false);
            if (webcamStream) {
                // Stop all tracks in the stream
                webcamStream.getTracks().forEach((track) => track.stop());
                setWebcamStream(null); // Release the stream reference
            }
        } else {
            // Turn on the camera
            setIsWebcamVisible(true);
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: false })
                .then((stream) => {
                    setWebcamStream(stream); // Store the stream
                    // Use the stream for rendering (e.g., in a <video> element)
                })
                .catch((error) => {
                    console.error("Error accessing camera:", error);
                    setIsWebcamVisible(false); // Reset state if access fails
                });
        }
    };

    const toggleWebcamSize = () => {
        setIsWebcamMinimized(!isWebcamMinimized);
    };

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full mx-4 text-center animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
                        <Clock className="w-8 h-8 text-white animate-spin" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Questions...</h2>
                    <p className="text-gray-600">Preparing your personalized interview</p>
                </div>
            </div>
        );
    }

    const progressPercent = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
            </div>

            {/* Fixed Header */}
            <header className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors duration-200"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <div>
                                    <h1 className="text-lg font-bold text-slate-800">Interview Practice</h1>
                                    <p className="text-xs text-slate-500">AI-powered interview preparation</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="hidden sm:flex items-center space-x-3">
                                <div className="flex items-center space-x-2 text-sm text-slate-600">
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Question {currentIndex + 1}/{questions.length}</span>
                                </div>
                                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                                        style={{ width: `${progressPercent}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm font-medium text-slate-700">{Math.round(progressPercent)}%</span>
                            </div>

                            <button
                                onClick={toggleSidePanel}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors duration-200 lg:hidden"
                            >
                                <Menu className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="pt-20 pb-8 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                        {/* Main Interview Section */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Question Card */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium opacity-90">Interviewer</span>
                                                <p className="text-xs opacity-75">Question {currentIndex + 1} of {questions.length}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm bg-white/10 rounded-full px-3 py-1">
                                            <Clock className="w-4 h-4" />
                                            <span className="font-mono">{formatTime(timer)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <InterviewQuestion
                                        question={questions[currentIndex]}
                                        index={currentIndex + 1}
                                        total={questions.length}
                                        onNext={handleNext}
                                    />

                                    {/* Controls */}
                                    <div className="flex grid grid-cols-1 items-center justify-between mt-6 pt-4 border-t border-slate-100">
                                        <button
                                            onClick={handlePrevious}
                                            disabled={currentIndex === 0}
                                            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium
                                                ${currentIndex === 0
                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-md'}`}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            <span>Previous</span>
                                        </button>

                                        <div className="text-center">
                                            <div className="text-xs text-slate-500 mb-1">
                                                {currentIndex < questions.length - 1 ? "Keep going! You're doing amazing!" : "Final question - finish strong!"}
                                            </div>
                                        </div>

                                        <div className="w-20"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Tips Section */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                                <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Pro Interview Tips
                                </h3>
                                <div className="grid sm:grid-cols-3 gap-4 text-sm text-blue-700">
                                    <div className="flex items-start space-x-2">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <span>Take time to think before answering</span>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <span>Use specific examples from experience</span>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <span>Structure answers clearly and concisely</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Webcam Section */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-slate-800">Camera</h3>
                                    <button
                                        onClick={toggleWebcam}
                                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium
                                            ${isWebcamVisible
                                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
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
                                    <div className="space-y-3">
                                        <WebcamPreview
                                            onToggleSize={toggleWebcamSize}
                                            isActive={isWebcamVisible}
                                        />
                                        <p className="text-xs text-slate-500 text-center">
                                            Practice your body language and expressions
                                        </p>
                                    </div>
                                )}

                                {!isWebcamVisible && (
                                    <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                                        <div className="text-center">
                                            <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                            <p className="text-xs text-slate-500">Camera off</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Questions Navigation - Desktop */}
                            <div className="hidden lg:block bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 p-4">
                                <h3 className="text-sm font-semibold text-slate-800 mb-4">All Questions</h3>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {questions.map((question, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setCurrentIndex(index);
                                                setTimer(0);
                                                localStorage.setItem("currentQuestionIndex", index.toString());
                                            }}
                                            className={`w-full text-left p-3 rounded-lg transition-all duration-200 group
                                                ${index === currentIndex
                                                    ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 shadow-md'
                                                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:shadow-md'}`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-medium">Question {index + 1}</span>
                                                {index < currentIndex && (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                )}
                                                {index === currentIndex && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-600 line-clamp-2">{question}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Questions Panel */}
            <div className={`fixed inset-0 z-40 lg:hidden transform transition-transform duration-300 ${isSidePanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={toggleSidePanel}></div>
                <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl p-6 overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-800">All Questions</h3>
                        <button
                            onClick={toggleSidePanel}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors duration-200"
                        >
                            <X className="w-5 h-5 text-slate-600" />
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
                                className={`w-full text-left p-4 rounded-xl transition-all duration-200
                                    ${index === currentIndex
                                        ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 shadow-lg'
                                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:shadow-md'}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Question {index + 1}</span>
                                    {index < currentIndex && (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    )}
                                    {index === currentIndex && (
                                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                    )}
                                </div>
                                <p className="text-sm text-slate-600 line-clamp-3">{question}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* CSS for animations */}
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
            `}</style>
        </div>
    );
}