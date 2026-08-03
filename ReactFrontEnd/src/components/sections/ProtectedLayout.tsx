import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedLayoutRole({
                                                children,
                                                allowRoles,
                                                requirePremium = false
                                            }: {
    children: React.ReactNode;
    allowRoles: string[];
    requirePremium?: boolean;
})  {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            // Sử dụng replace: true để ngăn history stack
            navigate("/login", {
                replace: true,
                state: { from: location.pathname }
            });
            return;
        }

        if (!user.role || !allowRoles.includes(user.role)) {
            navigate("/error", {
                replace: true,
                state: { code: 403 }
            });
        }
        if (requirePremium && !user.isPremium) {
            navigate("/premium", {
                replace: true,
                state: { message: "Chức năng này chỉ dành cho người dùng Premium." }
            });
        }
    }, [user, isLoading, allowRoles, navigate, location.pathname]);

    // Nếu đang loading hoặc user không hợp lệ, không render gì
    if (isLoading || !user || !user.role || !allowRoles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
}