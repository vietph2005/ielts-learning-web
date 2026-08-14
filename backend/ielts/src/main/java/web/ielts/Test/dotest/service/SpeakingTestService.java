package web.ielts.Test.dotest.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import web.ielts.FileUpload.FileUploadService;
import web.ielts.Test.dotest.model.Speaking;
import web.ielts.Test.result.model.speaking.*;
import web.ielts.Test.dotest.repository.SpeakingRepository;
import web.ielts.Test.result.repository.SpeakingAnswerRepository;
import web.ielts.Test.ai.service.ProsodyService;
import web.ielts.Test.ai.service.WhisperService;
import web.ielts.Test.ai.service.AiSpeakingService;
import web.ielts.Test.ai.model.FleCohAnswer;
import web.ielts.Test.ai.model.PronunciationAnswer;
import web.ielts.Test.common.util.UrlEncryptor;
import web.ielts.Test.result.service.IeltsScoringUtils;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Locale;
import java.util.Map;

@Service
public class SpeakingTestService {

    @Autowired
    private SpeakingRepository speakingRepository;

    @Autowired
    private SpeakingAnswerRepository speakingAnswerRepository;

    @Autowired
    private ProsodyService prosodyService;

    @Autowired
    private WhisperService whisper;

    @Autowired
    private AiSpeakingService aiSpeakingService;

    @Autowired
    private FileUploadService fileUploadService;

    public Speaking getSpeakingByTestId(String testId) {
        return speakingRepository.findByTestId(testId);
    }

    public SpeakingAnswer saveSubmission(SpeakingAnswer submission) {
        return speakingAnswerRepository.save(submission);
    }

    public void updateAnswerUrls(SpeakingAnswer speakingAnswer, Map<String, String> fileUrlMap) {
        SpeakingAnswerPart13 part1 = speakingAnswer.getPart1();
        double part1Score = 0.0;
        double part2Score = 0.0;
        double part3Score = 0.0;

        // 🔹 Part 1
        if (part1 != null && part1.getQuestions() != null) {
            double totalScore = 0;
            int validQuestionCount = 0;

            for (SpeakingAnswerQuestion qa : part1.getQuestions()) {
                String blob = qa.getAudioAnswer();
                String filename = extractFileName(blob);
                String s3Url = fileUrlMap.getOrDefault(filename, blob);
                String s3UrlNotEncrypt = s3Url;

                if (s3UrlNotEncrypt == null || s3UrlNotEncrypt.trim().isEmpty() || !s3UrlNotEncrypt.startsWith("http")) {
                    continue;
                }
                s3Url = UrlEncryptor.encodeUrl(s3Url);
                qa.setAudioAnswer(s3Url);
                try {
                    // Whisper transcribe
                    JsonNode transcript = whisper.transcribeWithTimestampsAndSyllables(s3UrlNotEncrypt);

                    // Praat Prosody features & Fluency
                    FleCohAnswer prosodyFeatures = prosodyService.analyzeProsodyFeatures(s3UrlNotEncrypt, transcript);
                    double fluencyScore = calculatePraatFluencyScore(prosodyFeatures);

                    // AI Speaking evaluation (Grammar, Lexical, Fluency & Coherence)
                    SpeakingAnswerQuestion sp = aiSpeakingService.evaluateSpeaking(transcript, qa.getQuestion(), 1, prosodyFeatures, fluencyScore, null);

                    // Praat & AI Pronunciation
                    PronunciationAnswer pa = prosodyService.analyze(s3UrlNotEncrypt, transcript, 1);

                    if (sp != null) {
                        qa.setTranscript(sp.getTranscript());
                        qa.setGrammarAnswer(sp.getGrammarAnswer());
                        qa.setLexicalAnswer(sp.getLexicalAnswer());
                        qa.setFluencyCohAnswer(sp.getFluencyCohAnswer());
                    }
                    qa.setPronunciationAnswer(pa);

                    double grammar = (sp != null && sp.getGrammarAnswer() != null) ? sp.getGrammarAnswer().getScore() : 5.0;
                    double lexical = (sp != null && sp.getLexicalAnswer() != null) ? sp.getLexicalAnswer().getScore() : 5.0;
                    double fluency = (sp != null && sp.getFluencyCohAnswer() != null) ? sp.getFluencyCohAnswer().getScore() : 5.0;
                    double pronunciation = (pa != null) ? pa.getScore() : 5.0;

                    double averageForThisQuestion = (grammar + lexical + fluency + pronunciation) / 4.0;
                    qa.setScore(averageForThisQuestion);
                    validQuestionCount++;
                    totalScore += averageForThisQuestion;

                } catch (Exception e) {
                    System.err.println("Lỗi khi chấm câu hỏi Part 1: " + qa.getQuestion());
                    e.printStackTrace();
                }
            }
            double avgScore = validQuestionCount > 0 ? (totalScore / validQuestionCount) : 0.0;
            avgScore = new BigDecimal(avgScore).setScale(1, RoundingMode.HALF_UP).doubleValue();
            part1.setAverageScore(avgScore);
            part1Score = part1.getAverageScore();
        }

        // 🔹 Part 2
        SpeakingAnswerPart2 part2 = speakingAnswer.getPart2();
        if (part2 != null) {
            String blob = part2.getAudioAnswer();
            String filename = extractFileName(blob);
            String s3Url = fileUrlMap.getOrDefault(filename, blob);
            String s3UrlNotEncrypt = s3Url;

            if (s3UrlNotEncrypt == null) {
                System.out.println("⚠️ Bỏ qua Part 2 do URL không hợp lệ: " + s3UrlNotEncrypt);
            } else {
                s3Url = UrlEncryptor.encodeUrl(s3Url);
                part2.setAudioAnswer(s3Url);
                try {
                    // Whisper
                    JsonNode transcript = whisper.transcribeWithTimestampsAndSyllables(s3UrlNotEncrypt);

                    // Praat Fluency
                    FleCohAnswer prosodyFeatures = prosodyService.analyzeProsodyFeatures(s3UrlNotEncrypt, transcript);
                    double fluencyScore = calculatePraatFluencyScore(prosodyFeatures);

                    // AI evaluation với cueCards
                    SpeakingAnswerQuestion sp = aiSpeakingService.evaluateSpeaking(transcript, part2.getQuestion(), 2, prosodyFeatures, fluencyScore, part2.getCueCards());

                    // Pronunciation
                    PronunciationAnswer pa = prosodyService.analyze(s3UrlNotEncrypt, transcript, 2);

                    if (sp != null) {
                        part2.setTranscript(sp.getTranscript());
                        part2.setGrammarAnswer(sp.getGrammarAnswer());
                        part2.setLexicalAnswer(sp.getLexicalAnswer());
                        part2.setFluencyCohAnswer(sp.getFluencyCohAnswer());
                    }
                    part2.setPronunciationAnswer(pa);

                    double grammar = (sp != null && sp.getGrammarAnswer() != null) ? sp.getGrammarAnswer().getScore() : 5.0;
                    double lexical = (sp != null && sp.getLexicalAnswer() != null) ? sp.getLexicalAnswer().getScore() : 5.0;
                    double fluency = (sp != null && sp.getFluencyCohAnswer() != null) ? sp.getFluencyCohAnswer().getScore() : 5.0;
                    double pronunciation = (pa != null) ? pa.getScore() : 5.0;
                    double averageForThisQuestion = (grammar + lexical + fluency + pronunciation) / 4.0;

                    averageForThisQuestion = new BigDecimal(averageForThisQuestion).setScale(1, RoundingMode.HALF_UP).doubleValue();
                    part2.setScore(averageForThisQuestion);
                    part2Score = part2.getScore();
                } catch (Exception e) {
                    System.err.println("❌ Lỗi khi chấm Part 2: " + e.getMessage());
                    e.printStackTrace();
                }
            }
        }

        // 🔹 Part 3
        SpeakingAnswerPart13 part3 = speakingAnswer.getPart3();
        if (part3 != null && part3.getQuestions() != null) {
            double totalScore = 0;
            int validQuestionCount = 0;

            for (SpeakingAnswerQuestion qa : part3.getQuestions()) {
                String blob = qa.getAudioAnswer();
                String filename = extractFileName(blob);
                String s3Url = fileUrlMap.getOrDefault(filename, blob);
                String s3UrlNotEncrypt = s3Url;

                if (s3UrlNotEncrypt == null || s3UrlNotEncrypt.trim().isEmpty() || !s3UrlNotEncrypt.startsWith("http")) {
                    continue;
                }

                s3Url = UrlEncryptor.encodeUrl(s3Url);
                qa.setAudioAnswer(s3Url);
                try {
                    // Whisper
                    JsonNode transcript = whisper.transcribeWithTimestampsAndSyllables(s3UrlNotEncrypt);

                    // Praat Fluency
                    FleCohAnswer prosodyFeatures = prosodyService.analyzeProsodyFeatures(s3UrlNotEncrypt, transcript);
                    double fluencyScore = calculatePraatFluencyScore(prosodyFeatures);

                    // AI evaluation
                    SpeakingAnswerQuestion sp = aiSpeakingService.evaluateSpeaking(transcript, qa.getQuestion(), 3, prosodyFeatures, fluencyScore, null);

                    // Pronunciation
                    PronunciationAnswer pa = prosodyService.analyze(s3UrlNotEncrypt, transcript, 3);

                    if (sp != null) {
                        qa.setTranscript(sp.getTranscript());
                        qa.setGrammarAnswer(sp.getGrammarAnswer());
                        qa.setLexicalAnswer(sp.getLexicalAnswer());
                        qa.setFluencyCohAnswer(sp.getFluencyCohAnswer());
                    }
                    qa.setPronunciationAnswer(pa);

                    double grammar = (sp != null && sp.getGrammarAnswer() != null) ? sp.getGrammarAnswer().getScore() : 5.0;
                    double lexical = (sp != null && sp.getLexicalAnswer() != null) ? sp.getLexicalAnswer().getScore() : 5.0;
                    double fluency = (sp != null && sp.getFluencyCohAnswer() != null) ? sp.getFluencyCohAnswer().getScore() : 5.0;
                    double pronunciation = (pa != null) ? pa.getScore() : 5.0;

                    double averageForThisQuestion = (grammar + lexical + fluency + pronunciation) / 4.0;
                    qa.setScore(averageForThisQuestion);

                    totalScore += averageForThisQuestion;
                    validQuestionCount++;

                } catch (Exception e) {
                    System.err.println("Lỗi khi chấm câu hỏi Part 3: " + qa.getQuestion());
                    e.printStackTrace();
                }
            }
            double avgScore = validQuestionCount > 0 ? (totalScore / validQuestionCount) : 0.0;
            avgScore = new BigDecimal(avgScore).setScale(1, RoundingMode.HALF_UP).doubleValue();
            part3.setAverageScore(avgScore);
            part3Score = part3.getAverageScore();
        }

        // 🔹 Tính Overall Band cho Speaking
        int validParts = 0;
        double totalPartScores = 0.0;
        if (part1 != null && part1.getQuestions() != null && !part1.getQuestions().isEmpty()) {
            validParts++;
            totalPartScores += part1Score;
        }
        if (part2 != null) {
            validParts++;
            totalPartScores += part2Score;
        }
        if (part3 != null && part3.getQuestions() != null && !part3.getQuestions().isEmpty()) {
            validParts++;
            totalPartScores += part3Score;
        }
        double avgBand = validParts > 0 ? IeltsScoringUtils.calculateIeltsRounding(totalPartScores / (double) validParts) : 0.0;
        speakingAnswer.setBand(avgBand);
    }

    public double calculatePraatFluencyScore(FleCohAnswer basicFluent) {
        if (basicFluent == null) return 50.0;
        double speechRate = 0.0;
        int pauseCount = 0;
        double totalDuration = 0.0;

        try {
            if (basicFluent.getSpeechRate() != null) {
                speechRate = Double.parseDouble(basicFluent.getSpeechRate());
            }
        } catch (Exception ignored) {}

        try {
            if (basicFluent.getPauseCount() != null) {
                pauseCount = Integer.parseInt(basicFluent.getPauseCount());
            }
        } catch (Exception ignored) {}

        try {
            if (basicFluent.getTotalDuration() != null) {
                totalDuration = Double.parseDouble(basicFluent.getTotalDuration());
            }
        } catch (Exception ignored) {}

        double pauseRate;
        if (totalDuration > 0) {
            pauseRate = pauseCount / (totalDuration / 60.0);
        } else {
            pauseRate = pauseCount * 3.0;
        }

        double srBand = mapSpeechRateToBand(speechRate);
        double prBand = mapPauseRateToBand(pauseRate);

        double bandScore = 0.6 * srBand + 0.4 * prBand;
        bandScore = Math.max(1.0, Math.min(9.0, bandScore));

        System.out.printf(Locale.US, "🎯 [PRAAT FLUENCY] SpeechRate: %.2f (Band %.2f), PauseRate: %.2f/min (Band %.2f) => Weighted Band: %.2f%n",
                speechRate, srBand, pauseRate, prBand, bandScore);

        return ((bandScore - 1.0) / 8.0) * 100.0;
    }

    public double mapSpeechRateToBand(double speechRate) {
        if (speechRate >= 3.2) return 9.0;
        if (speechRate >= 2.8) return 8.0 + (speechRate - 2.8) / (3.2 - 2.8) * 1.0;
        if (speechRate >= 2.5) return 7.0 + (speechRate - 2.5) / (2.8 - 2.5) * 1.0;
        if (speechRate >= 2.2) return 6.0 + (speechRate - 2.2) / (2.5 - 2.2) * 1.0;
        if (speechRate >= 1.8) return 5.0 + (speechRate - 1.8) / (2.2 - 1.8) * 1.0;
        if (speechRate >= 1.5) return 4.0 + (speechRate - 1.5) / (1.8 - 1.5) * 1.0;
        if (speechRate >= 1.2) return 3.0 + (speechRate - 1.2) / (1.5 - 1.2) * 1.0;
        if (speechRate >= 0.8) return 2.0 + (speechRate - 0.8) / (1.2 - 0.8) * 1.0;
        if (speechRate >= 0.4) return 1.0 + (speechRate - 0.4) / (0.8 - 0.4) * 1.0;
        return 1.0;
    }

    public double mapPauseRateToBand(double pauseRate) {
        if (pauseRate <= 4.0) return 9.0;
        if (pauseRate <= 7.0) return 9.0 - (pauseRate - 4.0) / (7.0 - 4.0) * 1.0;
        if (pauseRate <= 10.0) return 8.0 - (pauseRate - 7.0) / (10.0 - 7.0) * 1.0;
        if (pauseRate <= 14.0) return 7.0 - (pauseRate - 10.0) / (14.0 - 10.0) * 1.0;
        if (pauseRate <= 18.0) return 6.0 - (pauseRate - 14.0) / (18.0 - 14.0) * 1.0;
        if (pauseRate <= 23.0) return 5.0 - (pauseRate - 18.0) / (23.0 - 18.0) * 1.0;
        if (pauseRate <= 28.0) return 4.0 - (pauseRate - 23.0) / (28.0 - 23.0) * 1.0;
        if (pauseRate <= 35.0) return 3.0 - (pauseRate - 28.0) / (35.0 - 28.0) * 1.0;
        if (pauseRate <= 45.0) return 2.0 - (pauseRate - 35.0) / (45.0 - 35.0) * 1.0;
        return 1.0;
    }

    private String extractFileName(String blobUrl) {
        try {
            return blobUrl.substring(blobUrl.lastIndexOf("/") + 1);
        } catch (Exception e) {
            return blobUrl;
        }
    }

    public String uploadFile(MultipartFile file, String subfolder, String role, String username) throws IOException {
        try {
            if (file.getContentType() != null && file.getContentType().equals("audio/webm")) {
                File mp3File = AudioService.convertWebmToMp3(file);
                String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "audio.webm";
                String mp3Filename = originalName.endsWith(".webm") ? originalName.replace(".webm", ".mp3") : originalName + ".mp3";

                try (InputStream is = new FileInputStream(mp3File)) {
                    byte[] bytes = is.readAllBytes();
                    return fileUploadService.uploadFileBytes(bytes, mp3Filename, "audio/mpeg", "audio", subfolder, role, username);
                } finally {
                    mp3File.delete();
                }
            } else {
                return fileUploadService.uploadFile(file, "audio", subfolder, role, username);
            }
        } catch (Exception e) {
            throw new IOException("Failed to upload file to Supabase: " + e.getMessage(), e);
        }
    }

    public String uploadFile(MultipartFile file, String key) throws IOException {
        return uploadFile(file, "speaking", "STUDENT", "anonymous");
    }
}
