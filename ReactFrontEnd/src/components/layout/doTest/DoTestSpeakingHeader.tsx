import { Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";

interface SimpleTestHeaderProps {
    initialTime: number;
}

export function DoTestSpeakingHeader({ initialTime }: SimpleTestHeaderProps) {
    const [timeRemaining, setTimeRemaining] = useState(initialTime);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
        const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
        return `${minutes}:${secs}`;
    };

    return (
        <header
            className="bg-white dark:bg-[#202124] border-b border-gray-200 dark:border-gray-700 px-6 py-3 sticky top-0 z-50"
            style={{ userSelect: "none" }}
        >
            <div className="grid grid-cols-3 items-center">
                {/* Logo bên trái */}
                <div className="flex items-center">
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            IELTS Master
                        </span>
                    </Link>
                </div>
                {/* Timer ở giữa */}
                <div className="flex justify-center">
                    <div
                        className={`flex items-center space-x-2 ${
                            timeRemaining <= 60
                                ? "text-red-600 dark:text-red-400 font-bold animate-pulse"
                                : "text-orange-600 dark:text-orange-400"
                        }`}
                    >
                        <Clock className="w-5 h-5" />
                        <span className="text-2xl font-bold">{formatTime(timeRemaining)}</span>
                    </div>
                </div>
                {/* Cột phải để trống hoặc cho nút khác nếu cần */}
                <div></div>
            </div>
        </header>
    );
}
