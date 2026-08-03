import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedLayoutRole({
    children,
    allowRoles
}: {
    children: React.ReactNode;
    allowRoles: string[];
}) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isLoading } = useAuth();
    const hasChecked = useRef(false);

    useEffect(() => {
        if (hasChecked.current || isLoading) return;
        hasChecked.current = true;

        // Nếu chưa login
        if (!user) {
            // Tùy theo role cho phép, điều hướng tới đúng trang login
            if (allowRoles.includes("admin")) {
                navigate("/login-admin", { state: { from: location.pathname } });
            } else if (allowRoles.includes("teacher")) {
                navigate("/staff-login", { state: { from: location.pathname } });
            }else if (allowRoles.includes("manager")) {
                navigate("/staff-login", { state: { from: location.pathname } });
            } else {
                navigate("/login", { state: { from: location.pathname } }); // fallback
            }
            return;
        }

        // Nếu login nhưng role không phù hợp
        if (!user.role || !allowRoles.includes(user.role)) {
            navigate("/error", { state: { code: 403 } });
        }
    }, [user, isLoading, allowRoles, navigate, location]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!user || !user.role || !allowRoles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
}
