package web.ielts.Test.service.AI;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.microsoft.cognitiveservices.speech.*;
import com.microsoft.cognitiveservices.speech.audio.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import web.ielts.Test.model.answer.speaking.AzurePronunciationResult;
import java.io.File;
import java.util.concurrent.Future;

@Service
public class AzurePronunciationService {
    @Value("${azure.speech.key}")
    private String azureKey;

    @Value("${azure.speech.region}")
    private String azureRegion;

    public AzurePronunciationResult assessAndSave(File audioFile, String referenceText, String audioUrl) throws Exception {
        SpeechConfig config = SpeechConfig.fromSubscription(azureKey, azureRegion);
        config.setSpeechRecognitionLanguage("en-US");

        PronunciationAssessmentConfig pronConfig = new PronunciationAssessmentConfig(
                referenceText,
                PronunciationAssessmentGradingSystem.HundredMark,
                PronunciationAssessmentGranularity.Phoneme,
                true // Enable miscue (so sánh với transcript thực tế)
        );

        AudioConfig audioConfig = AudioConfig.fromWavFileInput(audioFile.getAbsolutePath());
        SpeechRecognizer recognizer = new SpeechRecognizer(config, audioConfig);
        pronConfig.applyTo(recognizer);

        Future<SpeechRecognitionResult> task = recognizer.recognizeOnceAsync();
        SpeechRecognitionResult result = task.get();

        String recognizedText = result.getText();
        String json = result.getProperties().getProperty(PropertyId.SpeechServiceResponse_JsonResult);

        // Parse điểm số từ JSON
        double pronunciationScore = 0, accuracyScore = 0, fluencyScore = 0, completenessScore = 0;
        if (json != null) {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(json);
            JsonNode nbest = root.path("NBest");
            if (nbest.isArray() && nbest.size() > 0) {
                JsonNode pa = nbest.get(0).path("PronunciationAssessment");
                pronunciationScore = pa.path("PronScore").asDouble(0);
                accuracyScore = pa.path("AccuracyScore").asDouble(0);
                fluencyScore = pa.path("FluencyScore").asDouble(0);
                completenessScore = pa.path("CompletenessScore").asDouble(0);
            }
        }

        AzurePronunciationResult entity = new AzurePronunciationResult();
        entity.setReferenceText(referenceText);
        entity.setRecognizedText(recognizedText);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(json);
        ObjectNode minimal = mapper.createObjectNode();

        // 1. Lấy DisplayText (hoặc Lexical tuỳ bạn muốn)
        minimal.put("Text", root.path("DisplayText").asText("")); // hoặc "Lexical"

        // 2. Lấy PronunciationAssessment tổng hợp
        JsonNode nbest = root.path("NBest");
        if (nbest.isArray() && nbest.size() > 0) {
            JsonNode pa = nbest.get(0).path("PronunciationAssessment");
            minimal.set("PronunciationAssessment", pa);

            // 3. Lấy danh sách Words
            ArrayNode words = mapper.createArrayNode();
            JsonNode wordsNode = nbest.get(0).path("Words");
            if (wordsNode.isArray()) {
                for (JsonNode wordNode : wordsNode) {
                    ObjectNode wordObj = mapper.createObjectNode();
                    wordObj.put("Word", wordNode.path("Word").asText(""));
                    wordObj.put("AccuracyScore", wordNode.path("PronunciationAssessment").path("AccuracyScore").asDouble(0));

                    // Lấy danh sách Phonemes
                    ArrayNode phonemes = mapper.createArrayNode();
                    JsonNode phonemesNode = wordNode.path("Phonemes");
                    if (phonemesNode.isArray()) {
                        for (JsonNode phonemeNode : phonemesNode) {
                            ObjectNode phonemeObj = mapper.createObjectNode();
                            phonemeObj.put("Phoneme", phonemeNode.path("Phoneme").asText(""));
                            phonemeObj.put("AccuracyScore", phonemeNode.path("PronunciationAssessment").path("AccuracyScore").asDouble(0));
                            phonemes.add(phonemeObj);
                        }
                    }
                    wordObj.set("Phonemes", phonemes);
                    words.add(wordObj);
                }
            }
            minimal.set("Words", words);
        }

        String minimalJson = mapper.writeValueAsString(minimal);
        entity.setJsonResult(minimalJson);

        entity.setPronunciationScore(pronunciationScore);
        entity.setAccuracyScore(accuracyScore);
        entity.setFluencyScore(fluencyScore);
        entity.setCompletenessScore(completenessScore);

        recognizer.close();
        audioConfig.close();
        config.close();

        return entity;
    }
} 