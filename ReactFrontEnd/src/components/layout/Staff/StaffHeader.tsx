import { StaffNavigationMenu } from "./StaffNavigationMenu";
import { useAuth } from "@/contexts/AuthContext";

export function StaffHeader() {
  const { user, logout } = useAuth(); 
  if (!user || (user.role !== "teacher" && user.role !== "manager")) {
    return null;
  }
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 shadow-sm bg-white/90 backdrop-blur-md">
      <StaffNavigationMenu role={user.role} onLogout={logout} />
    </header>
  );
}
