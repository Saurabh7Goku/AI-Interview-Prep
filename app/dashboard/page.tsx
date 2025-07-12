"use client";
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Search, FileText, Briefcase, Users, Home, History, LogIn, X, Menu, Sparkles, Download, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth, getInterviewHistory, Interview } from '@/firebase/firebase';
import { useToast } from '@/components/ToastProvide';
import { subDays, isSameDay, isWithinInterval, format } from 'date-fns';

const Dashboard = () => {
    const router = useRouter();
    const { showToast } = useToast();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [interviewData, setInterviewData] = useState<Interview[]>([]);
    const [showPremiumPopup, setShowPremiumPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRange, setSelectedRange] = useState('today');
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isDataLoading, setIsDataLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                // User is authenticated, fetch data
                setIsDataLoading(true);
                getInterviewHistory(user.uid)
                    .then((interviews) => {
                        setInterviewData(interviews);
                        setIsDataLoading(false);
                    })
                    .catch((error) => {
                        showToast("❌ Failed to load interview data.", "error");
                        console.error("Error loading interview data:", error);
                        setIsDataLoading(false);
                    });
            } else {
                // No user, redirect to auth
                showToast("❌ Please sign in to view your dashboard.", "error");
                router.push("/auth");
            }
            setIsAuthLoading(false); // Auth state resolved
        });

        return () => unsubscribe();
    }, [router, showToast]);

    const getFilteredData = (interviews: Interview[], selectedRange: string) => {
        const now = new Date();
        let filtered: Interview[] = [];

        if (selectedRange === 'today') {
            filtered = interviews.filter((interview) => {
                const date = typeof interview.createdAt === 'string' ? new Date(interview.createdAt) : interview.createdAt.toDate();
                return isSameDay(date, now);
            });

            // Sort by time and map to { label: "hh:mm", value: avgScore }
            return filtered
                .sort((a, b) => {
                    const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt.toDate();
                    const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt.toDate();
                    return dateA.getTime() - dateB.getTime();
                })
                .map((interview) => {
                    const date = typeof interview.createdAt === 'string' ? new Date(interview.createdAt) : interview.createdAt.toDate();
                    const time = format(date, 'HH:mm'); // e.g., "14:30"
                    const scores = Object.values(interview.scores ?? {});
                    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
                    return { label: time, value: parseFloat(avgScore.toFixed(1)) };
                });
        } else if (selectedRange === 'Last 7 Days') {
            filtered = interviews.filter((interview) => {
                const date = typeof interview.createdAt === 'string' ? new Date(interview.createdAt) : interview.createdAt.toDate();
                return isWithinInterval(date, { start: subDays(now, 6), end: now });
            });

            const grouped: Record<string, Interview[]> = {};
            filtered.forEach((interview) => {
                const date = typeof interview.createdAt === 'string' ? new Date(interview.createdAt) : interview.createdAt.toDate();
                const day = format(date, 'EEE'); // e.g., "Mon"
                if (!grouped[day]) grouped[day] = [];
                grouped[day].push(interview);
            });

            return Object.entries(grouped).map(([day, interviews]) => ({
                label: day,
                value: getAverage(interviews)
            }));
        } else if (selectedRange === 'Last 30 Days') {
            filtered = interviews.filter((interview) => {
                const date = typeof interview.createdAt === 'string' ? new Date(interview.createdAt) : interview.createdAt.toDate();
                return isWithinInterval(date, { start: subDays(now, 29), end: now });
            });

            const grouped: Record<string, Interview[]> = {};
            filtered.forEach((interview) => {
                const date = typeof interview.createdAt === 'string' ? new Date(interview.createdAt) : interview.createdAt.toDate();
                const day = format(date, 'MMM d'); // e.g., "Jul 10"
                if (!grouped[day]) grouped[day] = [];
                grouped[day].push(interview);
            });

            return Object.entries(grouped).map(([day, interviews]) => ({
                label: day,
                value: getAverage(interviews)
            }));
        } else {
            return getMonthlyScores(interviews);
        }
    };

    const getAverage = (interviews: Interview[]) => {
        if (interviews.length === 0) return 0;

        const sum = interviews.reduce((total, interview) => {
            const scores = Object.values(interview.scores ?? {}) as number[];
            const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
            return total + avg;
        }, 0);

        return +(sum / interviews.length).toFixed(1);
    };


    // Process data for charts
    const getMonthlyScores = (interviews: Interview[]) => {
        const currentYear = new Date().getFullYear();
        const monthNumbers = Array.from(
            new Set(
                interviews
                    .map((interview) => {
                        const date = typeof interview.createdAt === 'string'
                            ? new Date(interview.createdAt)
                            : interview.createdAt.toDate();
                        return date.getFullYear() === currentYear ? date.getMonth() : null;
                    })
                    .filter((monthNum): monthNum is number => monthNum !== null)
            )
        ).sort((a, b) => a - b);

        if (monthNumbers.length === 0) {
            monthNumbers.push(new Date().getMonth());
        }

        const monthNames = monthNumbers.map(num =>
            new Date(currentYear, num).toLocaleString('default', { month: 'short' })
        );

        const monthlyScores = monthNumbers.map((monthNum, idx) => {
            const monthInterviews = interviews.filter((interview) => {
                const date = typeof interview.createdAt === 'string'
                    ? new Date(interview.createdAt)
                    : interview.createdAt.toDate();
                return date.getMonth() === monthNum && date.getFullYear() === currentYear;
            });

            const avgScore = monthInterviews.length > 0
                ? monthInterviews.reduce((sum, interview) => {
                    const scores = Object.values(interview.scores);
                    return sum + (scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0);
                }, 0) / monthInterviews.length
                : 0;

            return { label: monthNames[idx], value: parseFloat(avgScore.toFixed(1)) };
        });

        return monthlyScores;
    };

    const getScoreDistribution = (interviews: Interview[]) => {
        const grouped: Record<string, Interview[]> = {};
        interviews.forEach((interview) => {
            const key = `${interview.interviewType} - ${interview.interviewRole}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(interview);
        });

        const colors = ['#2563eb', '#1d4ed8', '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'];
        return Object.entries(grouped).map(([key, interviews], index) => {
            const avgScore = interviews.length > 0
                ? interviews.reduce((sum, interview) => {
                    const scores = Object.values(interview.scores);
                    return sum + (scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0);
                }, 0) / interviews.length
                : 0;
            return {
                name: key,
                value: parseFloat(avgScore.toFixed(1)),
                color: colors[index % colors.length]
            };
        }).filter(item => item.value > 0);
    };

    const filteredData = getFilteredData(interviewData, selectedRange);
    const scoreDistribution = getScoreDistribution(interviewData);

    const services = [
        { title: 'ATS Resume Scan', value: 'Scan your resume', change: 'Optimize now', icon: FileText, color: 'bg-blue-600', action: 'premium' },
        { title: 'Resume Builder', value: 'Build resume', change: 'Create now', icon: FileText, color: 'bg-blue-700', action: 'premium' },
        { title: 'Job Search', value: 'Find jobs', change: 'Search now', icon: Briefcase, color: 'bg-blue-600', action: 'premium' },
        { title: 'Interview Prep', value: 'Practice now', change: 'Start prep', icon: Users, color: 'bg-blue-700', action: 'homeform' },
    ];

    const sidebarItems = [
        { name: 'Dashboard', icon: Home, path: '/' },
        { name: 'ATS Scan', icon: FileText, path: '/ats-scan' },
        { name: 'Job Finder', icon: Search, path: '/job-finder' },
        { name: 'Mock Interview', icon: Users, path: '/mock-interview' },
        { name: 'History', icon: History, path: '/history' },
        { name: 'Sign Up', icon: LogIn, path: '/auth' },
    ];

    const handleServiceClick = (action: string) => {
        if (action === 'homeform') {
            localStorage.removeItem("questions");
            localStorage.removeItem("userAnswers");
            localStorage.removeItem("feedbacks");
            localStorage.removeItem("scores");
            localStorage.removeItem("currentQuestionIndex");
            showToast("✅ Local storage cleared!", "success");
            router.push('/homeform');
        } else {
            setShowPremiumPopup(true);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:shadow-none lg:border-r border-gray-200`}>
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                                    <Briefcase className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xl font-bold text-gray-900">InterviewPrep AI</span>
                            </div>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {sidebarItems.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => {
                                    setIsSidebarOpen(false);
                                    router.push(item.path);
                                }}
                                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${item.name === 'Dashboard'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                    }`}
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                <span className="font-medium">{item.name}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">U</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">User</p>
                                    <p className="text-xs text-gray-500">Free Plan</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
                            >
                                <Menu className="w-6 h-6 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                                <p className="text-gray-600">Your interview performance overview</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors">
                                <Filter className="w-4 h-4" />
                                <span>Filter</span>
                            </button>
                            <button className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors">
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">
                    {/* Service Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 lg:mb-8">
                        {services.map((service, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center`}>
                                        <service.icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">{service.title}</h3>
                                <p className="text-sm text-gray-600 mb-4">{service.value}</p>
                                <button
                                    onClick={() => handleServiceClick(service.action)}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                                >
                                    {service.change} →
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Charts */}
                    <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                            <div className="xl:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Interview Performance</h3>
                                    <select
                                        value={selectedRange}
                                        onChange={(e) => setSelectedRange(e.target.value)}
                                        className="px-3 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="today">Today</option>
                                        <option value="Last 7 Days">Last 7 Days</option>
                                        <option value="Last 30 Days">Last 30 Days</option>
                                        <option value="All Time">All Time</option>
                                    </select>
                                </div>
                                <div className="mb-6">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-3xl font-bold text-gray-900">
                                            {interviewData.length > 0
                                                ? (interviewData.reduce((sum, interview) => {
                                                    const scores = Object.values(interview.scores);
                                                    return sum + (scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0);
                                                }, 0) / interviewData.length).toFixed(1)
                                                : '0.0'}
                                        </span>
                                        <span className="text-sm text-green-600 font-medium">↗ +10%</span>
                                    </div>
                                    <p className="text-sm text-gray-500">Average score across all interviews</p>
                                </div>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={filteredData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                            <XAxis dataKey="label" stroke="#6b7280" fontSize={12} />
                                            <YAxis stroke="#6b7280" fontSize={12} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    fontSize: '12px'
                                                }}
                                            />
                                            <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Score Distribution</h3>
                                    <select className="px-3 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option>All Interviews</option>
                                    </select>
                                </div>
                                <div className="flex justify-center mb-6">
                                    <div className="w-40 h-40">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={scoreDistribution}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={70}
                                                    dataKey="value"
                                                >
                                                    {scoreDistribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {scoreDistribution.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                                <span className="text-sm text-gray-700">{item.name}</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{item.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Popup */}
            {showPremiumPopup && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Unlock Premium Features</h2>
                            <button
                                onClick={() => setShowPremiumPopup(false)}
                                className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Access ATS Resume Scan, Resume Builder, and Job Search with our Premium Membership.
                        </p>
                        <button
                            onClick={() => router.push('/subscription')}
                            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-sm"
                        >
                            Get Premium
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;