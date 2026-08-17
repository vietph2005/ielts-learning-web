package web.ielts.Test.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import web.ielts.Test.ai.service.AIService;
import web.ielts.Test.result.model.writing.WritingAIResponse;

public class WritingTask1DatasetTest {

    @Test
    public void testGradeDatasetRow0() {
        ObjectMapper objectMapper = new ObjectMapper();
        AIService aiService = new AIService(objectMapper);

        String groqKey = System.getenv("GROQ_API_KEY");
        if (groqKey == null || groqKey.isBlank()) {
            System.out.println("⚠️ GROQ_API_KEY environment variable is not set. Skipping live API test.");
            return;
        }

        ReflectionTestUtils.setField(aiService, "groqApiKey", groqKey);
        ReflectionTestUtils.setField(aiService, "maxRetries", 3);
        ReflectionTestUtils.setField(aiService, "retryDelayMs", 2000L);

        // --- Data from HuggingFace row 0 ---
        String question = "The line graph below shows how elderly people in the United States spent their free time between 1980 and 2010. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.";
        
        String imageUrl = "https://datasets-server.huggingface.co/cached-assets/TraTacXiMuoi/Ielts_writing_task1_academic/--/df115b81b922e5487492a30756b6f54c436354e3/--/default/train/0/image/image.jpg?Expires=1786993098&Signature=sLb8QaTTmb0hdf5foyos29LnAgX~HFq3-dvUURKm2gxwBD5RbQDy0RO2XqS5oEIe8O4JYjhTm1AhWEbNAnwNQTIqfE8Fpq2wAYYtZV~lM5VNDfrwV0lSdYcSRiOCjwpNspVLtJSWn~~bQXHEFXfmBqGSByEe3attrR2e21rdXV8DxegbwL~fvGDz1ExgdPqBWp2D9jhvI1wmNTcuVHswOQTXelThQ3Y6PaQyVcjFh4-ryJwgPQUUSDpkg2GwjiILo9ASsHrsrhoQmqaUlItyeeboengsYvXiXswYX1pMpnLbZ49tUbmPPK8fFf~p0vpHWg4xSIeY-p-ebG9c8sSWFA__&Key-Pair-Id=K3C0L9WB6U5DUC";
        
        String essay = """
                The line chart presents the percentage of elderly Americans engaging in various leisure activities between 1980 and 2010.
                A notable trend is a significant increase in participation across all activities except for television viewing and going to the theatre, which remained relatively stable. In addition, hiking became the dominant pastime by the end of the period, surpassing television as the most popular choice.
                In the 1980s, television viewing was the most prevalent activity, with 60% of elderly individuals partaking. This figure gradually rose to 70% by the 2000s. Hiking and internet use also exhibited upward trajectories, with hiking experiencing a particularly sharp ascent from 20% to 60% over the same period. Internet use, while growing, showed a more modest increase, reaching 15% in the 2000s. Meanwhile, the figures for reading activity fluctuated, initially rising before declining to 20% in the 2000s. Theater attendance followed a contrasting trajectory, plunging to 30% in the 1990s before gradually rebounding to 40% in the 2000s.
                During the final decade, hiking became the most popular kind of free time activity among elders in the US, reaching 80% participation. Whereas, watching TV experienced a slight decline to roughly 65%. Reading and surfing the Internet gained substantial traction, rising to 60% and 50% respectively. The figure for visiting the theatre activity also increased, but to a much lesser extent, reaching around 45% in the 2010s.
                """;

        System.out.println("=================================================");
        System.out.println("🚀 BẮT ĐẦU TEST BÀI THI TỪ DATASET HUGGING FACE");
        System.out.println("=================================================");
        System.out.println("📌 Đề bài: " + question);
        System.out.println("🎯 Điểm chuẩn trong Dataset (Benchmark): Band 8.5");
        System.out.println();

        // 1. Pre-extract Vision Ground Truth Data
        System.out.println("--- BƯỚC 1: TRÍCH XUẤT SỐ LIỆU TỪ ẢNH (VISION AI 1 LẦN) ---");
        String chartData = null;
        try {
            chartData = aiService.extractChartDataFromImage(imageUrl, question);
            System.out.println("📊 Ground Truth Chart Data:\n" + chartData);
        } catch (Exception e) {
            System.out.println("⚠️ Vision extraction failed or skipped: " + e.getMessage());
        }

        // 2. Grade Task 1 with Ground Truth & Compact Rubrics
        System.out.println("\n--- BƯỚC 2: CHẤM BÀI VỚI PROMPT GROUND TRUTH ---");
        WritingAIResponse result = aiService.WritingTask1(imageUrl, question, essay, chartData);

        System.out.println("\n=================================================");
        System.out.println("🎉 KẾT QUẢ CHẤM ĐIỂM CỦA HỆ THỐNG");
        System.out.println("=================================================");
        System.out.println("🏆 Overall Score: Band " + result.getScore());
        System.out.println();
        if (result.getEvaluation() != null) {
            System.out.println("📋 1. Task Achievement: " + (result.getEvaluation().getTaskAchievement() != null ? result.getEvaluation().getTaskAchievement().getScoreEva() : "N/A"));
            System.out.println("   Comment: " + (result.getEvaluation().getTaskAchievement() != null ? result.getEvaluation().getTaskAchievement().getReviewEva() : ""));
            System.out.println("📋 2. Coherence & Cohesion: " + (result.getEvaluation().getCoherenceCohesion() != null ? result.getEvaluation().getCoherenceCohesion().getScoreEva() : "N/A"));
            System.out.println("   Comment: " + (result.getEvaluation().getCoherenceCohesion() != null ? result.getEvaluation().getCoherenceCohesion().getReviewEva() : ""));
            System.out.println("📋 3. Lexical Resource: " + (result.getEvaluation().getLexicalResource() != null ? result.getEvaluation().getLexicalResource().getScoreEva() : "N/A"));
            System.out.println("   Comment: " + (result.getEvaluation().getLexicalResource() != null ? result.getEvaluation().getLexicalResource().getReviewEva() : ""));
            System.out.println("📋 4. Grammar: " + (result.getEvaluation().getGrammar() != null ? result.getEvaluation().getGrammar().getScoreEva() : "N/A"));
            System.out.println("   Comment: " + (result.getEvaluation().getGrammar() != null ? result.getEvaluation().getGrammar().getReviewEva() : ""));
        }

        if (result.getFeedback() != null) {
            System.out.println("\n🔍 Overall Comment: " + result.getFeedback().getOverallComment());
            if (result.getFeedback().getErrorCorrections() != null) {
                System.out.println("\n⚠️ Error Corrections (" + result.getFeedback().getErrorCorrections().size() + "):");
                for (var err : result.getFeedback().getErrorCorrections()) {
                    System.out.println("   - [" + err.getErrorType() + "] '" + err.getOriginalText() + "' -> '" + err.getCorrectedText() + "': " + err.getExplanation());
                }
            }
            if (result.getFeedback().getSentenceImprovements() != null) {
                System.out.println("\n💡 Sentence Improvements (" + result.getFeedback().getSentenceImprovements().size() + "):");
                for (var imp : result.getFeedback().getSentenceImprovements()) {
                    System.out.println("   - Original: " + imp.getOriginalSentence());
                    System.out.println("   - Improved: " + imp.getImprovedSentence());
                    System.out.println("   - Boost: " + imp.getBandBoost() + " | " + imp.getExplanation());
                }
            }
        }
        System.out.println("=================================================");
    }
}
