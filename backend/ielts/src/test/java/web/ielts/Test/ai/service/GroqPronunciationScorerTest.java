package web.ielts.Test.ai.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import web.ielts.Test.ai.model.FeedBackAI;
import web.ielts.Test.ai.model.IntonationSentence;
import web.ielts.Test.ai.model.StressMismatch;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class GroqPronunciationScorerTest {

    private GroqPronunciationScorer scorer;

    @BeforeEach
    void setUp() {
        scorer = new GroqPronunciationScorer();
    }

    @Test
    void testExtractImportantWordsLocally_FiltersFunctionWords() {
        List<String> words = List.of("I", "really", "want", "to", "study", "computer", "science", "at", "university");
        List<IntonationSentence> result = scorer.extractImportantWordsLocally(words);

        assertNotNull(result);
        assertFalse(result.isEmpty());

        List<String> resultTexts = result.stream().map(IntonationSentence::getText).toList();
        assertTrue(resultTexts.contains("really"));
        assertTrue(resultTexts.contains("study"));
        assertTrue(resultTexts.contains("computer"));
        assertTrue(resultTexts.contains("science"));
        assertTrue(resultTexts.contains("university"));

        // Function words should be excluded
        assertFalse(resultTexts.contains("I"));
        assertFalse(resultTexts.contains("to"));
        assertFalse(resultTexts.contains("at"));
    }

    @Test
    void testScorePronunciation_HeuristicAndMathematicalScoring() {
        String transcript = "I definitely prefer living in a bustling city.";
        int totalWords = 8;

        List<IntonationSentence> importantWords = List.of(
                new IntonationSentence("definitely", 1),
                new IntonationSentence("prefer", 2),
                new IntonationSentence("living", 3),
                new IntonationSentence("bustling", 6),
                new IntonationSentence("city", 7)
        );

        List<IntonationSentence> emphasizedWords = List.of(
                new IntonationSentence("definitely", 1),
                new IntonationSentence("prefer", 2),
                new IntonationSentence("bustling", 6),
                new IntonationSentence("city", 7)
        );

        List<IntonationSentence> correct = List.of(
                new IntonationSentence("definitely", 1),
                new IntonationSentence("prefer", 2),
                new IntonationSentence("bustling", 6),
                new IntonationSentence("city", 7)
        );

        List<IntonationSentence> missing = List.of(
                new IntonationSentence("living", 3)
        );

        List<IntonationSentence> over = List.of();

        List<StressMismatch> stressMismatches = List.of(); // 0 stress errors

        FeedBackAI feedback = scorer.scorePronunciation(
                transcript,
                stressMismatches,
                importantWords,
                emphasizedWords,
                correct,
                missing,
                over,
                80.0,
                totalWords,
                1
        );

        assertNotNull(feedback);
        assertTrue(feedback.getScore() >= 7.0 && feedback.getScore() <= 9.0, "Score should reflect high performance (7.0 - 9.0)");
        assertNotNull(feedback.getComment());
    }

    @Test
    void testCalculateHeuristicScore_WeightedMath() {
        FeedBackAI feedback = scorer.calculateHeuristicScore(92.0, 85.0, 1, 8.0);

        assertNotNull(feedback);
        assertEquals(8.0, feedback.getScore());
        assertTrue(feedback.getComment().contains("92.0%"));
        assertTrue(feedback.getComment().contains("85.0%"));
    }
}
