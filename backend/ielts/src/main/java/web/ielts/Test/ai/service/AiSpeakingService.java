package web.ielts.Test.ai.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web.ielts.Test.ai.model.FleCohAnswer;
import web.ielts.Test.result.model.speaking.SpeakingAnswerQuestion;

import java.util.List;

@Service
public class AiSpeakingService {
    @Autowired
    private WhisperService whisperService;

    @Autowired
    private AIService aiService;

    private final ObjectMapper mapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    public String cleanGptJson(String response) {
        if (response == null) return "";
        String trimmed = response.trim();
        if (trimmed.startsWith("```")) {
            trimmed = trimmed
                    .replaceAll("(?s)```json\\s*", "")
                    .replaceAll("(?s)```", "")
                    .trim();
        }
        int firstBrace = trimmed.indexOf('{');
        int lastBrace = trimmed.lastIndexOf('}');
        if (firstBrace != -1 && lastBrace != -1 && lastBrace >= firstBrace) {
            return trimmed.substring(firstBrace, lastBrace + 1);
        }
        return trimmed;
    }

    public SpeakingAnswerQuestion evaluateSpeaking(
            JsonNode transcriptText,
            String question,
            int partNumber,
            FleCohAnswer basicFluent,
            double fluentScore,
            List<String> cueCard
    ) {
        // 1. Tạo prompt chuẩn cho từng part
        String prompt = aiService.buildSpeakingPrompt(
                partNumber,
                question,
                transcriptText,
                basicFluent,
                fluentScore,
                cueCard
        );

        // 2. Gọi AI
        String gptResponse = aiService.callSpeakingPart(prompt);
        String cleaned = cleanGptJson(gptResponse);
        System.out.println("=== AI SPEAKING RESPONSE ===");
        System.out.println(gptResponse);

        // 3. Parse JSON
        try {
            return mapper.readValue(cleaned, SpeakingAnswerQuestion.class);
        } catch (JsonProcessingException e) {
            System.err.println("❌ Lỗi khi parse AI response thành SpeakingAnswerQuestion:");
            System.err.println("Raw response: " + gptResponse);
            e.printStackTrace();
            return null;
        }
    }
}
