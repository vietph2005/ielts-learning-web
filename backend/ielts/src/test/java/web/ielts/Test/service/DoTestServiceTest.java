package web.ielts.Test.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import web.ielts.Test.model.answer.writing.TaskWritingAnswer;
import web.ielts.Test.model.answer.writing.WritingAnswer;
import web.ielts.Test.repository.ReadingRepository;
import web.ielts.Test.repository.answer.ReadingAnswerRepository;
import web.ielts.Test.repository.answer.WritingAnswerRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoTestServiceTest {

    @Mock
    private ReadingAnswerRepository readingAnswerRepository;

    @Mock
    private ReadingRepository readingRepository;

    @Mock
    private WritingAnswerRepository writingAnswerRepository;

    @InjectMocks
    private DoTestService doTestService;

    @Test
    void testCalculateIeltsBand() {
        // Gọi method private thông qua Reflection
        assertEquals(9.0, ReflectionTestUtils.invokeMethod(doTestService, "calculateIeltsBand", 39, 40));
        assertEquals(8.0, ReflectionTestUtils.invokeMethod(doTestService, "calculateIeltsBand", 36, 40));
        assertEquals(7.5, ReflectionTestUtils.invokeMethod(doTestService, "calculateIeltsBand", 34, 40));
        assertEquals(7.0, ReflectionTestUtils.invokeMethod(doTestService, "calculateIeltsBand", 30, 40));
        assertEquals(6.5, ReflectionTestUtils.invokeMethod(doTestService, "calculateIeltsBand", 27, 40));
        assertEquals(6.0, ReflectionTestUtils.invokeMethod(doTestService, "calculateIeltsBand", 23, 40));
        assertEquals(5.5, ReflectionTestUtils.invokeMethod(doTestService, "calculateIeltsBand", 19, 40));
        assertEquals(5.0, ReflectionTestUtils.invokeMethod(doTestService, "calculateIeltsBand", 15, 40));
        assertEquals(4.5, ReflectionTestUtils.invokeMethod(doTestService, "calculateIeltsBand", 13, 40));
        assertEquals(4.0, ReflectionTestUtils.invokeMethod(doTestService, "calculateIeltsBand", 10, 40));
        assertEquals(1.0, ReflectionTestUtils.invokeMethod(doTestService, "calculateIeltsBand", 0, 40));
    }

    @Test
    void testCalculateIeltsRounding() {
        // Gọi method private thông qua Reflection
        assertEquals(6.5, ReflectionTestUtils.invokeMethod(doTestService, "calculateIeltsRounding", 6.25));
        assertEquals(7.0, ReflectionTestUtils.invokeMethod(doTestService, "calculateIeltsRounding", 6.75));
        assertEquals(6.0, ReflectionTestUtils.invokeMethod(doTestService, "calculateIeltsRounding", 6.125));
        assertEquals(6.5, ReflectionTestUtils.invokeMethod(doTestService, "calculateIeltsRounding", 6.375));
        assertEquals(6.5, ReflectionTestUtils.invokeMethod(doTestService, "calculateIeltsRounding", 6.625));
        assertEquals(7.0, ReflectionTestUtils.invokeMethod(doTestService, "calculateIeltsRounding", 6.875));
    }

    @Test
    void testSaveWritingAnswer_OverallBandCalculation() {
        WritingAnswer answer = new WritingAnswer();
        answer.setGradingMethod("AI");

        TaskWritingAnswer task1 = new TaskWritingAnswer();
        task1.setScore("6.0");
        TaskWritingAnswer task2 = new TaskWritingAnswer();
        task2.setScore("7.0");

        answer.setTask1(task1);
        answer.setTask2(task2);

        // Mock repository save
        when(writingAnswerRepository.save(any(WritingAnswer.class))).thenAnswer(inv -> inv.getArgument(0));

        WritingAnswer result = doTestService.saveWritingAnswer(answer);

        // (6.0 + 7.0*2) / 3 = 6.666...
        // 6.666... làm tròn theo quy tắc IELTS -> 6.5
        assertEquals(6.5, result.getBand());
    }
}
