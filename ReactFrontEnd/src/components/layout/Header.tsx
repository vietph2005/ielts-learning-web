import { Link } from "react-router-dom"
import { BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NavigationMenu } from "@/components/layout/NavigationMenu"
import { UserMenu } from "@/components/layout/UserMenu"
import { useAuth } from "@/contexts/AuthContext"

export function Header() {
    const { user, logout } = useAuth()

    return (
        <nav className="sticky top-0 z-50 bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">LANGUAGES</span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-1">
                        <NavigationMenu />
                    </div>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <UserMenu onLogout={logout} />
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link to="/login">
                                    <Button variant="ghost">Login</Button>
                                </Link>
                                <Link to="/register">
                                    <Button className="bg-emerald-600 hover:bg-emerald-700">Register</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
