"use client"
import { useState } from "react";
import { Briefcase, Sparkles, ArrowRight, Star, Target, Brain, Award, MessageSquare, Clock, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

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

  // Duplicate testimonials for seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-600 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-blue-300 rounded-full blur-2xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">InterviewPrep AI</span>
          </div>
          <button
            onClick={() => router.push("/homeform")}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Interview Preparation
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            Ace Your Next
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent"> Interview</span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Generate personalized interview questions tailored to your job profile and experience level.
            Prepare smarter, not harder, with our AI-powered platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => router.push("/homeform")}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center space-x-2"
            >
              <span>Start Preparing Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 font-semibold rounded-2xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Watch Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 p-8">
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
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Why Choose InterviewPrep AI?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our intelligent platform adapts to your needs, providing the most relevant and challenging questions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
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
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Success Stories</h2>
            <p className="text-xl text-gray-600">See how others have succeeded with InterviewPrep AI</p>
          </div>

          {/* Container with hidden overflow */}
          <div className="relative overflow-hidden">
            {/* Moving container */}
            <div className="flex gap-6 animate-scroll">
              {duplicatedTestimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-80 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic leading-relaxed">{testimonial.text}</p>
                  <div>
                    <div className="font-semibold text-gray-800">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced gradient overlays for smooth fade effect */}
            <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-blue-50 to-transparent pointer-events-none z-10"></div>
            <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-blue-50 to-transparent pointer-events-none z-10"></div>
          </div>
        </div>

        <style jsx>{`
    @keyframes scroll {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(-200%);
      }
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
              Join thousands of successful candidates who prepared with InterviewPrep AI
            </p>
            <button
              onClick={() => router.push("/homeform")}
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
      <footer className="relative z-10 px-6 py-12 border-t border-blue-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-800">InterviewPrep AI</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Powered by AI • Secure & Private</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}