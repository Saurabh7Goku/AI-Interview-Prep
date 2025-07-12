"use client";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Home, FileText, Search, MessageCircle, History, X } from "lucide-react";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();

    const sidebarItems = [
        { name: "Dashboard", icon: Home, path: "/" },
        { name: "ATS Scan", icon: FileText, path: "/ats-scan" },
        { name: "Job Finder", icon: Search, path: "/job-finder" },
        { name: "Mock Interview", icon: MessageCircle, path: "/mock-interview" },
        { name: "History", icon: History, path: "/history" },
    ];

    return (
        <div
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform ${isOpen ? "translate-x-0" : "-translate-x-full"
                } transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0`}
        >
            <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">Prep</span>
                    </div>
                    <span className="text-white font-bold text-lg">aiInterPrep</span>
                </div>
                <button
                    onClick={onClose}
                    className="md:hidden text-gray-400 hover:text-white"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <nav className="mt-8">
                <div className="px-4 mb-4">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Main Menu
                    </h3>
                </div>
                {sidebarItems.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => {
                            router.push(item.path);
                            onClose(); // Close sidebar on mobile after navigation
                        }}
                        className={`w-full flex items-center px-6 py-3 text-left transition-colors ${pathname === item.path
                            ? "bg-gray-800 text-white border-r-2 border-blue-600"
                            : "text-gray-400 hover:text-white hover:bg-gray-800"
                            }`}
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.name}
                    </button>
                ))}
            </nav>
        </div>
    );
}