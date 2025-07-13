import { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle, XCircle, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning";

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    const getDisplayDuration = () => {
        const baseTime = 2000;
        const messageLength = message.length;
        const readingTime = Math.max(messageLength * 50, 1000);

        // Error messages stay longer
        const typeMultiplier = type === "error" ? 1.5 : type === "warning" ? 1.2 : 1;

        return Math.min(baseTime + readingTime * typeMultiplier, 8000); 
    };

    const typeStyles = {
        success: {
            borderColor: "border-t-green-500",
            iconColor: "text-green-500",
            title: "Successful"
        },
        error: {
            borderColor: "border-t-red-500",
            iconColor: "text-red-500",
            title: "Oh snap"
        },
        warning: {
            borderColor: "border-t-yellow-500",
            iconColor: "text-yellow-500",
            title: "Warning"
        }
    };

    const IconComponent =
        type === "success" ? CheckCircle :
            type === "error" ? XCircle :
                AlertTriangle;

    const styles = typeStyles[type];

    useEffect(() => {
        // Slow appearing animation with delay
        const appearTimer = setTimeout(() => {
            setIsVisible(true);
        }, 100); // Small delay before starting the animation

        const duration = getDisplayDuration();
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
                onClose();
            }, 500); // Wait for exit animation
        }, duration + 100); // Account for the initial delay

        return () => {
            clearTimeout(appearTimer);
            clearTimeout(timer);
        };
    }, [onClose, message, type]);

    const handleManualClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose();
        }, 500); // Wait for slower exit animation
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
            <div
                className={`
                    max-w-sm w-full pointer-events-auto
                    bg-white ${styles.borderColor} border-t-4 border-l border-r border-b border-gray-200
                    shadow-lg rounded-lg
                    flex items-start space-x-3 p-4
                    transform transition-all duration-700 ease-out
                    ${isVisible && !isExiting
                        ? 'translate-x-0 translate-y-0 opacity-100 scale-100'
                        : isExiting
                            ? 'translate-x-full opacity-0 scale-95'
                            : 'translate-x-full translate-y-2 opacity-0 scale-90'
                    }
                `}
            >
                <div className="flex-shrink-0 mt-0.5">
                    <IconComponent className={`w-5 h-5 ${styles.iconColor}`} />
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="text-gray-900 text-sm font-semibold">
                        {styles.title}
                    </h4>
                    <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                        {message}
                    </p>
                </div>

                <button
                    onClick={handleManualClose}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    aria-label="Close notification"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Toast;