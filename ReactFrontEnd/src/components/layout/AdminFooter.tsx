import { Link } from "react-router-dom";
import { Shield, Mail, Phone, Clock } from "lucide-react";

export function AdminFooter() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center space-x-2 mb-4 justify-center md:justify-start">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">ADMIN PANEL</span>
            </div>
            <p className="text-gray-400 text-center md:text-left">Admin portal for managing users, reports, and transactions.</p>
          </div>
          <div>
            <div className="space-y-3 text-center md:text-right">
              <div className="flex items-center text-sm gap-2 text-gray-400 justify-center md:justify-end">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Email: admin@languages.com</span>
              </div>
              <div className="flex items-center text-sm gap-2 text-gray-400 justify-center md:justify-end">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Phone: (123) 456-7890</span>
              </div>
              <div className="flex items-center text-sm gap-2 text-gray-400 justify-center md:justify-end">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Hours: Mon-Fri 9:00 AM - 5:00 PM</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} LANGUAGES Admin. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 