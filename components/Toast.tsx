import { useEffect } from "react";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export type ToastType = "success" | "error" | "warning";

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
    const bgColor =
        type === "success"
            ? "bg-green-500"
            : type === "error"
                ? "bg-red-500"
                : "bg-yellow-500";

    const IconComponent =
        type === "success" ? CheckCircle :
            type === "error" ? XCircle :
                AlertTriangle;

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000); // Auto-close after 3 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 z-50 animate-fadeIn`}>
            <IconComponent className="w-5 h-5 flex-shrink-0" />
            <span>{message}</span>
        </div>
    );
};

export default Toast;