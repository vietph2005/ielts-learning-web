package web.ielts.Test.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import web.ielts.Test.ai.model.DetectedStressWord;
import web.ielts.Test.ai.model.FleCohAnswer;
import web.ielts.Test.ai.model.IntonationSentence;

import java.io.*;
import java.net.URL;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class PraatAudioService {

    @Value("${app.praat.path}")
    private String PRAAT_PATH;

    @Value("${app.praat.script-path}")
    private String PRAAT_SCRIPT_PATH;

    @Value("${app.praat.stress-analysis-script-path}")
    private String STRESS_ANALYSIS_SCRIPT_PATH;

    @Value("${app.praat.intonation-script-path}")
    private String INTONATION_SCRIPT_PATH;

    @Value("${app.praat.get-duration-script-path}")
    private String GET_DURATION;

    public File downloadAudioFile(String url) throws IOException {
        System.out.println("Downloading file from URL: " + url);
        File file = File.createTempFile("prosody-", ".mp3");
        try (InputStream in = new URL(url).openStream(); OutputStream out = new FileOutputStream(file)) {
            in.transferTo(out);
        }
        System.out.println("Audio download successful: " + file.getAbsolutePath());
        return file;
    }

    public File convertMp3ToWav(File mp3File) throws IOException, InterruptedException {
        System.out.println("Converting MP3 to WAV via FFmpeg...");
        File wavFile = new File(mp3File.getParent(), mp3File.getName().replace(".mp3", ".wav"));
        ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg", "-y", "-i", mp3File.getAbsolutePath(),
                "-ar", "44100", "-ac", "1", wavFile.getAbsolutePath()
        );
        pb.redirectErrorStream(true);
        Process process = pb.start();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            reader.lines().forEach(System.out::println);
        }
        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("FFmpeg conversion failed with exit code: " + exitCode);
        }
        System.out.println("Conversion to WAV successful: " + wavFile.getAbsolutePath());
        return wavFile;
    }

    public double praatGetAudioDuration(File wavFile) throws IOException {
        String scriptPath = new File(GET_DURATION).getAbsolutePath();
        System.out.println("Praat path: " + PRAAT_PATH);
        System.out.println("Praat script: " + scriptPath);
        System.out.println("Audio file: " + wavFile.getAbsolutePath());

        ProcessBuilder pb = new ProcessBuilder(
                PRAAT_PATH, "--run", scriptPath, wavFile.getAbsolutePath()
        );
        pb.redirectErrorStream(true);

        Process process = pb.start();

        StringBuilder output = new StringBuilder();
        String durationLine = null;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
                if (durationLine == null) durationLine = line;
            }
        }

        int exitCode;
        try {
            exitCode = process.waitFor();
        } catch (InterruptedException e) {
            throw new IOException("Process interrupted", e);
        }

        if (exitCode != 0) {
            System.err.println("Praat output:\n" + output);
            throw new IOException("Praat exited with code " + exitCode);
        }

        if (durationLine == null || durationLine.trim().isEmpty()) {
            System.err.println("Praat output:\n" + output);
            throw new IOException("No duration received from Praat output");
        }

        try {
            String cleanDuration = durationLine.replaceAll("[^0-9.]", "");
            return Double.parseDouble(cleanDuration);
        } catch (NumberFormatException e) {
            System.err.println("Praat output:\n" + output);
            throw new IOException("Cannot parse duration: " + durationLine, e);
        }
    }

    public File generateTextGridFromJson(JsonNode root, File audioFile) throws IOException {
        File textGridFile = new File(audioFile.getParent(), audioFile.getName().replace(".wav", ".TextGrid"));
        System.out.println("👉 Generating TextGrid file: " + textGridFile.getAbsolutePath());

        try (PrintWriter writer = new PrintWriter(textGridFile)) {
            double audioDuration = praatGetAudioDuration(audioFile);
            System.out.println("✅ Audio duration: " + audioDuration);

            writer.println("File type = \"ooTextFile\"");
            writer.println("Object class = \"TextGrid\"");
            writer.println();
            writer.println("xmin = 0");
            writer.println("xmax = " + audioDuration);
            writer.println("tiers? <exists>");
            writer.println("size = 3"); // 3 tiers: words, sentences, syllables
            writer.println("item []:");

            // Word tier
            writer.println("    item [1]:");
            writer.println("        class = \"IntervalTier\"");
            writer.println("        name = \"words\"");
            writer.println("        xmin = 0");
            writer.println("        xmax = " + audioDuration);

            List<JsonNode> wordNodes = new ArrayList<>();
            if (root.has("segments") && root.get("segments").isArray()) {
                root.get("segments").forEach(segment -> {
                    if (segment.has("words") && segment.get("words").isArray()) {
                        segment.get("words").forEach(wordNodes::add);
                    }
                });
            } else if (root.has("words") && root.get("words").isArray()) {
                root.get("words").forEach(wordNodes::add);
            }
            System.out.println("✅ Total words in TextGrid: " + wordNodes.size());

            writer.println("        intervals: size = " + wordNodes.size());
            for (int i = 0; i < wordNodes.size(); i++) {
                JsonNode word = wordNodes.get(i);
                double start = word.has("start") ? word.get("start").asDouble() : 0.0;
                double end = word.has("end") ? word.get("end").asDouble() : 0.0;
                String wordText = word.has("word") ? word.get("word").asText() : "";
                writer.println("        intervals [" + (i + 1) + "]:");
                writer.println("            xmin = " + start);
                writer.println("            xmax = " + end);
                writer.println("            text = \"" + wordText + "\"");
            }

            // Sentence tier
            writer.println("    item [2]:");
            writer.println("        class = \"IntervalTier\"");
            writer.println("        name = \"sentences\"");
            writer.println("        xmin = 0");
            writer.println("        xmax = " + audioDuration);

            List<List<JsonNode>> sentences = groupWordsIntoSentences(wordNodes);
            writer.println("        intervals: size = " + sentences.size());

            for (int i = 0; i < sentences.size(); i++) {
                List<JsonNode> sentenceWords = sentences.get(i);
                double sentenceStart = sentenceWords.get(0).has("start") ? sentenceWords.get(0).get("start").asDouble() : 0.0;
                double sentenceEnd = sentenceWords.get(sentenceWords.size() - 1).has("end")
                        ? sentenceWords.get(sentenceWords.size() - 1).get("end").asDouble() : 0.0;

                writer.println("        intervals [" + (i + 1) + "]:");
                writer.println("            xmin = " + sentenceStart);
                writer.println("            xmax = " + sentenceEnd);
                writer.println("            text = \"Sentence " + (i + 1) + "\"");
            }

            // Syllable tier
            writer.println("    item [3]:");
            writer.println("        class = \"IntervalTier\"");
            writer.println("        name = \"syllables\"");
            writer.println("        xmin = 0");
            writer.println("        xmax = " + audioDuration);
            writer.println("        intervals: size = " + wordNodes.size());

            for (int i = 0; i < wordNodes.size(); i++) {
                JsonNode word = wordNodes.get(i);
                double start = word.has("start") ? word.get("start").asDouble() : 0.0;
                double end = word.has("end") ? word.get("end").asDouble() : 0.0;

                String syllableCount = word.has("syllables") ? word.get("syllables").asText() : "1";

                writer.println("        intervals [" + (i + 1) + "]:");
                writer.println("            xmin = " + start);
                writer.println("            xmax = " + end);
                writer.println("            text = \"" + syllableCount + "\"");
            }

            System.out.println("TextGrid file written successfully: " + textGridFile.getAbsolutePath());
        }
        return textGridFile;
    }

    public List<List<JsonNode>> groupWordsIntoSentences(List<JsonNode> words) {
        List<List<JsonNode>> sentences = new ArrayList<>();
        List<JsonNode> currentSentence = new ArrayList<>();
        double PAUSE_THRESHOLD = 0.4; // seconds pause between sentences

        for (int i = 0; i < words.size(); i++) {
            JsonNode word = words.get(i);
            currentSentence.add(word);
            String wordText = word.has("word") ? word.get("word").asText().toLowerCase() : "";

            boolean isSentenceEnd = false;

            if (wordText.matches(".*[.!?]$")) {
                isSentenceEnd = true;
            }

            if (!isSentenceEnd && i < words.size() - 1) {
                JsonNode nextWord = words.get(i + 1);
                double currentEnd = word.has("end") ? word.get("end").asDouble() : -1;
                double nextStart = nextWord.has("start") ? nextWord.get("start").asDouble() : -1;
                if (currentEnd >= 0 && nextStart >= 0 && (nextStart - currentEnd) >= PAUSE_THRESHOLD) {
                    isSentenceEnd = true;
                }
            }

            if (isSentenceEnd) {
                sentences.add(currentSentence);
                currentSentence = new ArrayList<>();
            }
        }

        if (!currentSentence.isEmpty()) {
            sentences.add(currentSentence);
        }

        return sentences;
    }

    public FleCohAnswer runPraatAnalysis(File wavFile, File textGridFile) throws IOException, InterruptedException {
        File outputFile = File.createTempFile("praat-output", ".txt");
        System.out.println("▶️ [PRAAT ANALYSIS] Starting analysis...");
        System.out.println("   Input WAV: " + wavFile.getAbsolutePath());
        System.out.println("   TextGrid: " + textGridFile.getAbsolutePath());
        System.out.println("   Output will be saved to: " + outputFile.getAbsolutePath());

        ProcessBuilder pb = new ProcessBuilder(
                PRAAT_PATH, "--run", PRAAT_SCRIPT_PATH,
                wavFile.getAbsolutePath(),
                textGridFile.getAbsolutePath(),
                outputFile.getAbsolutePath()
        );
        pb.redirectErrorStream(true);

        Process process = pb.start();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println("[Praat] " + line);
            }
        }

        int exitCode = process.waitFor();
        System.out.println("✅ [PRAAT] Process exited with code: " + exitCode);

        if (exitCode != 0) {
            System.err.println("❌ [ERROR] Praat analysis failed!");
            throw new RuntimeException("Praat process failed with exit code: " + exitCode);
        }

        System.out.println("📊 [PRAAT] Parsing results from: " + outputFile.getAbsolutePath());
        return parsePraatOutput(outputFile);
    }

    private FleCohAnswer parsePraatOutput(File outputFile) throws IOException {
        FleCohAnswer answer = new FleCohAnswer();
        try (BufferedReader reader = new BufferedReader(new FileReader(outputFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (!line.contains("=")) continue;
                String[] parts = line.split("=");
                if (parts.length != 2) continue;
                String key = parts[0].trim();
                String valueStr = parts[1].trim();
                switch (key) {
                    case "meanIntensity":
                        answer.setMeanIntensity(valueStr);
                        break;
                    case "pauseCount":
                        answer.setPauseCount(valueStr);
                        break;
                    case "speechRate":
                        answer.setSpeechRate(valueStr);
                        break;
                    case "totalDuration":
                        answer.setTotalDuration(valueStr);
                        break;
                    case "totalPauseDuration":
                        answer.setTotalPauseDuration(valueStr);
                        break;
                    case "wordCount":
                        answer.setWordCount(valueStr);
                        break;
                }
            }
        }

        double calculatedPauseRate = answer.getCalculatedPauseRate();
        answer.setPauseRate(String.format(Locale.US, "%.2f", calculatedPauseRate));
        answer.setScore(0);
        answer.setComment(null);
        System.out.println("📤 Parsed FleCohAnswer:\n" + answer.toString());
        return answer;
    }

    public String parseStressOutputWithList(File textGridFile, List<DetectedStressWord> detectedStressWords) throws IOException, InterruptedException {
        File outputFile = new File(textGridFile.getParent(),
                "stress_output_" + Instant.now().toEpochMilli() + ".txt");
        ProcessBuilder pb = new ProcessBuilder(
                PRAAT_PATH, "--run",
                STRESS_ANALYSIS_SCRIPT_PATH,
                textGridFile.getAbsolutePath().replace(".TextGrid", ".wav"),
                textGridFile.getAbsolutePath(),
                outputFile.getAbsolutePath()
        );
        pb.redirectErrorStream(true);
        Process process = pb.start();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            while (reader.readLine() != null) {}
        }
        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("Stress analysis failed with code: " + exitCode);
        }

        StringBuilder resultBuilder = new StringBuilder();
        if (outputFile.exists()) {
            try (BufferedReader reader = new BufferedReader(new FileReader(outputFile))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    resultBuilder.append(line).append("\n");
                    if (line.contains(":")) {
                        String[] parts = line.split(":", 2);
                        if (parts.length >= 2) {
                            String word = parts[0].trim().toLowerCase();
                            String positionStr = parts[1].trim().replaceAll("[^0-9]", "");
                            if (!positionStr.isEmpty()) {
                                try {
                                    int detectedPosition = Integer.parseInt(positionStr);
                                    detectedStressWords.add(new DetectedStressWord(word, detectedPosition));
                                } catch (NumberFormatException e) {
                                    System.err.println("Error parsing stress position: " + line);
                                }
                            }
                        }
                    }
                }
            }
        }
        return resultBuilder.toString();
    }

    public List<IntonationSentence> analyzeSentenceIntonation(File wavFile, File textGridFile) {
        List<IntonationSentence> resultList = new ArrayList<>();
        try {
            File outputFile = new File(textGridFile.getParent(),
                    "intonation_output_" + System.currentTimeMillis() + ".txt");

            ProcessBuilder pb = new ProcessBuilder(
                    PRAAT_PATH, "--run",
                    INTONATION_SCRIPT_PATH,
                    wavFile.getAbsolutePath(),
                    textGridFile.getAbsolutePath(),
                    outputFile.getAbsolutePath()
                );
            System.out.println("🔊 [INTONATION] Running command: " + String.join(" ", pb.command()));
            pb.redirectErrorStream(true);

            Process process = pb.start();

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    System.out.println("   [PRAAT] " + line);
                }
            }

            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new IOException("Intonation analysis failed with exit code: " + exitCode);
            }

            System.out.println("📊 [INTONATION] Parsing results from: " + outputFile.getAbsolutePath());
            if (outputFile.exists()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(outputFile))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        if (line.contains("Emphasized word:")) {
                            String[] parts = line.split("'");
                            if (parts.length >= 2) {
                                String word = parts[1];
                                resultList.add(new IntonationSentence(word, -1));
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("💥 Sentence intonation analysis error: " + e.getMessage());
            e.printStackTrace();
        }
        return resultList;
    }
}
