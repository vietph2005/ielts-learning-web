package web.ielts.History.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import web.ielts.History.dto.HistoryTest;
import web.ielts.Test.model.TestAnswer;
import web.ielts.Test.model.answer.listening.ListeningAnswer;
import web.ielts.Test.model.answer.reading.ReadingAnswer;
import web.ielts.Test.model.answer.speaking.SpeakingAnswer;
import web.ielts.Test.model.answer.writing.WritingAnswer;
import web.ielts.Test.repository.answer.ListeningAnswerRepository;
import web.ielts.Test.repository.answer.ReadingAnswerRepository;
import web.ielts.Test.repository.answer.SpeakingAnswerRepository;
import web.ielts.Test.repository.answer.WritingAnswerRepository;
import web.ielts.Test.service.TestAnswerService;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class HistoryServiceTest {

    @Mock
    private ReadingAnswerRepository readingAnswerRepository;

    @Mock
    private WritingAnswerRepository writingAnswerRepository;

    @Mock
    private ListeningAnswerRepository listeningAnswerRepository;

    @Mock
    private SpeakingAnswerRepository speakingAnswerRepository;

    @Mock
    private TestAnswerService testAnswerService;

    @InjectMocks
    private HistoryService historyService;

    @Test
    void testGetListeningByUsername() {
        ListeningAnswer ans = new ListeningAnswer();
        ans.setId("ans1");
        ans.setUsername("user1");
        ans.setTestId("testListening");
        ans.setBand(7.0);
        ans.setSubmittedAt(LocalDateTime.of(2026, 8, 8, 12, 0));

        when(listeningAnswerRepository.findByUsername("user1")).thenReturn(List.of(ans));

        List<HistoryTest> result = historyService.getListeningByUsername("user1");

        assertEquals(1, result.size());
        assertEquals("ans1", result.get(0).getId());
        assertEquals("listening", result.get(0).getSkill());
        assertEquals("testListening", result.get(0).getTestID());
        assertEquals(7.0, result.get(0).getBand());
    }

    @Test
    void testGetWritingByUsername() {
        WritingAnswer ans = new WritingAnswer();
        ans.setId("ans2");
        ans.setUsername("user1");
        ans.setTestId("testWriting");
        ans.setBand(6.5);
        ans.setSubmittedAt(LocalDateTime.of(2026, 8, 8, 12, 0));

        when(writingAnswerRepository.findByUsername("user1")).thenReturn(List.of(ans));

        List<HistoryTest> result = historyService.getWritingByUsername("user1");

        assertEquals(1, result.size());
        assertEquals("writing", result.get(0).getSkill());
        assertEquals("testWriting", result.get(0).getTestID());
    }

    @Test
    void testGetSpeakingByUsername() {
        SpeakingAnswer ans = new SpeakingAnswer();
        ans.setId("ans3");
        ans.setUsername("user1");
        ans.setTestId("testSpeaking");
        ans.setBand(8.0);

        when(speakingAnswerRepository.findByUsername("user1")).thenReturn(List.of(ans));

        List<HistoryTest> result = historyService.getSpeakingByUsername("user1");

        assertEquals(1, result.size());
        assertEquals("speaking", result.get(0).getSkill());
        assertEquals("testSpeaking", result.get(0).getTestID());
    }

    @Test
    void testGetReadingByUsername() {
        ReadingAnswer ans = new ReadingAnswer();
        ans.setId("ans4");
        ans.setUsername("user1");
        ans.setTestId("testReading");
        ans.setBand(7.5);

        when(readingAnswerRepository.findByUsername("user1")).thenReturn(List.of(ans));

        List<HistoryTest> result = historyService.getReadingByUsername("user1");

        assertEquals(1, result.size());
        assertEquals("reading", result.get(0).getSkill());
        assertEquals("testReading", result.get(0).getTestID());
    }

    @Test
    void testGetFullTestByUsername_VerifyTestIDCorrectness() {
        TestAnswer ans = new TestAnswer();
        ans.setId("sub1");
        ans.setUsername("user1");
        ans.setTestId("testFulltest");
        ans.setSubmittedAt(LocalDateTime.of(2026, 8, 8, 12, 0));

        when(testAnswerService.getAllByUsername("user1")).thenReturn(List.of(ans));

        List<HistoryTest> result = historyService.getFullTestByUsername("user1");

        assertEquals(1, result.size());
        assertEquals("sub1", result.get(0).getId());
        assertEquals("fulltest", result.get(0).getSkill());
        // Xác minh xem testID có được gán bằng testId của đề thi thay vì ID bản ghi nộp bài (sửa lỗi logic)
        assertEquals("testFulltest", result.get(0).getTestID());
    }
}
