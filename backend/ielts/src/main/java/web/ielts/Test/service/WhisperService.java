package web.ielts.Test.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.*;
import java.net.URL;
import java.nio.file.Files;
import java.text.Normalizer;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class WhisperService {
    @Value("${groq.api.key}")
    private String groqApiKey;

    public JsonNode transcribeWithTimestampsAndSyllables(String audioUrl) throws IOException {
        File audioFile = downloadAudioFile(audioUrl);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.setBearerAuth(groqApiKey);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new FileSystemResource(audioFile));
        body.add("model", "whisper-large-v3");
        body.add("language", "en");
        body.add("response_format", "verbose_json");
        body.add("timestamp_granularities[]", "word");

        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
        RestTemplate restTemplate = new RestTemplate();

        ResponseEntity<String> response = restTemplate.postForEntity(
                "https://api.groq.com/openai/v1/audio/transcriptions",
                request,
                String.class
        );

        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(response.getBody());

        // Thêm thông tin số âm tiết vào kết quả
        if (rootNode.has("words")) {
            ArrayNode wordsNode = (ArrayNode) rootNode.get("words");
            for (JsonNode wordNode : wordsNode) {
                if (wordNode.has("word")) {
                    String word = wordNode.get("word").asText();
                    int syllableCount = CMUDictionary.countSyllables(word);
                    ((ObjectNode) wordNode).put("syllables", syllableCount);
                }
            }
        }

        return rootNode;
    }

    private File downloadAudioFile(String url) throws IOException {
        if (url == null || url.trim().isEmpty() || !url.startsWith("http")) {
            throw new IllegalArgumentException("Invalid or empty URL: " + url);
        }

        File file = File.createTempFile("audio-", ".mp3");
        file.deleteOnExit();

        try (InputStream in = new URL(url).openStream();
             OutputStream out = new FileOutputStream(file)) {
            in.transferTo(out);
            System.out.println("Audio file downloaded to: " + file.getAbsolutePath());
        } catch (IOException e) {
            System.err.println("Error downloading file from URL: " + url);
            e.printStackTrace();
            throw e;
        }

        return file;
    }
}