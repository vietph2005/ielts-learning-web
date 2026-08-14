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

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    @Value("${openai.api.key:}")
    private String apiKey;

    @Value("${groq.api.key:}")
    private String groqApiKey;

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
        // 1. Primary: Groq (free, fast, Llama 3.3 70B)
        if (groqApiKey != null && !groqApiKey.isBlank()) {
            System.out.println("🚀 Calling Groq (llama-3.3-70b-versatile) for Speaking Evaluation...");
            try {
                String result = callGroqContent(prompt);
                if (result != null && !result.isBlank()) {
                    System.out.println("✅ Groq evaluation succeeded.");
                    return result;
                }
            } catch (Exception e) {
                System.err.println("⚠️ Groq failed: " + e.getMessage() + ". Trying OpenAI fallback...");
            }
        }

        // 2. Fallback to OpenAI GPT-4o
        System.out.println("🔄 Falling back to OpenAI GPT-4o for Speaking Evaluation...");
        return callSpeakingPartWithOpenAI(prompt);
    }

    private String callGroqContent(String prompt) {
        String systemMessage = """
                You are an official, certified IELTS Speaking Examiner.
                Evaluate the candidate strictly and objectively based on official IELTS Speaking Public Band Descriptors.
                - Follow the criteria for Lexical Resource, Grammatical Range & Accuracy, and Coherence.
                - Extract ALL distinct errors accurately without adding unnecessary corrections.
                - Return strictly valid JSON matching the requested schema.
                """;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        Map<String, Object> requestBody = Map.of(
                "model", "llama-3.3-70b-versatile",
                "messages", List.of(
                        Map.of("role", "system", "content", systemMessage),
                        Map.of("role", "user", "content", prompt)
                ),
                "response_format", Map.of("type", "json_object"),
                "temperature", 0.1
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
            throw new RuntimeException("Groq and OpenAI API keys are unavailable. Please configure GROQ_API_KEY or OPENAI_API_KEY in your .env / application.properties file.");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openaiApiKey);

        String systemMessage = """
                You are an official, certified IELTS Speaking Examiner.
                Evaluate the candidate strictly and objectively based on official IELTS Speaking Public Band Descriptors.
                - Follow the criteria for Lexical Resource, Grammatical Range & Accuracy, and Coherence.
                - Extract ALL distinct errors accurately without adding unnecessary corrections.
                - Return strictly valid JSON matching the requested schema.
                """;

        Map<String, Object> requestBody = Map.of(
                "model", "gpt-4o",
                "messages", List.of(
                        Map.of("role", "system", "content", systemMessage),
                        Map.of("role", "user", "content", prompt)
                ),
                "response_format", Map.of("type", "json_object"),
                "temperature", 0.1
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
                return root
                        .path("choices")
                        .path(0)
                        .path("message")
                        .path("content")
                        .asText();
            } else {
                throw new RuntimeException("OpenAI API error: " + response.getStatusCode());
            }
        } catch (Exception e) {
            System.err.println("❌ OpenAI Speaking call failed: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to call OpenAI for Speaking evaluation: " + e.getMessage(), e);
        }
    }

    // =========================================================================
    // 2. WRITING AI EVALUATION
    // =========================================================================

    public WritingAIResponse WritingTask1(String imageUrl, String question, String answer) {
        String prompt = IeltsWritingRubrics.buildTask1Prompt(question, answer);
        String response = callOpenAITask1(prompt, imageUrl);
        return parseResponse(response, answer);
    }

    public WritingAIResponse WritingTask2(String question, String answer) {
        String prompt = IeltsWritingRubrics.buildTask2Prompt(question, answer);
        String response = callOpenAITask2(prompt);
        return parseResponse(response, answer);
    }

    private String callOpenAITask1(String promptText, String imageUrl) {
        try {
            if (imageUrl == null || !imageUrl.startsWith("https://")) {
                throw new IllegalArgumentException("Image URL must be a valid HTTPS URL: " + imageUrl);
            }

            System.out.println("==== IMAGE URL BEING SENT TO OPENAI ====");
            System.out.println(imageUrl);

            String requestBody = """
                    {
                      "model": "gpt-4o",
                      "messages": [
                        {
                          "role": "user",
                          "content": [
                            { "type": "text", "text": %s },
                            { "type": "image_url", "image_url": { "url": %s } }
                          ]
                        }
                      ],
                      "temperature": 0.2
                    }
                    """.formatted(
                    objectMapper.writeValueAsString(promptText),
                    objectMapper.writeValueAsString(imageUrl)
            );

            String response = webClient.post()
                    .uri("/chat/completions")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + openaiApiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode jsonNode = objectMapper.readTree(response);
            return jsonNode.get("choices").get(0).get("message").get("content").asText();

        } catch (Exception e) {
            System.err.println("==== OPENAI API ERROR (Writing Task 1) ====");
            e.printStackTrace();
            throw new RuntimeException("OpenAI API error: " + e.getMessage(), e);
        }
    }

    private String callOpenAITask2(String prompt) {
        try {
            String requestBody = """
                    {
                      "model": "gpt-4o",
                      "messages": [
                        { "role": "user", "content": %s }
                      ],
                      "temperature": 0.1
                    }
                    """.formatted(objectMapper.writeValueAsString(prompt));

            String response = webClient.post()
                    .uri("/chat/completions")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + openaiApiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode jsonNode = objectMapper.readTree(response);
            return jsonNode.get("choices").get(0).get("message").get("content").asText();

        } catch (Exception e) {
            System.err.println("==== OPENAI API ERROR (Writing Task 2) ====");
            e.printStackTrace();
            throw new RuntimeException("OpenAI API error: " + e.getMessage(), e);
        }
    }

    private WritingAIResponse parseResponse(String content, String originalAnswer) {
        try {
            Pattern pattern = Pattern.compile("\\{.*\\}", Pattern.DOTALL);
            Matcher matcher = pattern.matcher(content);

            if (matcher.find()) {
                String jsonPart = matcher.group();
                return objectMapper.readValue(jsonPart, WritingAIResponse.class);
            } else {
                throw new IllegalArgumentException("Không tìm thấy JSON hợp lệ trong phản hồi");
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi parse response: " + e.getMessage());
            throw new RuntimeException("Không thể phân tích phản hồi từ AI", e);
        }
    }

    // =========================================================================
    // 3. GENERAL CHAT INTERACTION
    // =========================================================================

    public String callChatWithMessages(List<Map<String, String>> messages) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> requestBody = Map.of(
                "model", "gpt-4o",
                "messages", messages,
                "temperature", 0.2,
                "max_tokens", 1500
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
                return root
                        .path("choices")
                        .path(0)
                        .path("message")
                        .path("content")
                        .asText();
            } else {
                throw new RuntimeException("OpenAI API error: " + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to call OpenAI GPT API or parse response", e);
        }
    }
}
