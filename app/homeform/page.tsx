"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Briefcase,
    User,
    ChevronDown,
    Sparkles,
    ArrowRight,
    Brain,
    Zap,
    Shield,
    Code,
    Database,
    Palette,
    MessageCircle,
    TrendingUp,
    Globe,
    Smartphone,
    Server,
    Camera,
    Star,
    Clock,
    Target
} from "lucide-react";

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

    const jobCategories = [
        { icon: Code, title: "Development", roles: ["Frontend", "Backend", "Full Stack", "Mobile"] },
        { icon: Database, title: "Data Science", roles: ["Data Analyst", "ML Engineer", "Data Engineer"] },
        { icon: Palette, title: "Software Dev.", roles: ["System engg.", "Developer", "Product Design"] },
        { icon: MessageCircle, title: "Marketing", roles: ["Digital Marketing", "Content", "SEO"] },
        { icon: TrendingUp, title: "Business", roles: ["Product Manager", "Business Analyst", "Consultant"] },
        { icon: Shield, title: "Security", roles: ["DevOps", "Cloud Engineer", "Cybersecurity"] }
    ];

    const floatingElements = [
        { icon: Brain, delay: "0s", duration: "6s", position: { left: "15%", top: "20%" } },
        { icon: Zap, delay: "1s", duration: "8s", position: { left: "85%", top: "15%" } },
        { icon: Globe, delay: "2s", duration: "7s", position: { left: "75%", top: "70%" } },
        { icon: Smartphone, delay: "3s", duration: "9s", position: { left: "20%", top: "80%" } },
        { icon: Server, delay: "4s", duration: "6s", position: { left: "90%", top: "45%" } },
        { icon: Camera, delay: "5s", duration: "8s", position: { left: "10%", top: "50%" } }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
                {/* Gradient Orbs */}
                <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>

                {/* Floating Icons */}
                {floatingElements.map((element, index) => (
                    <div
                        key={index}
                        className="absolute opacity-10"
                        style={{
                            left: element.position.left,
                            top: element.position.top,
                            animation: `float ${element.duration} ease-in-out infinite`,
                            animationDelay: element.delay
                        }}
                    >
                        <element.icon className="w-8 h-8 text-white" />
                    </div>
                ))}
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

            <div className="relative z-10 flex items-center justify-center min-h-screen p-8">

                <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-16 items-center">

                    {/* Right Side - Hero Content */}
                    <div className="text-white space-y-10 order-1 lg:order-2">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h1 className="text-3xl sm:text-7xl font-bold leading-tight">
                                    <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                        Ace Your
                                    </span>
                                    <br />
                                    <span className="text-white">Next Interview</span>
                                </h1>

                                <p className="sm:text-xl text-base text-gray-300 leading-relaxed max-w-lg">
                                    Get personalized mock interview questions tailored to your role and experience level.
                                    Practice with confidence and land your dream job.
                                </p>
                            </div>
                        </div>

                        {/* Job Categories Grid */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-white">Popular Job Categories</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {jobCategories.map((category, index) => (
                                    <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all duration-300 group cursor-pointer">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <category.icon className="w-4 h-4 text-white" />
                                            </div>
                                            <h4 className="font-medium text-white text-sm">{category.title}</h4>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {category.roles.slice(0, 2).map((role, roleIndex) => (
                                                <span key={roleIndex} className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full">
                                                    {role}
                                                </span>
                                            ))}
                                            {category.roles.length > 2 && (
                                                <span className="text-xs text-gray-400 px-2 py-1">
                                                    +{category.roles.length - 2} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Success Stats */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                            <div className="grid grid-cols-3 gap-6 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-cyan-400">10K+</div>
                                    <div className="text-sm text-gray-400">Questions Generated</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-blue-400">95%</div>
                                    <div className="text-sm text-gray-400">Success Rate</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-purple-400">50+</div>
                                    <div className="text-sm text-gray-400">Job Roles</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Left Side - Form */}
                    <div className="relative order-2 lg:order-1">

                        {/* Glassmorphism Form Container */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
                            {/* Form Background Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>

                            <div className="relative z-10">

                                {/* Form Header */}
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-4 shadow-lg">
                                        <Briefcase className="w-8 h-8 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Start Your Practice</h2>
                                    <p className="text-gray-300">Generate personalized questions in seconds</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Job Profile Input */}
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-gray-200 mb-2">
                                            <Briefcase className="w-4 h-4 mr-2 text-cyan-400" />
                                            Job Profile
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={jobProfile}
                                                onChange={(e) => setJobProfile(e.target.value)}
                                                placeholder="e.g., Frontend Developer, Data Scientist"
                                                required
                                                className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:border-cyan-400 focus:bg-white/20 focus:outline-none transition-all duration-300 text-white placeholder-gray-400"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                        </div>
                                    </div>

                                    {/* Experience Level Select */}
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-gray-200 mb-2">
                                            <User className="w-4 h-4 mr-2 text-cyan-400" />
                                            Experience Level
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={experienceLevel}
                                                onChange={(e) => setExperienceLevel(e.target.value)}
                                                className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:border-cyan-400 focus:bg-white/20 focus:outline-none transition-all duration-300 text-white appearance-none cursor-pointer"
                                            >
                                                <option value="Fresher" className="bg-slate-800 text-white">Fresher (0-1 years)</option>
                                                <option value="Junior" className="bg-slate-800 text-white">Junior (1-3 years)</option>
                                                <option value="Mid" className="bg-slate-800 text-white">Mid-level (3-6 years)</option>
                                                <option value="Senior" className="bg-slate-800 text-white">Senior (6+ years)</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center space-x-2 ${loading ? "opacity-70 cursor-not-allowed transform-none" : ""}`}
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
                                </form>

                                {/* Form Features */}
                                <div className="mt-8 pt-6 border-t border-white/20">
                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                                            <span>AI-Powered</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            <span>Personalized</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                            <span>Industry-Specific</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                                            <span>Real-time</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom CSS for animations */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
            `}</style>
        </div>
    );
}