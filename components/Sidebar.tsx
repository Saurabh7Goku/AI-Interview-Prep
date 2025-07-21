import React, { useState } from 'react';
import { Search, FileText, Home, History, LogIn, Users, X, TargetIcon } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import logo from '@/public/logo.png';

interface SidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [showPremiumPopup, setShowPremiumPopup] = useState(false);

    const sidebarItems: {
        name: string;
        icon: React.FC<any>;
        path?: string;
        action?: string;
    }[] = [
            { name: 'Dashboard', icon: Home, path: '/dashboard' },
            { name: 'ATS Scan', icon: FileText, path: 'https://ats-resume-a7rk.onrender.com' },
            { name: 'Job Finder', icon: Search, action: 'subscription' },
            { name: 'Mock Interview', icon: Users, path: '/homeform' },
            { name: 'History', icon: History, path: '/history' },
            { name: 'Premium', icon: TargetIcon, action: 'subscription' },
            { name: 'Log Out', icon: LogIn, action: 'logout' },
        ];

    return (
        <div className={`fixed top-0 left-0 h-full bg-black/98 w-80 sm:w-64 shadow-xl transform transition-transform duration-300 ease-in-out z-50 lg:static lg:shadow-none lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="px-5 py-5 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Image src={logo} alt="PreplystHub - AI Logo" className="w-12 h-12 rounded-xl flex items-center justify-center" />
                            <span className="text-lg font-bold text-white">PreplystHub - AI</span>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-2 rounded-lg hover:bg-gray-700 transition-colors lg:hidden"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {sidebarItems.map((item) => {
                        // Determine if this item is active
                        const isActive = item.path && pathname.startsWith(item.path);

                        return (
                            <button
                                key={item.name}
                                onClick={() => {
                                    setIsSidebarOpen(false);
                                    if (item.action === 'logout') {
                                        localStorage.clear();
                                        router.push('/');
                                    } if (item.action === 'subscription') {
                                        setShowPremiumPopup(true);
                                    }
                                    else if (item.path) {
                                        router.push(item.path);
                                    }
                                }}
                                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 
                                    ${isActive
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
                                `}
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                <span className="font-medium">{item.name}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-700">
                    <div className="bg-black/40 p-4 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">U</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">User</p>
                                <p className="text-xs text-gray-400">Free Plan</p>
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

export default Sidebar;
