"use client";
import { useState } from "react";
import { Sparkles, ArrowRight, Star, Target, Brain, Award, MessageSquare, History, X, Menu, Shield, LogIn, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvide";
import Image from "next/image";
import logo from "@/public/logo.png";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNavigation = (path: string) => {
    setIsSidebarOpen(false);
    router.push(path);
  };

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Questions",
      description: "Get intelligent, role-specific questions tailored to your job profile and experience level."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Personalized Content",
      description: "Questions adapt to your experience level, from fresher to senior positions."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Quick Generation",
      description: "Generate comprehensive interview questions in seconds, not hours."
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Industry Standards",
      description: "Questions based on current industry practices and hiring trends."
    }
  ];

  const stats = [
    { number: "10K+", label: "Questions Generated" },
    { number: "500+", label: "Job Profiles" },
    { number: "95%", label: "Success Rate" },
    { number: "24/7", label: "Available" }
  ];

  const testimonials = [
    {
      name: "Abhinav",
      role: "Software Engineer",
      company: "Tech Corp",
      text: "The questions were spot-on for my frontend developer interview. Helped me prepare thoroughly!",
      rating: 4
    },
    {
      name: "Renu Deshmukh",
      role: "Data Analyst",
      company: "Analytics Inc",
      text: "Amazing tool! The AI generated questions that were exactly what I faced in my actual interview.",
      rating: 5
    },
    {
      name: "Vikesh Kumar",
      role: "Cloud Engineer",
      company: "Startup XYZ",
      text: "Level-appropriate questions that boosted my confidence. Highly recommend for interview prep!",
      rating: 4
    },
    {
      name: "Govind Kushwaha",
      role: "Project Lead",
      company: "InnovateTech",
      text: "Comprehensive questions covering all aspects of product management. Excellent preparation tool!",
      rating: 5
    },
    {
      name: "Rajesh Kumar",
      role: "Data Analyst",
      company: "DataFlow Ltd",
      text: "The AI understood my experience level perfectly and generated relevant questions. Amazing!",
      rating: 5
    },
    {
      name: "Harsh Tiwari",
      role: "Software Developer",
      company: "Salesforce",
      text: "Great variety of design thinking questions. Helped me articulate my design process better.",
      rating: 4
    }
  ];

  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <div className="min-h-screen bg-black">
      {/* Background Pattern */}
      <div className="
          absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] sm:bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none">
      </div>


      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black /98 bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="md:hidden">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      </div>


      {/* Navigation */}
      <nav className="relative z-10 px-4 sm:px-6 py-4 bg-transparent shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image src={logo} alt="JobFlow AI Logo" className="md:w-16 md:h-16 w-12 h-12 rounded-xl flex items-center justify-center" />
            <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              PreplystHub - AI
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => handleNavigation("/history")}
              className="px-6 py-2 bg-white/80 border border-blue-200 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300"
            >
              View History
            </button>
            <button
              onClick={() => {
                // Clear stale data first
                localStorage.removeItem("questions");
                localStorage.removeItem("userAnswers");
                localStorage.removeItem("feedbacks");
                localStorage.removeItem("scores");
                localStorage.removeItem("interviewRole");
                localStorage.removeItem("interviewType");
                localStorage.removeItem("skills");
                localStorage.removeItem("currentQuestionIndex");
                router.push("/dashboard");
              }}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Dashboard
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 bg-white/80 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-300"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>
      <div className="absolute top-1/2 left-1/100 w-66 h-66 rounded-full pointer-events-none bg-blue-700 opacity-30 blur-3xl"></div>
      <div className="absolute top-0 right-1/100 w-66 h-66 rounded-full pointer-events-none bg-blue-700 opacity-30 blur-3xl"></div>


      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Interview Preparation
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-300 mb-6 leading-tight">
            Ace Your Next
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent"> Interview</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Generate personalized interview questions tailored to your job profile and experience level.
            Prepare smarter, not harder, with our AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => {
                localStorage.removeItem("questions");
                localStorage.removeItem("userAnswers");
                localStorage.removeItem("feedbacks");
                localStorage.removeItem("scores");
                localStorage.removeItem("currentQuestionIndex");
                router.push("/auth");
              }}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center space-x-2"
            >
              <span>Start Preparing Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-gray-300 backdrop-blur-sm text-gray-700 font-semibold rounded-2xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Watch Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-300 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-300 mb-6">Why Choose PreplystHub - AI?</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Our intelligent platform adapts to your needs, providing the most relevant and challenging questions.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-300 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-300 mb-6">Success Stories</h2>
            <p className="text-xl text-gray-400">See how others have succeeded with PreplystHub - AI</p>
          </div>
          <div className="relative overflow-hidden">
            <div className="flex gap-6 animate-scroll">
              {duplicatedTestimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-80 bg-gray-300 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-blue-700 fill-current" />
                    ))}
                  </div>
                  <p className="text-black mb-4 italic leading-relaxed">{testimonial.text}</p>
                  <div>
                    <div className="font-semibold text-black">{testimonial.name}</div>
                    <div className="text-sm text-black">{testimonial.role} at {testimonial.company}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-black to-transparent pointer-events-none z-10"></div>
            <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-black to-transparent pointer-events-none z-10"></div>
          </div>
        </div>
        <style jsx>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-200%); }
          }
          .animate-scroll {
            animation: scroll 30s linear infinite;
          }
          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 text-white shadow-2xl">
            <h2 className="text-4xl font-bold mb-6">Ready to Ace Your Interview?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of successful candidates who prepared with PreplystHub - AI
            </p>
            <button
              onClick={() => handleNavigation("/homeform")}
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center space-x-2 mx-auto"
            >
              <Sparkles className="w-5 h-5" />
              <span>Generate Your Questions Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-3 border-t border-blue-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image src={logo} alt="JobFlow AI Logo" className="w-12 h-12 md:w-18 md:h-18 rounded-xl flex items-center justify-center" />
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-300">
              <Shield className="w-6 h-6" />
              <span>Powered by Firebase • Secure & Private</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}