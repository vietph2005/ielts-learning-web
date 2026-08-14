package web.ielts.Test.ai.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import web.ielts.Common.dto.ApiResponse;
import web.ielts.Test.ai.service.AIService;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ai")
public class AIController {

    @Autowired
    private AIService aiService;

    @PostMapping("/chat")
    public ApiResponse<String> aiChat(@RequestBody Map<String, Object> body) {
        Object messagesObj = body.get("messages");
        String prompt = (String) body.getOrDefault("prompt", "");

        String systemPrompt = "Bạn là trợ lý AI cho học sinh Việt Nam. Mặc định, bạn CHỈ trả lời bằng tiếng Việt. Nếu học sinh yêu cầu ví dụ, " +
                "đặt câu, hoặc dịch sang tiếng Anh thì mới trả lời thêm tiếng Anh. Nếu không, tuyệt đối không trả lời song ngữ." +
                " Nếu học sinh hỏi nghĩa từ, giải thích, ngữ pháp, ... chỉ trả lời tiếng Việt. Nếu học sinh hỏi 'đặt câu', 'ví dụ', 'example', 'sentence', " +
                "'dịch sang tiếng Anh', 'translate to English'... thì trả lời cả hai ngôn ngữ, trong đó tiếng Việt trước, tiếng Anh sau.\n\n" +
                "Ví dụ:\nQ: Nghĩa của từ 'flow'?\nA: 'Flow' nghĩa là sự chuyển động liên tục của chất lỏng, khí hoặc điện. " +
                "Nó cũng có thể chỉ sự tiến triển trôi chảy của một quá trình hoặc ý tưởng.\n---\nQ: Đặt câu với từ 'flow'?\nA:" +
                " Tiếng Việt: Dòng sông chảy rất mạnh sau cơn mưa lớn.\nTiếng Anh: The river flows very strongly after the heavy rain.\n---";

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));

        if (messagesObj instanceof List<?>) {
            for (Object m : (List<?>) messagesObj) {
                if (m instanceof Map) {
                    Map<?, ?> mm = (Map<?, ?>) m;
                    String role = String.valueOf(mm.get("role"));
                    String content = String.valueOf(mm.get("content"));
                    if (role != null && content != null && !content.trim().isEmpty()) {
                        if (role.equals("user") || role.equals("assistant")) {
                            messages.add(Map.of("role", role, "content", content));
                        }
                    }
                }
            }
        } else if (prompt != null && !prompt.trim().isEmpty()) {
            messages.add(Map.of("role", "user", "content", prompt));
        }

        String result = aiService.callChatWithMessages(messages);
        return ApiResponse.success(result, "Phản hồi từ AI thành công");
    }
}
