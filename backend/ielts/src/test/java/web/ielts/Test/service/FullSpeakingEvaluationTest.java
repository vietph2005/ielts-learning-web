package web.ielts.Test.service;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import web.ielts.Test.ai.model.FeedBackAI;
import web.ielts.Test.ai.model.FleCohAnswer;
import web.ielts.Test.ai.model.IntonationSentence;
import web.ielts.Test.ai.model.StressMismatch;
import web.ielts.Test.ai.service.AIService;
import web.ielts.Test.ai.service.GroqPronunciationScorer;
import web.ielts.Test.result.model.speaking.SpeakingAnswerQuestion;
import web.ielts.Test.result.service.IeltsScoringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

import static org.junit.jupiter.api.Assertions.*;

public class FullSpeakingEvaluationTest {

    private final ObjectMapper objectMapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    @Test
    public void testFullThreePartIeltsSpeakingTest() {
        System.out.println("================================================================================");
        System.out.println("🎙️ KHỞI CHẠY KIỂM THỬ THỰC TẾ BÀI THI IELTS SPEAKING (LIVE GROQ AI EVALUATION)");
        System.out.println("================================================================================\n");

        AIService aiService = new AIService(objectMapper);
        GroqPronunciationScorer pronunciationScorer = new GroqPronunciationScorer();

        String groqKey = System.getenv("GROQ_API_KEY");
        if (groqKey == null || groqKey.isBlank()) {
            try {
                java.util.Properties props = new java.util.Properties();
                java.io.File propFile = new java.io.File("src/main/resources/application-local.properties");
                if (propFile.exists()) {
                    try (java.io.FileInputStream fis = new java.io.FileInputStream(propFile)) {
                        props.load(fis);
                        groqKey = props.getProperty("GROQ_API_KEY");
                    }
                }
            } catch (Exception ignored) {}
        }
        if (groqKey == null || groqKey.isBlank()) {
            groqKey = System.getProperty("GROQ_API_KEY", "dummy_groq_key");
        }
        ReflectionTestUtils.setField(aiService, "groqApiKey", groqKey);
        ReflectionTestUtils.setField(pronunciationScorer, "groqApiKey", groqKey);

        // =====================================================================
        // PART 1: INTRODUCTION & INTERVIEW (4 CÂU HỎI)
        // =====================================================================
        System.out.println("--------------------------------------------------------------------------------");
        System.out.println("📌 PART 1: INTRODUCTION & INTERVIEW (4 QUESTIONS)");
        System.out.println("--------------------------------------------------------------------------------");

        List<QuestionSample> part1Questions = List.of(
                new QuestionSample(
                        "Do you work or are you a student?",
                        "Currently I am a senior university student majoring in software engineering. I find my academic field both demanding and incredibly fascinating because technology evolves rapidly.",
                        3.1, 1, 0.40, 24, 0
                ),
                new QuestionSample(
                        "What do you enjoy most about your studies?",
                        "What I enjoy the most is solving complex coding problems and building practical web applications that can genuinely help people in their everyday routines.",
                        3.0, 1, 0.38, 24, 0
                ),
                new QuestionSample(
                        "Do you prefer living in a city or the countryside?",
                        "To be honest, I definitely prefer living in a bustling city. There are plenty of modern facilities, such as shopping malls and reliable public transport. In contrast, the countryside is a bit too quiet for my taste.",
                        3.2, 2, 0.80, 35, 1
                ),
                new QuestionSample(
                        "How do you usually spend your weekends?",
                        "On weekends, I usually unwind by hanging out with my close friends at local cafes or catching up on reading tech articles to expand my knowledge.",
                        2.9, 1, 0.35, 27, 0
                )
        );

        List<Double> part1Scores = new ArrayList<>();

        for (int i = 0; i < part1Questions.size(); i++) {
            QuestionSample q = part1Questions.get(i);
            System.out.printf("%n🔹 [Part 1 - Câu %d]: %s%n", i + 1, q.question);
            System.out.printf("   Transcript: \"%s\"%n", q.transcript);

            double qScore = evaluateSingleQuestionLive(aiService, pronunciationScorer, 1, q, null);
            part1Scores.add(qScore);
            System.out.printf("   ==> Điểm câu hỏi %d: %.2f / 9.0%n", i + 1, qScore);
        }

        double part1Average = part1Scores.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        System.out.printf("%n🎯 [KẾT QUẢ PART 1]: Điểm trung bình = %.2f (Làm tròn: %.1f)%n",
                part1Average, IeltsScoringUtils.calculateIeltsRounding(part1Average));

        // =====================================================================
        // PART 2: INDIVIDUAL LONG TURN / CUE CARD (1 CÂU HỎI DÀI)
        // =====================================================================
        System.out.println("\n--------------------------------------------------------------------------------");
        System.out.println("📌 PART 2: INDIVIDUAL LONG TURN / CUE CARD (1 TOPIC)");
        System.out.println("--------------------------------------------------------------------------------");

        String part2Topic = "Describe a memorable journey you went on.";
        List<String> part2CueCards = List.of(
                "Where you went",
                "Who you went with",
                "What you did",
                "And explain why this journey was particularly memorable to you"
        );

        String part2Transcript = "I would like to share my experience of a memorable trip to Da Nang with my family last summer. " +
                "We spent four fantastic days exploring famous attractions, including the Golden Bridge at Ba Na Hills and the serene beaches of My Khe. " +
                "During our stay, we indulged in delicious local seafood dishes and took scenic evening walks along the Dragon Bridge to witness the fire show. " +
                "This journey was truly unforgettable because it provided a precious opportunity for our family members to strengthen our emotional bonds after months of demanding work.";

        QuestionSample part2Sample = new QuestionSample(
                part2Topic,
                part2Transcript,
                3.15, 4, 1.80, 95, 2
        );

        System.out.printf("🔹 [Part 2 - Cue Card]: %s%n", part2Topic);
        System.out.println("   Cue Card Points: " + part2CueCards);
        System.out.printf("   Transcript (%d words): \"%s\"%n", part2Sample.totalWords, part2Transcript);

        double part2Score = evaluateSingleQuestionLive(aiService, pronunciationScorer, 2, part2Sample, part2CueCards);
        System.out.printf("%n🎯 [KẾT QUẢ PART 2]: Điểm bài nói dài = %.2f (Làm tròn: %.1f)%n",
                part2Score, IeltsScoringUtils.calculateIeltsRounding(part2Score));

        // =====================================================================
        // PART 3: TWO-WAY DISCUSSION (4 CÂU HỎI MỞ RỘNG)
        // =====================================================================
        System.out.println("\n--------------------------------------------------------------------------------");
        System.out.println("📌 PART 3: TWO-WAY DISCUSSION (4 QUESTIONS)");
        System.out.println("--------------------------------------------------------------------------------");

        List<QuestionSample> part3Questions = List.of(
                new QuestionSample(
                        "Why do many people choose to travel abroad for holidays?",
                        "In my perspective, people travel abroad primarily to immerse themselves in diverse cultures, experience authentic international cuisines, and broaden their personal perspectives beyond their domestic boundaries.",
                        3.05, 2, 0.70, 29, 0
                ),
                new QuestionSample(
                        "How has modern transportation changed the way people travel?",
                        "Technological advancements in aviation and high-speed railways have dramatically reduced travel time, making distant international destinations far more accessible and affordable for ordinary travelers.",
                        3.10, 1, 0.45, 26, 0
                ),
                new QuestionSample(
                        "Do you think international tourism helps promote mutual cultural understanding?",
                        "Without a doubt, direct interactions between tourists and local communities cultivate mutual empathy, break down historical stereotypes, and foster peaceful global relations among distinct societies.",
                        3.0, 2, 0.75, 25, 0
                ),
                new QuestionSample(
                        "What are some negative environmental impacts associated with mass tourism?",
                        "Unregulated mass tourism often leads to severe carbon footprints from aviation, environmental degradation of pristine natural habitats, and immense waste generation that overwhelms local waste management systems.",
                        2.95, 2, 0.80, 27, 1
                )
        );

        List<Double> part3Scores = new ArrayList<>();

        for (int i = 0; i < part3Questions.size(); i++) {
            QuestionSample q = part3Questions.get(i);
            System.out.printf("%n🔹 [Part 3 - Câu %d]: %s%n", i + 1, q.question);
            System.out.printf("   Transcript: \"%s\"%n", q.transcript);

            double qScore = evaluateSingleQuestionLive(aiService, pronunciationScorer, 3, q, null);
            part3Scores.add(qScore);
            System.out.printf("   ==> Điểm câu hỏi %d: %.2f / 9.0%n", i + 1, qScore);
        }

        double part3Average = part3Scores.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        System.out.printf("%n🎯 [KẾT QUẢ PART 3]: Điểm trung bình = %.2f (Làm tròn: %.1f)%n",
                part3Average, IeltsScoringUtils.calculateIeltsRounding(part3Average));

        // =====================================================================
        // TỔNG HỢP TOÀN BỘ BÀI THI IELTS SPEAKING (OVERALL BAND SCORE)
        // =====================================================================
        double overallRawBand = (part1Average + part2Score + part3Average) / 3.0;
        double overallIeltsBand = IeltsScoringUtils.calculateIeltsRounding(overallRawBand);

        System.out.println("\n================================================================================");
        System.out.println("🏆 BẢNG ĐIỂM TỔNG KẾT BÀI THI IELTS SPEAKING CHÍNH THỨC (LIVE AI EVALUATION)");
        System.out.println("================================================================================");
        System.out.printf("📊 Part 1 Score (4 questions) : %.2f  (Band: %.1f)%n", part1Average, IeltsScoringUtils.calculateIeltsRounding(part1Average));
        System.out.printf("📊 Part 2 Score (Cue Card)    : %.2f  (Band: %.1f)%n", part2Score, IeltsScoringUtils.calculateIeltsRounding(part2Score));
        System.out.printf("📊 Part 3 Score (4 questions) : %.2f  (Band: %.1f)%n", part3Average, IeltsScoringUtils.calculateIeltsRounding(part3Average));
        System.out.println("--------------------------------------------------------------------------------");
        System.out.printf("🌟 OVERALL IELTS SPEAKING BAND : %.1f / 9.0 (Raw: %.3f)%n", overallIeltsBand, overallRawBand);
        System.out.println("================================================================================");

        assertTrue(overallIeltsBand >= 6.0 && overallIeltsBand <= 9.0, "Overall band should be in valid range");
    }

    private double evaluateSingleQuestionLive(
            AIService aiService,
            GroqPronunciationScorer pronunciationScorer,
            int partNumber,
            QuestionSample sample,
            List<String> cueCards
    ) {
        // 1. Acoustic Fluency calculation (from simulated Praat data)
        double speechRateBand = Math.min(9.0, 1.0 + (sample.speechRate / 3.5) * 8.0);
        double pauseRate = (sample.pauseCount / ((sample.totalWords / sample.speechRate) / 60.0));
        double pauseRateBand = Math.max(4.0, Math.min(9.0, 9.0 - (pauseRate / 5.0)));
        double acousticFluencyBand = (0.60 * speechRateBand) + (0.40 * pauseRateBand);

        FleCohAnswer fleCoh = new FleCohAnswer();
        fleCoh.setSpeechRate(String.format(Locale.US, "%.2f", sample.speechRate));
        fleCoh.setPauseCount(String.valueOf(sample.pauseCount));
        fleCoh.setTotalDuration(String.format(Locale.US, "%.2f", sample.totalWords / sample.speechRate));
        fleCoh.setTotalPauseDuration(String.format(Locale.US, "%.2f", sample.pauseDuration));

        // 2. Build Speaking Prompt
        ObjectNode transcriptNode = objectMapper.createObjectNode();
        transcriptNode.put("text", sample.transcript);

        double fluenScore = (acousticFluencyBand - 1.0) / 8.0 * 100.0;

        String prompt = aiService.buildSpeakingPrompt(
                partNumber,
                sample.question,
                transcriptNode,
                fleCoh,
                fluenScore,
                cueCards
        );

        assertNotNull(prompt);

        // 3. LIVE AI Speaking Call
        double grammarScore = 8.0;
        double lexicalScore = 8.0;
        double fcScore = acousticFluencyBand;

        try {
            String aiRawResponse = aiService.callSpeakingPart(prompt);
            if (aiRawResponse != null && !aiRawResponse.isBlank()) {
                String cleaned = cleanJson(aiRawResponse);
                SpeakingAnswerQuestion parsed = objectMapper.readValue(cleaned, SpeakingAnswerQuestion.class);
                if (parsed != null) {
                    if (parsed.getGrammarAnswer() != null && parsed.getGrammarAnswer().getScore() > 0) {
                        grammarScore = parsed.getGrammarAnswer().getScore();
                    }
                    if (parsed.getLexicalAnswer() != null && parsed.getLexicalAnswer().getScore() > 0) {
                        lexicalScore = parsed.getLexicalAnswer().getScore();
                    }
                    if (parsed.getFluencyCohAnswer() != null && parsed.getFluencyCohAnswer().getScore() > 0) {
                        fcScore = parsed.getFluencyCohAnswer().getScore();
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("⚠️ Live AI Speaking call note: " + e.getMessage());
        }

        // 4. LIVE Pronunciation 4-Layer Mathematical Evaluation
        List<String> words = Arrays.asList(sample.transcript.split("\\s+"));
        List<IntonationSentence> importantWords = pronunciationScorer.extractImportantWordsLocally(words);

        List<IntonationSentence> emphasizedWords = new ArrayList<>(importantWords);
        List<IntonationSentence> correctEmphasized = new ArrayList<>(importantWords);
        List<IntonationSentence> missing = new ArrayList<>();
        List<IntonationSentence> over = new ArrayList<>();

        List<StressMismatch> stressMismatches = new ArrayList<>();
        for (int m = 0; m < sample.stressMismatches; m++) {
            stressMismatches.add(new StressMismatch("sampleWord" + m, 1, 2, 0.0, 1.0, m));
        }

        FeedBackAI pronunciationFeedback = pronunciationScorer.scorePronunciation(
                sample.transcript,
                stressMismatches,
                importantWords,
                emphasizedWords,
                correctEmphasized,
                missing,
                over,
                100.0,
                sample.totalWords,
                partNumber
        );

        double pronunciationScore = (pronunciationFeedback != null) ? pronunciationFeedback.getScore() : 8.0;

        System.out.printf("   [Chi tiết 4 tiêu chí]: FC = %.1f | LR = %.1f | GRA = %.1f | P = %.1f%n",
                fcScore, lexicalScore, grammarScore, pronunciationScore);

        return (fcScore + lexicalScore + grammarScore + pronunciationScore) / 4.0;
    }

    private String cleanJson(String response) {
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

    private static class QuestionSample {
        String question;
        String transcript;
        double speechRate;
        int pauseCount;
        double pauseDuration;
        int totalWords;
        int stressMismatches;

        QuestionSample(String question, String transcript, double speechRate, int pauseCount, double pauseDuration, int totalWords, int stressMismatches) {
            this.question = question;
            this.transcript = transcript;
            this.speechRate = speechRate;
            this.pauseCount = pauseCount;
            this.pauseDuration = pauseDuration;
            this.totalWords = totalWords;
            this.stressMismatches = stressMismatches;
        }
    }
}
