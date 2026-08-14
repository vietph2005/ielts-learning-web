import apiClient from "@/lib/apiClient";

export async function askAI(question: string, chatHistory: { role: "user" | "ai", text: string }[]): Promise<string> {
  try {
    const messages = chatHistory.map(m => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text
    })).concat({ role: "user", content: question });

    const result = await apiClient.post('/ai/chat', { messages });
    return typeof result === 'string' ? result : JSON.stringify(result);
  } catch (e: any) {
    return "[AI error]: " + (e?.message || "Cannot connect to AI backend");
  }
}