export async function askAI(question: string, chatHistory: {role: "user"|"ai", text: string}[]): Promise<string> {
  const API_URL = import.meta.env.VITE_API_URL;
  try {
    // Convert chatHistory to OpenAI format (role: user/assistant)
    const messages = chatHistory.map(m => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text
    })).concat({ role: "user", content: question });
    const res = await fetch(`${API_URL}/api/ai-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });
    if (!res.ok) throw new Error(await res.text());
    const text = await res.text();
    return text;
  } catch (e: any) {
    return "[AI error]: " + (e?.message || "Cannot connect to AI backend");
  }
} 