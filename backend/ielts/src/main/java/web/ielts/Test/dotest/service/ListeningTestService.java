package web.ielts.Test.dotest.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web.ielts.Test.dotest.model.Listening;
import web.ielts.Test.result.model.listening.ListeningAnswer;
import web.ielts.Test.dotest.repository.ListeningRepository;
import web.ielts.Test.result.repository.ListeningAnswerRepository;
import web.ielts.Test.result.service.IeltsScoringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ListeningTestService {

    @Autowired
    private ListeningRepository listeningRepository;

    @Autowired
    private ListeningAnswerRepository listeningAnswerRepository;

    public List<Listening> getAllListeningTests() {
        return listeningRepository.findAll();
    }

    public Listening getListeningByTestId(String testId) {
        return listeningRepository.findByTestId(testId);
    }

    public ListeningAnswer saveListeningAnswer(ListeningAnswer answer) {
        if (answer.getTestId() != null) {
            Listening original = listeningRepository.findByTestId(answer.getTestId());
            if (original != null && original.getTasks() != null && answer.getTasks() != null) {
                for (int t = 0; t < Math.min(original.getTasks().size(), answer.getTasks().size()); t++) {
                    var origTask = original.getTasks().get(t);
                    var ansTask = answer.getTasks().get(t);
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

        if (answer.getTasks() != null) {
            for (var task : answer.getTasks()) {
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

        return listeningAnswerRepository.save(answer);
    }
}
