package web.ielts.Test.dotest.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web.ielts.Test.dotest.model.Reading;
import web.ielts.Test.result.model.reading.ReadingAnswer;
import web.ielts.Test.dotest.repository.ReadingRepository;
import web.ielts.Test.result.repository.ReadingAnswerRepository;
import web.ielts.Test.result.service.IeltsScoringUtils;

import java.time.LocalDateTime;

@Service
public class ReadingTestService {

    @Autowired
    private ReadingRepository readingRepository;

    @Autowired
    private ReadingAnswerRepository readingAnswerRepository;

    public Reading getReadingByTestId(String testId) {
        return readingRepository.findByTestId(testId);
    }

    public ReadingAnswer saveReadingAnswer(ReadingAnswer answer) {
        if (answer.getTestId() != null) {
            Reading original = readingRepository.findByTestId(answer.getTestId());
            if (original != null && original.getTasks() != null && answer.getTaskReadingAnswer() != null) {
                for (int t = 0; t < Math.min(original.getTasks().size(), answer.getTaskReadingAnswer().size()); t++) {
                    var origTask = original.getTasks().get(t);
                    var ansTask = answer.getTaskReadingAnswer().get(t);
                    if (origTask.getSections() != null && ansTask.getSections() != null) {
                        for (int s = 0; s < Math.min(origTask.getSections().size(), ansTask.getSections().size()); s++) {
                            var origSec = origTask.getSections().get(s);
                            var ansSec = ansTask.getSections().get(s);
                            if (origSec.getQuestions() != null && ansSec.getQuestions() != null) {
                                for (int q = 0; q < Math.min(origSec.getQuestions().size(), ansSec.getQuestions().size()); q++) {
                                    var origQ = origSec.getQuestions().get(q);
                                    var ansQ = ansSec.getQuestions().get(q);
                                    if ((ansQ.getExplanation() == null || ansQ.getExplanation().isEmpty()) && origQ.getExplanation() != null) {
                                        ansQ.setExplanation(origQ.getExplanation());
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        int totalQuestions = 0;
        int correctAnswers = 0;

        if (answer.getTaskReadingAnswer() != null) {
            for (var task : answer.getTaskReadingAnswer()) {
                if (task.getSections() != null) {
                    for (var section : task.getSections()) {
                        String type = section.getType();
                        if (section.getQuestions() != null) {
                            for (var q : section.getQuestions()) {
                                totalQuestions++;
                                if (IeltsScoringUtils.isAnswerCorrect(type, q.getAnswer(), q.getStudentAnswer())) {
                                    correctAnswers++;
                                }
                            }
                        }
                    }
                }
            }
        }

        answer.setTotalQuestions(totalQuestions);
        answer.setTotalCorrect(correctAnswers);

        double band = IeltsScoringUtils.calculateIeltsBand(correctAnswers, totalQuestions);
        answer.setBand(band);

        if (answer.getSubmittedAt() == null) {
            answer.setSubmittedAt(LocalDateTime.now());
        }

        return readingAnswerRepository.save(answer);
    }
}
