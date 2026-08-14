package web.ielts.Test.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import web.ielts.Test.dotest.dto.ListTest;
import web.ielts.Test.dotest.model.Listening;
import web.ielts.Test.dotest.model.Reading;
import web.ielts.Test.dotest.repository.*;
import web.ielts.Test.dotest.service.TestService;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TestServiceTest {

    @Mock
    private TestRepository testRepository;

    @Mock
    private ListeningRepository listeningRepository;

    @Mock
    private ReadingRepository readingRepository;

    @Mock
    private WritingRepository writingRepository;

    @Mock
    private SpeakingRepository speakingRepository;

    @InjectMocks
    private TestService testService;

    @Test
    void testGetTestsGroupedByYear() {
        web.ielts.Test.dotest.model.Test t1 = new web.ielts.Test.dotest.model.Test();
        t1.setTestId("test1");
        t1.setTestTitle("IELTS Academic Test 1");
        t1.setCreatedAt("2025-10-12");

        web.ielts.Test.dotest.model.Test t2 = new web.ielts.Test.dotest.model.Test();
        t2.setTestId("test2");
        t2.setTestTitle("IELTS General Test 1");
        t2.setCreatedAt("2026-05-15");

        when(testRepository.findAll()).thenReturn(List.of(t1, t2));

        Map<Integer, List<ListTest>> result = testService.getTestsGroupedByYear();

        assertEquals(2, result.size());
        assertTrue(result.containsKey(2025));
        assertTrue(result.containsKey(2026));
        assertEquals("test1", result.get(2025).get(0).getId());
    }

    @Test
    void testGetListeningTestsByYear() {
        web.ielts.Test.dotest.model.Test t = new web.ielts.Test.dotest.model.Test();
        t.setTestId("test1");
        t.setTestTitle("IELTS Listening 1");
        t.setCreatedAt("2025-10-12");

        Listening listening = new Listening();
        listening.setTestId("test1");

        when(testRepository.findAll()).thenReturn(List.of(t));
        when(listeningRepository.findAll()).thenReturn(List.of(listening));

        Map<Integer, List<ListTest>> result = testService.getListeningTestsByYear();

        assertEquals(1, result.size());
        assertEquals("test1", result.get(2025).get(0).getId());
    }

    @Test
    void testGetReadingTestsByYear() {
        web.ielts.Test.dotest.model.Test t = new web.ielts.Test.dotest.model.Test();
        t.setTestId("test2");
        t.setTestTitle("IELTS Reading 1");
        t.setCreatedAt("2026-05-15");

        Reading reading = new Reading();
        reading.setTestId("test2");

        when(testRepository.findAll()).thenReturn(List.of(t));
        when(readingRepository.findAll()).thenReturn(List.of(reading));

        Map<Integer, List<ListTest>> result = testService.getReadingTestsByYear();

        assertEquals(1, result.size());
        assertEquals("test2", result.get(2026).get(0).getId());
    }
}
