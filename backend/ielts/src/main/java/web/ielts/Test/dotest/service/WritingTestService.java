package web.ielts.Test.dotest.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import web.ielts.Test.dotest.model.Writing;
import web.ielts.Test.result.model.writing.WritingAIResponse;
import web.ielts.Test.result.model.writing.WritingAnswer;
import web.ielts.Test.dotest.repository.WritingRepository;
import web.ielts.Test.result.repository.WritingAnswerRepository;
import web.ielts.Test.ai.service.AIService;
import web.ielts.Test.result.service.IeltsScoringUtils;

import java.util.Optional;

@Service
public class WritingTestService {

    @Autowired
    private WritingRepository writingRepository;

    @Autowired
    private WritingAnswerRepository writingAnswerRepository;

    @Autowired
    private AIService aiService;

    public Optional<Writing> getWritingByTestId(String testId) {
        return writingRepository.findById(testId);
    }

    /**
     * Lưu bài writing và kích hoạt chấm AI bất đồng bộ (nếu gradingMethod = "AI").
     * Trả về ngay WritingAnswer với gradingStatus = "grading".
     */
    public WritingAnswer saveWritingAnswer(WritingAnswer answer) {
        if (answer.getGradingMethod() != null && answer.getGradingMethod().equalsIgnoreCase("AI")) {
            answer.setGradingStatus("grading");
        } else {
            answer.setGradingStatus("submitted");
        }
        WritingAnswer saved = writingAnswerRepository.save(answer);

        // Kích hoạt chấm điểm AI bất đồng bộ
        if ("AI".equalsIgnoreCase(saved.getGradingMethod())) {
            gradeAsyncWithAI(saved.getId());
        }

        return saved;
    }

    /**
     * Chấm điểm AI bất đồng bộ - chạy trong background thread.
     * Frontend polling /test-answers/writing/{id}/status để kiểm tra.
     */
    @Async
    public void gradeAsyncWithAI(String answerId) {
        WritingAnswer answer;
        try {
            answer = writingAnswerRepository.findById(answerId)
                    .orElseThrow(() -> new RuntimeException("WritingAnswer not found: " + answerId));
        } catch (Exception e) {
            System.err.println("❌ Cannot find WritingAnswer for async grading: " + e.getMessage());
            return;
        }

        boolean task1Success = false;
        boolean task2Success = false;

        // ---- Lấy chartData từ đề thi gốc (nếu có) ----
        String chartData = null;
        if (answer.getTestId() != null) {
            try {
                Optional<Writing> writingOpt = writingRepository.findById(answer.getTestId());
                if (writingOpt.isPresent() && writingOpt.get().getTasks() != null) {
                    for (Writing.Task t : writingOpt.get().getTasks()) {
                        if (t.getTaskNumber() == 1 && t.getChartData() != null && !t.getChartData().isBlank()) {
                            chartData = t.getChartData();
                            System.out.println("📊 Found pre-extracted chartData for testId: " + answer.getTestId());
                            break;
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("⚠️ Could not fetch chartData from test: " + e.getMessage());
            }
        }

        // ---- Chấm Task 1 ----
        var task1 = answer.getTask1();
        if (task1 != null) {
            try {
                System.out.println("🎯 Grading Task 1 for answerId: " + answerId);
                WritingAIResponse eval1 = aiService.WritingTask1(
                        task1.getImageUrl(), task1.getQuestion(), task1.getAnswer(), chartData);

                task1.setFeedback(eval1.getFeedback());
                if (task1.getFeedback() != null && eval1.getFeedback() != null) {
                    task1.getFeedback().setErrorCorrections(eval1.getFeedback().getErrorCorrections());
                    task1.getFeedback().setOverallComment(eval1.getFeedback().getOverallComment());
                    task1.getFeedback().setSentenceImprovements(eval1.getFeedback().getSentenceImprovements());
                }
                task1.setSampleAnswer(eval1.getSampleAnswer());
                task1.setScore(eval1.getScore());
                task1.setEvaluation(eval1.getEvaluation());

                System.out.println("✅ Task 1 graded: " + eval1.getScore());
                task1Success = true;

            } catch (Exception e) {
                System.err.println("❌ Error grading Task 1: " + e.getMessage());
                // Không crash - để task2 tiếp tục
            }
        } else {
            task1Success = true; // không có task1 = ok
        }

        // ---- Chấm Task 2 ----
        var task2 = answer.getTask2();
        if (task2 != null) {
            try {
                System.out.println("🎯 Grading Task 2 for answerId: " + answerId);
                WritingAIResponse eval2 = aiService.WritingTask2(task2.getQuestion(), task2.getAnswer());

                task2.setFeedback(eval2.getFeedback());
                task2.setSampleAnswer(eval2.getSampleAnswer());
                task2.setScore(eval2.getScore());

                if (task2.getFeedback() != null && eval2.getFeedback() != null) {
                    task2.getFeedback().setErrorCorrections(eval2.getFeedback().getErrorCorrections());
                    task2.getFeedback().setSentenceImprovements(eval2.getFeedback().getSentenceImprovements());
                    task2.getFeedback().setOverallComment(eval2.getFeedback().getOverallComment());
                }

                task2.setEvaluation(eval2.getEvaluation());
                System.out.println("✅ Task 2 graded: " + eval2.getScore());
                task2Success = true;

            } catch (Exception e) {
                System.err.println("❌ Error grading Task 2: " + e.getMessage());
            }
        } else {
            task2Success = true; // không có task2 = ok
        }

        // ---- Tính điểm tổng IELTS ----
        double score1 = 0;
        double score2 = 0;
        boolean hasScore1 = false;
        boolean hasScore2 = false;

        if (task1 != null && task1.getScore() != null && !task1.getScore().trim().isEmpty()) {
            try {
                score1 = Double.parseDouble(task1.getScore().trim());
                hasScore1 = true;
            } catch (NumberFormatException ignored) {}
        }
        if (task2 != null && task2.getScore() != null && !task2.getScore().trim().isEmpty()) {
            try {
                score2 = Double.parseDouble(task2.getScore().trim());
                hasScore2 = true;
            } catch (NumberFormatException ignored) {}
        }

        // IELTS Writing band: Task2 có trọng số gấp đôi Task1
        if (hasScore1 && hasScore2) {
            double rawBand = (score1 + score2 * 2.0) / 3.0;
            answer.setBand(IeltsScoringUtils.calculateIeltsRounding(rawBand));
        } else if (hasScore2) {
            answer.setBand(score2);
        } else if (hasScore1) {
            answer.setBand(score1);
        }

        // ---- Cập nhật trạng thái ----
        if (task1Success && task2Success) {
            answer.setGradingStatus("graded");
        } else if (!task1Success && !task2Success) {
            answer.setGradingStatus("grading_failed");
        } else {
            // Một task thành công, một thất bại → vẫn graded (partial)
            answer.setGradingStatus("graded");
        }

        try {
            writingAnswerRepository.save(answer);
            System.out.println("💾 Writing answer saved with status: " + answer.getGradingStatus()
                    + ", band: " + answer.getBand());
        } catch (Exception e) {
            System.err.println("❌ Failed to save graded writing answer: " + e.getMessage());
        }
    }

    /**
     * Lấy trạng thái chấm điểm của một WritingAnswer.
     */
    public Optional<WritingAnswer> getWritingAnswerById(String id) {
        return writingAnswerRepository.findById(id);
    }
}
