"use client"
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ATSReport } from '@/types';
import toast from 'react-hot-toast';
import { Eye, Calendar, Building2, Target, FileText, X, TrendingUp, Clock, Star, BarChart3, Award, ChevronRight, Home, LucideStore, DollarSign, Menu, LucideHome, ScanSearchIcon, IndianRupeeIcon } from 'lucide-react';
import Link from 'next/dist/client/link';
import AuthButton from './AuthButton';
import { useRouter } from 'next/navigation';
import logo from "@/public/logo.png";
import Image from "next/image";

export default function Dashboard() {
    const router = useRouter();
    const [user] = useAuthState(auth);
    const [reports, setReports] = useState<ATSReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<ATSReport | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const fetchReports = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const q = query(collection(db, `users/${user.uid}/reports`));
                const querySnapshot = await getDocs(q);
                const fetchedReports: ATSReport[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    fetchedReports.push({ ...data, id: doc.id } as ATSReport);
                });

                setReports(fetchedReports.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
            } catch (error) {
                toast.error('Failed to load reports.');
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [user]);

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600';
        if (score >= 60) return 'text-amber-600';
        return 'text-rose-600';
    };

    const getScoreBackground = (score: number) => {
        if (score >= 80) return 'bg-emerald-50 border-emerald-200 text-emerald-800';
        if (score >= 60) return 'bg-amber-50 border-amber-200 text-amber-800';
        return 'bg-rose-50 border-rose-200 text-rose-800';
    };

    const getScoreGradient = (score: number) => {
        if (score >= 80) return 'from-emerald-500 to-teal-600';
        if (score >= 60) return 'from-amber-500 to-orange-600';
        return 'from-rose-500 to-pink-600';
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-3">Welcome Back</h2>
                    <p className="text-slate-600">Please sign in to access your ATS dashboard and view your resume analysis reports.</p>
                </div>
            </div>
        );
    }

    const avgScore = reports.length > 0 ? Math.round(reports.reduce((acc, r) => acc + r.matchScore, 0) / reports.length) : 0;

    return (
        <div className="min-h-screen font-sans bg-gradient-to-br from-slate-50 to-blue-50">
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
                            <Link href="/ResumeScanner" className="hover:text-blue-600 transition-all duration-300 flex items-center text-sm font-medium group">
                                <ScanSearchIcon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                ATS Scan
                            </Link>
                            <Link href="/subscription" className="hover:text-blue-600 transition-all duration-300 flex items-center text-sm font-medium group">
                                <IndianRupeeIcon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                Subscription
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
                            <Link href="/ResumeScanner" className="block hover:text-blue-600 transition-colors py-2 flex items-center text-sm">
                                <ScanSearchIcon className="w-4 h-4 mr-2" /> ATS Scan
                            </Link>
                            <Link href="/subscription" className="block hover:text-blue-600 transition-colors py-2 flex items-center text-sm">
                                <ScanSearchIcon className="w-4 h-4 mr-2" /> Subscription
                            </Link>
                            <AuthButton />
                        </div>
                    )}
                </div>
            </nav>
            {/* Header Section */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-5 md:px-6 md:py-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900 mb-3">
                                Welcome back, {user.displayName?.split(' ')[0] || 'User'}! 👋
                            </h1>
                            <p className="text-lg text-slate-600">Here's your ATS performance overview</p>
                            <button
                                onClick={() => router.push('/ResumeScanner')}
                                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-white font-semibold shadow-lg transition duration-300 ease-in-out hover:from-indigo-600 hover:to-purple-700 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300"
                            >
                                🚀 Go To Scan
                            </button>
                        </div>

                        {/* Stats Cards */}
                        <div className="flex gap-6">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white min-w-[140px]">
                                <div className="flex items-center justify-between mb-2">
                                    <BarChart3 className="w-6 h-6 opacity-80" />
                                </div>
                                <p className="text-3xl font-bold mb-1">{reports.length}</p>
                                <p className="text-sm opacity-90">Total Scans</p>
                            </div>

                            <div className={`bg-gradient-to-r ${avgScore >= 80 ? 'from-emerald-500 to-teal-600' : avgScore >= 60 ? 'from-amber-500 to-orange-600' : 'from-rose-500 to-pink-600'} rounded-2xl p-6 text-white min-w-[140px]`}>
                                <div className="flex items-center justify-between mb-2">
                                    <Award className="w-6 h-6 opacity-80" />
                                </div>
                                <p className="text-3xl font-bold mb-1">{avgScore}%</p>
                                <p className="text-sm opacity-90">Avg Score</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-6">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl md:text-3xl font-bold text-slate-900 flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                            </div>
                            Recent Job Scans
                        </h2>
                        {reports.length > 0 && (
                            <div className="bg-slate-100 px-4 py-2 rounded-full">
                                <p className="text-slate-600 text-sm font-medium">
                                    {reports.length} scan{reports.length !== 1 ? 's' : ''} completed
                                </p>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                                <p className="text-slate-600 text-lg">Loading your reports...</p>
                            </div>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="bg-white rounded-3xl p-12 shadow-xl border border-slate-200 max-w-2xl mx-auto">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
                                    <FileText className="w-12 h-12 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">Start Your ATS Journey</h3>
                                <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                                    Upload your resume and job descriptions to get detailed compatibility analysis and improvement suggestions.
                                </p>
                                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                    Scan Your First Resume
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {reports.map((report) => (
                                <div
                                    key={report.id}
                                    className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer overflow-hidden"
                                    onClick={() => setSelectedReport(report)}
                                >
                                    {/* Card Header */}
                                    <div className="p-6 pb-4">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                    {report.jobTitle}
                                                </h3>
                                                <div className="flex items-center text-slate-600 mb-4">
                                                    <Building2 className="w-4 h-4 mr-2" />
                                                    <span className="font-medium">{report.companyName}</span>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                                        </div>

                                        {/* Score Badge */}
                                        <div className={`inline-flex items-center px-4 py-2 rounded-xl border-2 font-bold ${getScoreBackground(report.matchScore)} mb-4`}>
                                            <Target className="w-4 h-4 mr-2" />
                                            {report.matchScore}% Match
                                        </div>

                                        {/* Date */}
                                        <div className="flex items-center text-slate-500 text-sm mb-4">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            {new Date(report.createdAt).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="px-6 pb-6 space-y-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
                                                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                                                Resume Preview
                                            </h4>
                                            <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-3 rounded-lg">
                                                {report.resumeText}
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
                                                <Star className="w-4 h-4 mr-2 text-amber-500" />
                                                Key Suggestions
                                            </h4>
                                            <div className="space-y-2">
                                                {(report.contentSuggestions ?? []).slice(0, 2).map((suggestion, index) => (
                                                    <div key={index} className="flex items-start bg-blue-50 p-3 rounded-lg">
                                                        <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 mt-0.5">
                                                            {index + 1}
                                                        </div>
                                                        <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed">
                                                            {suggestion}
                                                        </p>
                                                    </div>
                                                ))}
                                                {(report.contentSuggestions ?? []).length === 0 && (
                                                    <p className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg">
                                                        No suggestions available.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                                        <div className="flex items-center justify-center text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors">
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Full Analysis
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Enhanced Modal */}
            {
                selectedReport && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-8 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-2">{selectedReport.jobTitle}</h2>
                                    <div className="flex items-center text-slate-600">
                                        <Building2 className="w-5 h-5 mr-2" />
                                        <span className="text-lg font-medium">{selectedReport.companyName}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors p-3 hover:bg-white/50 rounded-xl"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
                                <div className="p-8 space-y-8">
                                    {/* Score and Date Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className={`inline-flex items-center px-6 py-4 rounded-2xl border-2 ${getScoreBackground(selectedReport.matchScore)}`}>
                                            <Target className="w-6 h-6 mr-3" />
                                            <span className="text-2xl font-bold">
                                                {selectedReport.matchScore}% ATS Match Score
                                            </span>
                                        </div>
                                        <div className="flex items-center text-slate-500 bg-slate-100 px-4 py-3 rounded-xl">
                                            <Clock className="w-5 h-5 mr-2" />
                                            <span className="font-medium">
                                                Analyzed on {new Date(selectedReport.createdAt).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Resume Content */}
                                    <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                                <FileText className="w-4 h-4 text-blue-600" />
                                            </div>
                                            Resume Content Analysis
                                        </h3>
                                        <div className="bg-white rounded-xl p-6 border border-slate-200 max-h-80 overflow-y-auto">
                                            <pre className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed font-mono">
                                                {selectedReport.resumeText}
                                            </pre>
                                        </div>
                                    </div>

                                    {/* Improvement Suggestions */}
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
                                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                                            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                                                <Star className="w-4 h-4 text-amber-600" />
                                            </div>
                                            AI-Powered Improvement Suggestions
                                        </h3>
                                        <div className="grid gap-4">
                                            {selectedReport.contentSuggestions.map((suggestion, index) => (
                                                <div key={index} className="flex items-start p-6 bg-white rounded-xl border border-blue-200 hover:border-blue-300 transition-colors">
                                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0">
                                                        {index + 1}
                                                    </div>
                                                    <p className="text-slate-700 leading-relaxed flex-1">{suggestion}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="border-t border-slate-200 p-6 bg-slate-50">
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Close Analysis Report
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}