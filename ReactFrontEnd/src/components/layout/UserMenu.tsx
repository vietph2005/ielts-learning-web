import {User, LogOut, Settings, Crown, History, AlertCircle} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Report from "@/components/sections/Report";
import {useState} from "react";
import EditProfile from "@/components/sections/EditProfile";

interface UserMenuProps {
    onLogout: () => void
}

export function UserMenu({ onLogout }: UserMenuProps) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const defaultAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${
        user?.username || "default"
    }&backgroundColor=65C3C8`;

    const handleLogout = () => {
        onLogout(); // Gọi hàm logout từ props
        navigate("/"); // Điều hướng về trang chủ
    };
    return (
        <>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar>
                        <AvatarImage src={defaultAvatarUrl} alt={user?.username || "User"} />
                        <AvatarFallback className="bg-emerald-600 text-white">
                            {user?.username?.substring(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem onClick={() => setIsEditProfileOpen(true)}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </DropdownMenuItem>
                {/* Only show the following items if NOT teacher or manager */}
                {user?.role !== 'teacher' && user?.role !== 'manager' && (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/test-history")}> 
                        <History className="mr-2 h-4 w-4" />
                        <span>Test History</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/premium")}> 
                        <Crown className="mr-2 h-4 w-4" />
                        <span>Premium</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsFeedbackOpen(true)}>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        <span>Report</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
            <EditProfile isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />

            <Report
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
    />
    </>
    );
}
