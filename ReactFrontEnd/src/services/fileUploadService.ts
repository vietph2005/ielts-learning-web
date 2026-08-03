import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase";

export const uploadFile = async (file: File, type: 'audio' | 'image'): Promise<string> => {
    try {
        const folder = type === 'audio' ? 'audios' : 'images';
        const timestamp = Date.now();
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storageRef = ref(storage, `${folder}/${timestamp}_${cleanFileName}`);

        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Firebase upload error:", error);
        throw new Error(`Failed to upload ${type} file to Firebase Storage`);
    }
};