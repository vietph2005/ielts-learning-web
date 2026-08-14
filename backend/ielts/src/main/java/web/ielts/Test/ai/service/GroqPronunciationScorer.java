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

    public List<IntonationSentence> evaluateImportantWords(String transcript, List<String> transcriptWords) {
        System.out.println("\n🔊 [PRONUNCIATION] Starting AI evaluation for important words...");
        try {
            String prompt = buildPronunciationPrompt(transcript, transcriptWords);
            String aiResponse = callOpenAIPronunciation(prompt);
            System.out.println("AI Response (Important words): " + aiResponse);
            return parsePronunciationResponseToList(aiResponse);
        } catch (Exception e) {
            System.err.println("❌ Error in pronunciation evaluation: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    private String buildPronunciationPrompt(String transcript, List<String> transcriptWords) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are a certified IELTS Speaking examiner and an expert in English intonation and sentence stress.\n")
                .append("Your task is to identify ALL important content words in the given transcript that SHOULD be emphasized for natural and effective IELTS speech.\n\n")
                .append("=== Instructions ===\n")
                .append("- Carefully read the transcript and its tokenized word array below.\n")
                .append("- Identify words that are semantically important (nouns, main action verbs, key adjectives, contrastive markers, proper nouns, new information).\n")
                .append("- Do NOT include unstressed function words (e.g., 'the', 'a', 'an', 'and', 'of', 'to', 'in', 'is', 'was', 'for', 'with').\n")
                .append("- Return strictly a JSON object with key 'importantWords' containing an array of objects with 'text' and 'index' (0-indexed position in the tokenized array).\n")
                .append("- Format: {\"importantWords\": [{\"text\": \"...\", \"index\": 0}]}\n")
                .append("- Do NOT return any markdown formatting outside JSON or extra explanation.\n\n")
                .append("=== Transcript ===\n")
                .append(transcript != null ? transcript : "")
                .append("\n\n")
                .append("=== Tokenized Words ===\n")
                .append(transcriptWords != null ? transcriptWords.toString() : "[]")
                .append("\n\n")
                .append("Return ONLY the requested JSON object format.\n");

        return prompt.toString();
    }

    private String callOpenAIPronunciation(String prompt) {
        // 1. Primary: Groq
        if (groqApiKey != null && !groqApiKey.isBlank()) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(groqApiKey);

                Map<String, Object> requestBody = Map.of(
                        "model", "llama-3.3-70b-versatile",
                        "messages", List.of(
                                Map.of("role", "system", "content", "You are an IELTS pronunciation expert. Return strictly a JSON object with 'importantWords' array."),
                                Map.of("role", "user", "content", prompt)
                        ),
                        "response_format", Map.of("type", "json_object"),
                        "temperature", 0.1
                );

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                ResponseEntity<String> response = restTemplate.postForEntity(
                        "https://api.groq.com/openai/v1/chat/completions",
                        entity,
                        String.class
                );

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    String content = root.path("choices").path(0).path("message").path("content").asText().trim();
                    System.out.println("✅ Groq Pronunciation (important words) succeeded.");
                    return content;
                }
            } catch (Exception e) {
                System.err.println("⚠️ Groq pronunciation call failed: " + e.getMessage() + ". Trying OpenAI fallback...");
            }
        }

        // 2. Fallback: OpenAI
        if (openaiApiKey != null && !openaiApiKey.isBlank() && !openaiApiKey.equals("your_openai_api_key_here")) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(openaiApiKey);

                Map<String, Object> requestBody = Map.of(
                        "model", "gpt-4o",
                        "messages", List.of(
                                Map.of("role", "system", "content", "You are an IELTS pronunciation expert. Return strictly a JSON object with 'importantWords' array."),
                                Map.of("role", "user", "content", prompt)
                        ),
                        "response_format", Map.of("type", "json_object"),
                        "temperature", 0.1
                );

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                ResponseEntity<String> response = restTemplate.postForEntity(
                        "https://api.openai.com/v1/chat/completions",
                        entity,
                        String.class
                );

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    String content = root.path("choices").path(0).path("message").path("content").asText().trim();
                    System.out.println("✅ OpenAI Pronunciation (important words) succeeded.");
                    return content;
                }
            } catch (Exception e) {
                System.err.println("❌ OpenAI pronunciation call failed: " + e.getMessage());
            }
        }

        System.err.println("⚠️ Both Groq and OpenAI unavailable for Pronunciation important words.");
        return "{\"importantWords\": []}";
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
            } else {
                int firstBracket = content.indexOf('[');
                int lastBracket = content.lastIndexOf(']');
                if (firstBracket != -1 && lastBracket != -1 && lastBracket > firstBracket) {
                    String jsonStr = content.substring(firstBracket, lastBracket + 1);
                    return objectMapper.readValue(jsonStr, new TypeReference<List<IntonationSentence>>() {});
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error parsing Pronunciation AI response: " + e.getMessage());
        }
        return new ArrayList<>();
    }

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
        int overEmphasisCount = (overEmphasis != null) ? overEmphasis.size() : 0;

        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an official, certified IELTS Speaking Examiner evaluating the candidate's Pronunciation criterion.\n")
                .append("Test Context: Part ").append(partNumber).append(" of the IELTS Speaking Test.\n\n")
                .append("=== Candidate Spoken Transcript ===\n")
                .append(transcript != null ? transcript : "").append("\n\n")
                .append("=== Acoustic & Lexical Quantitative Summary ===\n")
                .append("- Total Spoken Words: ").append(totalWords).append("\n")
                .append("- Raw Word Stress Mismatches (Detected vs CMU Dictionary): ").append(rawStressMismatchCount).append("\n")
                .append("- Content Words Expected to be Emphasized (Important Words): ").append(importantWords != null ? importantWords.size() : 0).append("\n")
                .append("- Words Actually Emphasized by Candidate: ").append(emphasizedWords != null ? emphasizedWords.size() : 0).append("\n")
                .append("- Correctly Emphasized Content Words: ").append(correctEmphasizedWords != null ? correctEmphasizedWords.size() : 0).append("\n")
                .append("- Emphasis Recall Rate: ").append(String.format(Locale.US, "%.1f%%", emphasisRecall)).append("\n")
                .append("- Over-emphasized Words (Unnecessary stress on function/unimportant words): ").append(overEmphasisCount).append("\n")
                .append("- Missing Emphasis Count: ").append(missingEmphasis != null ? missingEmphasis.size() : 0).append("\n\n");

        prompt.append("=== Detailed Breakdown ===\n");
        prompt.append("1. Stress Mismatches (Word, Detected Syllable, Standard Syllable, Time Interval):\n");
        if (stressMismatchesDetailed == null || stressMismatchesDetailed.isEmpty()) {
            prompt.append("   None (All detected multisyllabic words match CMU baseline stress patterns).\n");
        } else {
            for (StressMismatch sm : stressMismatchesDetailed) {
                prompt.append(String.format(Locale.US, "   - '%s' (detected syllable: %s, standard dictionary syllable: %s, at %.2fs - %.2fs)\n",
                        sm.getWord(), sm.getDetectedPosition(), sm.getStandardPosition(), sm.getStart(), sm.getEnd()));
            }
        }

        prompt.append("\n2. Missing Emphasis (Important content words the candidate failed to emphasize):\n");
        if (missingEmphasis == null || missingEmphasis.isEmpty()) {
            prompt.append("   None (Candidate placed sentence stress on all expected content words).\n");
        } else {
            for (IntonationSentence w : missingEmphasis) {
                prompt.append(String.format("   - '%s' (word index: %d)\n", w.getText(), w.getIndex()));
            }
        }

        prompt.append("\n3. Over-emphasis (Unimportant or function words stressed by candidate):\n");
        if (overEmphasis == null || overEmphasis.isEmpty()) {
            prompt.append("   None.\n");
        } else {
            for (IntonationSentence w : overEmphasis) {
                prompt.append(String.format("   - '%s' (word index: %d)\n", w.getText(), w.getIndex()));
            }
        }

        prompt.append("\n=== Linguistic Arbitration Rules ===\n")
                .append("Before finalizing the pronunciation band score, you MUST act as an expert linguistic arbiter and review the raw stress mismatches against the transcript context:\n")
                .append("1. Heteronyms & Part-of-Speech: Standard CMU dictionary entries may only record one canonical stress pattern. For words that shift stress depending on noun vs. verb usage (e.g., 'record', 'present', 'contrast', 'object', 'increase', 'progress', 'conduct'), if the candidate's detected stress matches the actual part of speech in context, FORGIVE the mismatch (do not count as an error).\n")
                .append("2. Regional Accent Variations: Standard UK, US, AU, or Canadian pronunciation variants (e.g., 'garage', 'advertisement', 'address', 'adult', 'inquiry') must NOT be penalized.\n")
                .append("3. Proper Nouns, Foreign Names, & Technical Terms: Forgive minor stress mismatches if intelligible and natural.\n")
                .append("4. Acoustic False Positives: If a single-syllable word or function word was erroneously flagged, ignore it.\n")
                .append("Calculate the net remaining true stress errors as 'arbitratedStressErrors'.\n\n")
                .append("=== IELTS Pronunciation Band Descriptors & Rubric ===\n")
                .append("- Band 8.5 - 9.0: 0 arbitrated stress errors, Emphasis Recall >= 85%, Over-emphasis <= 1. Full phonological control, natural rhythm and sentence stress throughout.\n")
                .append("- Band 7.5 - 8.0: <= 1 arbitrated error, Emphasis Recall >= 75%, Over-emphasis <= 2. Easily understood, effective stress & intonation with minimal lapses.\n")
                .append("- Band 6.5 - 7.0: <= 3 arbitrated errors, Emphasis Recall >= 60%, Over-emphasis <= 4. Generally intelligible, variable stress control, some rhythm lapses.\n")
                .append("- Band 5.5 - 6.0: 4 - 6 arbitrated errors, Emphasis Recall >= 45%. Limited control, noticeable stress mistakes causing occasional lack of clarity.\n")
                .append("- Band 4.5 - 5.0: 7+ arbitrated errors OR Emphasis Recall < 40%. Frequent stress errors, poor rhythm/chunking, requires effort to understand.\n")
                .append("- Band <= 4.0: Severe breakdown in phonological features, speech is largely unintelligible.\n\n")
                .append("=== Output Requirements ===\n")
                .append("Return strictly a JSON object with the following schema:\n")
                .append("{\n")
                .append("  \"score\": <float in 0.5 steps from 0.0 to 9.0>,\n")
                .append("  \"arbitratedStressErrors\": <int>,\n")
                .append("  \"comment\": \"<Concise 2-3 sentence feedback in English summarizing pronunciation strengths, stress accuracy, intonation, and areas for improvement>\"\n")
                .append("}\n");

        // 1. Primary: Groq API
        if (groqApiKey != null && !groqApiKey.isBlank()) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(groqApiKey);

                Map<String, Object> requestBody = Map.of(
                        "model", "llama-3.3-70b-versatile",
                        "messages", List.of(
                                Map.of("role", "system", "content", "You are an official IELTS Speaking Examiner evaluating Pronunciation. Return strictly a JSON object with 'score', 'arbitratedStressErrors', and 'comment'."),
                                Map.of("role", "user", "content", prompt.toString())
                        ),
                        "response_format", Map.of("type", "json_object"),
                        "temperature", 0.1,
                        "max_tokens", 500
                );

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                ResponseEntity<String> response = restTemplate.postForEntity(
                        "https://api.groq.com/openai/v1/chat/completions",
                        entity,
                        String.class
                );

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    FeedBackAI result = parseScorerResponse(response.getBody());
                    if (result != null) {
                        System.out.println("✅ Groq Pronunciation Scoring succeeded: Score=" + result.getScore());
                        return result;
                    }
                }
            } catch (Exception e) {
                System.err.println("⚠️ Groq pronunciation score call failed: " + e.getMessage() + ". Trying OpenAI fallback...");
            }
        }

        // 2. Fallback: OpenAI API
        if (openaiApiKey != null && !openaiApiKey.isBlank() && !openaiApiKey.equals("your_openai_api_key_here")) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(openaiApiKey);

                Map<String, Object> requestBody = Map.of(
                        "model", "gpt-4o",
                        "messages", List.of(
                                Map.of("role", "system", "content", "You are an official IELTS Speaking Examiner evaluating Pronunciation. Return strictly a JSON object with 'score', 'arbitratedStressErrors', and 'comment'."),
                                Map.of("role", "user", "content", prompt.toString())
                        ),
                        "response_format", Map.of("type", "json_object"),
                        "temperature", 0.1,
                        "max_tokens", 500
                );

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                ResponseEntity<String> response = restTemplate.postForEntity(
                        "https://api.openai.com/v1/chat/completions",
                        entity,
                        String.class
                );

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    FeedBackAI result = parseScorerResponse(response.getBody());
                    if (result != null) {
                        System.out.println("✅ OpenAI Pronunciation Scoring succeeded: Score=" + result.getScore());
                        return result;
                    }
                }
            } catch (Exception e) {
                System.err.println("❌ OpenAI pronunciation scoring call failed: " + e.getMessage());
            }
        }

        // 3. Fallback Heuristic Rule-Based Scoring
        System.out.println("⚠️ Using rule-based heuristic scoring fallback for Pronunciation.");
        return calculateHeuristicScore(rawStressMismatchCount, emphasisRecall, overEmphasisCount);
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
            if (score > 9.0) score = 9.0;
            if (score < 0.0) score = 0.0;

            String comment = jsonNode.path("comment").asText("");
            if (jsonNode.has("arbitratedStressErrors")) {
                System.out.println("ℹ️ Arbitrated Stress Errors: " + jsonNode.path("arbitratedStressErrors").asInt());
            }
            return new FeedBackAI(score, comment);
        } catch (Exception e) {
            System.err.println("❌ Error parsing scorer response: " + e.getMessage());
            return null;
        }
    }

    private FeedBackAI calculateHeuristicScore(int stressMismatchCount, double emphasisRecall, int overEmphasisCount) {
        double estimatedScore;
        if (stressMismatchCount == 0 && emphasisRecall >= 85.0 && overEmphasisCount <= 1) {
            estimatedScore = 8.5;
        } else if (stressMismatchCount <= 1 && emphasisRecall >= 75.0 && overEmphasisCount <= 2) {
            estimatedScore = 7.5;
        } else if (stressMismatchCount <= 3 && emphasisRecall >= 60.0 && overEmphasisCount <= 4) {
            estimatedScore = 6.5;
        } else if (stressMismatchCount <= 6 && emphasisRecall >= 45.0) {
            estimatedScore = 5.5;
        } else if (stressMismatchCount >= 7 || emphasisRecall < 40.0) {
            estimatedScore = 4.5;
        } else {
            estimatedScore = 5.0;
        }
        String comment = String.format(Locale.US,
                "Pronunciation is generally intelligible with %d detected word stress mismatch(es) and an emphasis recall rate of %.1f%%.",
                stressMismatchCount, emphasisRecall
        );
        return new FeedBackAI(estimatedScore, comment);
    }
}
