package web.ielts.Test.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Service;
import web.ielts.Test.ai.model.*;

import java.io.File;
import java.io.IOException;
import java.util.*;

@Service
public class ProsodyService {

    private final PraatAudioService praatAudioService;
    private final CmuDictService cmuDictService;
    private final GroqPronunciationScorer groqPronunciationScorer;

    public ProsodyService(
            PraatAudioService praatAudioService,
            CmuDictService cmuDictService,
            GroqPronunciationScorer groqPronunciationScorer
    ) {
        this.praatAudioService = praatAudioService;
        this.cmuDictService = cmuDictService;
        this.groqPronunciationScorer = groqPronunciationScorer;
    }

    public FleCohAnswer analyzeProsodyFeatures(String audioUrl, JsonNode root) {
        try {
            File mp3File = praatAudioService.downloadAudioFile(audioUrl);
            File wavFile = praatAudioService.convertMp3ToWav(mp3File);
            File textGridFile = praatAudioService.generateTextGridFromJson(root, wavFile);
            return praatAudioService.runPraatAnalysis(wavFile, textGridFile);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Main Pronunciation Assessment method.
     */
    public PronunciationAnswer analyze(String audioUrl, JsonNode root, int partNumber) throws IOException, InterruptedException {
        System.out.println("\n=======================================");
        System.out.println("🚀 STARTING PROSODY ANALYSIS");
        System.out.println("   Audio URL: " + audioUrl);
        System.out.println("   JSON data: " + (root != null ? root.toString() : "null"));
        System.out.println("=======================================\n");

        PronunciationAnswer result = new PronunciationAnswer();

        // 1. Download and convert audio file
        File mp3File = praatAudioService.downloadAudioFile(audioUrl);
        File wavFile = praatAudioService.convertMp3ToWav(mp3File);

        // 2. Generate TextGrid
        File textGridFile = praatAudioService.generateTextGridFromJson(root, wavFile);

        // 3. Extract word timestamps and indices from root JSON
        List<WordInfo> wordInfoList = new ArrayList<>();
        if (root.has("words") && root.get("words").isArray()) {
            int idx = 0;
            for (JsonNode wordNode : root.get("words")) {
                String w = wordNode.has("word") ? wordNode.get("word").asText() : "";
                double start = wordNode.has("start") ? wordNode.get("start").asDouble() : -1;
                double end = wordNode.has("end") ? wordNode.get("end").asDouble() : -1;
                wordInfoList.add(new WordInfo(w, start, end, idx));
                idx++;
            }
        } else if (root.has("segments") && root.get("segments").isArray()) {
            int idx = 0;
            for (JsonNode segment : root.get("segments")) {
                if (segment.has("words") && segment.get("words").isArray()) {
                    for (JsonNode wordNode : segment.get("words")) {
                        String w = wordNode.has("word") ? wordNode.get("word").asText() : "";
                        double start = wordNode.has("start") ? wordNode.get("start").asDouble() : -1;
                        double end = wordNode.has("end") ? wordNode.get("end").asDouble() : -1;
                        wordInfoList.add(new WordInfo(w, start, end, idx));
                        idx++;
                    }
                }
            }
        }

        // 4. Run Praat Word Stress Analysis
        System.out.println("🔊 [STRESS] Running Praat stress analysis...");
        List<DetectedStressWord> detectedStressWords = new ArrayList<>();
        praatAudioService.parseStressOutputWithList(textGridFile, detectedStressWords);

        // 5. Sequential Alignment of detected stress words against wordInfoList
        List<StressMismatch> stressMismatchesDetailed = new ArrayList<>();
        int wordInfoCursor = 0;
        for (DetectedStressWord detected : detectedStressWords) {
            String cleanDetected = detected.getWord().replaceAll("[^a-zA-Z]", "").toLowerCase();
            if (cleanDetected.isEmpty()) continue;

            WordInfo matchedInfo = null;
            // Search forward from current cursor to prevent index drift
            for (int j = wordInfoCursor; j < wordInfoList.size(); j++) {
                WordInfo candidate = wordInfoList.get(j);
                String candidateClean = candidate.getWord().replaceAll("[^a-zA-Z]", "").toLowerCase();
                if (candidateClean.equals(cleanDetected)) {
                    matchedInfo = candidate;
                    wordInfoCursor = j + 1;
                    break;
                }
            }

            // Fallback search from 0 if not found ahead
            if (matchedInfo == null) {
                for (int j = 0; j < wordInfoCursor; j++) {
                    WordInfo candidate = wordInfoList.get(j);
                    String candidateClean = candidate.getWord().replaceAll("[^a-zA-Z]", "").toLowerCase();
                    if (candidateClean.equals(cleanDetected)) {
                        matchedInfo = candidate;
                        break;
                    }
                }
            }

            double start = (matchedInfo != null) ? matchedInfo.getStart() : -1.0;
            double end = (matchedInfo != null) ? matchedInfo.getEnd() : -1.0;
            int index = (matchedInfo != null) ? matchedInfo.getIndex() : -1;

            Integer standardPosition = cmuDictService.getStandardStressPosition(cleanDetected);
            if (standardPosition == null) continue;

            if (!standardPosition.equals(detected.getDetectedPosition())) {
                stressMismatchesDetailed.add(new StressMismatch(
                        cleanDetected,
                        detected.getDetectedPosition(),
                        standardPosition,
                        start,
                        end,
                        index
                ));
            }
        }

        System.out.println("\n===== STRESS COMPARISON RESULTS =====");
        if (stressMismatchesDetailed.isEmpty()) {
            System.out.println("All words match CMU Dictionary standard stress patterns.");
        } else {
            System.out.println("Words with stress mismatches (" + stressMismatchesDetailed.size() + "):");
            for (StressMismatch mismatch : stressMismatchesDetailed) {
                System.out.println("  - " + mismatch);
            }
        }
        System.out.println("=====================================");

        // 6. Praat Sentence Intonation & Emphasis Analysis
        System.out.println("🔊 [INTONATION] Running sentence intonation analysis...");
        List<IntonationSentence> intonationResults = praatAudioService.analyzeSentenceIntonation(wavFile, textGridFile);

        // 7. Tokenize Transcript and Map Word Emphasis with Sequential Offset Tracking
        String transcript = root.has("text") ? root.get("text").asText() : "";
        List<String> transcriptWords = new ArrayList<>();
        if (transcript != null && !transcript.isEmpty()) {
            for (String token : transcript.split("(\\s+|(?=[,.!?;:]))")) {
                String trimmed = token.trim();
                if (!trimmed.isEmpty()) {
                    transcriptWords.add(trimmed);
                }
            }
        }

        int totalWords = 0;
        for (String w : transcriptWords) {
            if (w.matches(".*[a-zA-Z].*")) {
                totalWords++;
            }
        }
        if (totalWords == 0) {
            totalWords = wordInfoList.size();
        }

        // A. importantWords: content words identified by LLM
        List<IntonationSentence> importantWords = new ArrayList<>();
        List<IntonationSentence> aiImportant = groqPronunciationScorer.evaluateImportantWords(transcript, transcriptWords);
        int lastImportantIdx = 0;
        if (aiImportant != null) {
            for (IntonationSentence p : aiImportant) {
                String cleanP = (p.getText() != null) ? p.getText().replaceAll("[^a-zA-Z]", "").toLowerCase() : "";
                if (cleanP.isEmpty()) continue;

                int matchedIdx = -1;
                // 1. Verify if index from AI is already accurate
                if (p.getIndex() >= 0 && p.getIndex() < transcriptWords.size()) {
                    String wordAtIdx = transcriptWords.get(p.getIndex()).replaceAll("[^a-zA-Z]", "").toLowerCase();
                    if (wordAtIdx.equals(cleanP)) {
                        matchedIdx = p.getIndex();
                    }
                }

                // 2. Search forward from lastImportantIdx
                if (matchedIdx == -1) {
                    for (int i = lastImportantIdx; i < transcriptWords.size(); i++) {
                        String candidate = transcriptWords.get(i).replaceAll("[^a-zA-Z]", "").toLowerCase();
                        if (candidate.equals(cleanP)) {
                            matchedIdx = i;
                            break;
                        }
                    }
                }

                // 3. Fallback search from start
                if (matchedIdx == -1) {
                    for (int i = 0; i < transcriptWords.size(); i++) {
                        String candidate = transcriptWords.get(i).replaceAll("[^a-zA-Z]", "").toLowerCase();
                        if (candidate.equals(cleanP)) {
                            matchedIdx = i;
                            break;
                        }
                    }
                }

                if (matchedIdx != -1) {
                    lastImportantIdx = matchedIdx + 1;
                }

                importantWords.add(new IntonationSentence(p.getText(), matchedIdx));
            }
        }

        // B. emphasizedWords: words detected as emphasized via Praat
        List<IntonationSentence> emphasizedWords = new ArrayList<>();
        int lastEmphasizedIdx = 0;
        for (IntonationSentence item : intonationResults) {
            String cleanItem = (item.getText() != null) ? item.getText().replaceAll("[^a-zA-Z]", "").toLowerCase() : "";
            if (cleanItem.isEmpty()) continue;

            int matchedIdx = -1;
            for (int j = lastEmphasizedIdx; j < transcriptWords.size(); j++) {
                String candidate = transcriptWords.get(j).replaceAll("[^a-zA-Z]", "").toLowerCase();
                if (candidate.equals(cleanItem)) {
                    matchedIdx = j;
                    break;
                }
            }

            if (matchedIdx == -1) {
                for (int j = 0; j < transcriptWords.size(); j++) {
                    String candidate = transcriptWords.get(j).replaceAll("[^a-zA-Z]", "").toLowerCase();
                    if (candidate.equals(cleanItem)) {
                        matchedIdx = j;
                        break;
                    }
                }
            }

            if (matchedIdx != -1) {
                lastEmphasizedIdx = matchedIdx + 1;
            }

            emphasizedWords.add(new IntonationSentence(item.getText(), matchedIdx));
        }

        // C. Compute correctEmphasizedWords, overEmphasis, missingEmphasis, and emphasisRecall
        List<IntonationSentence> correctEmphasizedWords = new ArrayList<>();
        List<IntonationSentence> overEmphasis = new ArrayList<>();
        List<IntonationSentence> missingEmphasis = new ArrayList<>();

        Set<Integer> matchedImportantIndices = new HashSet<>();
        Set<Integer> matchedEmphasizedIndices = new HashSet<>();

        for (int e = 0; e < emphasizedWords.size(); e++) {
            IntonationSentence emp = emphasizedWords.get(e);
            if (emp.getIndex() >= 0) {
                for (int i = 0; i < importantWords.size(); i++) {
                    if (!matchedImportantIndices.contains(i)) {
                        IntonationSentence imp = importantWords.get(i);
                        if (imp.getIndex() == emp.getIndex()) {
                            matchedImportantIndices.add(i);
                            matchedEmphasizedIndices.add(e);
                            correctEmphasizedWords.add(emp);
                            break;
                        }
                    }
                }
            }
        }

        for (int e = 0; e < emphasizedWords.size(); e++) {
            if (matchedEmphasizedIndices.contains(e)) continue;
            IntonationSentence emp = emphasizedWords.get(e);
            String cleanEmp = emp.getText().replaceAll("[^a-zA-Z]", "").toLowerCase();
            for (int i = 0; i < importantWords.size(); i++) {
                if (!matchedImportantIndices.contains(i)) {
                    IntonationSentence imp = importantWords.get(i);
                    String cleanImp = imp.getText().replaceAll("[^a-zA-Z]", "").toLowerCase();
                    if (cleanEmp.equals(cleanImp)) {
                        matchedImportantIndices.add(i);
                        matchedEmphasizedIndices.add(e);
                        correctEmphasizedWords.add(emp);
                        break;
                    }
                }
            }
        }

        for (int e = 0; e < emphasizedWords.size(); e++) {
            if (!matchedEmphasizedIndices.contains(e)) {
                overEmphasis.add(emphasizedWords.get(e));
            }
        }

        for (int i = 0; i < importantWords.size(); i++) {
            if (!matchedImportantIndices.contains(i)) {
                missingEmphasis.add(importantWords.get(i));
            }
        }

        double emphasisRecall = (importantWords.isEmpty())
                ? 100.0
                : ((double) correctEmphasizedWords.size() / (double) importantWords.size()) * 100.0;

        // 8. Call Groq Scorer with Linguistic Arbitration
        FeedBackAI feedback = groqPronunciationScorer.scorePronunciation(
                transcript,
                stressMismatchesDetailed,
                importantWords,
                emphasizedWords,
                correctEmphasizedWords,
                missingEmphasis,
                overEmphasis,
                emphasisRecall,
                totalWords,
                partNumber
        );

        // 9. Build final PronunciationAnswer
        result.setScore(feedback != null ? feedback.getScore() : 5.0);
        result.setComment(feedback != null ? feedback.getComment() : "");
        result.setStressMismatchesDetailed(stressMismatchesDetailed);
        result.setImportantWords(importantWords);
        result.setEmphasizedWords(emphasizedWords);
        result.setCorrectEmphasizedWords(correctEmphasizedWords);
        result.setOverEmphasis(overEmphasis);
        result.setMissingEmphasis(missingEmphasis);
        result.setStressTranscript(cmuDictService.stressTranscript(transcript));
        result.setTranscript(transcript);

        System.out.println("\n=======================================");
        System.out.println("🎉 PRONUNCIATION ANALYSIS COMPLETED");
        System.out.println("   Final Score: " + result.getScore());
        System.out.println("   Comment: " + result.getComment());
        System.out.println("=======================================\n");

        return result;
    }

    public File downloadAudioFile(String url) throws IOException {
        return praatAudioService.downloadAudioFile(url);
    }

    public File convertMp3ToWav(File mp3File) throws IOException, InterruptedException {
        return praatAudioService.convertMp3ToWav(mp3File);
    }

    public String stressTranscript(String transcript) {
        return cmuDictService.stressTranscript(transcript);
    }
}
