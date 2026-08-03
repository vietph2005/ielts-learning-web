import { Link } from "react-router-dom"
import { BookOpen, Headphones, PenTool, Mic } from "lucide-react"

export function NavigationMenu() {
    return (
        <>
            <div className="relative group">
                <button className="text-gray-700 px-4 py-2 text-sm font-medium hover:bg-emerald-50 hover:text-emerald-600 rounded-md transition-colors">
                    IELTS TESTS
                </button>
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                        <Link
                            to="/test/listening"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                            <Headphones className="w-4 h-4 mr-3" />
                            Listening Tests
                        </Link>
                        <Link
                            to="/test/reading"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                            <BookOpen className="w-4 h-4 mr-3" />
                            Reading Tests
                        </Link>
                        <Link
                            to="/test/writing"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                            <PenTool className="w-4 h-4 mr-3" />
                            Writing Tests
                        </Link>
                        <Link
                            to="/test/speaking"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                            <Mic className="w-4 h-4 mr-3" />
                            Speaking Tests
                        </Link>
                        <div className="border-t my-1"></div>
                        <Link
                            to="/test"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 font-medium"
                        >
                            All Tests
                        </Link>
                    </div>
                </div>
            </div>

            <div className="relative group">
                 <button className="text-gray-700 px-4 py-2 text-sm font-medium hover:bg-emerald-50 hover:text-emerald-600 rounded-md transition-colors">
                    IELTS TIPS
                 </button>
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                        <Link
                            to="/tips/Listening"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                            <Headphones className="w-4 h-4 mr-3" />
                            Listening Tips
                        </Link>
                        <Link
                            to="/tips/Reading"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                            <BookOpen className="w-4 h-4 mr-3" />
                            Reading Tips
                        </Link>
                        <Link
                            to="/tips/Writing"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                            <PenTool className="w-4 h-4 mr-3" />
                            Writing Tips
                        </Link>
                        <Link
                            to="/tips/Speaking"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                            <Mic className="w-4 h-4 mr-3" />
                            Speaking Tips
                        </Link>
                    </div>
                </div>
            </div>
            <Link
                to="/practice/vocabulary"
                className="text-gray-700 px-4 py-2 text-sm font-medium hover:bg-emerald-50 hover:text-emerald-600 rounded-md transition-colors"
            >
                VOCABULARY
            </Link>

            <Link
                to="/student/dashboard"
                className="text-gray-700 px-4 py-2 text-sm font-medium hover:bg-emerald-50 hover:text-emerald-600 rounded-md transition-colors"
            >
                DASHBOARD
            </Link>
        </>
    )
}
