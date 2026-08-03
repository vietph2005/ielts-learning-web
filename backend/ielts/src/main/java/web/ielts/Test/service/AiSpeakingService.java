package web.ielts.Test.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web.ielts.Test.model.answer.speaking.FleCohAnswer;
import web.ielts.Test.model.answer.speaking.SpeakingAnswerQuestion;
import web.ielts.Test.service.AI.AIService;

import java.util.List;

@Service
public class AiSpeakingService {
    @Autowired WhisperService whisperService;
    @Autowired
    private AIService aiService;
    public String cleanGptJson(String response) {
        if (response == null) return "";
        String trimmed = response.trim();
        if (trimmed.startsWith("```")) {
            return trimmed
                    .replaceAll("(?s)```json\\s*", "")  // bỏ ```json và xuống dòng
                    .replaceAll("(?s)```", "")          // bỏ ``` còn lại
                    .trim();
        }
        return trimmed;
    }
    public SpeakingAnswerQuestion evaluateSpeaking(
            JsonNode transcriptText,
            String question,
            int partNumber,
            FleCohAnswer basicFluent,
            double FluentScore,
            List<String> cueCard
    ) {
        // ✅ 1. Tạo prompt đúng cho từng part
        String prompt = aiService.buildSpeakingPrompt(
                partNumber,
                question,
                transcriptText,
                basicFluent,
                FluentScore,
                cueCard

        );

        // ✅ 2. Gọi GPT
        String gptResponse = aiService.callSpeakingPart(prompt);
        String cleaned = cleanGptJson(gptResponse);
        System.out.println("=== GPT RESPONSE ===");
        System.out.println(gptResponse);
        // ✅ 3. Parse JSON
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(cleaned, SpeakingAnswerQuestion.class);
        } catch (JsonProcessingException e) {
            System.err.println("❌ Lỗi khi parse GPT response thành EvaluationResult:");
            e.printStackTrace();
            return null;
        }
    }
}