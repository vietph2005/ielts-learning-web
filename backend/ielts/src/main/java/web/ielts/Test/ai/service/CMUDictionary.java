package web.ielts.Test.ai.service;

import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CMUDictionary {
    private static final Map<String, List<String[]>> cmuDict = new HashMap<>();

    public static void loadDict(File dictFile) throws IOException {
        try (BufferedReader reader = new BufferedReader(new FileReader(dictFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.startsWith(";;;")) continue; // skip comments

                String[] parts = line.split("  ");
                if (parts.length < 2) continue;

                String word = parts[0];
                String[] phonemes = parts[1].trim().split(" ");
                cmuDict.computeIfAbsent(word, k -> new ArrayList<>()).add(phonemes);
            }
        }
    }

    public static int countSyllables(String word) {
        List<String[]> phonemeLists = cmuDict.get(word.toUpperCase());
        if (phonemeLists == null || phonemeLists.isEmpty()) return estimateSyllables(word);

        String[] phonemes = phonemeLists.get(0);
        int syllables = 0;
        for (String p : phonemes) {
            if (p.matches(".*\\d")) syllables++;
        }
        return syllables;
    }

    private static int estimateSyllables(String word) {
        String w = word.toLowerCase().replaceAll("[^a-z]", "");
        if (w.length() == 0) return 0;

        String[] vowelGroups = w.split("[^aeiouy]+");
        int count = 0;
        for (String vg : vowelGroups) {
            if (!vg.isEmpty()) count++;
        }
        return Math.max(count, 1);
    }
}
