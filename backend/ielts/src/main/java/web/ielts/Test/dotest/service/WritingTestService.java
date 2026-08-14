package web.ielts.Test.dotest.service;

import org.springframework.beans.factory.annotation.Autowired;
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

    public WritingAnswer saveWritingAnswer(WritingAnswer answer) {
        WritingAnswer savedAnswer = writingAnswerRepository.save(answer);
        if (savedAnswer.getGradingMethod() != null && savedAnswer.getGradingMethod().equalsIgnoreCase("AI")) {
            var task1 = savedAnswer.getTask1();
            if (task1 != null) {
                try {
                    WritingAIResponse eval1 = aiService.WritingTask1(task1.getImageUrl(), task1.getQuestion(), task1.getAnswer());

                    task1.setFeedback(eval1.getFeedback());
                    if (task1.getFeedback() != null && eval1.getFeedback() != null) {
                        task1.getFeedback().setErrorCorrections(eval1.getFeedback().getErrorCorrections());
                        task1.getFeedback().setOverallComment(eval1.getFeedback().getOverallComment());
                        task1.getFeedback().setSentenceImprovements(eval1.getFeedback().getSentenceImprovements());
                    }
                    task1.setSampleAnswer(eval1.getSampleAnswer());
                    task1.setScore(eval1.getScore());
                    task1.setEvaluation(eval1.getEvaluation());

                } catch (Exception e) {
                    System.out.println("Error evaluating Task 1: " + e.getMessage());
                }
            }

            var task2 = savedAnswer.getTask2();
            if (task2 != null) {
                try {
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

                } catch (Exception e) {
                    System.out.println("Error evaluating Task 2: " + e.getMessage());
                }
            }
        }

        double score1 = 0;
        double score2 = 0;
        boolean hasScore1 = false;
        boolean hasScore2 = false;

        var task1 = savedAnswer.getTask1();
        if (task1 != null && task1.getScore() != null && !task1.getScore().trim().isEmpty()) {
            try {
                score1 = Double.parseDouble(task1.getScore().trim());
                hasScore1 = true;
            } catch (NumberFormatException ignored) {}
        }
        var task2 = savedAnswer.getTask2();
        if (task2 != null && task2.getScore() != null && !task2.getScore().trim().isEmpty()) {
            try {
                score2 = Double.parseDouble(task2.getScore().trim());
                hasScore2 = true;
            } catch (NumberFormatException ignored) {}
        }

        if (hasScore1 && hasScore2) {
            double rawBand = (score1 + score2 * 2.0) / 3.0;
            savedAnswer.setBand(IeltsScoringUtils.calculateIeltsRounding(rawBand));
        } else if (hasScore2) {
            savedAnswer.setBand(score2);
        } else if (hasScore1) {
            savedAnswer.setBand(score1);
        }

        return writingAnswerRepository.save(savedAnswer);
    }
}
