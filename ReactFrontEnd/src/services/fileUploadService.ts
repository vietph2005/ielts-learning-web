import { customFetch } from "@/components/sections/customFetch";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const uploadFile = async (
    file: File,
    type: 'audio' | 'image',
    subfolder: string = 'listening',
    role?: string,
    username?: string
): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const params = new URLSearchParams();
        params.append('subfolder', subfolder);
        if (role) params.append('role', role);
        if (username) params.append('username', username);

        const endpoint = type === 'audio' ? `${API_URL}/api/upload/audio` : `${API_URL}/api/upload/image`;
        const response = await customFetch(`${endpoint}?${params.toString()}`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Upload failed with status ${response.status}`);
        }

        const data = await response.json();
        if (!data.url) {
            throw new Error('No URL returned from server upload endpoint');
        }

        return data.url;
    } catch (error) {
        console.error("Supabase backend upload error:", error);
        throw error instanceof Error ? error : new Error(`Failed to upload ${type} file to Supabase Storage`);
    }
};