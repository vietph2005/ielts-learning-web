package web.ielts.Test.ai.rubrics;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;
import web.ielts.Test.ai.model.FleCohAnswer;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class IeltsSpeakingRubricsTest {

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void testBuildSpeakingPart1Prompt_StructureAndTokenEfficiency() {
        ObjectNode transcriptNode = mapper.createObjectNode();
        transcriptNode.put("text", "I really love reading books because it helps broaden my horizons.");

        FleCohAnswer fleCoh = new FleCohAnswer();
        fleCoh.setSpeechRate("2.8");
        fleCoh.setPauseCount("2");

        String prompt = IeltsSpeakingRubrics.buildSpeakingPart1Prompt(
                "Do you like reading books?",
                transcriptNode,
                fleCoh,
                75.0
        );

        assertNotNull(prompt);
        assertTrue(prompt.contains("Do you like reading books?"));
        assertTrue(prompt.contains("I really love reading books"));
        assertTrue(prompt.contains("grammarAnswer"));
        assertTrue(prompt.contains("lexicalAnswer"));
        assertTrue(prompt.contains("fluencyCohAnswer"));
        assertTrue(prompt.contains("OFF-TOPIC"));

        // Verify token efficiency: prompt length in characters should be well under 4500 chars (approx ~700 tokens vs 2000+ previously)
        assertTrue(prompt.length() < 4500, "Prompt should be token-efficient (under 4500 chars)");
    }

    @Test
    void testBuildSpeakingPart2Prompt_StructureAndCueCards() {
        ObjectNode transcriptNode = mapper.createObjectNode();
        transcriptNode.put("text", "I would like to talk about a memorable holiday I had last summer.");

        FleCohAnswer fleCoh = new FleCohAnswer();
        fleCoh.setSpeechRate("3.0");
        fleCoh.setPauseCount("1");

        List<String> cueCards = List.of("Where you went", "Who you went with", "What you did");

        String prompt = IeltsSpeakingRubrics.buildSpeakingPart2Prompt(
                "Describe a memorable holiday",
                transcriptNode,
                cueCards,
                fleCoh,
                80.0
        );

        assertNotNull(prompt);
        assertTrue(prompt.contains("Describe a memorable holiday"));
        assertTrue(prompt.contains("Where you went"));
        assertTrue(prompt.contains("grammarAnswer"));
        assertTrue(prompt.contains("lexicalAnswer"));
        assertTrue(prompt.contains("Long Turn"));
        assertTrue(prompt.length() < 4500, "Prompt should be token-efficient");
    }

    @Test
    void testBuildSpeakingPart3Prompt_StructureAndAbstractDiscussion() {
        ObjectNode transcriptNode = mapper.createObjectNode();
        transcriptNode.put("text", "In my opinion, tourism brings substantial economic benefits to local communities.");

        FleCohAnswer fleCoh = new FleCohAnswer();
        fleCoh.setSpeechRate("2.6");
        fleCoh.setPauseCount("3");

        String prompt = IeltsSpeakingRubrics.buildSpeakingPart3Prompt(
                "What are the benefits of tourism for local communities?",
                transcriptNode,
                fleCoh,
                70.0
        );

        assertNotNull(prompt);
        assertTrue(prompt.contains("What are the benefits of tourism"));
        assertTrue(prompt.contains("tourism brings substantial economic benefits"));
        assertTrue(prompt.contains("grammarAnswer"));
        assertTrue(prompt.contains("lexicalAnswer"));
        assertTrue(prompt.length() < 4500, "Prompt should be token-efficient");
    }

    @Test
    void testExtractTranscriptText_HandlesVariousJsonNodes() {
        // Object node with 'text'
        ObjectNode node1 = mapper.createObjectNode();
        node1.put("text", "Sample text");
        assertEquals("Sample text", IeltsSpeakingRubrics.extractTranscriptText(node1));

        // Textual node
        assertEquals("Raw string", IeltsSpeakingRubrics.extractTranscriptText(mapper.valueToTree("Raw string")));

        // Null node
        assertEquals("", IeltsSpeakingRubrics.extractTranscriptText(null));
    }
}
