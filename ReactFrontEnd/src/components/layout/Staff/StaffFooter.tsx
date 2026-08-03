import { Link } from "react-router-dom";
import { BookOpen, Mail, Phone, Clock } from "lucide-react";

export function StaffFooter() {
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
            <p className="text-gray-400">Staff portal for managing tests, grading, and resources.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/handle-reports" className="hover:text-white">Handle Report</Link>
              </li>
              <li>
                <Link to="/transactions" className="hover:text-white">Transaction Report</Link>
              </li>

            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/transactions-history" className="hover:text-white">Transaction History</Link>
              </li>
              <li>
                <Link to="/accept-tests" className="hover:text-white">Accept Tests</Link>
              </li>
            </ul>
          </div>
          <div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center text-sm gap-2 text-gray-400">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Email: support@languages.com</span>
              </div>
              <div className="flex items-center text-sm gap-2 text-gray-400">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Phone: (123) 456-7890</span>
              </div>
              <div className="flex items-center text-sm gap-2 text-gray-400">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Hours: Mon-Fri 9:00 AM - 5:00 PM</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} LANGUAGES. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

