"use client";
import React, { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip,
    BarChart, Bar, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, Legend, ReferenceLine
} from 'recharts';
import {
    FileText, Briefcase, Users, Menu, Download, Filter, X, TrendingUp,
    Calendar, Award, Target, BarChart3, Activity, ChevronDown, RefreshCw,
    Eye, Maximize2, Minimize2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth, getInterviewHistory } from '@/firebase/firebase';
import { useToast } from '@/components/ToastProvide';
import { Timestamp } from 'firebase/firestore';
import Sidebar from '../../components/Sidebar';

// Define the Interview interface based on usage
interface Interview {
    id: string;
    userId: string;
    questions: string[];
    answers: { [key: number]: string };
    feedbacks: { [key: number]: string };
    scores: { [key: number]: number };
    interviewType: string;
    interviewRole: string;
    skills: string;
    createdAt: string | Timestamp;
}

// Define types for chart data
interface ChartData {
    label: string;
    average: number;
    maximum: number;
    minimum: number;
    count: number;
}

interface ScoreDistributionData {
    name: string;
    value: number;
    count: number;
    color: string;
}

interface SkillsRadarData {
    skill: string;
    score: number;
    fullMark: number;
}

// Define type for selectedRange
type TimeRange = 'today' | 'Last 7 Days' | 'Last 30 Days' | 'This Year';

// Utility functions with type annotations
const subDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
};

const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    );
};

const isWithinInterval = (date: Date, interval: { start: Date; end: Date }): boolean => {
    return date >= interval.start && date <= interval.end;
};

const format = (date: Date, formatStr: string): string => {
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
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [interviewData, setInterviewData] = useState<Interview[]>([]);
    const [showPremiumPopup, setShowPremiumPopup] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedRange, setSelectedRange] = useState<TimeRange>('This Year');
    const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
    const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
    const [selectedChart, setSelectedChart] = useState<'area' | 'bar' | 'line' | 'composed'>('area');
    const [selectedMetric, setSelectedMetric] = useState<'average' | 'all'>('average');
    const [isChartExpanded, setIsChartExpanded] = useState<boolean>(false);
    const [animationKey, setAnimationKey] = useState<number>(0);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setIsDataLoading(true);
                getInterviewHistory(user.uid)
                    .then((interviews: Interview[]) => {
                        setInterviewData(interviews);
                        setIsDataLoading(false);
                    })
                    .catch((error: Error) => {
                        showToast("❌ Failed to load interview data.", "error");
                        console.error("Error loading interview data:", error);
                        setIsDataLoading(false);
                    });
            } else {
                showToast("❌ Please sign in to view your dashboard.", "error");
                router.push("/auth");
            }
            setIsAuthLoading(false);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [router, showToast]);

    const refreshData = () => {
        setAnimationKey((prev) => prev + 1);
        const user = auth.currentUser;
        if (user) {
            setIsDataLoading(true);
            getInterviewHistory(user.uid)
                .then((interviews: Interview[]) => {
                    setInterviewData(interviews);
                    setIsDataLoading(false);
                    showToast("✅ Data refreshed successfully!", "success");
                })
                .catch((error: Error) => {
                    showToast("❌ Failed to refresh data.", "error");
                    setIsDataLoading(false);
                });
        }
    };

    const getFilteredData = (interviews: Interview[], selectedRange: TimeRange): ChartData[] => {
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
                    const avgScore = interview.questions.length > 0 ? scores.reduce((a, b) => a + b, 0) / interview.questions.length : 0;
                    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
                    const minScore = scores.length > 0 ? Math.min(...scores) : 0;
                    return {
                        label: time,
                        average: parseFloat(avgScore.toFixed(1)),
                        maximum: parseFloat(maxScore.toFixed(1)),
                        minimum: parseFloat(minScore.toFixed(1)),
                        count: 1,
                    };
                });
        } else if (selectedRange === 'Last 7 Days') {
            filtered = interviews.filter((interview) => {
                const date = typeof interview.createdAt === 'string' ? new Date(interview.createdAt) : interview.createdAt.toDate();
                return isWithinInterval(date, { start: subDays(now, 6), end: now });
            });

            const grouped: { [key: string]: Interview[] } = {};
            filtered.forEach((interview) => {
                const date = typeof interview.createdAt === 'string' ? new Date(interview.createdAt) : interview.createdAt.toDate();
                const day = format(date, 'EEE');
                if (!grouped[day]) grouped[day] = [];
                grouped[day].push(interview);
            });

            return Object.entries(grouped).map(([day, interviews]) => ({
                label: day,
                average: getAverage(interviews),
                maximum: getMaximum(interviews),
                minimum: getMinimum(interviews),
                count: interviews.length,
            }));
        } else if (selectedRange === 'Last 30 Days') {
            filtered = interviews.filter((interview) => {
                const date = typeof interview.createdAt === 'string' ? new Date(interview.createdAt) : interview.createdAt.toDate();
                return isWithinInterval(date, { start: subDays(now, 29), end: now });
            });

            const grouped: { [key: string]: Interview[] } = {};
            filtered.forEach((interview) => {
                const date = typeof interview.createdAt === 'string' ? new Date(interview.createdAt) : interview.createdAt.toDate();
                const day = format(date, 'MMM d');
                if (!grouped[day]) grouped[day] = [];
                grouped[day].push(interview);
            });

            return Object.entries(grouped).map(([day, interviews]) => ({
                label: day,
                average: getAverage(interviews),
                maximum: getMaximum(interviews),
                minimum: getMinimum(interviews),
                count: interviews.length,
            }));
        } else {
            return getMonthlyScores(interviews);
        }
    };

    const getAverage = (interviews: Interview[]): number => {
        if (interviews.length === 0) return 0;
        const sum = interviews.reduce((total, interview) => {
            const scores = Object.values(interview.scores ?? {});
            const avg = interview.questions.length > 0 ? scores.reduce((a, b) => a + b, 0) / interview.questions.length : 0;
            return total + avg;
        }, 0);
        return +(sum / interviews.length).toFixed(1);
    };

    const getMaximum = (interviews: Interview[]): number => {
        if (interviews.length === 0) return 0;
        const max = interviews.reduce((maxVal, interview) => {
            const scores = Object.values(interview.scores ?? {});
            const interviewMax = scores.length > 0 ? Math.max(...scores) : 0;
            return Math.max(maxVal, interviewMax);
        }, 0);
        return +max.toFixed(1);
    };

    const getMinimum = (interviews: Interview[]): number => {
        if (interviews.length === 0) return 0;
        const min = interviews.reduce((minVal, interview) => {
            const scores = Object.values(interview.scores ?? {});
            const interviewMin = scores.length > 0 ? Math.min(...scores) : 10;
            return Math.min(minVal, interviewMin);
        }, 10);
        return +min.toFixed(1);
    };

    const getMonthlyScores = (interviews: Interview[]): ChartData[] => {
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

        const monthNames = monthNumbers.map((num) =>
            new Date(currentYear, num).toLocaleString('default', { month: 'short' })
        );

        return monthNumbers.map((monthNum, idx) => {
            const monthInterviews = interviews.filter((interview) => {
                const date = typeof interview.createdAt === 'string'
                    ? new Date(interview.createdAt)
                    : interview.createdAt.toDate();
                return date.getMonth() === monthNum && date.getFullYear() === currentYear;
            });

            return {
                label: monthNames[idx],
                average: getAverage(monthInterviews),
                maximum: getMaximum(monthInterviews),
                minimum: getMinimum(monthInterviews),
                count: monthInterviews.length,
            };
        });
    };

    const getScoreDistribution = (interviews: Interview[]): ScoreDistributionData[] => {
        const grouped: { [key: string]: Interview[] } = {};
        interviews.forEach((interview) => {
            const key = interview.interviewRole; // Use only interviewRole as the key
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(interview);
        });

        const colors = [
            '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B',
            '#EF4444', '#EC4899', '#6366F1', '#84CC16',
        ];

        return Object.entries(grouped)
            .map(([key, interviews], index) => {
                const avgScore = getAverage(interviews);
                return {
                    name: key.length > 20 ? key.substring(0, 20) + '...' : key,
                    value: avgScore,
                    count: interviews.length,
                    color: colors[index % colors.length],
                };
            })
            .filter((item) => item.value > 0);
    };

    const getSkillsRadarData = (interviews: Interview[]): SkillsRadarData[] => {
        const skillsMap: { [key: string]: { total: number; count: number } } = {};
        interviews.forEach((interview) => {
            const skills = typeof interview.skills === 'string'
                ? interview.skills.split(',').map((s) => s.trim()).filter(Boolean)
                : [];

            skills.forEach((skill) => {
                if (!skillsMap[skill]) {
                    skillsMap[skill] = { total: 0, count: 0 };
                }
                const scores = Object.values(interview.scores ?? {});
                const avgScore = interview.questions.length > 0 ? scores.reduce((a, b) => a + b, 0) / interview.questions.length : 0;
                skillsMap[skill].total += avgScore;
                skillsMap[skill].count += 1;
            });
        });

        return Object.entries(skillsMap)
            .map(([skill, data]) => ({
                skill: skill.length > 15 ? skill.substring(0, 15) + '...' : skill,
                score: +(data.total / data.count).toFixed(1),
                fullMark: 10,
            }))
            .slice(0, 8);
    };

    const filteredData = getFilteredData(interviewData, selectedRange);
    const scoreDistribution = getScoreDistribution(interviewData);
    const skillsRadarData = getSkillsRadarData(interviewData);

    const chartData: ChartData[] = filteredData.length > 0
        ? [{ label: 'Start', average: 0, maximum: 0, minimum: 0, count: 0 }, ...filteredData]
        : [];

    const services = [
        { title: 'ATS Scan', value: 'Scan your resume', change: 'Optimize now', icon: FileText, color: 'bg-blue-600', action: 'premium' },
        { title: 'Resume Builder', value: 'Build resume', change: 'Create now', icon: FileText, color: 'bg-blue-700', action: 'premium' },
        { title: 'Job Search', value: 'Find jobs', change: 'Search now', icon: Briefcase, color: 'bg-blue-600', action: 'premium' },
        { title: 'Interview Prep', value: 'Practice now', change: 'Start prep', icon: Users, color: 'bg-blue-700', action: 'homeform' },
    ];

    const handleServiceClick = (action: string) => {
        if (action === 'homeform') {
            localStorage.removeItem('questions');
            localStorage.removeItem('userAnswers');
            localStorage.removeItem('feedbacks');
            localStorage.removeItem('scores');
            localStorage.removeItem('currentQuestionIndex');
            localStorage.removeItem('interviewRole');
            localStorage.removeItem('interviewType');
            localStorage.removeItem('skills');
            showToast('Fill Out the Form', 'success');
            router.push('/homeform');
        }
        else if (action === 'atsscan') {
            window.open('https://ats-resume-a7rk.onrender.com', '_blank');
        } else {
            setShowPremiumPopup(true);
        }
    };

    const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[]; }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white backdrop-blur-sm p-4 rounded-xl border border-gray-700 shadow-xl">
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {`${entry.name}: ${entry.value}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const renderChart = () => {
        const commonProps = {
            data: chartData,
            margin: { top: 20, right: 30, left: 20, bottom: 20 },
        };

        switch (selectedChart) {
            case 'area':
                return (
                    <AreaChart {...commonProps}>
                        <defs>
                            <linearGradient id="colorAverage" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorMaximum" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="label" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 10]} />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={7} stroke="#F59E0B" strokeDasharray="5 5" label="Target" />
                        <Area
                            type="monotone"
                            dataKey="average"
                            stroke="#8B5CF6"
                            fillOpacity={1}
                            fill="url(#colorAverage)"
                            strokeWidth={3}
                        />
                        {selectedMetric === 'all' && (
                            <Area
                                type="monotone"
                                dataKey="maximum"
                                stroke="#10B981"
                                fillOpacity={1}
                                fill="url(#colorMaximum)"
                                strokeWidth={2}
                            />
                        )}
                    </AreaChart>
                );
            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="label" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 10]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="average" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                        {selectedMetric === 'all' && (
                            <Bar dataKey="maximum" fill="#10B981" radius={[4, 4, 0, 0]} />
                        )}
                    </BarChart>
                );
            case 'composed':
                return (
                    <ComposedChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="label" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 10]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" fill="#06B6D4" radius={[4, 4, 0, 0]} yAxisId="right" />
                        <Line type="monotone" dataKey="average" stroke="#8B5CF6" strokeWidth={3} />
                        <YAxis yAxisId="right" orientation="right" stroke="#06B6D4" fontSize={12} />
                    </ComposedChart>
                );
            default:
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="label" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 10]} />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={7} stroke="#F59E0B" strokeDasharray="5 5" label="Target" />
                        <Line
                            type="monotone"
                            dataKey="average"
                            stroke="#8B5CF6"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#8B5CF6' }}
                            activeDot={{ r: 6, fill: '#8B5CF6' }}
                        />
                        {selectedMetric === 'all' && (
                            <>
                                <Line
                                    type="monotone"
                                    dataKey="maximum"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={{ r: 3, fill: '#10B981' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="minimum"
                                    stroke="#EF4444"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={{ r: 3, fill: '#EF4444' }}
                                />
                            </>
                        )}
                    </LineChart>
                );
        }
    };

    if (isAuthLoading || isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-800 p-8 max-w-md w-full mx-4 text-center">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-purple-700 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-2 border-4 border-purple-600 border-t-transparent rounded-full animate-spin animate-reverse"></div>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">Loading Dashboard...</h2>
                    <p className="text-gray-400">Fetching your interview insights</p>
                </div>
            </div>
        );
    }

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
                                <h1 className="text-2xl font-bold text-white">
                                    Dashboard
                                </h1>
                                <p className="text-gray-400 mt-1">Your interview performance insights</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={refreshData}
                                className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 md:bg-white/2 text-gray-300 hover:bg-gray-600 transition-colors"
                            >
                                <RefreshCw className={`w-4 h-4 ${isDataLoading ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                            <button className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 md:bg-white/2 text-gray-300 hover:bg-gray-600 transition-colors">
                                <Filter className="w-4 h-4" />
                                <span>Filter</span>
                            </button>
                            <button className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 md:bg-white/2 text-gray-300 hover:bg-gray-600 transition-colors">
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
                            <div className="grid grid-cols-2 gap-4">
                                {services.map((service, index) => (
                                    <div key={index} className="group bg-white/10 md:bg-white/2 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`w-14 h-14 ${service.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                <service.icon className="w-7 h-7 text-white" />
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-white mb-2 text-lg">{service.title}</h3>
                                        <p className="text-sm text-gray-400 mb-4">{service.value}</p>
                                        <button
                                            onClick={() => handleServiceClick(service.action)}
                                            className="text-sm text-purple-400 hover:text-purple-300 font-semibold hover:underline transition-all duration-300 flex items-center space-x-1 group-hover:translate-x-1"
                                        >
                                            <span>{service.change}</span>
                                            <span className="transform transition-transform duration-300 group-hover:translate-x-1">→</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Interview Details Table */}
                        <div className="lg:col-span-2 bg-white/10 md:bg-white/2 p-6 rounded-xl shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                                    <Activity className="w-5 h-5 text-purple-400" />
                                    <span>Recent Interviews</span>
                                </h3>
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
                                            <th className="text-left py-3 px-2 text-gray-300 font-semibold">Type</th>
                                            <th className="text-left py-3 px-2 text-gray-300 font-semibold">Role</th>
                                            <th className="text-left py-3 px-2 text-gray-300 font-semibold">Score</th>
                                            <th className="text-left py-3 px-2 text-gray-300 font-semibold">Skills</th>
                                            {/* <th className="text-left py-3 px-2 text-gray-300 font-semibold">Actions</th> */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {interviewData.slice(0, 10).map((interview, index) => {
                                            const scores = Object.values(interview.scores ?? {});
                                            const avgScore = interview.questions.length > 0 ? scores.reduce((a, b) => a + b, 0) / interview.questions.length : 0;
                                            const skills = typeof interview.skills === 'string'
                                                ? interview.skills.split(',').map((s) => s.trim()).filter(Boolean)
                                                : [];
                                            return (
                                                <tr key={index} className="hover:bg-gray-700/50 transition-all duration-300 border-b border-gray-800/50">
                                                    <td className="py-4 px-2 text-gray-300 font-medium">
                                                        <span className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded-lg text-xs">
                                                            {interview.interviewType?.slice(0, 10) || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-2 text-gray-300 max-w-32 truncate">
                                                        {interview.interviewRole?.slice(0, 30) || 'N/A'}
                                                    </td>
                                                    <td className="py-4 px-2">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-bold ${avgScore >= 8
                                                                ? 'bg-green-900/50 text-green-300 border border-green-700'
                                                                : avgScore >= 6
                                                                    ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700'
                                                                    : 'bg-red-900/50 text-red-300 border border-red-700'
                                                                }`}
                                                        >
                                                            {avgScore.toFixed(1)}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-2 text-gray-300">
                                                        <div className="flex flex-wrap gap-1">
                                                            {skills.slice(0, 2).map((skill, idx) => (
                                                                <span key={idx} className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded-lg text-xs">
                                                                    {skill.slice(0, 15)}
                                                                </span>
                                                            ))}
                                                            {skills.length > 2 && (
                                                                <span className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded-lg text-xs">
                                                                    +{skills.length - 2}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {interviewData.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="py-4 px-2 text-gray-500 text-center">
                                                    No interviews found. Start an interview to see your performance here.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Performance Over Time */}
                        <div className="lg:col-span-2 bg-white/10 md:bg-white/2 p-6 rounded-2xl shadow-xl">
                            <div className="grid grid-cols-1 lg:grid-cols-3 items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                                    <BarChart3 className="w-5 h-5 md:w-10 md:h-10 text-purple-400" />
                                    <span>Performance Over Time</span>
                                </h3>
                                <div className="flex items-center space-x-3 py-2">
                                    <select
                                        value={selectedRange}
                                        onChange={(e) => setSelectedRange(e.target.value as TimeRange)}
                                        className="md:px-4 md:py-2 rounded-xl bg-gray-800 text-gray-300 md:text-sm 
                                                        focus:outline-none focus:ring-2 focus:ring-purple-500  
                                                        px-2 py-1 text-xs"
                                    >
                                        <option>today</option>
                                        <option>Last 7 Days</option>
                                        <option>Last 30 Days</option>
                                        <option>This Year</option>
                                    </select>

                                    <select
                                        value={selectedChart}
                                        onChange={(e) =>
                                            setSelectedChart(e.target.value as 'area' | 'bar' | 'line' | 'composed')
                                        }
                                        className="md:px-4 md:py-2 rounded-xl bg-gray-800 text-gray-300 md:text-sm 
                                                    focus:outline-none focus:ring-2 focus:ring-purple-500 
                                                    px-2 py-1 text-xs"
                                    >
                                        <option value="area">Area</option>
                                        <option value="bar">Bar</option>
                                        <option value="line">Line</option>
                                        <option value="composed">Composed</option>
                                    </select>

                                    <select
                                        value={selectedMetric}
                                        onChange={(e) => setSelectedMetric(e.target.value as 'average' | 'all')}
                                        className="md:px-4 md:py-2 rounded-xl bg-gray-800 text-gray-300 md:text-sm 
                                                    focus:outline-none focus:ring-2 focus:ring-purple-500 
                                                    px-2 py-1 text-xs"
                                    >
                                        <option value="average">Average</option>
                                        <option value="all">All Metrics</option>
                                    </select>

                                    <button
                                        onClick={() => setIsChartExpanded(!isChartExpanded)}
                                        className="hidden md:block md:p-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 
                                                    transition-all duration-300 p-1 text-xs"
                                    >
                                        {isChartExpanded ? (
                                            <Minimize2 className="w-4 h-4 sm:w-3 sm:h-3" />
                                        ) : (
                                            <Maximize2 className="w-4 h-4 sm:w-3 sm:h-3" />
                                        )}
                                    </button>
                                </div>

                            </div>
                            <div className={`${isChartExpanded ? 'h-[600px]' : 'h-[300px]'}`}>
                                <ResponsiveContainer width="100%" height="100%" key={animationKey}>
                                    {renderChart()}
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Score Distribution */}
                        <div className="bg-white/10 md:bg-white/2 backdrop-blur-sm p-6 rounded-2xl shadow-xl">
                            <h3 className="text-xl font-bold text-white flex items-center space-x-2 mb-6">
                                <Target className="w-5 h-5 text-purple-400" />
                                <span>Score Distribution</span>
                            </h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={scoreDistribution}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label
                                        >
                                            {scoreDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Skills Radar Chart */}
                    <div className="mt-6 bg-white/10 md:bg-white/2 backdrop-blur-sm p-6 rounded-2xl shadow-xl relative overflow-hidden">
                        <h3 className="text-xl font-bold text-white flex items-center space-x-2 mb-6 relative z-10">
                            <Award className="w-5 h-5 text-purple-400 animate-pulse" />
                            <span>Skills Performance</span>
                            <div className="ml-auto text-sm text-gray-400 font-normal">
                                Interactive Chart
                            </div>
                        </h3>

                        <div className="h-[300px] relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={skillsRadarData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                                    {/* Multiple grid rings for better depth */}
                                    <PolarGrid
                                        stroke="#374151"
                                        strokeWidth={1}
                                        strokeOpacity={0.8}
                                        gridType="polygon"
                                    />
                                    <PolarGrid
                                        stroke="#4B5563"
                                        strokeWidth={0.5}
                                        strokeOpacity={0.4}
                                        gridType="polygon"
                                    />

                                    {/* Enhanced angle axis */}
                                    <PolarAngleAxis
                                        dataKey="skill"
                                        stroke="#E5E7EB"
                                        fontSize={13}
                                        fontWeight="500"
                                        tick={{ fill: '#E5E7EB', fontSize: 13 }}
                                        tickSize={8}
                                    />

                                    {/* Enhanced radius axis */}
                                    <PolarRadiusAxis
                                        angle={30}
                                        domain={[0, 10]}
                                        stroke="#6B7280"
                                        fontSize={11}
                                        tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                        tickCount={6}
                                        tickSize={4}
                                    />

                                    {/* Main radar area with enhanced styling */}
                                    <Radar
                                        name="Skills"
                                        dataKey="score"
                                        stroke="#8B5CF6"
                                        strokeWidth={3}
                                        fill="url(#radarGradient)"
                                        fillOpacity={0.3}
                                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                                        activeDot={{
                                            fill: '#A855F7',
                                            stroke: '#FFFFFF',
                                            strokeWidth: 2,
                                            r: 6,
                                            filter: 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.6))'
                                        }}
                                    />

                                    {/* Secondary radar for visual depth */}
                                    <Radar
                                        name="Baseline"
                                        dataKey="score"
                                        stroke="#8B5CF6"
                                        strokeWidth={1}
                                        strokeOpacity={0.3}
                                        fill="none"
                                        strokeDasharray="5,5"
                                    />

                                    {/* Enhanced tooltip */}
                                    <Tooltip
                                        content={<CustomTooltip />}
                                        wrapperStyle={{
                                            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))',
                                            zIndex: 1000
                                        }}
                                    />

                                    {/* Gradient definitions */}
                                    <defs>
                                        <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
                                            <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.6} />
                                            <stop offset="50%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.1} />
                                        </radialGradient>
                                    </defs>
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Performance indicators */}
                        <div className="mt-4 flex justify-between items-center text-xs text-gray-400 relative z-10">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                <span>Current Performance</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span>Scale: 0-10</span>
                                <div className="flex items-center space-x-1">
                                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Premium Popup  */}
            {
                showPremiumPopup && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800 p-6 max-w-md w-full">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white">Unlock Premium Features</h2>
                                <button
                                    onClick={() => setShowPremiumPopup(false)}
                                    className="text-gray-400 hover:text-white transition-all duration-300"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <p className="text-gray-300 mb-4">
                                Upgrade to SuperGrok to access advanced features like ATS Scan, Resume Builder, and Job Search.
                            </p>
                            <a
                                href="https://x.ai/grok"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                            >
                                Learn More
                            </a>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Dashboard;
