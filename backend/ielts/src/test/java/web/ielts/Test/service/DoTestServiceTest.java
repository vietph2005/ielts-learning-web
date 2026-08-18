package web.ielts.Test.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import web.ielts.Test.dotest.repository.ReadingRepository;
import web.ielts.Test.dotest.service.ReadingTestService;
import web.ielts.Test.dotest.service.WritingTestService;
import web.ielts.Test.result.model.writing.TaskWritingAnswer;
import web.ielts.Test.result.model.writing.WritingAnswer;
import web.ielts.Test.result.repository.ReadingAnswerRepository;
import web.ielts.Test.result.repository.WritingAnswerRepository;
import web.ielts.Test.result.service.IeltsScoringUtils;

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
    private WritingTestService writingTestService;

    @InjectMocks
    private ReadingTestService readingTestService;

    @Test
    void testCalculateIeltsBand() {
        assertEquals(9.0, IeltsScoringUtils.calculateIeltsBand(39, 40));
        assertEquals(8.0, IeltsScoringUtils.calculateIeltsBand(36, 40));
        assertEquals(7.5, IeltsScoringUtils.calculateIeltsBand(34, 40));
        assertEquals(7.0, IeltsScoringUtils.calculateIeltsBand(30, 40));
        assertEquals(6.5, IeltsScoringUtils.calculateIeltsBand(27, 40));
        assertEquals(6.0, IeltsScoringUtils.calculateIeltsBand(23, 40));
        assertEquals(5.5, IeltsScoringUtils.calculateIeltsBand(19, 40));
        assertEquals(5.0, IeltsScoringUtils.calculateIeltsBand(15, 40));
        assertEquals(4.5, IeltsScoringUtils.calculateIeltsBand(13, 40));
        assertEquals(4.0, IeltsScoringUtils.calculateIeltsBand(10, 40));
        assertEquals(1.0, IeltsScoringUtils.calculateIeltsBand(0, 40));
    }

    @Test
    void testCalculateIeltsRounding() {
        assertEquals(6.5, IeltsScoringUtils.calculateIeltsRounding(6.25));
        assertEquals(7.0, IeltsScoringUtils.calculateIeltsRounding(6.75));
        assertEquals(6.0, IeltsScoringUtils.calculateIeltsRounding(6.125));
        assertEquals(6.5, IeltsScoringUtils.calculateIeltsRounding(6.375));
        assertEquals(6.5, IeltsScoringUtils.calculateIeltsRounding(6.625));
        assertEquals(7.0, IeltsScoringUtils.calculateIeltsRounding(6.875));
    }

    @Test
    void testSaveWritingAnswer_StatusAndSaving() {
        WritingAnswer answer = new WritingAnswer();
        answer.setGradingMethod("AI");

        when(writingAnswerRepository.save(any(WritingAnswer.class))).thenAnswer(inv -> inv.getArgument(0));

        WritingAnswer result = writingTestService.saveWritingAnswer(answer);

        assertNotNull(result);
        assertEquals("grading", result.getGradingStatus());
    }

    @Test
    void testCalculateWritingBandScore() {
        double score1 = 6.0;
        double score2 = 7.0;
        double rawBand = (score1 + score2 * 2.0) / 3.0;
        assertEquals(6.5, IeltsScoringUtils.calculateIeltsRounding(rawBand));
    }
}
