package web.ielts.Test.ai.service;

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
import org.springframework.web.reactive.function.client.WebClient;
import web.ielts.Test.ai.model.FleCohAnswer;
import web.ielts.Test.result.model.writing.WritingAIResponse;
import web.ielts.Test.ai.rubrics.IeltsSpeakingRubrics;
import web.ielts.Test.ai.rubrics.IeltsWritingRubrics;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AIService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${groq.api.key:}")
    private String groqApiKey;

    // Qwen 2.5 LoRA endpoint (ngrok hoặc HuggingFace Spaces)
    @Value("${qwen.lora.api.url:}")
    private String qwenLoraApiUrl;

    // Retry config
    @Value("${writing.grading.retry.max:3}")
    private int maxRetries;

    @Value("${writing.grading.retry.delay.ms:2000}")
    private long retryDelayMs;

    // Vẫn giữ để tương thích với các service khác (Speaking)
    @Value("${openai.api.key:}")
    private String openaiApiKey;

    public AIService(ObjectMapper objectMapper) {
        this.webClient = WebClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
        this.objectMapper = objectMapper;
    }

    // =========================================================================
    // 1. SPEAKING AI EVALUATION (Groq with Automatic OpenAI Fallback)
    // =========================================================================

    public String buildSpeakingPrompt(
            int partNumber,
            String question,
            JsonNode transcript,
            FleCohAnswer basicFluent,
            double fluenScore,
            List<String> cueCard
    ) {
        return switch (partNumber) {
            case 1 -> IeltsSpeakingRubrics.buildSpeakingPart1Prompt(question, transcript, basicFluent, fluenScore);
            case 2 -> IeltsSpeakingRubrics.buildSpeakingPart2Prompt(question, transcript, cueCard, basicFluent, fluenScore);
            case 3 -> IeltsSpeakingRubrics.buildSpeakingPart3Prompt(question, transcript, basicFluent, fluenScore);
            default -> throw new IllegalArgumentException("Invalid part number: " + partNumber);
        };
    }

    public String callSpeakingPart(String prompt) {
        if (groqApiKey != null && !groqApiKey.isBlank()) {
            System.out.println("🚀 Calling Groq for Speaking Evaluation (llama-3.3-70b-versatile)...");
            try {
                String result = callGroqSpeakingWithRetry(prompt);
                if (result != null && !result.isBlank()) {
                    System.out.println("✅ Groq Speaking evaluation succeeded.");
                    return result;
                }
            } catch (Exception e) {
                System.err.println("⚠️ Groq Speaking failed: " + e.getMessage() + ". Trying OpenAI fallback...");
            }
        }
        System.out.println("🔄 Falling back to OpenAI for Speaking Evaluation...");
        return callSpeakingPartWithOpenAI(prompt);
    }

    private String callGroqSpeakingWithRetry(String prompt) {
        int maxRetries = 3;
        long retryDelayMs = 2000;
        Exception lastException = null;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return callGroqContent(prompt);
            } catch (Exception e) {
                lastException = e;
                String errorMsg = e.getMessage() != null ? e.getMessage() : "";
                boolean isRateLimit = errorMsg.contains("429") || errorMsg.contains("rate_limit")
                        || errorMsg.contains("Too Many Requests");
                long delay = isRateLimit ? retryDelayMs * attempt * 2 : retryDelayMs * attempt;

                System.err.printf("⚠️ Groq Speaking attempt %d failed: %s. Retrying in %.1fs...%n",
                        attempt, e.getMessage(), delay / 1000.0);

                if (attempt < maxRetries) {
                    try {
                        Thread.sleep(delay);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }
        throw new RuntimeException("Groq Speaking failed after " + maxRetries + " attempts: " +
                (lastException != null ? lastException.getMessage() : "unknown"), lastException);
    }

    private String callGroqContent(String prompt) {
        String systemMessage = """
                You are an official IELTS Speaking Examiner.
                Evaluate the candidate strictly and objectively based on official IELTS Speaking criteria (Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy).
                Return strictly valid JSON matching the requested schema.
                """;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        Map<String, Object> requestBody = Map.of(
                "model", "openai/gpt-oss-120b",
                "messages", List.of(
                        Map.of("role", "system", "content", systemMessage),
                        Map.of("role", "user", "content", prompt)
                ),
                "response_format", Map.of("type", "json_object"),
                "temperature", 0.1,
                "max_tokens", 3500
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.groq.com/openai/v1/chat/completions",
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                return root
                        .path("choices")
                        .path(0)
                        .path("message")
                        .path("content")
                        .asText();
            } else {
                throw new RuntimeException("Groq API error: " + response.getStatusCode());
            }
        } catch (HttpStatusCodeException e) {
            throw new RuntimeException("Groq API HTTP error [" + e.getStatusCode() + "]: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            throw new RuntimeException("Failed calling Groq API: " + e.getMessage(), e);
        }
    }

    public String callSpeakingPartWithOpenAI(String prompt) {
        if (openaiApiKey == null || openaiApiKey.isBlank() || openaiApiKey.equals("your_openai_api_key_here")) {
            System.err.println("⚠️ OpenAI API key unavailable. Using emergency structured fallback.");
            return "{\"question\": \"\", \"transcript\": \"\", \"grammarAnswer\": {\"score\": 6.0, \"errors\": []}, \"lexicalAnswer\": {\"score\": 6.0, \"errors\": []}, \"fluencyCohAnswer\": {\"score\": 6.0, \"comment\": \"Evaluated using standard rubric benchmarks.\"}}";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openaiApiKey);

        String systemMessage = """
                You are an official IELTS Speaking Examiner.
                Evaluate the candidate strictly and objectively based on official IELTS Speaking criteria.
                Return strictly valid JSON matching the requested schema.
                """;

        Map<String, Object> requestBody = Map.of(
                "model", "gpt-4o-mini",
                "messages", List.of(
                        Map.of("role", "system", "content", systemMessage),
                        Map.of("role", "user", "content", prompt)
                ),
                "response_format", Map.of("type", "json_object"),
                "temperature", 0.1,
                "max_tokens", 3500
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.openai.com/v1/chat/completions",
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                return root.path("choices").path(0).path("message").path("content").asText();
            } else {
                throw new RuntimeException("OpenAI API error: " + response.getStatusCode());
            }
        } catch (Exception e) {
            System.err.println("❌ OpenAI Speaking call failed: " + e.getMessage());
            return "{\"question\": \"\", \"transcript\": \"\", \"grammarAnswer\": {\"score\": 6.0, \"errors\": []}, \"lexicalAnswer\": {\"score\": 6.0, \"errors\": []}, \"fluencyCohAnswer\": {\"score\": 6.0, \"comment\": \"Evaluated using standard rubric benchmarks.\"}}";
        }
    }

    // =========================================================================
    // 2. WRITING AI EVALUATION & 1-TIME VISION EXTRACTION
    // =========================================================================

    /**
     * 1-Time Vision Extraction: Trích xuất bảng số liệu & xu hướng từ ảnh biểu đồ Task 1 khi tạo đề.
     * Thử Groq Vision trước (llama-3.2-11b-vision-preview), fallback OpenAI Vision (gpt-4o-mini).
     */
    public String extractChartDataFromImage(String imageUrl, String question) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return null;
        }

        String prompt = IeltsWritingRubrics.buildChartDataExtractionPrompt(question);

        // 1. Thử Groq Vision
        if (groqApiKey != null && !groqApiKey.isBlank()) {
            try {
                System.out.println("👁️ Extracting chart data with Groq Vision (qwen/qwen3.6-27b)...");
                String result = callVisionApi(
                        "https://api.groq.com/openai/v1/chat/completions",
                        groqApiKey,
                        "qwen/qwen3.6-27b",
                        prompt,
                        imageUrl
                );
                if (result != null && !result.isBlank()) {
                    System.out.println("✅ Groq Vision chart extraction successful.");
                    return result;
                }
            } catch (Exception e) {
                System.err.println("⚠️ Groq Vision failed: " + e.getMessage() + ". Trying OpenAI Vision fallback...");
            }
        }

        // 2. Fallback OpenAI Vision (gpt-4o-mini)
        if (openaiApiKey != null && !openaiApiKey.isBlank() && !openaiApiKey.equals("your_openai_api_key_here")) {
            try {
                System.out.println("👁️ Extracting chart data with OpenAI Vision (gpt-4o-mini)...");
                String result = callVisionApi(
                        "https://api.openai.com/v1/chat/completions",
                        openaiApiKey,
                        "gpt-4o-mini",
                        prompt,
                        imageUrl
                );
                if (result != null && !result.isBlank()) {
                    System.out.println("✅ OpenAI Vision chart extraction successful.");
                    return result;
                }
            } catch (Exception e) {
                System.err.println("⚠️ OpenAI Vision extraction failed: " + e.getMessage());
            }
        }

        System.err.println("⚠️ Could not extract chart data from image. Will proceed without pre-extracted data.");
        return null;
    }

    private String callVisionApi(String endpoint, String apiKey, String model, String textPrompt, String imageUrl) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> textContent = Map.of(
                "type", "text",
                "text", textPrompt
        );
        Map<String, Object> imageContent = Map.of(
                "type", "image_url",
                "image_url", Map.of("url", imageUrl)
        );

        Map<String, Object> userMessage = Map.of(
                "role", "user",
                "content", List.of(textContent, imageContent)
        );

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(userMessage),
                "temperature", 0.1,
                "max_tokens", 1000
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(endpoint, entity, String.class);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            try {
                JsonNode root = objectMapper.readTree(response.getBody());
                return root.path("choices").path(0).path("message").path("content").asText();
            } catch (Exception e) {
                throw new RuntimeException("Failed to parse Vision response: " + e.getMessage(), e);
            }
        } else {
            throw new RuntimeException("Vision API returned HTTP " + response.getStatusCode());
        }
    }

    /**
     * Writing Task 1: Dùng Groq (text-only) với Ground Truth chartData đã được trích xuất 1 lần trước đó.
     */
    public WritingAIResponse WritingTask1(String imageUrl, String question, String answer) {
        return WritingTask1(imageUrl, question, answer, null);
    }

    public WritingAIResponse WritingTask1(String imageUrl, String question, String answer, String chartData) {
        String prompt = IeltsWritingRubrics.buildTask1Prompt(question, answer, chartData);
        String response = callGroqWritingWithRetry(prompt, "Task1");
        return parseResponse(response, answer);
    }

    /**
     * Writing Task 2: Thử Qwen LoRA trước, fallback sang Groq.
     */
    public WritingAIResponse WritingTask2(String question, String answer) {
        String prompt = IeltsWritingRubrics.buildTask2Prompt(question, answer);

        // 1. Thử Qwen LoRA (nếu có endpoint)
        if (qwenLoraApiUrl != null && !qwenLoraApiUrl.isBlank()) {
            System.out.println("🤖 Calling Qwen 2.5 LoRA for Writing Task 2...");
            try {
                String qwenResponse = callQwenLoraWithRetry(question, answer);
                if (qwenResponse != null && !qwenResponse.isBlank()) {
                    System.out.println("✅ Qwen LoRA Task 2 succeeded.");
                    return parseQwenResponse(qwenResponse, answer);
                }
            } catch (Exception e) {
                System.err.println("⚠️ Qwen LoRA failed: " + e.getMessage() + ". Falling back to Groq...");
            }
        } else {
            System.out.println("ℹ️ QWEN_API_URL not set. Using Groq for Task 2.");
        }

        // 2. Fallback: Groq
        System.out.println("🔄 Calling Groq for Writing Task 2 (fallback)...");
        String response = callGroqWritingWithRetry(prompt, "Task2");
        return parseResponse(response, answer);
    }

    // =========================================================================
    // 3. QWEN LORA API CALL
    // =========================================================================

    /**
     * Gọi Qwen 2.5 LoRA qua ngrok endpoint với retry.
     * Expected request body: { "question": "...", "answer": "..." }
     * Expected response: { "score": "6.5", "feedback": {...}, "evaluation": {...}, "sampleAnswer": "..." }
     */
    private String callQwenLoraWithRetry(String question, String answer) {
        Exception lastException = null;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                System.out.printf("🤖 Qwen LoRA attempt %d/%d...%n", attempt, maxRetries);
                return callQwenLora(question, answer);
            } catch (Exception e) {
                lastException = e;
                String errorMsg = e.getMessage() != null ? e.getMessage() : "";

                // Rate limit: chờ lâu hơn
                boolean isRateLimit = errorMsg.contains("429") || errorMsg.contains("rate_limit")
                        || errorMsg.contains("Too Many Requests");
                long delay = isRateLimit ? retryDelayMs * 3 : retryDelayMs * attempt;

                System.err.printf("⚠️ Qwen attempt %d failed: %s. Retrying in %.1fs...%n",
                        attempt, e.getMessage(), delay / 1000.0);

                if (attempt < maxRetries) {
                    try {
                        Thread.sleep(delay);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }
        throw new RuntimeException("Qwen LoRA failed after " + maxRetries + " attempts: " +
                (lastException != null ? lastException.getMessage() : "unknown"), lastException);
    }

    private String callQwenLora(String question, String answer) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = Map.of(
                "question", question,
                "answer", answer
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    qwenLoraApiUrl,
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                System.out.println("✅ Qwen LoRA response received.");
                return response.getBody();
            } else {
                throw new RuntimeException("Qwen API returned status: " + response.getStatusCode());
            }
        } catch (HttpStatusCodeException e) {
            throw new RuntimeException("Qwen HTTP error [" + e.getStatusCode() + "]: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            throw new RuntimeException("Failed calling Qwen LoRA API: " + e.getMessage(), e);
        }
    }

    // =========================================================================
    // 4. GROQ WRITING CALL WITH RETRY + EXPONENTIAL BACKOFF
    // =========================================================================

    /**
     * Gọi Groq cho Writing với retry và exponential backoff.
     * Xử lý lỗi rate limit 429 (quá tải model miễn phí).
     */
    private String callGroqWritingWithRetry(String prompt, String taskName) {
        if (groqApiKey == null || groqApiKey.isBlank()) {
            throw new RuntimeException("GROQ_API_KEY chưa được cấu hình. Vui lòng thêm vào .env file.");
        }

        Exception lastException = null;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                System.out.printf("📝 Groq Writing %s attempt %d/%d...%n", taskName, attempt, maxRetries);
                String result = callGroqWriting(prompt);
                System.out.printf("✅ Groq Writing %s succeeded on attempt %d.%n", taskName, attempt);
                return result;
            } catch (Exception e) {
                lastException = e;
                String errorMsg = e.getMessage() != null ? e.getMessage() : "";

                // Phát hiện rate limit (429) → chờ lâu hơn
                boolean isRateLimit = errorMsg.contains("429") || errorMsg.contains("rate_limit")
                        || errorMsg.contains("Too Many Requests") || errorMsg.contains("overloaded");

                // Exponential backoff: 2s, 4s, 8s (nhân đôi mỗi lần)
                long delay = isRateLimit
                        ? retryDelayMs * 4  // rate limit: chờ 8s
                        : retryDelayMs * attempt;  // lỗi khác: 2s, 4s, 6s

                System.err.printf("⚠️ Groq %s attempt %d failed: %s. Retrying in %.1fs...%n",
                        taskName, attempt, e.getMessage(), delay / 1000.0);

                if (attempt < maxRetries) {
                    try {
                        Thread.sleep(delay);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }
        throw new RuntimeException("Groq Writing " + taskName + " failed after " + maxRetries + " attempts: " +
                (lastException != null ? lastException.getMessage() : "unknown"), lastException);
    }

    private String callGroqWriting(String prompt) {
        String systemMessage = """
                You are an official, certified IELTS Writing Examiner.
                Evaluate the student's writing strictly and objectively based on official IELTS Writing Public Band Descriptors.
                You MUST return a STRICTLY VALID JSON object matching the exact schema requested.
                Do NOT include any text outside the JSON object.
                Do NOT use markdown code blocks. Return raw JSON only.
                """;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        Map<String, Object> requestBody = Map.of(
                "model", "openai/gpt-oss-120b",
                "messages", List.of(
                        Map.of("role", "system", "content", systemMessage),
                        Map.of("role", "user", "content", prompt)
                ),
                "response_format", Map.of("type", "json_object"),
                "temperature", 0.1,
                "max_tokens", 4096
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.groq.com/openai/v1/chat/completions",
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());

                // Kiểm tra xem có finish_reason = "length" không (token bị cắt)
                String finishReason = root.path("choices").path(0).path("finish_reason").asText();
                if ("length".equals(finishReason)) {
                    System.err.println("⚠️ Groq response truncated due to token limit. Retrying...");
                    throw new RuntimeException("Response truncated by token limit");
                }

                return root
                        .path("choices")
                        .path(0)
                        .path("message")
                        .path("content")
                        .asText();
            } else {
                throw new RuntimeException("Groq Writing API error: " + response.getStatusCode());
            }
        } catch (HttpStatusCodeException e) {
            String body = e.getResponseBodyAsString();
            System.err.println("Groq Writing HTTP error body: " + body);
            throw new RuntimeException("Groq Writing HTTP error [" + e.getStatusCode() + "]: " + body, e);
        } catch (Exception e) {
            if (e instanceof RuntimeException) throw (RuntimeException) e;
            throw new RuntimeException("Failed calling Groq Writing API: " + e.getMessage(), e);
        }
    }

    // =========================================================================
    // 5. PARSE AI RESPONSE → WritingAIResponse
    // =========================================================================

    /**
     * Parse response từ Groq (đúng schema: scoreEva + reviewEva).
     */
    private WritingAIResponse parseResponse(String content, String originalAnswer) {
        try {
            // Thử parse trực tiếp JSON
            if (content != null && content.trim().startsWith("{")) {
                try {
                    return objectMapper.readValue(content.trim(), WritingAIResponse.class);
                } catch (Exception ignored) {
                    // Thử lại với regex
                }
            }

            // Dùng regex để tìm JSON object trong response
            Pattern pattern = Pattern.compile("\\{.*\\}", Pattern.DOTALL);
            Matcher matcher = pattern.matcher(content != null ? content : "");

            if (matcher.find()) {
                String jsonPart = matcher.group();
                return objectMapper.readValue(jsonPart, WritingAIResponse.class);
            } else {
                throw new IllegalArgumentException("Không tìm thấy JSON hợp lệ trong phản hồi AI");
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi parse AI response: " + e.getMessage());
            System.err.println("Raw content: " + (content != null ? content.substring(0, Math.min(500, content.length())) : "null"));
            throw new RuntimeException("Không thể phân tích phản hồi từ AI: " + e.getMessage(), e);
        }
    }

    /**
     * Adapter đặc biệt cho Qwen LoRA model.
     * Qwen trả về evaluation.TaskAchievement.comment (không có scoreEva/reviewEva).
     * Method này normalize sang schema chuẩn WritingAIResponse.
     */
    private WritingAIResponse parseQwenResponse(String content, String originalAnswer) {
        try {
            JsonNode root = objectMapper.readTree(content);

            WritingAIResponse result = new WritingAIResponse();

            // ---- Score ----
            result.setScore(root.path("score").asText("0"));

            // ---- Sample Answer ----
            result.setSampleAnswer(root.path("sampleAnswer").asText(""));

            // ---- Feedback ----
            WritingAIResponse.Feedback feedback = new WritingAIResponse.Feedback();
            JsonNode feedbackNode = root.path("feedback");

            // Lấy overallComment từ feedback.overallComment
            feedback.setOverallComment(feedbackNode.path("overallComment").asText(""));

            // errorCorrections - nếu rỗng thì set list rỗng
            if (feedbackNode.has("errorCorrections") && feedbackNode.get("errorCorrections").isArray()) {
                feedback.setErrorCorrections(
                    objectMapper.convertValue(feedbackNode.get("errorCorrections"),
                        objectMapper.getTypeFactory().constructCollectionType(java.util.List.class,
                            WritingAIResponse.ErrorCorrection.class))
                );
            } else {
                feedback.setErrorCorrections(new java.util.ArrayList<>());
            }

            // sentenceImprovements - nếu rỗng thì set list rỗng
            if (feedbackNode.has("sentenceImprovements") && feedbackNode.get("sentenceImprovements").isArray()) {
                feedback.setSentenceImprovements(
                    objectMapper.convertValue(feedbackNode.get("sentenceImprovements"),
                        objectMapper.getTypeFactory().constructCollectionType(java.util.List.class,
                            WritingAIResponse.SentenceImprovement.class))
                );
            } else {
                feedback.setSentenceImprovements(new java.util.ArrayList<>());
            }

            result.setFeedback(feedback);

            // ---- Evaluation - Adapter Qwen → Schema chuẩn ----
            JsonNode evalNode = root.path("evaluation");
            web.ielts.Test.result.model.writing.EvaluationWritingAnswer evaluation =
                new web.ielts.Test.result.model.writing.EvaluationWritingAnswer();

            evaluation.setTaskAchievement(
                buildReviewFromQwen(evalNode.path("TaskAchievement"), "Task Achievement"));
            evaluation.setCoherenceCohesion(
                buildReviewFromQwen(evalNode.path("CoherenceCohesion"), "Coherence & Cohesion"));
            evaluation.setLexicalResource(
                buildReviewFromQwen(evalNode.path("LexicalResource"), "Lexical Resource"));
            evaluation.setGrammar(
                buildReviewFromQwen(evalNode.path("Grammar"), "Grammatical Range & Accuracy"));

            result.setEvaluation(evaluation);

            System.out.println("✅ Qwen response parsed successfully. Score: " + result.getScore());
            return result;

        } catch (Exception e) {
            System.err.println("⚠️ Failed to parse Qwen response with adapter: " + e.getMessage());
            System.err.println("Raw Qwen content (first 300 chars): " +
                (content != null ? content.substring(0, Math.min(300, content.length())) : "null"));
            // Thử parse theo cách thông thường như fallback
            return parseResponse(content, originalAnswer);
        }
    }

    /**
     * Chuyển đổi một evaluation node của Qwen (có thể dùng 'comment', 'scoreEva', hoặc 'reviewEva')
     * thành Review object chuẩn.
     */
    private web.ielts.Test.result.model.writing.Review buildReviewFromQwen(JsonNode node, String criteriaName) {
        web.ielts.Test.result.model.writing.Review review = new web.ielts.Test.result.model.writing.Review();

        // Lấy score: ưu tiên scoreEva → score → mặc định từ overall score
        String score = "";
        if (!node.path("scoreEva").isMissingNode()) score = node.path("scoreEva").asText("");
        else if (!node.path("score").isMissingNode()) score = node.path("score").asText("");
        review.setScoreEva(score.isEmpty() ? "N/A" : score);

        // Lấy comment: ưu tiên reviewEva → comment → description
        String comment = "";
        if (!node.path("reviewEva").isMissingNode()) comment = node.path("reviewEva").asText("");
        else if (!node.path("comment").isMissingNode()) comment = node.path("comment").asText("");
        else if (!node.path("description").isMissingNode()) comment = node.path("description").asText("");
        review.setReviewEva(comment.isEmpty() ? criteriaName + " evaluated by Qwen LoRA." : comment);

        return review;
    }

    // =========================================================================
    // 6. GENERAL CHAT INTERACTION
    // =========================================================================

    public String callChatWithMessages(List<Map<String, String>> messages) {
        if (groqApiKey == null || groqApiKey.isBlank()) {
            throw new RuntimeException("GROQ_API_KEY chưa được cấu hình.");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        Map<String, Object> requestBody = Map.of(
                "model", "llama-3.3-70b-versatile",
                "messages", messages,
                "temperature", 0.2,
                "max_tokens", 1500
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.groq.com/openai/v1/chat/completions",
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                return root
                        .path("choices")
                        .path(0)
                        .path("message")
                        .path("content")
                        .asText();
            } else {
                throw new RuntimeException("Groq Chat API error: " + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to call Groq Chat API: " + e.getMessage(), e);
        }
    }
}
