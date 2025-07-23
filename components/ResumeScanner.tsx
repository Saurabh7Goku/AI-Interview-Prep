"use client";

import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase/firebase";
import { addDoc, collection, getDocs, query } from "firebase/firestore";
import toast from "react-hot-toast";
import {
    Upload, FileText, Building2, Target, Clock, Search, ChevronDown, ChevronUp, LucideStore,
    CheckCircle2, XCircle, AlertCircle, Lightbulb, Brain, User, Menu, X, Home, DollarSign, HelpCircle,
    Sparkles, Zap,
    LucideHome
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import AuthButton from "./AuthButton";
import { ATSReport } from "@/types";
import logo from "@/public/logo.png";
import { useRouter } from "next/navigation";



export default function ResumeScanner() {
    const router = useRouter();
    const [user] = useAuthState(auth);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [yearsOfExperience, setYearsOfExperience] = useState<number>(0);
    const [report, setReport] = useState<ATSReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [existingReports, setExistingReports] = useState<ATSReport[]>([]);
    const [expandedSections, setExpandedSections] = useState({
        ATS: false,
        skills: false,
        toneAndStyle: false,
        content: false,
        structure: false,
        general: false,
    });

    useEffect(() => {
        const fetchReports = async () => {
            if (!user) return;
            const q = query(collection(db, `users/${user.uid}/reports`));
            const querySnapshot = await getDocs(q);
            const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ATSReport[];
            setExistingReports(fetched);
        };

        fetchReports();
    }, [user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setResumeFile(e.target.files[0]);
    };

    const handleScan = async () => {
        if (!user) {
            toast.error("Please sign in to scan your resume.");
            return;
        }

        if (existingReports.length >= 3) {
            toast.custom((t) => (
                <div className="bg-white border border-red-200 shadow-lg rounded-xl p-4 max-w-sm w-full flex items-start space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold">
                        !
                    </div>
                    <div className="text-sm text-gray-800">
                        <p className="font-semibold">Free trial limit reached</p>
                        <p className="text-xs text-gray-500 mt-1">You’ve used all 3 free scans. Visit the Subscription page to unlock more scans.</p>
                        <button
                            className="mt-2 text-blue-600 text-xs font-medium underline"
                            onClick={() => {
                                toast.dismiss(t.id);
                                router.push("/subscription");
                            }}
                        >
                            Go to Subscription
                        </button>
                    </div>
                </div>
            ));
            return;
        }

        if (!resumeFile || !jobDescription || !companyName || !jobTitle) {
            toast.error("Please fill in all fields and upload a resume.");
            return;
        }

        setLoading(true);
        toast.loading("Uploading and scanning your resume...", { id: "scan" });

        try {
            const formData = new FormData();
            formData.append("resume", resumeFile);
            formData.append("jobDescription", jobDescription);
            formData.append("yearsOfExperience", yearsOfExperience.toString());

            const response = await fetch("/api/scan-resume", {
                method: "POST",
                body: formData,
            });

            const reportData = await response.json();
            toast.success("Resume scanned successfully!", { id: "scan" });

            const newReport: ATSReport = {
                id: "",
                userId: user.uid,
                jobTitle,
                companyName,
                matchScore: reportData.matchScore || reportData.overallScore || 0,
                missingKeywords: reportData.missingKeywords || [],
                formattingIssues: reportData.formattingIssues || [],
                contentSuggestions: reportData.contentSuggestions || [],
                hardSkillsMatch: reportData.hardSkillsMatch || [],
                softSkillsMatch: reportData.softSkillsMatch || [],
                experienceAlignment: reportData.experienceAlignment || "",
                resumeText: reportData.resumeText || "",
                jobDescription,
                createdAt: new Date().toISOString(),
                skills: reportData.skills || { score: 0, tips: [] },
                toneAndStyle: reportData.toneAndStyle || { score: 0, tips: [] },
                content: reportData.content || { score: 0, tips: [] },
                structure: reportData.structure || { score: 0, tips: [] },
                ATS: reportData.ATS || { tips: [] },
            };

            const docRef = await addDoc(collection(db, `users/${user.uid}/reports`), newReport);
            setReport({ ...newReport, id: docRef.id });
        } catch (error) {
            console.error("Scan error:", error);
            toast.error("Failed to scan resume. Please try again.", { id: "scan" });
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
        if (score >= 60) return "bg-gradient-to-r from-blue-400 to-blue-500 text-white";
        return "bg-gradient-to-r from-blue-300 to-blue-400 text-white";
    };

    const getCategoryColor = (category: keyof typeof expandedSections) => {
        const colors = {
            ATS: "bg-blue-50 border-blue-200 text-blue-800",
            skills: "bg-blue-50 border-blue-200 text-blue-800",
            toneAndStyle: "bg-blue-50 border-blue-200 text-blue-800",
            content: "bg-blue-50 border-blue-200 text-blue-800",
            structure: "bg-blue-50 border-blue-200 text-blue-800",
            general: "bg-blue-50 border-blue-200 text-blue-800",
        };
        return colors[category];
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Navigation Bar */}
            <nav className="bg-white text-black border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md bg-white/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <Image src={logo} alt={"PreplystHub-AI logo"} />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">PreplystHub - AI</span>
                        </Link>
                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="dashboard" className="hover:text-blue-600 transition-all duration-300 flex items-center text-sm font-medium group">
                                <LucideHome className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                Home
                            </Link>
                            <Link href="/atsDashboard" className="hover:text-blue-600 transition-all duration-300 flex items-center text-sm font-medium group">
                                <LucideStore className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                Past Scans
                            </Link>
                            <Link href="/subscription" className="hover:text-blue-600 transition-all duration-300 flex items-center text-sm font-medium group">
                                <DollarSign className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                Pricing
                            </Link>
                            <AuthButton />
                        </div>
                        <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                    {isMenuOpen && (
                        <div className="md:hidden mt-4 space-y-3 bg-gray-50 rounded-2xl p-4 animate-in slide-in-from-top-2 duration-200">
                            <Link href="/dashboard" className="block hover:text-blue-600 transition-colors py-2 flex items-center text-sm">
                                <LucideHome className="w-4 h-4 mr-2" /> Home
                            </Link>
                            <Link href="/atsDashboard" className="block hover:text-blue-600 transition-colors py-2 flex items-center text-sm">
                                <LucideStore className="w-4 h-4 mr-2" /> Past Scans
                            </Link>
                            <Link href="/subscription" className="block hover:text-blue-600 transition-colors py-2 flex items-center text-sm">
                                <DollarSign className="w-4 h-4 mr-2" /> Pricing
                            </Link>
                            <AuthButton />
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            {!report && !loading && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
                        <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <Zap className="w-4 h-4" />
                            <span>AI-Powered Analysis</span>
                        </div>
                        <h1 className="text-5xl sm:text-6xl font-bold text-black mb-6 leading-tight">
                            Perfect Your Resume with
                            <span className="text-blue-600 block">Smart AI Analysis</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Get instant feedback on your resume's ATS compatibility, keyword optimization, and professional presentation to land your dream job faster.
                        </p>
                    </div>
                </section>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Form Panel */}
                    <div className={`transition-all duration-700 ${loading ? 'animate-pulse' : ''}`}>
                        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xl shadow-gray-100/50">
                            <div className="flex items-center space-x-3 mb-8">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-black">Resume & Job Details</h2>
                            </div>

                            <div className="space-y-8">
                                {/* Company Name */}
                                <div className="group">
                                    <label className="block text-sm font-semibold text-black mb-3 flex items-center group-focus-within:text-blue-600 transition-colors">
                                        <div className="w-5 h-5 mr-2 text-blue-500 group-focus-within:scale-110 transition-transform">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="w-full p-4 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-black placeholder-gray-400 bg-white hover:border-gray-300"
                                        placeholder="e.g., Google, Microsoft, Apple"
                                    />
                                </div>

                                {/* Job Title */}
                                <div className="group">
                                    <label className="block text-sm font-semibold text-black mb-3 flex items-center group-focus-within:text-blue-600 transition-colors">
                                        <div className="w-5 h-5 mr-2 text-blue-500 group-focus-within:scale-110 transition-transform">
                                            <Target className="w-5 h-5" />
                                        </div>
                                        Job Title
                                    </label>
                                    <input
                                        type="text"
                                        value={jobTitle}
                                        onChange={(e) => setJobTitle(e.target.value)}
                                        className="w-full p-4 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-black placeholder-gray-400 bg-white hover:border-gray-300"
                                        placeholder="e.g., Software Engineer, Product Manager"
                                    />
                                </div>

                                {/* Years of Experience */}
                                <div className="group">
                                    <label className="block text-sm font-semibold text-black mb-3 flex items-center group-focus-within:text-blue-600 transition-colors">
                                        <div className="w-5 h-5 mr-2 text-blue-500 group-focus-within:scale-110 transition-transform">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        Years of Experience
                                    </label>
                                    <input
                                        type="number"
                                        value={yearsOfExperience}
                                        onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                                        className="w-full p-4 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-black placeholder-gray-400 bg-white hover:border-gray-300"
                                        placeholder="Enter years of experience"
                                        min="0"
                                    />
                                </div>

                                {/* Job Description */}
                                <div className="group">
                                    <label className="block text-sm font-semibold text-black mb-3 flex items-center group-focus-within:text-blue-600 transition-colors">
                                        <div className="w-5 h-5 mr-2 text-blue-500 group-focus-within:scale-110 transition-transform">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        Job Description
                                    </label>
                                    <textarea
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        className="w-full p-4 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 resize-none text-black placeholder-gray-400 bg-white hover:border-gray-300"
                                        rows={6}
                                        placeholder="Paste the complete job description here..."
                                    />
                                </div>

                                {/* File Upload */}
                                <div className="group">
                                    <label className="block text-sm font-semibold text-black mb-3 flex items-center group-focus-within:text-blue-600 transition-colors">
                                        <div className="w-5 h-5 mr-2 text-blue-500 group-focus-within:scale-110 transition-transform">
                                            <Upload className="w-5 h-5" />
                                        </div>
                                        Upload Resume (PDF)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="resume-upload"
                                        />
                                        <label
                                            htmlFor="resume-upload"
                                            className={`w-full p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all duration-300 flex flex-col items-center space-y-4 group hover:border-blue-500 hover:bg-blue-50/50 ${resumeFile
                                                ? "border-blue-500 bg-blue-50/50 text-blue-700"
                                                : "border-gray-300 text-gray-500"
                                                }`}
                                        >
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${resumeFile
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-100 text-gray-400"
                                                }`}>
                                                <Upload className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {resumeFile ? resumeFile.name : "Click or drag to upload PDF resume"}
                                                </p>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    PDF files only, max 10MB
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    onClick={handleScan}
                                    disabled={loading || !user}
                                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-8 rounded-2xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center font-semibold text-lg shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                                            Analyzing Resume...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="w-6 h-6 mr-3" />
                                            Scan Resume
                                        </>
                                    )}
                                </button>

                                {!user && (
                                    <div className="text-center p-4 bg-blue-50 rounded-2xl">
                                        <p className="text-blue-700 text-sm">
                                            Please <Link href="/signin" className="font-semibold hover:underline">sign in</Link> to scan your resume
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Results Panel */}
                    <div className="relative">
                        {!report && !loading ? (
                            <div className="relative h-full min-h-[600px] overflow-hidden">
                                {/* Blue Half Circle Background */}
                                <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-90 animate-pulse"></div>

                                {/* Resume Image Container */}
                                <div className="relative z-10 flex items-center justify-center h-full">
                                    <div className="transform hover:scale-105 transition-all duration-700 animate-in fade-in-0 slide-in-from-right-8">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-3xl transform rotate-3 scale-105"></div>
                                            <div className="relative bg-white rounded-3xl shadow-2xl p-8 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                                                <Image
                                                    src="/dummy-resume.png"
                                                    alt="Resume Preview"
                                                    width={0}
                                                    height={0}
                                                    className="w-[400px] h-auto rounded-xl object-contain"
                                                />

                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Elements */}
                                <div className="absolute top-20 left-8 animate-float">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Sparkles className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                                <div className="absolute bottom-20 left-16 animate-float" style={{ animationDelay: '1s' }}>
                                    <div className="w-8 h-8 bg-blue-500 rounded-full opacity-60"></div>
                                </div>
                                <div className="absolute top-40 left-4 animate-float" style={{ animationDelay: '2s' }}>
                                    <div className="w-6 h-6 bg-blue-300 rounded-full opacity-40"></div>
                                </div>
                            </div>
                        ) : report ? (
                            <div className="bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-100/50 animate-in fade-in-0 slide-in-from-right-8 duration-700">
                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold text-black">{report.jobTitle}</h3>
                                            <p className="text-gray-600 flex items-center">
                                                <Building2 className="w-4 h-4 mr-2" />
                                                {report.companyName}
                                            </p>
                                            <p className="text-sm text-gray-500">Scanned on {new Date(report.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className={`px-6 py-4 rounded-2xl ${getScoreColor(report.matchScore)} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
                                            <span className="text-3xl font-bold block">{report.matchScore}%</span>
                                            <p className="text-sm opacity-90">Match Score</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {(["ATS", "skills", "toneAndStyle", "content", "structure", "general"] as const).map((category, index) => (
                                            <div
                                                key={category}
                                                className={`rounded-2xl p-6 ${getCategoryColor(category)} border shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4`}
                                                style={{ animationDelay: `${index * 100}ms` }}
                                            >
                                                <button
                                                    className="w-full flex items-center justify-between text-left group"
                                                    onClick={() => toggleSection(category)}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                            {category === "ATS" && <FileText className="w-5 h-5 text-blue-600" />}
                                                            {category === "skills" && <Brain className="w-5 h-5 text-blue-600" />}
                                                            {category === "toneAndStyle" && <Lightbulb className="w-5 h-5 text-blue-600" />}
                                                            {category === "content" && <FileText className="w-5 h-5 text-blue-600" />}
                                                            {category === "structure" && <Target className="w-5 h-5 text-blue-600" />}
                                                            {category === "general" && <AlertCircle className="w-5 h-5 text-blue-600" />}
                                                        </div>
                                                        <span className="font-bold text-lg capitalize">{category.replace(/([A-Z])/g, " $1").trim()}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        {category !== "general" && (
                                                            <span className={`px-4 py-2 rounded-xl text-sm font-bold ${getScoreColor(report.matchScore || 0)}`}>
                                                                {report.matchScore || 0}%
                                                            </span>
                                                        )}
                                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                            {expandedSections[category] ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-blue-600" />}
                                                        </div>
                                                    </div>
                                                </button>

                                                {expandedSections[category] && (
                                                    <div className="mt-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                                        {/* Category-specific content rendering remains the same as original */}
                                                        {category === "ATS" && (
                                                            <>
                                                                {report.ATS.tips.map((tip, index) => (
                                                                    <div key={index} className="flex items-start p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0 ${tip.type === "good" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                                            {index + 1}
                                                                        </div>
                                                                        <p className={`font-medium ${tip.type === "good" ? "text-green-700" : "text-red-700"}`}>{tip.tip}</p>
                                                                    </div>
                                                                ))}
                                                                {report.missingKeywords.length > 0 && (
                                                                    <div className="mt-6 p-4 bg-white rounded-xl border border-gray-100">
                                                                        <h4 className="font-bold text-black flex items-center mb-3">
                                                                            <XCircle className="w-5 h-5 mr-2 text-red-500" />
                                                                            Missing Keywords ({report.missingKeywords.length})
                                                                        </h4>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {report.missingKeywords.map((keyword, index) => (
                                                                                <span key={index} className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                                                                                    {keyword}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                        {category === "skills" && (
                                                            <>
                                                                {report.skills.tips.map((tip, index) => (
                                                                    <div key={index} className="flex items-start p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 ${tip.type === "good" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
                                                                            {index + 1}
                                                                        </div>
                                                                        <div>
                                                                            <p className={`text-sm font-medium ${tip.type === "good" ? "text-green-700" : "text-red-700"}`}>{tip.tip}</p>
                                                                            {tip.explanation && <p className="text-xs text-gray-600 mt-1">{tip.explanation}</p>}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {report.hardSkillsMatch.length > 0 && (
                                                                    <div className="mt-4">
                                                                        <h4 className="font-semibold text-pink-700 flex items-center">
                                                                            <Brain className="w-5 h-5 mr-2" />
                                                                            Hard Skills Analysis
                                                                        </h4>
                                                                        <div className="grid grid-cols-1 gap-2 mt-2">
                                                                            {report.hardSkillsMatch.map((skill, index) => (
                                                                                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-gray-100">
                                                                                    <span className="text-gray-700 text-sm">{skill.skill}</span>
                                                                                    <div className="flex items-center">
                                                                                        {skill.present ? (
                                                                                            <>
                                                                                                <CheckCircle2 className="w-4 h-4 text-green-500 mr-1" />
                                                                                                <span className="text-green-500 text-xs">Present</span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                <XCircle className="w-4 h-4 text-red-500 mr-1" />
                                                                                                <span className="text-red-500 text-xs">Missing</span>
                                                                                            </>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {report.softSkillsMatch.length > 0 && (
                                                                    <div className="mt-4">
                                                                        <h4 className="font-semibold text-pink-700 flex items-center">
                                                                            <User className="w-5 h-5 mr-2" />
                                                                            Soft Skills Analysis
                                                                        </h4>
                                                                        <div className="grid grid-cols-1 gap-2 mt-2">
                                                                            {report.softSkillsMatch.map((skill, index) => (
                                                                                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-gray-100">
                                                                                    <span className="text-gray-700 text-sm">{skill.skill}</span>
                                                                                    <div className="flex items-center">
                                                                                        {skill.present ? (
                                                                                            <>
                                                                                                <CheckCircle2 className="w-4 h-4 text-green-500 mr-1" />
                                                                                                <span className="text-green-500 text-xs">Present</span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                <XCircle className="w-4 h-4 text-red-500 mr-1" />
                                                                                                <span className="text-red-500 text-xs">Missing</span>
                                                                                            </>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                        {["toneAndStyle", "content", "structure"].includes(category) && (
                                                            <>
                                                                {(report[category as keyof Pick<ATSReport, "toneAndStyle" | "content" | "structure">]?.tips || []).map((tip, index) => (
                                                                    <div key={index} className="flex items-start p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 ${tip.type === "good" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
                                                                            {index + 1}
                                                                        </div>
                                                                        <div>
                                                                            <p className={`text-sm font-medium ${tip.type === "good" ? "text-green-700" : "text-red-700"}`}>{tip.tip}</p>
                                                                            {tip.explanation && <p className="text-xs text-gray-600 mt-1">{tip.explanation}</p>}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </>
                                                        )}
                                                        {category === "general" && (
                                                            <>
                                                                {report.experienceAlignment && (
                                                                    <div className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                                                                        <h4 className="font-semibold text-gray-700 flex items-center">
                                                                            <Target className="w-5 h-5 mr-2" />
                                                                            Experience Alignment
                                                                        </h4>
                                                                        <p className="text-sm text-gray-600 mt-2">{report.experienceAlignment}</p>
                                                                    </div>
                                                                )}
                                                                {report.formattingIssues.length > 0 && (
                                                                    <div className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                                                                        <h4 className="font-semibold text-gray-700 flex items-center">
                                                                            <AlertCircle className="w-5 h-5 mr-2" />
                                                                            Formatting Issues ({report.formattingIssues.length})
                                                                        </h4>
                                                                        <ul className="space-y-2 mt-2">
                                                                            {report.formattingIssues.map((issue, index) => (
                                                                                <li key={index} className="flex items-start text-gray-600 text-sm">
                                                                                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                                                                    {issue}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                                {report.contentSuggestions.length > 0 && (
                                                                    <div className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                                                                        <h4 className="font-semibold text-gray-700 flex items-center">
                                                                            <Lightbulb className="w-5 h-5 mr- 2" />
                                                                            Content Suggestions ({report.contentSuggestions.length})
                                                                        </h4>
                                                                        <div className="space-y-2 mt-2">
                                                                            {report.contentSuggestions.map((suggestion, index) => (
                                                                                <div key={index} className="flex items-start">
                                                                                    <div className="w-6 h-6 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">
                                                                                        {index + 1}
                                                                                    </div>
                                                                                    <p className="text-sm text-gray-600">{suggestion}</p>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {report.resumeText && (
                                                                    <div className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                                                                        <h4 className="font-semibold text-gray-700 flex items-center">
                                                                            <FileText className="w-5 h-5 mr-2" />
                                                                            Resume Text Preview
                                                                        </h4>
                                                                        <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap line-clamp-6">{report.resumeText}</p>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white border border-gray-100 rounded-3xl shadow-xl p-8 flex items-center justify-center min-h-[600px]">
                                <div className="text-center space-y-6">
                                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto animate-spin">
                                        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-black">Analyzing Your Resume</h3>
                                        <p className="text-gray-600">Our AI is processing your resume and job requirements...</p>
                                    </div>
                                    <div className="flex justify-center space-x-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            `}</style>
        </div >
    );
}