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

        // 8. Calculate 4-layer sub-scores with Strict IELTS Calibration
        int rawStressMismatchCount = (stressMismatchesDetailed != null) ? stressMismatchesDetailed.size() : 0;

        // Layer 1: Actual Polysyllabic Count & Strict Word Stress
        int actualPolysyllabicCount = 0;
        for (WordInfo wi : wordInfoList) {
            if (cmuDictService.getSyllableCount(wi.getWord()) >= 2) {
                actualPolysyllabicCount++;
            }
        }
        if (actualPolysyllabicCount == 0) {
            for (String w : transcriptWords) {
                if (cmuDictService.getSyllableCount(w) >= 2) {
                    actualPolysyllabicCount++;
                }
            }
        }

        double wordStressAccuracy;
        double bandWordStress;
        if (actualPolysyllabicCount == 0) {
            wordStressAccuracy = 50.0;
            bandWordStress = (totalWords < 8) ? 3.0 : 4.5;
        } else {
            int correctWordStress = Math.max(0, actualPolysyllabicCount - rawStressMismatchCount);
            wordStressAccuracy = ((double) correctWordStress / actualPolysyllabicCount) * 100.0;
            double rawAccuracyBand = 1.0 + (wordStressAccuracy / 100.0) * 8.0;

            // Strict sample size confidence: requires at least 8 polysyllabic words for Band 8.0+
            double polysyllabicConfidence = Math.min(1.0, (double) actualPolysyllabicCount / 8.0);
            bandWordStress = 4.0 + (rawAccuracyBand - 4.0) * (0.4 + 0.6 * polysyllabicConfidence);

            if (actualPolysyllabicCount < 3) {
                bandWordStress = Math.min(bandWordStress, 6.0);
            } else if (actualPolysyllabicCount < 6) {
                bandWordStress = Math.min(bandWordStress, 7.0);
            }
        }
        bandWordStress = Math.max(1.0, Math.min(9.0, bandWordStress));

        // Layer 2: Sentence Stress F1-Score (Strict Non-Linear Curve)
        int importantCount = (importantWords != null) ? importantWords.size() : 0;
        int emphasizedCount = (emphasizedWords != null) ? emphasizedWords.size() : 0;
        int correctCount = (correctEmphasizedWords != null) ? correctEmphasizedWords.size() : 0;

        double recall = importantCount > 0 ? ((double) correctCount / importantCount) * 100.0 : 0.0;
        double precision = emphasizedCount > 0 ? ((double) correctCount / emphasizedCount) * 100.0 : 0.0;
        double f1Score = (recall + precision > 0) ? (2.0 * recall * precision) / (recall + precision) : 0.0;
        double bandSentenceStress = 1.0 + Math.pow(f1Score / 100.0, 1.25) * 8.0;

        if (totalWords < 8) {
            bandSentenceStress = Math.min(bandSentenceStress, 3.5);
        } else if (totalWords < 20) {
            bandSentenceStress = Math.min(bandSentenceStress, 6.5);
        }
        bandSentenceStress = Math.max(1.0, Math.min(9.0, bandSentenceStress));

        // Layer 3: Ending Sounds & Medial Syllables & Phonemes
        int unintelligibleCount = 0;
        int medialDeletionCount = 0;
        for (WordInfo wi : wordInfoList) {
            String w = wi.getWord().replaceAll("[^a-zA-Z]", "");
            if (w.isEmpty()) continue;

            if (!cmuDictService.isWordInDictionary(w)) {
                unintelligibleCount++;
            }
            int expectedSyllables = cmuDictService.getSyllableCount(w);
            if (expectedSyllables >= 3 && wi.getStart() >= 0 && wi.getEnd() > wi.getStart()) {
                double duration = wi.getEnd() - wi.getStart();
                if (duration < 0.09 * expectedSyllables) {
                    medialDeletionCount++;
                }
            }
        }

        int totalPhonemeErrors = (unintelligibleCount * 2) + medialDeletionCount + (rawStressMismatchCount / 2);
        double errorRate = totalWords > 0 ? ((double) totalPhonemeErrors / totalWords) : 0.0;
        double phonemeAccuracy = Math.max(20.0, (1.0 - errorRate * 1.8) * 100.0);
        double bandPhonemes = 1.0 + Math.pow(phonemeAccuracy / 100.0, 1.3) * 8.0;

        if (totalWords < 8) {
            bandPhonemes = Math.min(bandPhonemes, 3.5);
        } else if (totalWords < 20) {
            bandPhonemes = Math.min(bandPhonemes, 6.5);
        }
        bandPhonemes = Math.max(1.0, Math.min(9.0, bandPhonemes));

        // Layer 4: Connected Speech & Transition Linking
        int totalTransitions = Math.max(0, wordInfoList.size() - 1);
        int linkingOpportunities = 0;
        int smoothLinkingCount = 0;
        int disfluentGaps = 0;

        for (int i = 0; i < totalTransitions; i++) {
            WordInfo wA = wordInfoList.get(i);
            WordInfo wB = wordInfoList.get(i + 1);

            if (wA.getEnd() >= 0 && wB.getStart() >= 0) {
                double gap = wB.getStart() - wA.getEnd();
                boolean isLinking = cmuDictService.isConsonantToVowelLinking(wA.getWord(), wB.getWord());
                if (isLinking) {
                    linkingOpportunities++;
                    if (gap >= -0.05 && gap <= 0.08) {
                        smoothLinkingCount++;
                    }
                }
                if (gap > 0.30) {
                    disfluentGaps++;
                }
            }
        }

        double linkingRate = linkingOpportunities > 0 ? ((double) smoothLinkingCount / linkingOpportunities) * 100.0 : 50.0;
        double bandLinking = 1.0 + (linkingRate / 100.0) * 8.0;
        double transitionDisfluentRate = totalTransitions > 0 ? ((double) disfluentGaps / totalTransitions) : 0.0;
        double bandRhythm = Math.max(2.0, 8.5 - (transitionDisfluentRate * 10.0));
        double bandConnectedSpeech = (0.50 * bandLinking) + (0.50 * bandRhythm);
        bandConnectedSpeech = 1.0 + Math.pow(bandConnectedSpeech / 9.0, 1.25) * 8.0;

        if (totalWords < 8) {
            bandConnectedSpeech = Math.min(bandConnectedSpeech, 3.0);
        } else if (totalWords < 20) {
            bandConnectedSpeech = Math.min(bandConnectedSpeech, 6.0);
        }
        bandConnectedSpeech = Math.max(1.0, Math.min(9.0, bandConnectedSpeech));

        result.setWordStressAccuracy(Math.round(wordStressAccuracy * 10.0) / 10.0);
        result.setWordStressScore(Math.round(bandWordStress * 10.0) / 10.0);
        result.setF1Score(Math.round(f1Score * 10.0) / 10.0);
        result.setSentenceStressScore(Math.round(bandSentenceStress * 10.0) / 10.0);
        result.setPhonemeScore(Math.round(bandPhonemes * 10.0) / 10.0);
        result.setConnectedSpeechScore(Math.round(bandConnectedSpeech * 10.0) / 10.0);

        // 9. Call Groq Scorer with Linguistic Arbitration & Strict Descriptors
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

        // 10. Build final PronunciationAnswer
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
