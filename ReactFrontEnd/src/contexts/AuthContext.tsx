import { createContext, useContext, type ReactNode, useState, useEffect } from "react";
import type { AuthContextType, User } from "@/types/apiTypes";
import * as authService from "@/services/authService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_URL = import.meta.env.VITE_API_URL || 'VITE_API_URL=http://api.languages.io.vn:8080';
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Trạng thái loading ban đầu

    // ✅ Gọi refresh-token 1 lần khi khởi động
    useEffect(() => {
        fetchUser();
    }, []);

    // ✅ Hàm gọi API getMe
    const fetchUser = async () => {
        try {
            const data = await authService.getMe();
            console.log(data)
            if (data) {
                setUser({ username: data.username, role: data.role ,isPremium : data.isPremium});
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false); // Kết thúc loading sau khi fetch xong
        }
    };

    const login = async (email: string, password: string,role : string) => {
        const response = await authService.login(email, password,role);
        await fetchUser();
        return response;
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        // Không redirect ở đây, để các component tự điều hướng
    };

    const register = async (email: string, password: string) => {
        await authService.register(email, password);
        await fetchUser();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                logout,
                register,
                fetchUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth phải dùng trong AuthProvider");
    return context;
}
