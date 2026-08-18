package web.ielts.Test.ai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import web.ielts.Test.ai.model.FeedBackAI;
import web.ielts.Test.ai.model.IntonationSentence;
import web.ielts.Test.ai.model.StressMismatch;

import java.util.*;

@Service
public class GroqPronunciationScorer {

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    @Value("${groq.api.key:}")
    private String groqApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    // =========================================================================
    // 1. EVALUATE IMPORTANT WORDS (Lightweight LLM Call with Local Fallback)
    // =========================================================================

    public List<IntonationSentence> evaluateImportantWords(String transcript, List<String> transcriptWords) {
        if (transcript == null || transcript.isBlank() || transcriptWords == null || transcriptWords.isEmpty()) {
            return new ArrayList<>();
        }
        System.out.println("🔊 [PRONUNCIATION] Identifying important focus words...");
        try {
            String prompt = buildPronunciationPrompt(transcript, transcriptWords);
            String aiResponse = callOpenAIPronunciationWithRetry(prompt);
            List<IntonationSentence> result = parsePronunciationResponseToList(aiResponse);
            if (!result.isEmpty()) {
                return result;
            }
        } catch (Exception e) {
            System.err.println("⚠️ AI Pronunciation extraction failed: " + e.getMessage() + ". Using local rule-based extractor.");
        }
        return extractImportantWordsLocally(transcriptWords);
    }

    private String buildPronunciationPrompt(String transcript, List<String> transcriptWords) {
        return "Identify 0-indexed positions of content words and semantic focus words in the token array that require sentence stress in IELTS speech. Exclude unstressed function words.\n\n" +
                "Transcript: " + (transcript != null ? transcript : "") + "\n" +
                "Words: " + (transcriptWords != null ? transcriptWords.toString() : "[]") + "\n\n" +
                "Return strictly valid JSON: {\"importantWords\": [{\"text\": \"word\", \"index\": 0}]}";
    }

    private String callOpenAIPronunciationWithRetry(String prompt) {
        int maxRetries = 3;
        long retryDelayMs = 1500;

        // 1. Primary: Groq API with retry
        if (groqApiKey != null && !groqApiKey.isBlank()) {
            for (int attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_JSON);
                    headers.setBearerAuth(groqApiKey);

                    Map<String, Object> requestBody = Map.of(
                            "model", "openai/gpt-oss-120b",
                            "messages", List.of(
                                    Map.of("role", "system", "content", "You are an IELTS pronunciation evaluator. Return strictly a JSON object with 'importantWords' array."),
                                    Map.of("role", "user", "content", prompt)
                            ),
                            "temperature", 0.1,
                            "max_tokens", 300
                    );

                    HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                    ResponseEntity<String> response = restTemplate.postForEntity(
                            "https://api.groq.com/openai/v1/chat/completions",
                            entity,
                            String.class
                    );

                    if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                        JsonNode root = objectMapper.readTree(response.getBody());
                        return root.path("choices").path(0).path("message").path("content").asText().trim();
                    }
                } catch (Exception e) {
                    String errorMsg = e.getMessage() != null ? e.getMessage() : "";
                    boolean isRateLimit = errorMsg.contains("429") || errorMsg.contains("rate_limit");
                    long delay = isRateLimit ? retryDelayMs * attempt * 2 : retryDelayMs * attempt;
                    if (attempt < maxRetries) {
                        try {
                            Thread.sleep(delay);
                        } catch (InterruptedException ignored) {
                            Thread.currentThread().interrupt();
                            break;
                        }
                    }
                }
            }
        }

        // 2. Fallback: OpenAI API
        if (openaiApiKey != null && !openaiApiKey.isBlank() && !openaiApiKey.equals("your_openai_api_key_here")) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(openaiApiKey);

                Map<String, Object> requestBody = Map.of(
                        "model", "gpt-4o-mini",
                        "messages", List.of(
                                Map.of("role", "system", "content", "You are an IELTS pronunciation evaluator. Return strictly a JSON object with 'importantWords' array."),
                                Map.of("role", "user", "content", prompt)
                        ),
                        "response_format", Map.of("type", "json_object"),
                        "temperature", 0.1,
                        "max_tokens", 300
                );

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                ResponseEntity<String> response = restTemplate.postForEntity(
                        "https://api.openai.com/v1/chat/completions",
                        entity,
                        String.class
                );

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    return root.path("choices").path(0).path("message").path("content").asText().trim();
                }
            } catch (Exception ignored) {}
        }

        return "{\"importantWords\": []}";
    }

    private static final Set<String> FUNCTION_WORDS = Set.of(
            "a", "an", "the", "in", "on", "at", "to", "for", "with", "by", "from", "of", "about",
            "into", "through", "after", "before", "between", "under", "over", "above", "below",
            "is", "am", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
            "can", "could", "will", "would", "shall", "should", "may", "might", "must",
            "and", "but", "or", "so", "because", "although", "while", "if", "unless", "since",
            "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them",
            "my", "your", "his", "its", "our", "their", "this", "that", "these", "those"
    );

    public List<IntonationSentence> extractImportantWordsLocally(List<String> words) {
        List<IntonationSentence> result = new ArrayList<>();
        if (words == null) return result;
        for (int i = 0; i < words.size(); i++) {
            String clean = words.get(i).replaceAll("[^a-zA-Z]", "").toLowerCase();
            if (clean.length() >= 2 && !FUNCTION_WORDS.contains(clean)) {
                result.add(new IntonationSentence(words.get(i), i));
            }
        }
        return result;
    }

    private List<IntonationSentence> parsePronunciationResponseToList(String aiResponse) {
        if (aiResponse == null || aiResponse.trim().isEmpty()) {
            return new ArrayList<>();
        }
        try {
            String content = aiResponse.trim();
            if (content.startsWith("```")) {
                content = content.replaceAll("^```[a-zA-Z]*\\s*", "").replaceAll("\\s*```$", "").trim();
            }

            JsonNode root = objectMapper.readTree(content);
            if (root.isArray()) {
                return objectMapper.readValue(content, new TypeReference<List<IntonationSentence>>() {});
            } else if (root.has("importantWords") && root.get("importantWords").isArray()) {
                return objectMapper.readValue(root.get("importantWords").toString(), new TypeReference<List<IntonationSentence>>() {});
            }
        } catch (Exception e) {
            System.err.println("❌ Error parsing Pronunciation AI response: " + e.getMessage());
        }
        return new ArrayList<>();
    }

    // =========================================================================
    // 2. SCORE PRONUNCIATION (Unified Mathematical Multi-Layer Evaluation - Strict IELTS Standard)
    // =========================================================================

    public FeedBackAI scorePronunciation(
            String transcript,
            List<StressMismatch> stressMismatchesDetailed,
            List<IntonationSentence> importantWords,
            List<IntonationSentence> emphasizedWords,
            List<IntonationSentence> correctEmphasizedWords,
            List<IntonationSentence> missingEmphasis,
            List<IntonationSentence> overEmphasis,
            double emphasisRecall,
            int totalWords,
            int partNumber
    ) {
        int rawStressMismatchCount = (stressMismatchesDetailed != null) ? stressMismatchesDetailed.size() : 0;
        int importantCount = (importantWords != null) ? importantWords.size() : 0;
        int emphasizedCount = (emphasizedWords != null) ? emphasizedWords.size() : 0;
        int correctCount = (correctEmphasizedWords != null) ? correctEmphasizedWords.size() : 0;
        int overCount = (overEmphasis != null) ? overEmphasis.size() : 0;

        // 1. Layer 1: Word Stress Accuracy % (Polysyllabic benchmark)
        int estimatedPolysyllabic = Math.max(1, (int) Math.round(totalWords * 0.35));
        int correctWordStress = Math.max(0, estimatedPolysyllabic - rawStressMismatchCount);
        double wordStressAccuracy = Math.min(100.0, ((double) correctWordStress / estimatedPolysyllabic) * 100.0);
        double bandWordStress = 1.0 + (wordStressAccuracy / 100.0) * 8.0;

        // 2. Layer 2: Sentence Stress F1-Score (Strict non-linear curve)
        double recall = importantCount > 0 ? ((double) correctCount / importantCount) * 100.0 : 0.0;
        double precision = emphasizedCount > 0 ? ((double) correctCount / emphasizedCount) * 100.0 : 0.0;
        double f1Score = (recall + precision > 0) ? (2.0 * recall * precision) / (recall + precision) : 0.0;
        double bandSentenceStress = 1.0 + Math.pow(f1Score / 100.0, 1.25) * 8.0;

        // 3. Layer 3: Phonemes & Ending Sounds
        double phonemeAccuracy = Math.max(20.0, 95.0 - (rawStressMismatchCount * 4.0));
        double bandPhonemes = 1.0 + Math.pow(phonemeAccuracy / 100.0, 1.3) * 8.0;

        // 4. Layer 4: Connected Speech & Chunking
        double bandConnectedSpeech = Math.min(9.0, (0.50 * bandWordStress) + (0.50 * bandSentenceStress));
        bandConnectedSpeech = 1.0 + Math.pow(bandConnectedSpeech / 9.0, 1.25) * 8.0;

        // 5. Unified Mathematical Weighted Score (40% + 30% + 15% + 15%)
        double weightedBand = (0.40 * bandWordStress) + (0.30 * bandSentenceStress) + (0.15 * bandPhonemes) + (0.15 * bandConnectedSpeech);

        // Strict IELTS Sample-Size Caps (Band 8.0+ is strictly reserved for >= 45 words in Part 1 and >= 100 words in Part 2/3)
        if (totalWords < 8) {
            weightedBand = Math.min(weightedBand, 3.5);
        } else if (totalWords < 15) {
            weightedBand = Math.min(weightedBand, 5.0);
        } else if (totalWords < 25) {
            weightedBand = Math.min(weightedBand, 6.5);
        } else if (totalWords < 45) {
            weightedBand = Math.min(weightedBand, 7.5);
        }

        if (partNumber >= 2 && totalWords < 50) {
            weightedBand = Math.min(weightedBand, 5.0);
        } else if (partNumber >= 2 && totalWords < 90) {
            weightedBand = Math.min(weightedBand, 6.5);
        }

        weightedBand = Math.round(weightedBand * 2.0) / 2.0; // 0.5 step
        weightedBand = Math.max(1.0, Math.min(9.0, weightedBand));

        // 6. Build Compact Prompt for AI Arbitration & Feedback
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an official IELTS Speaking Examiner applying STRICT British Council / IDP Pronunciation Band Descriptors.\n")
                .append("Candidate Part ").append(partNumber).append(".\n")
                .append("Transcript: \"").append(transcript != null ? transcript : "").append("\"\n\n")
                .append("Acoustic Metrics:\n")
                .append("- Total Words: ").append(totalWords).append(", Estimated Polysyllabic: ").append(estimatedPolysyllabic).append("\n")
                .append("- Word Stress Accuracy: ").append(String.format(Locale.US, "%.1f%%", wordStressAccuracy))
                .append(" (Mismatches: ").append(rawStressMismatchCount).append(")\n")
                .append("- Sentence Stress F1: ").append(String.format(Locale.US, "%.1f%%", f1Score))
                .append(" (Recall: ").append(String.format(Locale.US, "%.1f%%", recall))
                .append(", Precision: ").append(String.format(Locale.US, "%.1f%%", precision)).append(")\n")
                .append("- Over-emphasized Words: ").append(overCount).append("\n")
                .append("- Strict Baseline Band: ").append(String.format(Locale.US, "%.1f", weightedBand)).append(" / 9.0\n\n")
                .append("STRICT SCORING RULES:\n")
                .append("1. Band 8.0-9.0 is EXTREMELY RARE: requires sustained (>= 45 words), near-native pronunciation with effortless intonation, linking, and zero phonemic strain.\n")
                .append("2. Normal fluent non-native speech belongs in Band 6.0 - 7.0.\n")
                .append("3. If transcript is very short (< 15 words) or nonsensical/unintelligible, score MUST be capped <= 4.0.\n")
                .append("4. Return strictly valid JSON: {\"score\": number, \"comment\": \"2 concise actionable feedback sentences on stress, intonation, and rhythm.\"}");

        // 7. Call AI with retry
        FeedBackAI aiFeedback = callPronunciationScorerApi(prompt.toString(), weightedBand);
        if (aiFeedback != null) {
            return aiFeedback;
        }

        // 8. Fallback to Mathematical Heuristic Result
        return calculateHeuristicScore(wordStressAccuracy, f1Score, rawStressMismatchCount, weightedBand);
    }

    private FeedBackAI callPronunciationScorerApi(String prompt, double defaultScore) {
        int maxRetries = 3;
        long retryDelayMs = 1500;

        // Groq Scorer
        if (groqApiKey != null && !groqApiKey.isBlank()) {
            for (int attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_JSON);
                    headers.setBearerAuth(groqApiKey);

                    Map<String, Object> requestBody = Map.of(
                            "model", "openai/gpt-oss-120b",
                            "messages", List.of(
                                     Map.of("role", "system", "content", "You are an official IELTS Speaking Examiner evaluating Pronunciation. Return strictly valid JSON with 'score', 'arbitratedStressErrors', and 'comment'."),
                                     Map.of("role", "user", "content", prompt)
                            ),
                            "response_format", Map.of("type", "json_object"),
                            "temperature", 0.1,
                            "max_tokens", 1000
                    );

                    HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                    ResponseEntity<String> response = restTemplate.postForEntity(
                            "https://api.groq.com/openai/v1/chat/completions",
                            entity,
                            String.class
                    );

                    if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                        FeedBackAI result = parseScorerResponse(response.getBody());
                        if (result != null) return result;
                    }
                } catch (Exception e) {
                    String errorMsg = e.getMessage() != null ? e.getMessage() : "";
                    boolean isRateLimit = errorMsg.contains("429") || errorMsg.contains("rate_limit");
                    long delay = isRateLimit ? retryDelayMs * attempt * 2 : retryDelayMs * attempt;
                    if (attempt < maxRetries) {
                        try {
                            Thread.sleep(delay);
                        } catch (InterruptedException ignored) {
                            Thread.currentThread().interrupt();
                            break;
                        }
                    }
                }
            }
        }

        // OpenAI Scorer Fallback
        if (openaiApiKey != null && !openaiApiKey.isBlank() && !openaiApiKey.equals("your_openai_api_key_here")) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(openaiApiKey);

                Map<String, Object> requestBody = Map.of(
                        "model", "gpt-4o-mini",
                        "messages", List.of(
                                Map.of("role", "system", "content", "You are an official IELTS Speaking Examiner evaluating Pronunciation. Return strictly valid JSON with 'score', 'arbitratedStressErrors', and 'comment'."),
                                Map.of("role", "user", "content", prompt)
                        ),
                        "response_format", Map.of("type", "json_object"),
                        "temperature", 0.1,
                        "max_tokens", 1000
                );

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                ResponseEntity<String> response = restTemplate.postForEntity(
                        "https://api.openai.com/v1/chat/completions",
                        entity,
                        String.class
                );

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    FeedBackAI result = parseScorerResponse(response.getBody());
                    if (result != null) return result;
                }
            } catch (Exception ignored) {}
        }

        return null;
    }

    private FeedBackAI parseScorerResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            String content = root.path("choices").path(0).path("message").path("content").asText().trim();
            if (content.startsWith("```")) {
                content = content.replaceAll("^```[a-zA-Z]*\\s*", "").replaceAll("\\s*```$", "").trim();
            }
            int firstBrace = content.indexOf('{');
            int lastBrace = content.lastIndexOf('}');
            if (firstBrace != -1 && lastBrace != -1 && lastBrace > firstBrace) {
                content = content.substring(firstBrace, lastBrace + 1);
            }

            JsonNode jsonNode = objectMapper.readTree(content);
            double score = jsonNode.path("score").asDouble(6.0);
            score = Math.round(score * 2.0) / 2.0;
            score = Math.max(1.0, Math.min(9.0, score));

            String comment = jsonNode.path("comment").asText("");
            return new FeedBackAI(score, comment);
        } catch (Exception e) {
            System.err.println("❌ Error parsing scorer response: " + e.getMessage());
            return null;
        }
    }

    public FeedBackAI calculateHeuristicScore(double wordStressAccuracy, double f1Score, int stressMismatchCount, double calculatedBand) {
        String comment = String.format(Locale.US,
                "Pronunciation demonstrates %.1f%% word stress accuracy and an intonation F1-score of %.1f%% with %d detected stress correction(s).",
                wordStressAccuracy, f1Score, stressMismatchCount
        );
        return new FeedBackAI(calculatedBand, comment);
    }
}
