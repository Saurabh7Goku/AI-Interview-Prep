"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, User, ChevronDown, Sparkles, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ToastProvide";


export default function HomeForm() {
    const router = useRouter();
    const [jobProfile, setJobProfile] = useState("");
    const [experienceLevel, setExperienceLevel] = useState("Fresher");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/generateQuestions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobProfile, experienceLevel }),
            });
            const data = await res.json();
            localStorage.setItem("questions", JSON.stringify(data.questions));
            localStorage.setItem("currentQuestionIndex", "0");
            router.push("/interview");
        } catch (error) {
            console.log("Failed to generate questions.", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-600 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-blue-300 rounded-full blur-2xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl mb-4 shadow-lg">
                        <Briefcase className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Interview Prep</h1>
                    <p className="text-gray-600">Generate personalized questions for your next interview</p>
                </div>

                {/* Form Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-100 p-8">
                    <div className="space-y-6">
                        {/* Job Profile Input */}
                        <div className="space-y-2">
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
                                Job Profile
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={jobProfile}
                                    onChange={(e) => setJobProfile(e.target.value)}
                                    placeholder="e.g., Frontend Developer, Data Scientist"
                                    required
                                    className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl opacity-0 hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Experience Level Select */}
                        <div className="space-y-2">
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <User className="w-4 h-4 mr-2 text-blue-600" />
                                Experience Level
                            </label>
                            <div className="relative">
                                <select
                                    value={experienceLevel}
                                    onChange={(e) => setExperienceLevel(e.target.value)}
                                    className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 text-gray-800 appearance-none cursor-pointer"
                                >
                                    <option value="Fresher">Fresher (0-1 years)</option>
                                    <option value="Junior">Junior (1-3 years)</option>
                                    <option value="Mid">Mid-level (3-6 years)</option>
                                    <option value="Senior">Senior (6+ years)</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl opacity-0 hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            onClick={handleSubmit}
                            className={`w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center space-x-2 ${loading ? "opacity-70 cursor-not-allowed transform-none" : ""
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Generating Questions...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    <span>Generate Questions</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Features List */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Tailored Questions</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Role-specific</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Level-appropriate</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>AI-powered</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-sm text-gray-500">
                    Powered by AI • Personalized for your success
                </div>
            </div>
        </div>
    );
}