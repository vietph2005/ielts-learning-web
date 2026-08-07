package web.ielts.History.service;

import org.springframework.beans.factory.annotation.Autowired;
import web.ielts.History.dto.HistoryTest;
import web.ielts.Test.model.answer.listening.ListeningAnswer;
import web.ielts.Test.model.answer.reading.ReadingAnswer;
import web.ielts.Test.model.answer.speaking.SpeakingAnswer;
import web.ielts.Test.model.answer.writing.WritingAnswer;
import org.springframework.stereotype.Service;
import web.ielts.Test.repository.answer.ListeningAnswerRepository;
import web.ielts.Test.repository.answer.ReadingAnswerRepository;
import web.ielts.Test.repository.answer.SpeakingAnswerRepository;
import web.ielts.Test.repository.answer.WritingAnswerRepository;
import web.ielts.Test.service.TestAnswerService;
import web.ielts.Test.model.TestAnswer;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class HistoryService {

    @Autowired
    private ReadingAnswerRepository readingAnswerRepository;

    @Autowired
    private WritingAnswerRepository writingAnswerRepository;

    @Autowired
    private ListeningAnswerRepository listeningAnswerRepository;
    
    @Autowired
    private SpeakingAnswerRepository speakingAnswerRepository;
    @Autowired
    private TestAnswerService testAnswerService;

    public List<HistoryTest> getListeningByUsername(String username) {
        System.out.println("DEBUG: Searching listening answers for username: " + username);
        List<ListeningAnswer> answers = listeningAnswerRepository.findByUsername(username);
        System.out.println("DEBUG: Found " + answers.size() + " listening answers");
        
        List<HistoryTest> historyTests = answers.stream().map(answer -> {
            HistoryTest history = new HistoryTest();
            history.setId(answer.getId());
            history.setUsername(answer.getUsername());
            history.setSkill("listening");
            history.setTestID(answer.getTestId());
            history.setBand(answer.getBand());
            history.setSubmittedAt(answer.getSubmittedAt());
            return history;
        }).collect(Collectors.toList());
        return historyTests;
    }

    public List<HistoryTest> getWritingByUsername(String username) {
        System.out.println("DEBUG: Searching writing answers for username: " + username);
        List<WritingAnswer> answers = writingAnswerRepository.findByUsername(username);
        System.out.println("DEBUG: Found " + answers.size() + " writing answers");
        
        List<HistoryTest> historyTests = answers.stream().map(answer -> {
            HistoryTest history = new HistoryTest();
            history.setId(answer.getId());
            history.setUsername(answer.getUsername());
            history.setSkill("writing");
            history.setTestID(answer.getTestId());
            history.setBand(answer.getBand());
            history.setSubmittedAt(answer.getSubmittedAt());
            return history;
        }).collect(Collectors.toList());
        return historyTests;
    }

    public List<HistoryTest> getSpeakingByUsername(String username) {
        System.out.println("DEBUG: Searching speaking answers for username: " + username);
        List<SpeakingAnswer> answers = speakingAnswerRepository.findByUsername(username);
        System.out.println("DEBUG: Found " + answers.size() + " speaking answers");
        
        List<HistoryTest> historyTests = answers.stream().map(answer -> {
            HistoryTest history = new HistoryTest();
            history.setId(answer.getId());
            history.setUsername(answer.getUsername());
            history.setSkill("speaking");
            history.setTestID(answer.getTestId());
            history.setBand(answer.getBand());
            history.setSubmittedAt(answer.getSubmittedAt());
            return history;
        }).collect(Collectors.toList());
        return historyTests;
    }

    public List<HistoryTest> getReadingByUsername(String username) {
        System.out.println("DEBUG: Searching reading answers for username: " + username);
        List<ReadingAnswer> answers = readingAnswerRepository.findByUsername(username);
        System.out.println("DEBUG: Found " + answers.size() + " reading answers");
        
        List<HistoryTest> historyTests = answers.stream().map(answer -> {
            HistoryTest history = new HistoryTest();
            history.setId(answer.getId());
            history.setUsername(answer.getUsername());
            history.setSkill("reading");
            history.setTestID(answer.getTestId());
            history.setBand(answer.getBand());
            history.setSubmittedAt(answer.getSubmittedAt());
            return history;
        }).collect(Collectors.toList());
        return historyTests;
    }

    public List<HistoryTest> getFullTestByUsername(String username) {
        List<TestAnswer> answers = testAnswerService.getAllByUsername(username);
        List<HistoryTest> historyTests = answers.stream().map(answer -> {
            HistoryTest history = new HistoryTest();
            history.setId(answer.getId());
            history.setUsername(answer.getUsername());
            history.setSkill("fulltest");
            history.setTestID(answer.getId());
            history.setBand(0);
            history.setSubmittedAt(answer.getSubmittedAt());
            return history;
        }).collect(java.util.stream.Collectors.toList());
        return historyTests;
    }
}
