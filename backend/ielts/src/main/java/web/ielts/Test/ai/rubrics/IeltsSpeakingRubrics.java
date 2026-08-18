package web.ielts.Test.ai.rubrics;

import com.fasterxml.jackson.databind.JsonNode;
import web.ielts.Test.ai.model.FleCohAnswer;

import java.util.List;

/**
 * Standardized IELTS Speaking Assessment Rubrics & Prompt Builders.
 * Fully aligned with official IELTS Speaking Public Band Descriptors (British Council / IDP / Cambridge).
 * Highly optimized for token efficiency and strict error extraction.
 */
public class IeltsSpeakingRubrics {

    // =========================================================================
    // 1. CONCISE OFFICIAL IELTS SPEAKING BAND ANCHORS (High-Density Rubric)
    // =========================================================================

    public static final String IELTS_SPEAKING_CORE_RUBRICS = """
            - Lexical Resource (LR):
              • Band 9: Full flexibility, sophisticated collocations & idiomatic precision.
              • Band 7.5-8.0: Wide vocabulary, effective collocations & paraphrase, rare minor inaccuracies.
              • Band 6.0-7.0: Sufficient range for length/detail, clear meaning despite some awkward word choices.
              • Band 4.5-5.5: Limited flexibility, basic vocabulary on familiar topics, frequent word choice errors.
              • Band <= 4.0: Extremely limited vocabulary, isolated words only.
            
            - Grammatical Range & Accuracy (GRA):
              • Band 9: Wide range of structures flexibly and naturally, consistently error-free.
              • Band 7.5-8.0: Frequent complex sentences, majority error-free, only minor non-systematic slips.
              • Band 6.0-7.0: Mix of simple and complex structures; mistakes occur but rarely impede meaning.
              • Band 4.5-5.5: Basic sentence forms reasonably accurate; complex structures contain errors.
              • Band <= 4.0: Repetitive simple structures with predominant errors.
            
            - Coherence & Topic Relevance (FC):
              • Band 9: Effortless topic development, natural logical flow and discourse markers.
              • Band 7.5-8.0: Fully develops topic with clear progression and flexible connectives.
              • Band 6.0-7.0: Keeps talking with sequential development, occasional repetition or awkward linking.
              • Band 4.5-5.5: Simplistic or repetitive connectives; disjointed ideas.
              • RELEVANCE RULE: If the answer is completely OFF-TOPIC, cap Coherence score at <= 3.5. If underdeveloped (1-2 words), cap at <= 4.5.
            """;

    // =========================================================================
    // 2. STANDARDIZED ERROR CATEGORIES FOR SPEAKING
    // =========================================================================

    public static final String SPEAKING_ERROR_TYPES = """
            Grammar: tense, subject-verb agreement, article usage, preposition, word form, clause structure, pronoun, modal verb, sentence structure, conditional, plural/singular form.
            Vocabulary: limited range, awkward phrasing, incorrect word, word choice / collocation, informal register, unnecessary repetition.
            Coherence: unclear progression, lack of connectors, off-topic response, underdeveloped idea.
            """;

    // =========================================================================
    // 3. UTILITY METHODS
    // =========================================================================

    public static String extractTranscriptText(JsonNode transcript) {
        if (transcript == null) return "";
        if (transcript.has("text") && !transcript.get("text").isNull()) {
            return transcript.get("text").asText();
        }
        if (transcript.isTextual()) {
            return transcript.asText();
        }
        return transcript.asText();
    }

    // =========================================================================
    // 4. PROMPT BUILDERS FOR SPEAKING PARTS 1, 2, 3
    // =========================================================================

    /**
     * Builds the prompt for IELTS Speaking Part 1 (Introduction & Interview).
     */
    public static String buildSpeakingPart1Prompt(
            String question,
            JsonNode transcript,
            FleCohAnswer basicFluent,
            double fluentScore
    ) {
        double scaledFluency = 1.0 + (fluentScore / 100.0) * 8.0;
        String textTranscript = extractTranscriptText(transcript);
        String fluentInfo = basicFluent != null ? basicFluent.toString() : "N/A";

        return "You must return your response STRICTLY in valid JSON format.\n" +
                "You are an official IELTS Speaking Examiner evaluating Speaking Part 1 (2-4 conversational sentences).\n" +
                "- Spoken transcripts have no punctuation. Completely IGNORE missing punctuation or capitalization.\n" +
                "- Extract key genuine errors (max 5 in grammarAnswer.errors, max 5 in lexicalAnswer.errors). errorText must be exact substring. Keep explanations concise.\n" +
                "- Acoustic Fluency: " + String.format(java.util.Locale.US, "%.2f", scaledFluency) + " / 9.0 (metrics: " + fluentInfo + ").\n" +
                "- Evaluate Coherence from topic progression, connectives, and relevance. If off-topic, cap Coherence <= 3.5.\n" +
                "- Final Fluency & Coherence score = balanced average of Acoustic Fluency and your assessed Coherence score, rounded to 0.5 increment.\n\n" +
                "IELTS RUBRIC ANCHORS:\n" +
                IELTS_SPEAKING_CORE_RUBRICS + "\n" +
                "ERROR TYPES: " + SPEAKING_ERROR_TYPES + "\n\n" +
                "REQUIRED JSON OUTPUT STRUCTURE:\n" +
                "{\n" +
                "  \"question\": \"The question text\",\n" +
                "  \"transcript\": \"The candidate transcript text\",\n" +
                "  \"grammarAnswer\": {\n" +
                "    \"score\": 7.0,\n" +
                "    \"comment\": \"Concise feedback on grammatical structures and accuracy.\",\n" +
                "    \"errors\": [{\"errorText\": \"...\", \"correctText\": \"...\", \"errorType\": \"Grammar: tense\", \"explanation\": \"concise 1-sentence note\", \"sentenceContext\": \"full sentence\"}]\n" +
                "  },\n" +
                "  \"lexicalAnswer\": {\n" +
                "    \"score\": 7.0,\n" +
                "    \"comment\": \"Concise feedback on vocabulary range, collocations, and precision.\",\n" +
                "    \"errors\": [{\"errorText\": \"...\", \"correctText\": \"...\", \"errorType\": \"Vocabulary: word choice / collocation\", \"explanation\": \"concise 1-sentence note\", \"sentenceContext\": \"full sentence\"}]\n" +
                "  },\n" +
                "  \"fluencyCohAnswer\": {\n" +
                "    \"score\": 7.0,\n" +
                "    \"comment\": \"Specific concise feedback regarding fluency and coherence in Part 1.\"\n" +
                "  }\n" +
                "}\n\n" +
                "Candidate Question:\n" + question + "\n\n" +
                "Candidate Transcript:\n" + textTranscript + "\n";
    }

    /**
     * Builds the prompt for IELTS Speaking Part 2 (Individual Long Turn / Cue Card).
     */
    public static String buildSpeakingPart2Prompt(
            String question,
            JsonNode transcript,
            List<String> cueCards,
            FleCohAnswer basicFluent,
            double fluentScore
    ) {
        double scaledFluency = 1.0 + (fluentScore / 100.0) * 8.0;
        String textTranscript = extractTranscriptText(transcript);
        String fluentInfo = basicFluent != null ? basicFluent.toString() : "N/A";
        String cueCardInfo = cueCards != null ? cueCards.toString() : "N/A";

        return "You must return your response STRICTLY in valid JSON format.\n" +
                "You are an official IELTS Speaking Examiner evaluating Speaking Part 2 (Long Turn 1-2 minutes).\n" +
                "- Spoken transcripts have no punctuation. Completely IGNORE missing punctuation or capitalization.\n" +
                "- Extract key genuine errors (max 8 in grammarAnswer.errors, max 8 in lexicalAnswer.errors). errorText must be exact substring. Keep explanations concise.\n" +
                "- If speaking < 30 seconds or off-topic, cap score <= 4.5.\n" +
                "- Acoustic Fluency: " + String.format(java.util.Locale.US, "%.2f", scaledFluency) + " / 9.0 (metrics: " + fluentInfo + ").\n" +
                "- Final Fluency & Coherence score = balanced average of Acoustic Fluency and assessed Coherence score, rounded to 0.5 increment.\n\n" +
                "IELTS RUBRIC ANCHORS:\n" +
                IELTS_SPEAKING_CORE_RUBRICS + "\n" +
                "ERROR TYPES: " + SPEAKING_ERROR_TYPES + "\n\n" +
                "REQUIRED JSON OUTPUT STRUCTURE:\n" +
                "{\n" +
                "  \"question\": \"The question text\",\n" +
                "  \"transcript\": \"The candidate transcript text\",\n" +
                "  \"grammarAnswer\": {\n" +
                "    \"score\": 6.5,\n" +
                "    \"comment\": \"Concise feedback on grammatical structures and accuracy in Part 2.\",\n" +
                "    \"errors\": [{\"errorText\": \"...\", \"correctText\": \"...\", \"errorType\": \"Grammar: tense\", \"explanation\": \"concise 1-sentence note\", \"sentenceContext\": \"full sentence\"}]\n" +
                "  },\n" +
                "  \"lexicalAnswer\": {\n" +
                "    \"score\": 6.5,\n" +
                "    \"comment\": \"Concise feedback on vocabulary range, collocations, and precision in Part 2.\",\n" +
                "    \"errors\": [{\"errorText\": \"...\", \"correctText\": \"...\", \"errorType\": \"Vocabulary: word choice / collocation\", \"explanation\": \"concise 1-sentence note\", \"sentenceContext\": \"full sentence\"}]\n" +
                "  },\n" +
                "  \"fluencyCohAnswer\": {\n" +
                "    \"score\": 6.5,\n" +
                "    \"comment\": \"Specific concise feedback regarding Part 2 topic coverage and discourse flow.\"\n" +
                "  }\n" +
                "}\n\n" +
                "Cue Card Topic: " + question + "\n" +
                "Cue Card Points: " + cueCardInfo + "\n" +
                "Candidate Transcript:\n" + textTranscript + "\n";
    }

    /**
     * Builds the prompt for IELTS Speaking Part 3 (Two-way Discussion).
     */
    public static String buildSpeakingPart3Prompt(
            String question,
            JsonNode transcript,
            FleCohAnswer basicFluent,
            double fluentScore
    ) {
        double scaledFluency = 1.0 + (fluentScore / 100.0) * 8.0;
        String textTranscript = extractTranscriptText(transcript);
        String fluentInfo = basicFluent != null ? basicFluent.toString() : "N/A";

        return "You must return your response STRICTLY in valid JSON format.\n" +
                "You are an official IELTS Speaking Examiner evaluating Speaking Part 3 (In-depth abstract discussion).\n" +
                "- Spoken transcripts have no punctuation. Completely IGNORE missing punctuation or capitalization.\n" +
                "- Extract key genuine errors (max 6 in grammarAnswer.errors, max 6 in lexicalAnswer.errors). errorText must be exact substring. Keep explanations concise.\n" +
                "- If off-topic or superficial (1 sentence), cap Coherence <= 4.0.\n" +
                "- Acoustic Fluency: " + String.format(java.util.Locale.US, "%.2f", scaledFluency) + " / 9.0 (metrics: " + fluentInfo + ").\n" +
                "- Final Fluency & Coherence score = balanced average of Acoustic Fluency and assessed Coherence score, rounded to 0.5 increment.\n\n" +
                "IELTS RUBRIC ANCHORS:\n" +
                IELTS_SPEAKING_CORE_RUBRICS + "\n" +
                "ERROR TYPES: " + SPEAKING_ERROR_TYPES + "\n\n" +
                "REQUIRED JSON OUTPUT STRUCTURE:\n" +
                "{\n" +
                "  \"question\": \"The question text\",\n" +
                "  \"transcript\": \"The candidate transcript text\",\n" +
                "  \"grammarAnswer\": {\n" +
                "    \"score\": 7.0,\n" +
                "    \"comment\": \"Concise feedback on grammatical structures and accuracy in Part 3.\",\n" +
                "    \"errors\": [{\"errorText\": \"...\", \"correctText\": \"...\", \"errorType\": \"Grammar: clause structure\", \"explanation\": \"concise 1-sentence note\", \"sentenceContext\": \"full sentence\"}]\n" +
                "  },\n" +
                "  \"lexicalAnswer\": {\n" +
                "    \"score\": 7.0,\n" +
                "    \"comment\": \"Concise feedback on vocabulary range, collocations, and precision in Part 3.\",\n" +
                "    \"errors\": [{\"errorText\": \"...\", \"correctText\": \"...\", \"errorType\": \"Vocabulary: word choice / collocation\", \"explanation\": \"concise 1-sentence note\", \"sentenceContext\": \"full sentence\"}]\n" +
                "  },\n" +
                "  \"fluencyCohAnswer\": {\n" +
                "    \"score\": 7.0,\n" +
                "    \"comment\": \"Specific concise feedback on Part 3 discussion, argument expansion, and fluency.\"\n" +
                "  }\n" +
                "}\n\n" +
                "Part 3 Question: " + question + "\n" +
                "Candidate Transcript:\n" + textTranscript + "\n";
    }
}
