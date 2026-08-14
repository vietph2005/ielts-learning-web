import apiClient from "@/lib/apiClient";

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

        const endpoint = type === 'audio' ? `/files/audio?${params.toString()}` : `/files/images?${params.toString()}`;
        const responseData = await apiClient.post<{ url: string }>(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        const url = (responseData as any)?.url;
        if (!url) {
            throw new Error('Không nhận được URL sau khi tải lên file');
        }

        return url;
    } catch (error) {
        console.error("File upload error:", error);
        throw error instanceof Error ? error : new Error(`Tải lên file ${type} thất bại`);
    }
};