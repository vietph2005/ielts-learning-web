import { HeroSection } from "@/components/sections/HeroSection"
import { LatestTestsSection } from "@/components/sections/LatestTestsSection"
import { TipsSection } from "@/components/sections/TipsSection"
import {useEffect, useState} from "react";
import { askAI } from "@/services/aiChatService";
import { useRef } from "react";
interface Tip {
    testId: string;
    skill: string;
    type: string;
    description: string;
}
interface IELTSTest {
    testId: string
    testTitle: string
    tags: string[]
    createdAt: string
}

export function HomePage() {
    const [tests, setTests] = useState<IELTSTest[]>([]);
    const [tips, setTips] = useState<{ [key: string]: Tip } | null>(null);
    // Chatbot state
    const [chatOpen, setChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const [chatHistory, setChatHistory] = useState<{role: "user"|"ai", text: string}[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const API_URL = import.meta.env.VITE_API_URL;
    useEffect(() => {
        fetch(`${API_URL}/api/3-tests`)
            .then(res => res.json())
            .then(data => setTests(data))

        fetch(`${API_URL}/api/all/tips-summary`)
            .then(res => res.json())
            .then(data => setTips(data));
    }, [])

    const handleAsk = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        setLoading(true);
        setChatHistory(h => [...h, {role: "user", text: chatInput.trim()}]);
        const userMsg = chatInput.trim();
        setChatInput("");
        inputRef.current?.focus();
        const res = await askAI(userMsg, [...chatHistory, {role: "user", text: userMsg}]);
        setChatHistory(h => [...h, {role: "ai", text: res}]);
        setLoading(false);
    };

    // Khi chatOpen, focus input
    useEffect(() => {
        if (chatOpen) setTimeout(() => inputRef.current?.focus(), 200);
    }, [chatOpen]);

    return (
        <div className="min-h-screen bg-gray-50">
            <HeroSection />
            <LatestTestsSection tests={tests} />
            {tips && <TipsSection tips={tips} />}
            {/*<FAQSection faqs={faqs} />*/}

            {/* Nút mở chat bot */}
            <button
                className="fixed bottom-6 right-6 z-50 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-3xl focus:outline-none"
                onClick={() => setChatOpen(true)}
                style={{display: chatOpen ? 'none' : 'flex'}}
                aria-label="Mở chat AI"
            >
                💬
            </button>

            {/* Box chat AI động */}
            {chatOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[98vw] bg-white border border-emerald-200 rounded-2xl shadow-2xl flex flex-col" style={{height: 540}}>
                    <div className="flex items-center justify-between px-6 py-3 border-b border-emerald-100 bg-emerald-600 rounded-t-2xl">
                        <span className="font-bold text-white text-lg">AI Chat Assistant</span>
                        <button onClick={() => setChatOpen(false)} className="text-white text-2xl font-bold hover:text-emerald-200">×</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px] min-h-[120px]" style={{fontSize: 17}}>
                        {chatHistory.length === 0 && (
                            <div className="text-gray-400 text-base text-center">Bạn có thể hỏi về từ vựng, dịch câu, ví dụ, ngữ pháp, luyện nói, ...</div>
                        )}
                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={msg.role === "user" ? "text-right" : "text-left"}>
                                <div className={
                                    (msg.role === "user"
                                        ? "inline-block bg-emerald-100 text-emerald-900"
                                        : "inline-block bg-gray-100 text-gray-800") +
                                    " px-4 py-3 rounded-xl max-w-[90%] text-base mb-1"
                                }>
                                    {msg.text.split("\n").map((line, i) => <div key={i}>{line}</div>)}
                                </div>
                            </div>
                        ))}
                        {loading && <div className="text-left text-gray-400 text-base">AI đang trả lời...</div>}
                    </div>
                    <form onSubmit={handleAsk} className="flex gap-2 p-4 border-t border-emerald-100 bg-white">
                        <input
                            ref={inputRef}
                            type="text"
                            className="flex-1 border border-emerald-200 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-base"
                            placeholder="Nhập câu hỏi cho AI..."
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            className="bg-emerald-600 text-white px-5 py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-60 text-base font-semibold"
                            disabled={loading || !chatInput.trim()}
                        >
                            Gửi
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}