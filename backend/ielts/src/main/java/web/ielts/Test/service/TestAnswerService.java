package web.ielts.Test.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web.ielts.Test.model.TestAnswer;
import web.ielts.Test.repository.TestAnswerRepository;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class TestAnswerService {
    @Autowired
    private TestAnswerRepository testAnswerRepository;

    public TestAnswer createTestAnswer(String testId, String username) {
        TestAnswer testAnswer = new TestAnswer(testId, username);
        return testAnswerRepository.save(testAnswer);
    }

    public Optional<TestAnswer> getByTestIdAndUsername(String testId, String username) {
        return testAnswerRepository.findByTestIdAndUsername(testId, username);
    }

    public Optional<TestAnswer> getById(String testAnswerId) {
        return testAnswerRepository.findById(testAnswerId);
    }

    public void updateListeningAnswer(String testAnswerId, String listeningAnswerId) {
        TestAnswer testAnswer = testAnswerRepository.findById(testAnswerId)
            .orElseThrow(() -> new RuntimeException("TestAnswer not found"));
        testAnswer.setListeningAnswerId(listeningAnswerId);
        testAnswerRepository.save(testAnswer);
    }
    public void updateReadingAnswer(String testAnswerId, String readingAnswerId) {
        TestAnswer testAnswer = testAnswerRepository.findById(testAnswerId)
            .orElseThrow(() -> new RuntimeException("TestAnswer not found"));
        testAnswer.setReadingAnswerId(readingAnswerId);
        testAnswerRepository.save(testAnswer);
    }
    public void updateWritingAnswer(String testAnswerId, String writingAnswerId) {
        TestAnswer testAnswer = testAnswerRepository.findById(testAnswerId)
            .orElseThrow(() -> new RuntimeException("TestAnswer not found"));
        testAnswer.setWritingAnswerId(writingAnswerId);
        testAnswerRepository.save(testAnswer);
    }
    public void updateSpeakingAnswer(String testAnswerId, String speakingAnswerId) {
        TestAnswer testAnswer = testAnswerRepository.findById(testAnswerId)
            .orElseThrow(() -> new RuntimeException("TestAnswer not found"));
        testAnswer.setSpeakingAnswerId(speakingAnswerId);
        testAnswer.setSubmittedAt(LocalDateTime.now());
        testAnswerRepository.save(testAnswer);
    }

    public java.util.List<TestAnswer> getAllByUsername(String username) {
        return testAnswerRepository.findAllByUsername(username);
    }
} 