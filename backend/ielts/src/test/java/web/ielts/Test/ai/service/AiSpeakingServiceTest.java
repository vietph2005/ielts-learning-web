package web.ielts.Test.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import web.ielts.Test.ai.model.FleCohAnswer;
import web.ielts.Test.result.model.speaking.SpeakingAnswerQuestion;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiSpeakingServiceTest {

    @Mock
    private AIService aiService;

    @Mock
    private WhisperService whisperService;

    @InjectMocks
    private AiSpeakingService aiSpeakingService;

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void testCleanGptJson_RemovesMarkdownAndNoise() {
        String raw1 = "```json\n{\"score\": 7.0}\n```";
        assertEquals("{\"score\": 7.0}", aiSpeakingService.cleanGptJson(raw1));

        String raw2 = "Here is the response: {\"score\": 6.5} Hope this helps!";
        assertEquals("{\"score\": 6.5}", aiSpeakingService.cleanGptJson(raw2));

        String raw3 = "{\"score\": 8.0}";
        assertEquals("{\"score\": 8.0}", aiSpeakingService.cleanGptJson(raw3));
    }

    @Test
    void testEvaluateSpeaking_SuccessfulParse() {
        ObjectNode transcriptNode = mapper.createObjectNode();
        transcriptNode.put("text", "I prefer living in a city.");

        String mockGptResponse = """
                {
                  "question": "City or countryside?",
                  "transcript": "I prefer living in a city.",
                  "grammarAnswer": {
                    "score": 7.5,
                    "errors": []
                  },
                  "lexicalAnswer": {
                    "score": 7.5,
                    "errors": []
                  },
                  "fluencyCohAnswer": {
                    "score": 7.0,
                    "comment": "Good fluency and coherence."
                  }
                }
                """;

        when(aiService.buildSpeakingPrompt(anyInt(), anyString(), any(), any(), anyDouble(), any()))
                .thenReturn("mock prompt");
        when(aiService.callSpeakingPart(anyString()))
                .thenReturn(mockGptResponse);

        SpeakingAnswerQuestion result = aiSpeakingService.evaluateSpeaking(
                transcriptNode,
                "City or countryside?",
                1,
                new FleCohAnswer(),
                70.0,
                null
        );

        assertNotNull(result);
        assertEquals("City or countryside?", result.getQuestion());
        assertEquals("I prefer living in a city.", result.getTranscript());
        assertNotNull(result.getGrammarAnswer());
        assertEquals(7.5, result.getGrammarAnswer().getScore());
        assertNotNull(result.getLexicalAnswer());
        assertEquals(7.5, result.getLexicalAnswer().getScore());
        assertNotNull(result.getFluencyCohAnswer());
        assertEquals(7.0, result.getFluencyCohAnswer().getScore());
    }
}
