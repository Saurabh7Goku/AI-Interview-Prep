"use client";
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, LineChart, Line } from 'recharts';
import { FileText, Briefcase, Users, Menu, Download, Filter, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth, getInterviewHistory, Interview } from '@/firebase/firebase';
import { useToast } from '@/components/ToastProvide';
import Sidebar from '../../components/Sidebar';

const subDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
};

const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear();
};

const isWithinInterval = (date: Date, { start, end }: { start: Date; end: Date }) => {
    return date >= start && date <= end;
};

const format = (date: Date, formatStr: string) => {
    if (formatStr === 'HH:mm') {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    if (formatStr === 'EEE') {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    if (formatStr === 'MMM d') {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return date.toDateString();
};

const Dashboard = () => {
    const router = useRouter();
    const { showToast } = useToast();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [interviewData, setInterviewData] = useState<Interview[]>([]);
    const [showPremiumPopup, setShowPremiumPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRange, setSelectedRange] = useState('Last 7 Days');
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isDataLoading, setIsDataLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
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
                showToast("❌ Please sign in to view your dashboard.", "error");
                router.push("/auth");
            }
            setIsAuthLoading(false);
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

            return filtered
                .sort((a, b) => {
                    const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt.toDate();
                    const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt.toDate();
                    return dateA.getTime() - dateB.getTime();
                })
                .map((interview) => {
                    const date = typeof interview.createdAt === 'string' ? new Date(interview.createdAt) : interview.createdAt.toDate();
                    const time = format(date, 'HH:mm');
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
                const day = format(date, 'EEE');
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
                const day = format(date, 'MMM d');
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

        const colors = ['#3B82F6', '#1E40AF', '#2563EB', '#60A5FA', '#93C5FD', '#DBEAFE'];
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
    const chartData = [
        { label: 'Start', value: 0 },
        ...filteredData
    ];

    const services = [
        { title: 'ATS Resume Scan', value: 'Scan your resume', change: 'Optimize now', icon: FileText, color: 'bg-blue-600', action: 'premium' },
        { title: 'Resume Builder', value: 'Build resume', change: 'Create now', icon: FileText, color: 'bg-blue-700', action: 'premium' },
        { title: 'Job Search', value: 'Find jobs', change: 'Search now', icon: Briefcase, color: 'bg-blue-600', action: 'premium' },
        { title: 'Interview Prep', value: 'Practice now', change: 'Start prep', icon: Users, color: 'bg-blue-700', action: 'homeform' },
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
        <div className="flex h-screen">
            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/98 bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                {/* Header */}
                <div className="bg-black shadow-sm px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 rounded-lg hover:bg-gray-900 transition-colors lg:hidden"
                            >
                                <Menu className="w-6 h-6 text-gray-300" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                                <p className="text-gray-400">Your interview performance overview</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/2 text-gray-300 hover:bg-gray-600 transition-colors">
                                <Filter className="w-4 h-4" />
                                <span>Filter</span>
                            </button>
                            <button className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/2 text-gray-300 hover:bg-gray-600 transition-colors">
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-black">
                    {/* Top Section with Service Cards and Interview Table */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                        {/* Service Cards - 2x2 Grid */}
                        <div className="lg:col-span-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {services.map((service, index) => (
                                    <div key={index} className="bg-white/2 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center`}>
                                                <service.icon className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-white mb-2">{service.title}</h3>
                                        <p className="text-sm text-gray-400 mb-4">{service.value}</p>
                                        <button
                                            onClick={() => handleServiceClick(service.action)}
                                            className="text-sm text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors"
                                        >
                                            {service.change} →
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Interview Details Table */}
                        <div className="lg:col-span-2 bg-white/2 p-6 rounded-xl shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-white">Recent Interviews</h3>
                                <select className="px-3 py-2 rounded-lg bg-gray-900 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option>Last 5</option>
                                    <option>Last 10</option>
                                    <option>All</option>
                                </select>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="text-left py-3 px-2 text-gray-300 font-medium">Type</th>
                                            <th className="text-left py-3 px-2 text-gray-300 font-medium">Role</th>
                                            <th className="text-left py-3 px-2 text-gray-300 font-medium">Score</th>
                                            <th className="text-left py-3 px-2 text-gray-300 font-medium">Skills</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {interviewData.slice(0, 10).map((interview, index) => {
                                            const scores = Object.values(interview.scores ?? {});
                                            const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
                                            const skills: string[] = Array.isArray(interview.skills)
                                                ? interview.skills.map(String)
                                                : [];

                                            return (
                                                <tr key={index} className="hover:bg-gray-700/50 transition-colors">
                                                    <td className="py-3 px-2 text-gray-300">
                                                        {interview.interviewType?.slice(0, 10) || 'N/A'}
                                                    </td>
                                                    <td className="py-3 px-2 text-gray-300">
                                                        {interview.interviewRole?.slice(0, 15) || 'N/A'}
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${avgScore >= 8 ? 'bg-green-900 text-green-300' :
                                                            avgScore >= 6 ? 'bg-yellow-900 text-yellow-300' :
                                                                'bg-red-900 text-red-300'
                                                            }`}>
                                                            {avgScore.toFixed(1)}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-2 text-gray-300">
                                                        {skills.length > 0 ? skills.slice(0, 2).join(', ') : 'N/A'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {interviewData.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="py-6 px-2 text-center text-gray-500">
                                                    No interviews found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section with Pie Chart */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                        <div className="xl:col-span-2 bg-white/2 p-6 rounded-xl shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-300 mb-2 sm:mb-0">Interview Performance</h3>
                                <select
                                    value={selectedRange}
                                    onChange={(e) => setSelectedRange(e.target.value)}
                                    className="px-3 py-2 rounded-lg bg-gray-900 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="today">Today</option>
                                    <option value="Last 7 Days">Last 7 Days</option>
                                    <option value="Last 30 Days">Last 30 Days</option>
                                    <option value="All Time">All Time</option>
                                </select>
                            </div>
                            <div className="mb-6">
                                <div className="flex items-center space-x-2">
                                    <span className="text-3xl font-bold text-gray-300">
                                        {interviewData.length > 0
                                            ? (interviewData.reduce((sum, interview) => {
                                                const scores = Object.values(interview.scores);
                                                return sum + (scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0);
                                            }, 0) / interviewData.length).toFixed(1)
                                            : '0.0'}
                                    </span>
                                    <span className="text-sm text-green-400 font-medium">↗ +10%</span>
                                </div>
                                <p className="text-sm text-gray-400">Average score across all interviews</p>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="2 2" />
                                        <XAxis dataKey="label" stroke="#6b7280" fontSize={12} />
                                        <YAxis stroke="#6b7280" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                color: '#f3f4f6'
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#8884d8"
                                            strokeWidth={2}
                                            dot={{ r: 3, fill: '#2563eb' }}
                                            activeDot={{ r: 3 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white/2 p-6 rounded-xl shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-white">Score Distribution</h3>
                                <select className="px-3 py-2 rounded-lg bg-gray-900 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
                                            <span className="text-sm text-gray-300">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-medium text-white">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Popup */}
            {showPremiumPopup && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white">Unlock Premium Features</h2>
                            <button
                                onClick={() => setShowPremiumPopup(false)}
                                className="text-gray-400 hover:text-gray-300 transition-colors p-2 hover:bg-gray-700 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-gray-300 mb-6">
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