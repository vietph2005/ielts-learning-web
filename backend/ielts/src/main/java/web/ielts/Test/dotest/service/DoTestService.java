package web.ielts.Test.dotest.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import web.ielts.Test.dotest.model.*;
import web.ielts.Test.result.model.listening.ListeningAnswer;
import web.ielts.Test.result.model.reading.ReadingAnswer;
import web.ielts.Test.ai.model.FleCohAnswer;
import web.ielts.Test.result.model.speaking.SpeakingAnswer;
import web.ielts.Test.result.model.writing.WritingAnswer;
import web.ielts.Test.dotest.repository.TestRepository;
import web.ielts.Test.result.service.IeltsScoringUtils;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class DoTestService {

    @Autowired
    private TestRepository testRepository;

    @Autowired
    private ReadingTestService readingTestService;

    @Autowired
    private ListeningTestService listeningTestService;

    @Autowired
    private WritingTestService writingTestService;

    @Autowired
    private SpeakingTestService speakingTestService;

    // ==================== Full Test ====================
    public Test getTestByTestId(String testId) {
        return testRepository.findById(testId).orElse(null);
    }

    // ==================== Reading ====================
    public Reading getReadingByTestId(String testId) {
        return readingTestService.getReadingByTestId(testId);
    }

    public ReadingAnswer saveReadingAnswer(ReadingAnswer answer) {
        return readingTestService.saveReadingAnswer(answer);
    }

    // ==================== Listening ====================
    public List<Listening> getAllListeningTests() {
        return listeningTestService.getAllListeningTests();
    }

    public Listening getListeningByTestId(String testId) {
        return listeningTestService.getListeningByTestId(testId);
    }

    public ListeningAnswer saveListeningAnswer(ListeningAnswer answer) {
        return listeningTestService.saveListeningAnswer(answer);
    }

    // ==================== Writing ====================
    public Optional<Writing> getWritingByTestId(String testId) {
        return writingTestService.getWritingByTestId(testId);
    }

    public WritingAnswer saveWritingAnswer(WritingAnswer answer) {
        return writingTestService.saveWritingAnswer(answer);
    }

    // ==================== Speaking ====================
    public Speaking getSpeakingByTestId(String testId) {
        return speakingTestService.getSpeakingByTestId(testId);
    }

    public SpeakingAnswer saveSubmission(SpeakingAnswer submission) {
        return speakingTestService.saveSubmission(submission);
    }

    public void updateAnswerUrls(SpeakingAnswer speakingAnswer, Map<String, String> fileUrlMap) {
        speakingTestService.updateAnswerUrls(speakingAnswer, fileUrlMap);
    }

    public double calculatePraatFluencyScore(FleCohAnswer basicFluent) {
        return speakingTestService.calculatePraatFluencyScore(basicFluent);
    }

    public String uploadFile(MultipartFile file, String subfolder, String role, String username) throws IOException {
        return speakingTestService.uploadFile(file, subfolder, role, username);
    }

    public String uploadFile(MultipartFile file, String key) throws IOException {
        return speakingTestService.uploadFile(file, key);
    }

    // ==================== Utility Delegations ====================
    public boolean isAnswerCorrect(String type, String correctAnswer, String studentAnswer) {
        return IeltsScoringUtils.isAnswerCorrect(type, correctAnswer, studentAnswer);
    }

    public double calculateIeltsBand(int correctAnswers, int totalQuestions) {
        return IeltsScoringUtils.calculateIeltsBand(correctAnswers, totalQuestions);
    }

    public double calculateIeltsRounding(double average) {
        return IeltsScoringUtils.calculateIeltsRounding(average);
    }
}
