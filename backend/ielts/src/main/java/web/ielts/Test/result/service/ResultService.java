package web.ielts.Test.result.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web.ielts.Test.result.model.listening.ListeningAnswer;
import web.ielts.Test.result.model.reading.ReadingAnswer;
import web.ielts.Test.result.model.speaking.SpeakingAnswer;
import web.ielts.Test.result.repository.ListeningAnswerRepository;
import web.ielts.Test.result.repository.ReadingAnswerRepository;
import web.ielts.Test.result.repository.SpeakingAnswerRepository;
import web.ielts.Test.dotest.repository.ListeningRepository;
import web.ielts.Test.dotest.repository.ReadingRepository;

import java.util.Optional;

@Service
public class ResultService {
    @Autowired
    private ListeningAnswerRepository listeningAnswerRepository;

    @Autowired
    private ReadingAnswerRepository readingAnswerRepository;

    @Autowired
    private SpeakingAnswerRepository speakingAnswerRepository;

    @Autowired
    private ListeningRepository listeningRepository;

    @Autowired
    private ReadingRepository readingRepository;

    public ListeningAnswer saveAnswer(ListeningAnswer answer) {
        return listeningAnswerRepository.save(answer);
    }

    public Optional<ListeningAnswer> findListeningById(String answerId) {
        Optional<ListeningAnswer> opt = listeningAnswerRepository.findById(answerId);
        if (opt.isPresent()) {
            ListeningAnswer answer = opt.get();
            if (answer.getTestId() != null) {
                web.ielts.Test.dotest.model.Listening original = listeningRepository.findByTestId(answer.getTestId());
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
        }
        return opt;
    }

    public Optional<ListeningAnswer> getListeningResult(String testId, String username) {
        return listeningAnswerRepository.findByUsername(username)
                .stream()
                .filter(ans -> ans.getTestId().equals(testId))
                .findFirst();
    }

    public ReadingAnswer saveAnswer(ReadingAnswer answer) {
        return readingAnswerRepository.save(answer);
    }

    public Optional<ReadingAnswer> findReadingById(String answerId) {
        Optional<ReadingAnswer> opt = readingAnswerRepository.findById(answerId);
        if (opt.isPresent()) {
            ReadingAnswer answer = opt.get();
            if (answer.getTestId() != null) {
                web.ielts.Test.dotest.model.Reading original = readingRepository.findByTestId(answer.getTestId());
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
        }
        return opt;
    }

    public Optional<ReadingAnswer> getReadingResult(String testId, String username) {
        return readingAnswerRepository.findByUsername(username)
                .stream()
                .filter(ans -> ans.getTestId().equals(testId))
                .findFirst();
    }

    public Optional<SpeakingAnswer> findSpeakingById(String answerId) {
        return speakingAnswerRepository.findById(answerId);
    }

    public Optional<SpeakingAnswer> getSpeakingResult(String testId, String username) {
        return speakingAnswerRepository.findByUsername(username)
                .stream()
                .filter(ans -> ans.getTestId().equals(testId))
                .findFirst();
    }
}
