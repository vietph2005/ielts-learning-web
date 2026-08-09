import { API_URL } from "@/config/api";


export const login = async (email: string, password: string, role: string) => {
    const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            email,
            password,
            role,

        }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Login failed");
    }

    // ✅ Trả JSON để frontend xử lý
    return await res.json();
};


export const logout = async () => {
    await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
    })
}

export const getMe = async () => {
    const res = await fetch(`${API_URL}/api/user-info`, { credentials: "include" })
    if (!res.ok) throw new Error("Failed to fetch user")
    return res.json()
}

export const register = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password}),
    })

    if (!res.ok) throw new Error("Email da dang ki")
}

