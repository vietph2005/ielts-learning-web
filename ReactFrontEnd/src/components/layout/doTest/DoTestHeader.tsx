import { Button } from "@/components/ui/button";
import { Clock, Maximize2, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";

interface DoTestHeaderProps {
    initialTime: number;
    onSubmit: () => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    onFullscreenToggle?: () => void;
    isHighlightMode: boolean;
    toggleHighlightMode: () => void;
}

export function DoTestHeader({
                                 initialTime,
                                 onSubmit,
                                 isDarkMode,
                                 toggleDarkMode,
                                 onFullscreenToggle,
                                 isHighlightMode,
                                 toggleHighlightMode,
                             }: DoTestHeaderProps) {
    const [timeRemaining, setTimeRemaining] = useState(initialTime);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [onSubmit]);

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
            <div className="flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        IELTS Master
                    </span>
                </Link>

                {/* Timer */}
                <div
                    className={`flex items-center space-x-2 ${
                        timeRemaining <= 60
                            ? "text-red-600 dark:text-red-400 font-bold animate-pulse"
                            : "text-orange-600 dark:text-orange-400"
                    }`}
                >
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">{formatTime(timeRemaining)}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                    {/* Fullscreen */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onFullscreenToggle}
                        className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Maximize2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </Button>

                    {/* Dark Mode */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleDarkMode}
                        className={`transition-colors ${
                            isDarkMode
                                ? "bg-yellow-300 dark:bg-yellow-600 rounded"
                                : "hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                    >
                        {isDarkMode ? (
                            <Sun className="w-4 h-4 text-yellow-400" />
                        ) : (
                            <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        )}
                    </Button>

                    {/* Highlight Mode */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleHighlightMode}
                        className={`transition-colors ${
                            isHighlightMode
                                ? "bg-emerald-600 rounded"
                                : "hover:bg-emerald-500 "
                        }`}
                    >
                        <span className="ml-1 text-sm">Highlight</span>
                    </Button>

                    {/* Submit */}
                    <Button
                        onClick={onSubmit}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-6"
                    >
                        Submit
                    </Button>
                </div>
            </div>
        </header>
    );
}
