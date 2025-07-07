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
    Target,
    ListChecks,
    Languages,
    Tag,
    CheckCircle,
    Users,
    Award
} from "lucide-react";

export default function HomeForm() {
    const router = useRouter();
    const [jobProfile, setJobProfile] = useState("");
    const [experienceLevel, setExperienceLevel] = useState("Fresher");
    const [skills, setSkills] = useState("");
    const [interviewType, setInterviewType] = useState("Technical");
    const [language, setLanguage] = useState("English");
    const [targetCompany, setTargetCompany] = useState("");
    const [focusTopics, setFocusTopics] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/generateQuestions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jobProfile,
                    experienceLevel,
                    skills,
                    interviewType,
                    language,
                    targetCompany,
                    focusTopics
                }),
            });
            const data = await res.json();
            localStorage.setItem("questions", JSON.stringify(data.questions));
            localStorage.setItem("currentQuestionIndex", "0");
            router.push("/interview");
        } catch (error) {
            console.error("Failed to generate questions.", error);
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

    // const predefinedSkills = [
    //     "Python", "JavaScript", "React", "Node.js", "SQL", "AWS", "Docker", "Git",
    //     "Communication", "Leadership", "Problem Solving", "Team Work", "Project Management",
    //     "Java", "C++", "MongoDB", "PostgreSQL", "Machine Learning", "Data Analysis"
    // ];

    // const interviewTypes = [
    //     { value: "Technical", label: "Technical Interview", desc: "Coding, system design, technical concepts" },
    //     { value: "HR", label: "HR Interview", desc: "Behavioral, cultural fit, company-specific" },
    //     { value: "Managerial", label: "Managerial Interview", desc: "Leadership, management scenarios" },
    //     { value: "Case Study", label: "Case Study", desc: "Problem-solving, analytical thinking" },
    //     { value: "Group Discussion", label: "Group Discussion", desc: "Communication, teamwork, debate skills" }
    // ];

    const floatingElements = [
        { icon: Brain, delay: "0s", duration: "6s", position: { left: "15%", top: "20%" } },
        { icon: Zap, delay: "1s", duration: "8s", position: { left: "85%", top: "15%" } },
        { icon: Globe, delay: "2s", duration: "7s", position: { left: "75%", top: "70%" } },
        { icon: Smartphone, delay: "3s", duration: "9s", position: { left: "20%", top: "80%" } },
        { icon: Server, delay: "4s", duration: "6s", position: { left: "90%", top: "45%" } },
        { icon: Camera, delay: "5s", duration: "8s", position: { left: "10%", top: "50%" } }
    ];

    const features = [
        { icon: CheckCircle, text: "Personalized Questions" },
        { icon: Users, text: "Real Interview Scenarios" },
        { icon: Award, text: "Industry Standards" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 overflow-hidden relative">
            {/* Enhanced Background Elements */}
            <div className="absolute inset-0">
                {/* Improved Gradient Orbs */}
                <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-indigo-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-indigo-100/40 to-blue-100/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-gradient-to-r from-blue-100/25 to-indigo-100/20 rounded-full blur-3xl animate-pulse delay-2000"></div>

                {/* Floating Icons */}
                {floatingElements.map((element, index) => (
                    <div
                        key={index}
                        className="absolute opacity-15"
                        style={{
                            left: element.position.left,
                            top: element.position.top,
                            animation: `float ${element.duration} ease-in-out infinite`,
                            animationDelay: element.delay
                        }}
                    >
                        <element.icon className="w-8 h-8 text-blue-500" />
                    </div>
                ))}
            </div>

            {/* Enhanced Grid Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%234F46E5%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

            <div className="relative z-10 flex items-center justify-center min-h-screen p-4 lg:p-8">
                <div className="w-full max-w-7xl grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">

                    {/* Left Side - Enhanced Form (60% width) */}
                    <div className="lg:col-span-3 relative">
                        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 lg:p-10 relative overflow-hidden">

                            {/* Form Background Pattern */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-indigo-50/20"></div>

                            {/* Floating Accent */}
                            <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-xl"></div>

                            {/* Enhanced Form Header */}
                            <div className="text-center mb-8 relative z-10">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl mb-6 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300">
                                    <Briefcase className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-3">
                                    Start Your
                                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Practice</span>
                                </h2>
                                <p className="text-gray-600 text-lg">Generate personalized interview questions tailored for you</p>

                                {/* Feature Pills */}
                                <div className="flex flex-wrap justify-center gap-2 mt-4">
                                    {features.map((feature, index) => (
                                        <div key={index} className="flex items-center space-x-2 bg-blue-50/50 text-blue-700 px-3 py-1 rounded-full text-sm">
                                            <feature.icon className="w-3 h-3" />
                                            <span>{feature.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">

                                {/* Enhanced Input Groups */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                    {/* Job Profile */}
                                    <div className="lg:col-span-2 space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                                                <Briefcase className="w-3 h-3 text-blue-600" />
                                            </div>
                                            Job Profile
                                        </label>
                                        <input
                                            type="text"
                                            value={jobProfile}
                                            onChange={(e) => setJobProfile(e.target.value)}
                                            placeholder="e.g., Frontend Developer, Data Scientist, Product Manager"
                                            required
                                            className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-500"
                                        />
                                    </div>

                                    {/* Experience Level */}
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                            <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                                                <User className="w-3 h-3 text-green-600" />
                                            </div>
                                            Experience Level
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={experienceLevel}
                                                onChange={(e) => setExperienceLevel(e.target.value)}
                                                className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none appearance-none transition-all duration-300 text-gray-800"
                                            >
                                                <option value="Fresher">Fresher (0-1 years)</option>
                                                <option value="Junior">Junior (1-3 years)</option>
                                                <option value="Mid">Mid-level (3-6 years)</option>
                                                <option value="Senior">Senior (6+ years)</option>

                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <ChevronDown className="w-4 h-4 text-gray-500" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Interview Type */}
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                            <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-2">
                                                <ListChecks className="w-3 h-3 text-purple-600" />
                                            </div>
                                            Interview Type
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={interviewType}
                                                onChange={(e) => setInterviewType(e.target.value)}
                                                className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none appearance-none transition-all duration-300 text-gray-800"
                                            >
                                                <option value="Technical">Technical</option>
                                                <option value="HR">HR / Behavioral</option>
                                                <option value="Managerial">Managerial</option>
                                                <option value="Mixed">Mixed</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <ChevronDown className="w-4 h-4 text-gray-500" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                            <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center mr-2">
                                                <Tag className="w-3 h-3 text-orange-600" />
                                            </div>
                                            Key Skills
                                        </label>
                                        <input
                                            type="text"
                                            value={skills}
                                            onChange={(e) => setSkills(e.target.value)}
                                            placeholder="e.g., React, SQL, Python, Leadership"
                                            className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-500"
                                        />
                                    </div>

                                    {/* Language */}
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                            <div className="w-6 h-6 bg-pink-100 rounded-lg flex items-center justify-center mr-2">
                                                <Languages className="w-3 h-3 text-pink-600" />
                                            </div>
                                            Language
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={language}
                                                onChange={(e) => setLanguage(e.target.value)}
                                                className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none appearance-none transition-all duration-300 text-gray-800"
                                            >
                                                <option value="English">English</option>
                                                <option value="Hindi">Hindi</option>
                                                <option value="Bilingual">Bilingual</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <ChevronDown className="w-4 h-4 text-gray-500" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Target Company */}
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                            <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center mr-2">
                                                <Target className="w-3 h-3 text-indigo-600" />
                                            </div>
                                            Target Company
                                            <span className="ml-2 text-xs text-gray-500 font-normal">(optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={targetCompany}
                                            onChange={(e) => setTargetCompany(e.target.value)}
                                            placeholder="e.g., Google, Microsoft, Amazon"
                                            className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-500"
                                        />
                                    </div>

                                    {/* Focus Topics */}
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                            <div className="w-6 h-6 bg-cyan-100 rounded-lg flex items-center justify-center mr-2">
                                                <ListChecks className="w-3 h-3 text-cyan-600" />
                                            </div>
                                            Focus Topics
                                            <span className="ml-2 text-xs text-gray-500 font-normal">(optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={focusTopics}
                                            onChange={(e) => setFocusTopics(e.target.value)}
                                            placeholder="e.g., System Design, Data Structures, Algorithms"
                                            className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-500"
                                        />
                                    </div>
                                </div>

                                {/* Enhanced Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center space-x-3 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span className="text-lg">Generating Questions...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            <span className="text-lg">Generate Questions</span>
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Side - Enhanced Hero Content (40% width) */}
                    <div className="lg:col-span-2 text-gray-800 space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                        Ace Your
                                    </span>
                                    <br />
                                    <span className="text-gray-800">Next Interview</span>
                                </h1>

                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Get personalized mock interview questions tailored to your role and experience level.
                                    Practice with confidence and land your dream job.
                                </p>
                            </div>
                        </div>

                        {/* Enhanced Job Categories */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                                <Star className="w-5 h-5 text-yellow-500 mr-2" />
                                Popular Categories
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                {jobCategories.slice(0, 4).map((category, index) => (
                                    <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:bg-white hover:shadow-lg transition-all duration-300 group cursor-pointer">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <category.icon className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-800">{category.title}</h4>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {category.roles.slice(0, 2).map((role, roleIndex) => (
                                                        <span key={roleIndex} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                                                            {role}
                                                        </span>
                                                    ))}
                                                    {category.roles.length > 2 && (
                                                        <span className="text-xs text-gray-500 px-2 py-1">
                                                            +{category.roles.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Enhanced Success Stats */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="space-y-1">
                                    <div className="text-2xl font-bold text-blue-600">10K+</div>
                                    <div className="text-sm text-gray-600">Questions</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-2xl font-bold text-indigo-600">95%</div>
                                    <div className="text-sm text-gray-600">Success Rate</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-2xl font-bold text-blue-600">50+</div>
                                    <div className="text-sm text-gray-600">Job Roles</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Custom CSS */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
                
                input:focus, select:focus {
                    transform: translateY(-1px);
                }
                
                .group:hover .group-hover\\:scale-110 {
                    transform: scale(1.1);
                }
            `}</style>
        </div>
    );
}