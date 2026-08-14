package web.ielts.Test.ai.rubrics;

import com.fasterxml.jackson.databind.JsonNode;
import web.ielts.Test.ai.model.FleCohAnswer;

import java.util.List;

/**
 * Standardized IELTS Speaking Assessment Rubrics & Prompt Builders.
 * Fully aligned with official IELTS Speaking Public Band Descriptors (British Council / IDP / Cambridge).
 * Returns complete list of all grammar and lexical errors detected in the candidate's response.
 */
public class IeltsSpeakingRubrics {

    // =========================================================================
    // 1. OFFICIAL IELTS SPEAKING BAND DESCRIPTORS (Bands 1 - 9)
    // =========================================================================

    public static final String IELTS_SPEAKING_LEXICAL_RESOURCE = """
            - IELTS Speaking Band Descriptors (Lexical Resource):
              • Band 9: Uses a full and flexible range of vocabulary naturally and accurately. Sustained use of idiomatic language and collocation. Skillful and precise paraphrase.
              • Band 8: Uses a wide vocabulary resource readily and flexibly to discuss all topics and convey precise meaning. Skillful use of less common and idiomatic items despite occasional minor inaccuracies in word choice and collocation. Paraphrases effectively.
              • Band 7: Uses vocabulary resource flexibly to discuss a variety of topics. Shows some ability to use less common and idiomatic items with awareness of style and collocation, though some inappropriacies occur. Uses paraphrase effectively.
              • Band 6: Has a wide enough vocabulary to discuss topics at length and make meaning clear in spite of inappropriacies. Generally able to paraphrase successfully.
              • Band 5: Manages to talk about familiar and unfamiliar topics but uses vocabulary with limited flexibility. Attempts paraphrase but not always with success. Frequent errors in word choice.
              • Band 4: Vocabulary is sufficient for familiar topics but only basic meaning can be conveyed on unfamiliar topics. Frequent errors in word choice and rare attempts at paraphrase.
              • Band 3: Uses simple vocabulary to convey personal information. Very limited vocabulary for unfamiliar topics.
              • Band 2: Only isolated words or memorized phrases. Almost no communication possible without mime or gesture.
              • Band 1: No rateable language / isolated words only.
            """;

    public static final String IELTS_SPEAKING_GRAMMATICAL_RANGE_ACCURACY = """
            - IELTS Speaking Band Descriptors (Grammatical Range and Accuracy):
              • Band 9: Uses a full range of structures naturally and appropriately. Produces consistently accurate structures apart from characteristic native speaker slips.
              • Band 8: Uses a wide range of structures flexibly. The majority of sentences are error-free, with only occasional non-systematic errors or minor inappropriacies.
              • Band 7: Uses a range of complex structures with flexibility. Error-free sentences are frequent, though some grammatical mistakes persist.
              • Band 6: Uses a mix of simple and complex structures, but with limited flexibility. May make frequent mistakes with complex structures, though these rarely cause comprehension problems.
              • Band 5: Produces basic sentence forms with reasonable accuracy. Uses a limited range of more complex structures, but these usually contain errors and may cause some confusion.
              • Band 4: Produces basic sentence forms and some short utterances are error-free. Subordinate clauses are rare, repetitive structures, and errors are frequent.
              • Band 3: Attempts basic sentence forms but errors predominate except in memorized phrases.
              • Band 2: Little or no evidence of basic sentence forms.
              • Band 1: No rateable language.
            """;

    public static final String IELTS_SPEAKING_COHERENCE = """
            - IELTS Speaking Band Descriptors (Coherence):
              • Band 9: Speaks with total coherence and effortless topic development. Uses cohesive devices fully appropriately and naturally throughout.
              • Band 8: Develops topics fully, coherently and appropriately. Uses cohesive devices flexibly and naturally without noticeable awkwardness.
              • Band 7: Speaks at length with clear topic development. Uses a range of connectives and discourse markers flexibly, though there may be occasional misuse or awkwardness.
              • Band 6: Is able to keep talking and develop topics sequentially, though coherence may be lost at times due to occasional repetition or inappropriate linking words.
              • Band 5: Usually maintains flow of speech but uses overused, simplistic, or inappropriate cohesive devices. Coherence is affected by repetition or disjointed ideas.
              • Band 4: Can link simple sentences but ideas are often repetitive or fragmented with frequent breakdowns in coherence.
              • Band 3: Limited ability to link ideas or develop topics logically. Often disconnected or incoherent.
              • Band 2: Utterances are isolated with no logical sequence.
              • Band 1: No coherence; utterances are unrelated or unintelligible.
            """;

    public static final String IELTS_SPEAKING_FLUENCY = """
            - IELTS Speaking Band Descriptors (Fluency & Acoustic Features):
              • Band 9: Speaks fluently with only rare repetition or self-correction. Any hesitation is content-related rather than searching for language. SpeechRate ≥ 3.2 wps, PauseRate ≤ 4.0 pauses/min.
              • Band 8: Speaks fluently with only occasional hesitation, repetition, or self-correction. SpeechRate ≥ 2.8 wps, PauseRate ≤ 7.0 pauses/min.
              • Band 7: Speaks at length without noticeable effort. May demonstrate language-related hesitation at times, or some repetition/self-correction. SpeechRate ≥ 2.5 wps, PauseRate ≤ 10.0 pauses/min.
              • Band 6: Is willing to speak at length, though may lose coherence at times due to occasional hesitation, repetition or self-correction. SpeechRate ≥ 2.2 wps, PauseRate ≤ 14.0 pauses/min.
              • Band 5: Usually maintains flow of speech but uses repetition, self-correction and/or slow speech to keep going. Overuses pauses. SpeechRate ≥ 1.8 wps, PauseRate ≤ 18.0 pauses/min.
              • Band 4: Cannot respond without noticeable pauses and may speak slowly, with frequent repetition and self-correction. SpeechRate ≥ 1.5 wps, PauseRate ≤ 23.0 pauses/min.
              • Band 3: Speaks with long pauses and has limited ability to link simple sentences. SpeechRate ≥ 1.2 wps, PauseRate ≤ 28.0 pauses/min.
              • Band 2: Pauses are long and frequent before nearly every word. SpeechRate ≥ 0.8 wps, PauseRate ≤ 35.0 pauses/min.
              • Band 1: No rateable continuous speech.
            """;

    // =========================================================================
    // 2. STANDARDIZED ERROR TYPES FOR SPEAKING
    // =========================================================================

    public static final String SPEAKING_ERROR_TYPES = """
            • Grammar-related:
            - Grammar: tense
            - Grammar: subject-verb agreement
            - Grammar: article usage
            - Grammar: preposition
            - Grammar: word form
            - Grammar: clause structure
            - Grammar: pronoun usage
            - Grammar: modal verb
            - Grammar: sentence structure
            - Grammar: conditional
            - Grammar: plural/singular form
            
            • Vocabulary-related:
            - Vocabulary: limited range
            - Vocabulary: awkward phrasing
            - Vocabulary: incorrect word
            - Vocabulary: word choice / collocation
            - Vocabulary: informal / inappropriate register
            - Vocabulary: vague expression
            - Vocabulary: unnecessary repetition
            
            • Coherence-related:
            - Coherence: unclear progression of ideas
            - Coherence: lack of logical connectors
            - Coherence: abrupt transitions
            - Coherence: off-topic response
            - Coherence: ideas not fully developed
            - Coherence: repetitive connectives
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

        return "You must return your response STRICTLY in JSON format.\n" +
                "You are an official, certified IELTS Speaking Examiner evaluating an authentic IELTS Speaking Part 1 response.\n\n" +
                "CONTEXT & INSTRUCTIONS FOR PART 1:\n" +
                "- Part 1 consists of short questions about everyday, familiar topics (home, work, studies, hobbies).\n" +
                "- A normal Part 1 response has 2 to 4 full sentences (approx. 15-25 seconds). Do NOT penalize candidates for not speaking like a long presentation.\n" +
                "- If the candidate answers with only a few words or a single incomplete fragment (e.g. \"Yes\", \"football\"), treat it as underdeveloped (Max Band 4.5-5.0).\n" +
                "- Spoken transcripts have no punctuation. Completely IGNORE missing commas, periods, capitalization, or punctuation marks.\n\n" +
                "COMPREHENSIVE ERROR DETECTION REQUIREMENT:\n" +
                "- You MUST scan the ENTIRE transcript and extract ALL grammar errors in 'grammarAnswer.errors' and ALL vocabulary/collocation errors in 'lexicalAnswer.errors'.\n" +
                "- For each error, 'errorText' must be the exact substring from the transcript.\n" +
                "- If no errors exist in a category, return an empty list: \"errors\": [].\n" +
                "- Acoustic Fluency score: " + String.format(java.util.Locale.US, "%.2f", scaledFluency) + " / 9.0 (metrics: " + fluentInfo + ").\n" +
                "- Evaluate Coherence based on the transcript's logical progression and topic development.\n" +
                "- The final Fluency & Coherence score is the balanced average of Acoustic Fluency (" + String.format(java.util.Locale.US, "%.2f", scaledFluency) + ") and your assessed Coherence score, rounded to 0.5 increment.\n\n" +
                "OFFICIAL BAND DESCRIPTORS TO APPLY:\n" +
                IELTS_SPEAKING_LEXICAL_RESOURCE + "\n" +
                IELTS_SPEAKING_GRAMMATICAL_RANGE_ACCURACY + "\n" +
                IELTS_SPEAKING_COHERENCE + "\n\n" +
                "ERROR CLASSIFICATION (Select EXACT errorType only from this list):\n" +
                SPEAKING_ERROR_TYPES + "\n\n" +
                "REQUIRED JSON OUTPUT STRUCTURE (Must be valid parseable JSON with these exact keys):\n" +
                "{\n" +
                "  \"question\": \"The question text\",\n" +
                "  \"transcript\": \"The candidate transcript text\",\n" +
                "  \"grammarAnswer\": {\n" +
                "    \"score\": 7.0,\n" +
                "    \"errors\": [\n" +
                "      {\n" +
                "        \"errorText\": \"exact incorrect phrase from transcript\",\n" +
                "        \"correctText\": \"accurate correction\",\n" +
                "        \"errorType\": \"Grammar: subject-verb agreement\",\n" +
                "        \"explanation\": \"concise explanation of the grammar rule\",\n" +
                "        \"sentenceContext\": \"full sentence containing the error\"\n" +
                "      }\n" +
                "    ]\n" +
                "  },\n" +
                "  \"lexicalAnswer\": {\n" +
                "    \"score\": 7.0,\n" +
                "    \"errors\": [\n" +
                "      {\n" +
                "        \"errorText\": \"exact incorrect phrase from transcript\",\n" +
                "        \"correctText\": \"natural vocabulary alternative\",\n" +
                "        \"errorType\": \"Vocabulary: word choice / collocation\",\n" +
                "        \"explanation\": \"concise explanation of why this word choice is awkward/incorrect\",\n" +
                "        \"sentenceContext\": \"full sentence containing the error\"\n" +
                "      }\n" +
                "    ]\n" +
                "  },\n" +
                "  \"fluencyCohAnswer\": {\n" +
                "    \"score\": 7.0,\n" +
                "    \"comment\": \"Specific feedback regarding speech rate, hesitation, and coherence in Part 1.\"\n" +
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

        return "You must return your response STRICTLY in JSON format.\n" +
                "You are an official, certified IELTS Speaking Examiner evaluating an authentic IELTS Speaking Part 2 (Long Turn) response.\n\n" +
                "CONTEXT & INSTRUCTIONS FOR PART 2:\n" +
                "- The candidate was given a Cue Card with a main topic and prompt guide points.\n" +
                "- The candidate is expected to speak at length (1 to 2 minutes), telling a coherent story/description.\n" +
                "- The bullet points on the cue card are guide suggestions. The key requirement is addressing the main topic and developing ideas naturally.\n" +
                "- If the candidate speaks fewer than 4-5 sentences or stops after 20-30 seconds, cap the score at Band 4.5-5.0 due to insufficient length/development.\n" +
                "- If the response is completely off-topic, assign Band 3.0-4.0 for Fluency & Coherence.\n" +
                "- Spoken transcripts have no punctuation. Completely IGNORE missing commas, periods, capitalization, or punctuation marks.\n\n" +
                "COMPREHENSIVE ERROR DETECTION REQUIREMENT:\n" +
                "- You MUST scan the ENTIRE transcript and extract ALL grammar errors in 'grammarAnswer.errors' and ALL vocabulary/collocation errors in 'lexicalAnswer.errors'.\n" +
                "- For each error, 'errorText' must be the exact substring from the transcript.\n" +
                "- If no errors exist in a category, return an empty list: \"errors\": [].\n" +
                "- Acoustic Fluency score: " + String.format(java.util.Locale.US, "%.2f", scaledFluency) + " / 9.0 (metrics: " + fluentInfo + ").\n" +
                "- Evaluate Coherence based on narrative flow, logical sequencing, and appropriate use of connectives throughout the long turn.\n" +
                "- The final Fluency & Coherence score is the balanced average of Acoustic Fluency (" + String.format(java.util.Locale.US, "%.2f", scaledFluency) + ") and your assessed Coherence score, rounded to 0.5 increment.\n\n" +
                "OFFICIAL BAND DESCRIPTORS TO APPLY:\n" +
                IELTS_SPEAKING_LEXICAL_RESOURCE + "\n" +
                IELTS_SPEAKING_GRAMMATICAL_RANGE_ACCURACY + "\n" +
                IELTS_SPEAKING_COHERENCE + "\n\n" +
                "ERROR CLASSIFICATION (Select EXACT errorType only from this list):\n" +
                SPEAKING_ERROR_TYPES + "\n\n" +
                "REQUIRED JSON OUTPUT STRUCTURE:\n" +
                "{\n" +
                "  \"question\": \"The question text\",\n" +
                "  \"transcript\": \"The candidate transcript text\",\n" +
                "  \"grammarAnswer\": {\n" +
                "    \"score\": 6.5,\n" +
                "    \"errors\": [\n" +
                "      {\n" +
                "        \"errorText\": \"exact incorrect phrase from transcript\",\n" +
                "        \"correctText\": \"accurate correction\",\n" +
                "        \"errorType\": \"Grammar: tense\",\n" +
                "        \"explanation\": \"concise explanation of the grammar rule\",\n" +
                "        \"sentenceContext\": \"full sentence containing the error\"\n" +
                "      }\n" +
                "    ]\n" +
                "  },\n" +
                "  \"lexicalAnswer\": {\n" +
                "    \"score\": 6.5,\n" +
                "    \"errors\": [\n" +
                "      {\n" +
                "        \"errorText\": \"exact incorrect phrase from transcript\",\n" +
                "        \"correctText\": \"natural vocabulary alternative\",\n" +
                "        \"errorType\": \"Vocabulary: word choice / collocation\",\n" +
                "        \"explanation\": \"concise explanation of why this word choice is awkward/incorrect\",\n" +
                "        \"sentenceContext\": \"full sentence containing the error\"\n" +
                "      }\n" +
                "    ]\n" +
                "  },\n" +
                "  \"fluencyCohAnswer\": {\n" +
                "    \"score\": 6.5,\n" +
                "    \"comment\": \"Specific feedback regarding Part 2 long turn performance, topic coverage, and discourse flow.\"\n" +
                "  }\n" +
                "}\n\n" +
                "Cue Card Topic:\n" + question + "\n\n" +
                "Cue Card Points:\n" + cueCardInfo + "\n\n" +
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

        return "You must return your response STRICTLY in JSON format.\n" +
                "You are an official, certified IELTS Speaking Examiner evaluating an authentic IELTS Speaking Part 3 (Two-way Discussion) response.\n\n" +
                "CONTEXT & INSTRUCTIONS FOR PART 3:\n" +
                "- Part 3 requires abstract, in-depth discussion on broader social, cultural, or philosophical issues connected to the Part 2 topic.\n" +
                "- Candidates are evaluated on their ability to express and justify opinions, analyze, hypothesize, and discuss abstract concepts.\n" +
                "- A strong Part 3 response should have clear point elaboration with reasons and examples (typically 3-6 well-developed sentences per answer).\n" +
                "- If the candidate provides a superficial 1-sentence answer, limit Band to ≤ 5.0 for lack of topic development.\n" +
                "- Spoken transcripts have no punctuation. Completely IGNORE missing commas, periods, capitalization, or punctuation marks.\n\n" +
                "COMPREHENSIVE ERROR DETECTION REQUIREMENT:\n" +
                "- You MUST scan the ENTIRE transcript and extract ALL grammar errors in 'grammarAnswer.errors' and ALL vocabulary/collocation errors in 'lexicalAnswer.errors'.\n" +
                "- For each error, 'errorText' must be the exact substring from the transcript.\n" +
                "- If no errors exist in a category, return an empty list: \"errors\": [].\n" +
                "- Acoustic Fluency score: " + String.format(java.util.Locale.US, "%.2f", scaledFluency) + " / 9.0 (metrics: " + fluentInfo + ").\n" +
                "- Evaluate Coherence based on logical argumentation, cause-and-effect reasoning, and sophisticated discourse markers.\n" +
                "- The final Fluency & Coherence score is the balanced average of Acoustic Fluency (" + String.format(java.util.Locale.US, "%.2f", scaledFluency) + ") and your assessed Coherence score, rounded to 0.5 increment.\n\n" +
                "OFFICIAL BAND DESCRIPTORS TO APPLY:\n" +
                IELTS_SPEAKING_LEXICAL_RESOURCE + "\n" +
                IELTS_SPEAKING_GRAMMATICAL_RANGE_ACCURACY + "\n" +
                IELTS_SPEAKING_COHERENCE + "\n\n" +
                "ERROR CLASSIFICATION (Select EXACT errorType only from this list):\n" +
                SPEAKING_ERROR_TYPES + "\n\n" +
                "REQUIRED JSON OUTPUT STRUCTURE:\n" +
                "{\n" +
                "  \"question\": \"The question text\",\n" +
                "  \"transcript\": \"The candidate transcript text\",\n" +
                "  \"grammarAnswer\": {\n" +
                "    \"score\": 7.0,\n" +
                "    \"errors\": [\n" +
                "      {\n" +
                "        \"errorText\": \"exact incorrect phrase from transcript\",\n" +
                "        \"correctText\": \"accurate correction\",\n" +
                "        \"errorType\": \"Grammar: clause structure\",\n" +
                "        \"explanation\": \"concise explanation of the grammar rule\",\n" +
                "        \"sentenceContext\": \"full sentence containing the error\"\n" +
                "      }\n" +
                "    ]\n" +
                "  },\n" +
                "  \"lexicalAnswer\": {\n" +
                "    \"score\": 7.0,\n" +
                "    \"errors\": [\n" +
                "      {\n" +
                "        \"errorText\": \"exact incorrect phrase from transcript\",\n" +
                "        \"correctText\": \"natural vocabulary alternative\",\n" +
                "        \"errorType\": \"Vocabulary: word choice / collocation\",\n" +
                "        \"explanation\": \"concise explanation of why this word choice is awkward/incorrect\",\n" +
                "        \"sentenceContext\": \"full sentence containing the error\"\n" +
                "      }\n" +
                "    ]\n" +
                "  },\n" +
                "  \"fluencyCohAnswer\": {\n" +
                "    \"score\": 7.0,\n" +
                "    \"comment\": \"Specific feedback on Part 3 discussion, argument expansion, and fluency.\"\n" +
                "  }\n" +
                "}\n\n" +
                "Part 3 Question:\n" + question + "\n\n" +
                "Candidate Transcript:\n" + textTranscript + "\n";
    }
}
