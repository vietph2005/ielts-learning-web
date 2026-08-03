import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import React, {useEffect} from "react";
export default function SoftProtectedLayout({ children, allowRoles }: { children: React.ReactNode; allowRoles: string[] }) {
    const { user } = useAuth();

    useEffect(() => {
        if (user && !allowRoles.includes(user.role)) {
            window.alert("You do not have permission to access this page");
        }
    }, [user, allowRoles]);

    if (user && !allowRoles.includes(user.role)) {
        // Redirect tùy theo role
        if (user.role === "admin") {
            return <Navigate to="/adminpage" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    return <>{children}</>;
}
