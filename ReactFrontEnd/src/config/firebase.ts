import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBEDdcoUsPgRYTmTmdCUFm7xOgOgxrcG8w",
  authDomain: "projectsavefileandaudio.firebaseapp.com",
  projectId: "projectsavefileandaudio",
  storageBucket: "projectsavefileandaudio.firebasestorage.app",
  messagingSenderId: "872363154377",
  appId: "1:872363154377:web:ddcdbcbae0eda476702618",
  measurementId: "G-FKQ5SJQ59R"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
