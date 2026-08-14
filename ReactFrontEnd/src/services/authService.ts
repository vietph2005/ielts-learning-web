import apiClient from "@/lib/apiClient";
import type { LoginResponse } from "@/types/apiTypes";

export const login = async (email: string, password: string, role: string): Promise<LoginResponse> => {
    return await apiClient.post<LoginResponse>('/auth/login', {
        email,
        password,
        role,
    });
};

export const logout = async (): Promise<void> => {
    await apiClient.post('/auth/logout');
};

export const getMe = async (): Promise<{ username: string; role: string; isPremium: boolean }> => {
    return await apiClient.get<{ username: string; role: string; isPremium: boolean }>('/auth/me');
};

export const register = async (email: string, password: string): Promise<void> => {
    await apiClient.post('/auth/register', { email, password });
};
