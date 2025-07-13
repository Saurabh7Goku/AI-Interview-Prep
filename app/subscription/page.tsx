'use client'
import React, { useState } from 'react';
import { Check, X, Star, Zap, Crown, Menu, ArrowRight, Users, Brain, FileText, Search, BarChart3, Bot, Shield, Award, Clock, User, HandHeartIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SubscriptionPage() {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('pro');
    const [isAnnual, setIsAnnual] = useState(false);

    const plans = [
        {
            name: 'Free',
            price: { monthly: 0, annual: 0 },
            description: 'Perfect for getting started with interview preparation',
            icon: Users,
            color: 'bg-slate-100 text-slate-700',
            buttonColor: 'bg-slate-600 hover:bg-slate-700 text-white',
            borderColor: 'border-slate-200',
            features: [
                { name: 'Mock Interviews', value: '3 sessions per month', included: true },
                { name: 'Interview History', value: 'Last 30 days only', included: true },
                { name: 'Basic Analysis', value: 'Performance scores', included: true },
                { name: 'ATS Resume Scan', value: '2 scans per month', included: true },
                { name: 'Resume Builder', value: 'Basic templates', included: false },
                { name: 'Job Search AI', value: 'Advanced matching', included: false },
                { name: 'AI Agents', value: 'Premium automation', included: false },
                { name: 'Priority Support', value: '24/7 dedicated support', included: false }
            ]
        },
        {
            name: 'Pro',
            price: { monthly: 29, annual: 290 },
            description: 'Most popular choice for serious job seekers',
            icon: Zap,
            color: 'bg-gradient-to-br from-blue-600 to-blue-700 text-white',
            buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
            borderColor: 'border-blue-200',
            popular: true,
            features: [
                { name: 'Mock Interviews', value: 'Unlimited sessions', included: true },
                { name: 'Interview History', value: 'Complete history & analytics', included: true },
                { name: 'Advanced Analysis', value: 'AI-powered insights & feedback', included: true },
                { name: 'ATS Resume Scan', value: '50 scans per day', included: true },
                { name: 'Resume Builder', value: 'Premium templates & optimization', included: true },
                { name: 'Job Search AI', value: 'Smart matching & recommendations', included: true },
                { name: 'AI Agents', value: 'Basic automation features', included: false },
                { name: 'Priority Support', value: 'Email & chat support', included: false }
            ]
        },
        {
            name: 'Enterprise',
            price: { monthly: 99, annual: 990 },
            description: 'Advanced features for teams and professionals',
            icon: Crown,
            color: 'bg-gradient-to-br from-purple-600 to-purple-700 text-white',
            buttonColor: 'bg-purple-600 hover:bg-purple-700 text-white',
            borderColor: 'border-purple-200',
            features: [
                { name: 'Mock Interviews', value: 'Unlimited + custom scenarios', included: true },
                { name: 'Interview History', value: 'Advanced analytics & reporting', included: true },
                { name: 'AI Analysis', value: 'Deep learning insights & coaching', included: true },
                { name: 'ATS Resume Scan', value: 'Unlimited + API access', included: true },
                { name: 'Resume Builder', value: 'All templates + custom branding', included: true },
                { name: 'Job Search AI', value: 'Advanced AI agents & automation', included: true },
                { name: 'AI Agents', value: 'Full automation suite', included: true },
                { name: 'Priority Support', value: '24/7 phone, chat & dedicated manager', included: true }
            ]
        }
    ];

    const features = [
        {
            icon: Brain,
            title: 'AI-Powered Mock Interviews',
            description: 'Practice with realistic scenarios using advanced AI technology tailored to your industry and role.'
        },
        {
            icon: BarChart3,
            title: 'Comprehensive Performance Analysis',
            description: 'Receive detailed insights on communication skills, confidence levels, and technical competencies.'
        },
        {
            icon: FileText,
            title: 'ATS-Optimized Resume Builder',
            description: 'Create professional resumes that successfully pass Applicant Tracking Systems.'
        },
        {
            icon: Search,
            title: 'Intelligent Job Matching',
            description: 'Discover opportunities that align perfectly with your skills, experience, and career goals.'
        },
        {
            icon: Bot,
            title: 'AI-Powered Automation',
            description: 'Streamline applications and follow-ups with intelligent automation agents.'
        },
        {
            icon: Shield,
            title: 'Enterprise Security',
            description: 'Your data is protected with enterprise-grade security and privacy measures.'
        }
    ];

    const testimonials = [
        {
            name: 'Harsh Tiwari',
            role: 'Software Engineer',
            company: 'Absyz',
            content: 'Interview Pro helped me land my dream job at a top tech company. The AI feedback was incredibly accurate.',
            rating: 4
        },
        {
            name: 'Govind Kushwaha',
            role: 'Project Lead',
            company: 'StartupXYZ',
            content: 'The mock interviews were so realistic, I felt completely prepared for the real thing.',
            rating: 5
        },

    ];

    return (
        <div className="flex min-h-screen bg-black">
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Header */}
                <header className="bg-transparent backdrop-blur-xl shadow-sm">
                    <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div>
                                <h1 className="text-base sm:text-xl font-bold text-blue-700">Subscription Plans</h1>
                                <p className="hidden sm:block text-gray-300 text-xs sm:text-sm">Choose the plan that best fits your career goals</p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow transition-colors">
                            Dashboard
                        </button>

                    </div>
                </header>
                <div className="absolute top-0 right-1/100 w-66 h-66 rounded-full pointer-events-none bg-blue-700 opacity-30 blur-3xl"></div>

                <div className="absolute top-1/2 left-1/100 w-66 h-66 rounded-full pointer-events-none bg-blue-700 opacity-30 blur-3xl"></div>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                    {/* Hero Section */}
                    <div className="text-center mb-12 sm:mb-16">

                        <div className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                            <Award size={14} className="mr-2 sm:mr-2" />
                            Trusted by 10,000+ professionals
                        </div>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-300 mb-4 sm:mb-6 leading-tight">
                            Choose Your
                            <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent"> Success Plan</span>
                        </h2>
                        <p className="text-base sm:text-lg lg:text-xl text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
                            Transform your interview performance with AI-powered practice, personalized feedback, and professional guidance
                        </p>

                        {/* Billing Toggle */}
                        <div className="flex items-center justify-center mb-8 sm:mb-12">
                            <div className="bg-white backdrop-blur-sm rounded-2xl p-2 shadow-lg">
                                <div className="flex items-center">
                                    <span className={`px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm ${!isAnnual ? 'font-semibold text-blue-700' : 'text-gray-600'}`}>
                                        Monthly
                                    </span>
                                    <button
                                        onClick={() => setIsAnnual(!isAnnual)}
                                        className={`relative inline-flex h-7 w-12 sm:h-8 sm:w-14 items-center rounded-full transition-colors ${isAnnual ? 'bg-blue-600' : 'bg-gray-300'}`}
                                    >
                                        <span
                                            className={`inline-block h-5 w-5 sm:h-6 sm:w-6 transform rounded-full bg-white transition-transform shadow-lg ${isAnnual ? 'translate-x-6 sm:translate-x-7' : 'translate-x-1'}`}
                                        />
                                    </button>
                                    <span className={`px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm ${isAnnual ? 'font-semibold text-blue-700' : 'text-gray-600'}`}>
                                        Annual
                                    </span>
                                    <span className="ml-2 text-xs sm:text-sm bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full font-medium">
                                        Save 17%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20">
                        {plans.map((plan, index) => (
                            <div
                                key={plan.name}
                                className={`relative bg-white/3 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl hover:scale-105 border-2 ${plan.popular ? 'border-blue-500 ring-4 ring-blue-500/10' : plan.borderColor}`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-0 right-0 text-blue-700 text-center py-2 sm:py-3 text-sm md:text-lg font-semibold">
                                        <Star className="inline mr-1 sm:mr-2" size={22} />
                                        Most Popular Choice
                                    </div>
                                )}

                                <div className="p-6 sm:p-8 pt-8 sm:pt-10">
                                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                                        <div className={`p-3 sm:p-4 rounded-2xl ${plan.color}`}>
                                            <plan.icon size={24} className="sm:w-7 sm:h-7" />
                                        </div>
                                        {plan.popular && (
                                            <div className="bg-yellow-100 text-yellow-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                                                Recommended
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-300 mb-2 sm:mb-3">{plan.name}</h3>
                                    <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 leading-relaxed">{plan.description}</p>

                                    <div className="mb-6 sm:mb-8">
                                        <div className="flex items-baseline">
                                            <span className="text-4xl sm:text-5xl font-bold text-gray-300">
                                                ${isAnnual ? plan.price.annual : plan.price.monthly}
                                            </span>
                                            <span className="text-sm sm:text-base text-gray-400 ml-2">
                                                {plan.price.monthly > 0 ? (isAnnual ? '/year' : '/month') : ''}
                                            </span>
                                        </div>
                                        {isAnnual && plan.price.monthly > 0 && (
                                            <div className="text-xs sm:text-sm text-gray-400 mt-2">
                                                ${Math.round(plan.price.annual / 12)}/month when billed annually
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 ${plan.buttonColor} hover:shadow-lg hover:scale-105 flex items-center justify-center`}
                                        onClick={() => setSelectedPlan(plan.name.toLowerCase())}
                                    >
                                        {plan.name === 'Free' ? 'Start Free Trial' : `${plan.name} Plan`}
                                        <ArrowRight className="ml-2" size={18} />
                                    </button>
                                </div>

                                <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                                    <div className="border-t border-gray-200 pt-4 sm:pt-6">
                                        <h4 className="font-semibold text-gray-200 mb-3 sm:mb-4 text-sm sm:text-base">What's included:</h4>
                                        <ul className="space-y-3 sm:space-y-4">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start">
                                                    <div className="flex-shrink-0 mt-1">
                                                        {feature.included ? (
                                                            <div className="p-1 bg-green-100 rounded-full">
                                                                <Check className="text-green-600" size={18} />
                                                            </div>
                                                        ) : (
                                                            <div className="p-1 bg-gray-100 rounded-full">
                                                                <X className="text-red-600" size={18} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-3 sm:ml-4">
                                                        <span className={`font-medium text-sm sm:text-base ${feature.included ? 'text-blue-600' : 'text-red-400'}`}>
                                                            {feature.name}
                                                        </span>
                                                        <div className="text-xs sm:text-sm text-gray-300 mt-1">{feature.value}</div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Features Section */}
                    <div className="bg-white/10 md:bg-white/2 backdrop-blur-sm rounded-3xl p-8 sm:p-12 mb-12 sm:mb-16 shadow-xl">
                        <div className="text-center mb-8 sm:mb-12">
                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-300 mb-3 sm:mb-4">Why Choose Interview Pro?</h3>
                            <p className="text-sm sm:text-lg text-gray-300 max-w-2xl mx-auto">
                                Our platform combines cutting-edge AI technology with proven interview strategies to give you the competitive edge
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {features.map((feature, index) => (
                                <div key={index} className="text-center group">
                                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 sm:p-6 rounded-2xl inline-block mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                                        <feature.icon size={32} className="sm:w-9 sm:h-9" />
                                    </div>
                                    <h4 className="text-lg sm:text-xl font-semibold text-gray-400 mb-2 sm:mb-3">{feature.title}</h4>
                                    <p className="text-sm sm:text-base text-gray-500 leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Social Proof */}
                    <div className="bg-white/10 md:bg-white/2 backdrop-blur-sm rounded-3xl p-8 sm:p-12 mb-12 sm:mb-16 shadow-xl">
                        <div className="text-center mb-8 sm:mb-12">
                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-300 mb-3 sm:mb-4">
                                Trusted by Professionals Worldwide
                            </h3>
                            <div className="flex justify-center mb-8 sm:mb-6">
                                <div className="w-1/1.5 inline-flex flex-row bg-white/10 rounded-lg px-2 md:px-6 py-2 space-y-4 sm:space-y-2 sm:space-x-2">
                                    <div className="text-center px-4">
                                        <div className="text-2xl sm:text-3xl font-bold text-blue-600">95%</div>
                                        <div className="text-xs sm:text-sm text-gray-300">Success Rate</div>
                                    </div>
                                    <div className="text-center px-4">
                                        <div className="text-2xl sm:text-3xl font-bold text-blue-600">10K+</div>
                                        <div className="text-xs sm:text-sm text-gray-300">Happy Users</div>
                                    </div>
                                    <div className="text-center px-4">
                                        <div className="text-2xl sm:text-3xl font-bold text-blue-600">500+</div>
                                        <div className="text-xs sm:text-sm text-gray-300">Companies</div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                            {testimonials.map((testimonial, index) => (
                                <div key={index} className="bg-white/10 sm:bg-white/2 rounded-2xl p-4 sm:p-6">
                                    <div className="flex items-center mb-3 sm:mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="text-yellow-500 fill-current" size={14} />
                                        ))}
                                    </div>
                                    <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4 italic">"{testimonial.content}"</p>
                                    <div>
                                        <div className="font-semibold text-sm sm:text-base text-gray-300">{testimonial.name}</div>
                                        <div className="text-xs sm:text-sm text-blue-600">{testimonial.role} at {testimonial.company}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Final CTA */}
                    <div className="text-center bg-white/10 md:bg-white/2 text-white rounded-3xl p-8 sm:p-12 shadow-2xl">
                        <h3 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Ready to Transform Your Career?</h3>
                        <p className="text-base sm:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto">
                            Join thousands of professionals who've accelerated their careers with Interview Pro. Start your journey today with a free trial.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-3 sm:space-x-4">
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-100 transition-all hover:shadow-lg flex items-center">
                                <Clock className="mr-2" size={18} />
                                Start Free Trial
                            </button>
                            <button className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-white hover:text-blue-600 transition-all">
                                View Demo
                            </button>
                        </div>
                        <p className="text-xs sm:text-sm opacity-75 mt-3 sm:mt-4">No credit card required • Cancel anytime</p>
                    </div>
                </main>
            </div>
        </div>
    )
}