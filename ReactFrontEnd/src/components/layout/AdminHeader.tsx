import { Link, useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function AdminHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== "admin") {
    navigate("/");
    return null; 
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 shadow-sm bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/admin-page" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">ADMIN PANEL</span>
        </Link>
        <nav className="flex items-center space-x-4">
          <button onClick={handleLogout} className="text-emerald-800 hover:text-emerald-900 font-semibold">Logout</button>
        </nav>
      </div>
    </header>
  );
}
