package web.ielts.Test.ai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CmuDictService {

    @Value("${cmudict.file.path}")
    private String CMU_DICT_PATH;

    private final Map<String, String> cmuDictMap = new HashMap<>();

    public CmuDictService() {
    }

    @PostConstruct
    public void init() {
        loadCmuDict();
    }

    /**
     * Loads CMU Pronouncing Dictionary from file into memory.
     * Handles Unicode/non-breaking spaces, strips variant markers like (1), (2),
     * and keeps primary pronunciations without overwriting them.
     */
    public void loadCmuDict() {
        if (CMU_DICT_PATH == null || CMU_DICT_PATH.isBlank()) {
            System.err.println("❌ CMU Dict path is not configured.");
            return;
        }
        File cmuDictFile = new File(CMU_DICT_PATH);
        System.out.println("Loading CMU Dict from: " + CMU_DICT_PATH);
        Path path = Paths.get(CMU_DICT_PATH);
        if (!Files.exists(path)) {
            System.err.println("❌ File not found: " + CMU_DICT_PATH);
            return;
        }
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(new FileInputStream(cmuDictFile), StandardCharsets.UTF_8))) {
            String line;
            int count = 0;
            while ((line = reader.readLine()) != null) {
                String trimmed = line.trim();
                if (trimmed.isEmpty() || trimmed.startsWith(";;;")) continue;

                String[] parts = trimmed.split("[\\s\\u00A0]+", 2);
                if (parts.length < 2) continue;

                String rawWord = parts[0];
                String pronunciation = parts[1].trim();

                rawWord = rawWord.replaceAll("\\(\\d+\\)$", "");
                String cleanWord = rawWord.replaceAll("[^a-zA-Z]", "").toLowerCase();

                if (!cleanWord.isEmpty()) {
                    if (!cmuDictMap.containsKey(cleanWord)) {
                        cmuDictMap.put(cleanWord, pronunciation);
                        count++;
                    }
                }
            }
            System.out.println("✅ Loaded " + count + " primary words from CMU Dict");
        } catch (IOException e) {
            System.err.println("❌ Error loading CMU Dict: " + e.getMessage());
        }
    }

    public Integer getStandardStressPosition(String word) {
        if (word == null) return null;
        String cleanWord = word.replaceAll("[^a-zA-Z]", "").toLowerCase();
        if (cleanWord.isEmpty()) return null;

        String pronunciation = cmuDictMap.get(cleanWord);
        if (pronunciation == null) {
            return null;
        }

        String[] syllables = pronunciation.split("\\s+");
        List<String> vowelSyllables = new ArrayList<>();
        for (String syl : syllables) {
            if (syl.matches(".*[0-2]$")) {
                vowelSyllables.add(syl);
            }
        }

        int syllableCount = vowelSyllables.size();
        if (syllableCount == 0) return null;
        if (syllableCount == 1) return 1;

        for (int i = 0; i < syllableCount; i++) {
            if (vowelSyllables.get(i).contains("1")) {
                return i + 1;
            }
        }

        for (int i = 0; i < syllableCount; i++) {
            if (vowelSyllables.get(i).contains("2")) {
                return i + 1;
            }
        }

        return 1;
    }

    /**
     * Returns transcript with stressed syllables (according to CMU Dict) capitalized.
     */
    public String stressTranscript(String transcript) {
        if (transcript == null || transcript.isEmpty()) return transcript;
        StringBuilder result = new StringBuilder();
        String[] words = transcript.split("(\\s+|(?=[,.!?;:]))");
        for (String word : words) {
            if (word.trim().isEmpty()) {
                result.append(word);
                continue;
            }
            String cleanWord = word.replaceAll("[^a-zA-Z]", "").toLowerCase();
            String pronunciation = cmuDictMap.get(cleanWord);
            if (pronunciation == null || cleanWord.isEmpty()) {
                result.append(word);
            } else {
                String[] syllables = pronunciation.split("\\s+");
                List<String> vowelSyllables = new ArrayList<>();
                for (String syl : syllables) {
                    if (syl.matches(".*[0-2]$")) {
                        vowelSyllables.add(syl);
                    }
                }
                int stressSyllable = -1;
                for (int i = 0; i < vowelSyllables.size(); i++) {
                    if (vowelSyllables.get(i).contains("1")) {
                        stressSyllable = i;
                        break;
                    }
                }
                if (vowelSyllables.size() <= 1 || stressSyllable == -1) {
                    result.append(word);
                } else {
                    int len = word.replaceAll("[^a-zA-Z]", "").length();
                    int[] splitPoints = new int[vowelSyllables.size() + 1];
                    for (int i = 0; i <= vowelSyllables.size(); i++) {
                        splitPoints[i] = (int) Math.round((double) i * len / vowelSyllables.size());
                    }
                    String onlyLetters = word.replaceAll("[^a-zA-Z]", "");
                    StringBuilder stressedWord = new StringBuilder();
                    for (int i = 0; i < vowelSyllables.size(); i++) {
                        String part = onlyLetters.substring(splitPoints[i], splitPoints[i + 1]);
                        if (i == stressSyllable) {
                            stressedWord.append(part.toUpperCase());
                        } else {
                            stressedWord.append(part.toLowerCase());
                        }
                    }
                    String nonLetter = word.replaceAll("[a-zA-Z]", "");
                    result.append(stressedWord);
                    result.append(nonLetter);
                }
            }
            result.append(" ");
        }
        return result.toString().replaceAll("\\s+([,.!?;:])", "$1").trim();
    }
}
