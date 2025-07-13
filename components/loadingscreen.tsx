"use client";
import React from 'react';
import Image from 'next/image';

const LoadingScreen = ({ isLoading }: { isLoading: boolean }) => {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#ADBBD4] via-[#DDD3E8] to-[#8697C4]">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

            {/* Logo */}
            <div className="relative w-32 h-32 sm:w-48 sm:h-48 mb-6">
                <Image
                    src="/loading.png"
                    alt="Loading"
                    fill
                    className="object-contain animate-pulse"
                    priority
                />
            </div>

            {/* Running Text */}
            <div className="overflow-hidden w-full max-w-md">
                <div className="text-lg sm:text-xl font-semibold text-gray-900 whitespace-nowrap animate-marquee">
                    Just a moment
                </div>
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% {
                        transform: translateX(100%);
                    }
                    100% {
                        transform: translateX(-100%);
                    }
                }
                .animate-marquee {
                    animation: marquee 4s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default LoadingScreen;