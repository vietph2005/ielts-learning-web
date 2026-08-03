import { Link } from "react-router-dom"
import { BookOpen } from "lucide-react"

export function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold">LANGUAGES</span>
                        </div>
                        <p className="text-gray-400">Your comprehensive platform for language test preparation and practice.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Tests</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li>
                                <Link to="/test/listening" className="hover:text-white">
                                    Listening
                                </Link>
                            </li>
                            <li>
                                <Link to="/test/reading" className="hover:text-white">
                                    Reading
                                </Link>
                            </li>
                            <li>
                                <Link to="/test/writing" className="hover:text-white">
                                    Writing
                                </Link>
                            </li>
                            <li>
                                <Link to="/test/speaking" className="hover:text-white">
                                    Speaking
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Tips</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li>
                                <Link to="/tips/Listening" className="hover:text-white">
                                    Listening Tips
                                </Link>
                            </li>
                            <li>
                                <Link to="/tips/Reading" className="hover:text-white">
                                    Reading Tips
                                </Link>
                            </li>
                            <li>
                                <Link to="/tips/Writing" className="hover:text-white">
                                    Writing Tips
                                </Link>
                            </li>
                            <li>
                                <Link to="/tips/Speaking" className="hover:text-white">
                                    Speaking Tips
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Support</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li>
                                <Link to="/contact" className="hover:text-white">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/help" className="hover:text-white">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="hover:text-white">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="hover:text-white">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2024 LANGUAGES. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
