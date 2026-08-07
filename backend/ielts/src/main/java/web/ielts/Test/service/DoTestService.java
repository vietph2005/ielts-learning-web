package web.ielts.Test.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import web.ielts.FileUpload.FileUploadService;
import web.ielts.Test.model.*;

import web.ielts.Test.model.answer.listening.ListeningAnswer;
import web.ielts.Test.model.answer.reading.ReadingAnswer;
import web.ielts.Test.model.answer.speaking.*;
import web.ielts.Test.model.answer.writing.WritingAIResponse;
import web.ielts.Test.model.answer.writing.WritingAnswer;
import web.ielts.Test.repository.*;
import web.ielts.Test.repository.answer.ListeningAnswerRepository;
import web.ielts.Test.repository.answer.ReadingAnswerRepository;
import web.ielts.Test.repository.answer.SpeakingAnswerRepository;
import web.ielts.Test.repository.answer.WritingAnswerRepository;
import web.ielts.Test.service.AI.AIService;
import web.ielts.Test.service.AI.ProsodyService;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import web.ielts.Test.service.AI.AzurePronunciationService;
import web.ielts.Test.model.answer.speaking.AzurePronunciationResult;

@Service
public class DoTestService {
    @Autowired
    private ProsodyService prosodyService;

    @Autowired
    private WritingRepository writingRepository;

    @Autowired
    private ListeningRepository listeningRepository;

    @Autowired
    private ReadingRepository readingRepository;

    @Autowired
    private ReadingAnswerRepository readingAnswerRepository;

    @Autowired
    private WritingAnswerRepository writingAnswerRepository;

    @Autowired
    private ListeningAnswerRepository listeningAnswerRepository;
    @Autowired
    private SpeakingAnswerRepository speakingAnswerRepository;
    @Autowired
    private TestRepository testRepository;
    @Autowired
    private AIService aiService;
    @Autowired
    private SpeakingRepository speakingRepository;
    @Autowired
    private WhisperService whisper;
    @Autowired
    private AiSpeakingService aiSpeakingService;
    @Autowired
    private AzurePronunciationService azurePronunciationService;
    @Autowired
    private FileUploadService fileUploadService;




    public Speaking getSpeakingByTestId(String testId) {
        return speakingRepository.findByTestId(testId);
    }
    public Optional<Writing> getWritingByTestId(String testId) {
        return writingRepository.findById(testId);
    }


    public List<Listening> getAllListeningTests() {
        return listeningRepository.findAll();
    }

    public Listening getListeningByTestId(String testId) {
        return listeningRepository.findByTestId(testId);
    }

    public Reading getReadingByTestId(String testId) {
        return readingRepository.findByTestId(testId);
    }
    public Test getTestByTestId(String testId) {
        return testRepository.findById(testId).orElse(null);
    }

    public ReadingAnswer saveReadingAnswer(ReadingAnswer answer) {
        if (answer.getTestId() != null) {
            Reading original = readingRepository.findByTestId(answer.getTestId());
            if (original != null && original.getTasks() != null && answer.getTaskReadingAnswer() != null) {
                for (int t = 0; t < Math.min(original.getTasks().size(), answer.getTaskReadingAnswer().size()); t++) {
                    var origTask = original.getTasks().get(t);
                    var ansTask = answer.getTaskReadingAnswer().get(t);
                    if (origTask.getSections() != null && ansTask.getSections() != null) {
                        for (int s = 0; s < Math.min(origTask.getSections().size(), ansTask.getSections().size()); s++) {
                            var origSec = origTask.getSections().get(s);
                            var ansSec = ansTask.getSections().get(s);
                            if (origSec.getQuestions() != null && ansSec.getQuestions() != null) {
                                for (int q = 0; q < Math.min(origSec.getQuestions().size(), ansSec.getQuestions().size()); q++) {
                                    var origQ = origSec.getQuestions().get(q);
                                    var ansQ = ansSec.getQuestions().get(q);
                                    if ((ansQ.getExplanation() == null || ansQ.getExplanation().isEmpty()) && origQ.getExplanation() != null) {
                                        ansQ.setExplanation(origQ.getExplanation());
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        int totalQuestions = 0;
        int correctAnswers = 0;

        for (var task : answer.getTaskReadingAnswer()) {
            for (var section : task.getSections()) {
                String type = section.getType();
                for (var q : section.getQuestions()) {
                    totalQuestions++;
                    if (isAnswerCorrect(type, q.getAnswer(), q.getStudentAnswer())) {
                        correctAnswers++;
                    }
                }
            }
        }
        answer.setTotalQuestions(totalQuestions);
        answer.setTotalCorrect(correctAnswers);

        double percent = totalQuestions == 0 ? 0.0 : (double) correctAnswers / totalQuestions;

        double band;
        if (percent >= 0.9) band = 9;
        else if (percent >= 0.85) band = 8;
        else if (percent >= 0.8) band = 7.5;
        else if (percent >= 0.7) band = 7;
        else if (percent >= 0.6) band = 6;
        else if (percent >= 0.5) band = 5;
        else band = 4;

        answer.setBand(band);

        if (answer.getSubmittedAt() == null) {
            answer.setSubmittedAt(LocalDateTime.now());
        }

        return readingAnswerRepository.save(answer);
    }

    public ListeningAnswer saveListeningAnswer(ListeningAnswer answer) {
        if (answer.getTestId() != null) {
            Listening original = listeningRepository.findByTestId(answer.getTestId());
            if (original != null && original.getTasks() != null && answer.getTasks() != null) {
                for (int t = 0; t < Math.min(original.getTasks().size(), answer.getTasks().size()); t++) {
                    var origTask = original.getTasks().get(t);
                    var ansTask = answer.getTasks().get(t);
                    if (origTask.getSections() != null && ansTask.getSections() != null) {
                        for (int s = 0; s < Math.min(origTask.getSections().size(), ansTask.getSections().size()); s++) {
                            var origSec = origTask.getSections().get(s);
                            var ansSec = ansTask.getSections().get(s);
                            if (origSec.getQuestions() != null && ansSec.getQuestions() != null) {
                                for (int q = 0; q < Math.min(origSec.getQuestions().size(), ansSec.getQuestions().size()); q++) {
                                    var origQ = origSec.getQuestions().get(q);
                                    var ansQ = ansSec.getQuestions().get(q);
                                    if ((ansQ.getExplanation() == null || ansQ.getExplanation().isEmpty()) && origQ.getExplanation() != null) {
                                        ansQ.setExplanation(origQ.getExplanation());
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        int totalQuestions = 0;
        int correctAnswers = 0;

        for (var task : answer.getTasks()) {
            for (var section : task.getSections()) {
                String type = section.getType(); // lấy type trước
                for (var q : section.getQuestions()) {
                    totalQuestions++;
                    if (isAnswerCorrect(type, q.getAnswer(), q.getStudentAnswer())) {
                        correctAnswers++;
                    }
                }
            }
        }
        answer.setTotalQuestions(totalQuestions);
        answer.setTotalCorrect(correctAnswers);

        double percent = totalQuestions == 0 ? 0.0 : (double) correctAnswers / totalQuestions;

        double band;
        if (percent >= 0.9) band = 9;
        else if (percent >= 0.85) band = 8;
        else if (percent >= 0.8) band = 7.5;
        else if (percent >= 0.7) band = 7;
        else if (percent >= 0.6) band = 6;
        else if (percent >= 0.5) band = 5;
        else band = 4;

        answer.setBand(band);

        if (answer.getSubmittedAt() == null) {
            answer.setSubmittedAt(LocalDateTime.now());
        }

        return listeningAnswerRepository.save(answer);
    }

    private boolean isAnswerCorrect(String type, String correctAnswer, String studentAnswer) {
        if (correctAnswer == null || studentAnswer == null) return false;

        correctAnswer = correctAnswer.trim().toLowerCase();
        studentAnswer = studentAnswer.trim().toLowerCase();

        switch (type.toLowerCase()) {
            case "multiple-choice":
            case "dropdown":
                // So sánh ký tự đầu tiên của đáp án
                return correctAnswer.charAt(0) == studentAnswer.charAt(0);
            default:
                return correctAnswer.equals(studentAnswer);
        }
    }

    public WritingAnswer saveWritingAnswer(WritingAnswer answer) {
        WritingAnswer savedAnswer = writingAnswerRepository.save(answer);
        if(savedAnswer.getGradingMethod().equalsIgnoreCase("AI")) {
            // Xử lý Task 1 nếu có
            var task1 = savedAnswer.getTask1();
            if (task1 != null) {
                try {
                    WritingAIResponse eval1 = aiService.WritingTask1(task1.getImageUrl(), task1.getQuestion(), task1.getAnswer());

                    // Set feedback và sample answer
                    task1.setFeedback(eval1.getFeedback());
                    task1.getFeedback().setErrorCorrections(eval1.getFeedback().getErrorCorrections());
                    task1.getFeedback().setOverallComment(eval1.getFeedback().getOverallComment());
                    task1.getFeedback().setSentenceImprovements(eval1.getFeedback().getSentenceImprovements());
                    task1.setSampleAnswer(eval1.getSampleAnswer());
                    task1.setScore(eval1.getScore());

                    // Log evaluation
                   System.out.println("================================");
                    System.out.println("Task 1 Evaluation:");
                    System.out.println("- Task Achievement: " + eval1.getEvaluation().getTaskAchievement());
                    System.out.println("- Coherence Cohesion: " + eval1.getEvaluation().getCoherenceCohesion());
                    System.out.println("- Lexical Resource: " + eval1.getEvaluation().getLexicalResource());
                    System.out.println("- Grammar: " + eval1.getEvaluation().getGrammar());

                    // Set evaluation
//            if (task1.getEvaluation() == null) {
//                task1.setEvaluation(new WritingEvaluation());
//            }
                    task1.setEvaluation(eval1.getEvaluation());
                    task1.getEvaluation().setTaskAchievement(eval1.getEvaluation().getTaskAchievement());
                    task1.getEvaluation().setCoherenceCohesion(eval1.getEvaluation().getCoherenceCohesion());
                    task1.getEvaluation().setLexicalResource(eval1.getEvaluation().getLexicalResource());
                    task1.getEvaluation().setGrammar(eval1.getEvaluation().getGrammar());

                } catch (Exception e) {
                    System.out.println("Error evaluating Task 1: " + e.getMessage());
                }
            }

            // Xử lý Task 2 nếu có
            var task2 = savedAnswer.getTask2();
            if (task2 != null) {
                try {

                    WritingAIResponse eval2 = aiService.WritingTask2(task2.getQuestion(), task2.getAnswer());

                    // Set feedback và sample answer
                    task2.setFeedback(eval2.getFeedback());
                    task2.setSampleAnswer(eval2.getSampleAnswer());
                    task2.setScore(eval2.getScore());


                    task2.getFeedback().setErrorCorrections(eval2.getFeedback().getErrorCorrections());
                    task2.getFeedback().setSentenceImprovements(eval2.getFeedback().getSentenceImprovements());
                    task2.getFeedback().setOverallComment(eval2.getFeedback().getOverallComment());
                    // Log evaluation
                    System.out.println("================================");
                    System.out.println("Task 2 Evaluation:");
                    System.out.println("- Task Achievement: " + eval2.getEvaluation().getTaskAchievement());
                    System.out.println("- Coherence Cohesion: " + eval2.getEvaluation().getCoherenceCohesion());
                    System.out.println("- Lexical Resource: " + eval2.getEvaluation().getLexicalResource());
                    System.out.println("- Grammar: " + eval2.getEvaluation().getGrammar());

                    // Set evaluation
//            if (task2.getEvaluation() == null) {
//                task2.setEvaluation(new WritingEvaluation());
//            }
                    task2.setEvaluation(eval2.getEvaluation());
                    task2.getEvaluation().setTaskAchievement(eval2.getEvaluation().getTaskAchievement());
                    task2.getEvaluation().setCoherenceCohesion(eval2.getEvaluation().getCoherenceCohesion());
                    task2.getEvaluation().setLexicalResource(eval2.getEvaluation().getLexicalResource());
                    task2.getEvaluation().setGrammar(eval2.getEvaluation().getGrammar());

                } catch (Exception e) {
                    System.out.println("Error evaluating Task 2: " + e.getMessage());
                }
            }
        }
        return writingAnswerRepository.save(savedAnswer);
    }

    public void updateAnswerUrls(SpeakingAnswer speakingAnswer, Map<String, String> fileUrlMap) {
        SpeakingAnswerPart13 part1 = speakingAnswer.getPart1();
        double part1Score = 0.0;
        double part2Score = 0.0;
        double part3Score = 0.0;
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
                System.out.println("tai sao"+s3Url);
                qa.setAudioAnswer(s3Url);
                    try {
                        //Whisper
                        JsonNode transcript = whisper.transcribeWithTimestampsAndSyllables(s3UrlNotEncrypt);
                        System.out.println(transcript);
                        File mp3File = prosodyService.downloadAudioFile(s3UrlNotEncrypt);
                        File wavFile = prosodyService.convertMp3ToWav(mp3File);
                        String transcriptText = transcript.has("text") ? transcript.get("text").asText() : null;
                        //Azure
                        AzurePronunciationResult azureResult = azurePronunciationService.assessAndSave(wavFile, transcriptText, s3UrlNotEncrypt);

                        //ThongSoCoBanProsody
                        FleCohAnswer prosodyFeatures = prosodyService.analyzeProsodyFeatures(s3UrlNotEncrypt, transcript);
                        //PHan Viet
                        SpeakingAnswerQuestion sp = aiSpeakingService.evaluateSpeaking(transcript, qa.getQuestion(),1,prosodyFeatures,azureResult.getFluencyScore(),null);

                        // Tích hợp Azure Pronunciation Assessment

                        //Praat va AI
                        PronunciationAnswer pa = prosodyService.analyze(azureResult,s3UrlNotEncrypt,transcript,1);
                        pa.setAzureResult(azureResult);
                        qa.setTranscript(sp.getTranscript());
                        qa.setGrammarAnswer(sp.getGrammarAnswer());
                        qa.setLexicalAnswer(sp.getLexicalAnswer());
                        qa.setFluencyCohAnswer(sp.getFluencyCohAnswer());
                        qa.setPronunciationAnswer(pa);
                     //totalScore += eval.getScore();
                        double grammar = sp.getGrammarAnswer().getScore();
                        double lexical = sp.getLexicalAnswer().getScore();
                        double fluency = sp.getFluencyCohAnswer().getScore();
                        double pronunciation = pa.getScore();

                        double averageForThisQuestion = (grammar + lexical + fluency + pronunciation) / 4.0;
                        qa.setScore(averageForThisQuestion);
                        validQuestionCount++;
                        totalScore += averageForThisQuestion;
                        validQuestionCount++; // ✅ Thêm dòng này

                    } catch (Exception e) {
                        System.err.println("Lỗi khi chấm câu hỏi: " + qa.getQuestion());
                        e.printStackTrace();
                    }
            }
            double avgScore = validQuestionCount > 0 ? (totalScore / validQuestionCount) : 0.0;
            avgScore = new BigDecimal(avgScore).setScale(1, RoundingMode.HALF_UP).doubleValue();


            part1.setAverageScore(avgScore);
            part1Score = part1.getAverageScore();
        }

         //🔹 Part 2
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
                        //Whisper
                        JsonNode transcript = whisper.transcribeWithTimestampsAndSyllables(s3UrlNotEncrypt);
                        System.out.println(transcript);
                        File mp3File = prosodyService.downloadAudioFile(s3UrlNotEncrypt);
                        File wavFile = prosodyService.convertMp3ToWav(mp3File);
                        String transcriptText = transcript.has("text") ? transcript.get("text").asText() : null;
                        //Azure
                        AzurePronunciationResult azureResult = azurePronunciationService.assessAndSave(wavFile, transcriptText, s3UrlNotEncrypt);

                        //ThongSoCoBanProsody
                        FleCohAnswer prosodyFeatures = prosodyService.analyzeProsodyFeatures(s3UrlNotEncrypt, transcript);
                        //PHan Viet
                        SpeakingAnswerQuestion sp = aiSpeakingService.evaluateSpeaking(transcript, part2.getQuestion(),1,prosodyFeatures,azureResult.getFluencyScore(),null);

                        // Tích hợp Azure Pronunciation Assessment

                        //Praat va AI
                        PronunciationAnswer pa = prosodyService.analyze(azureResult,s3UrlNotEncrypt,transcript,2);
                        pa.setAzureResult(azureResult);
                        part2.setTranscript(sp.getTranscript());
                        part2.setGrammarAnswer(sp.getGrammarAnswer());
                        part2.setLexicalAnswer(sp.getLexicalAnswer());
                        part2.setFluencyCohAnswer(sp.getFluencyCohAnswer());
                        part2.setPronunciationAnswer(pa);
                        //part2.setAzurePronunciationResult(azureResult); // Cần thêm trường này vào model nếu muốn lưu
                        double grammar = sp.getGrammarAnswer().getScore();
                        double lexical = sp.getLexicalAnswer().getScore();
                        double fluency = sp.getFluencyCohAnswer().getScore();
                        double pronunciation = pa.getScore();
                        double averageForThisQuestion = (grammar + lexical + fluency + pronunciation) / 4.0;

                        averageForThisQuestion = new BigDecimal(averageForThisQuestion).setScale(1, RoundingMode.HALF_UP).doubleValue();
                        part2.setScore(averageForThisQuestion);
                        part2Score = part2.getScore();
                        // validQuestionCount++;
                    } catch (Exception e) {
                        System.err.println("❌ Lỗi khi chấm Part 2");
                        e.printStackTrace();
                    }




            }

        }

  //Part 3
       SpeakingAnswerPart13 part3 = speakingAnswer.getPart3();
        if (part3 != null && part3.getQuestions() != null) {

            double totalScore = 0;
            int validQuestionCount = part3.getQuestions().size();

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
                        //Whisper
                        JsonNode transcript = whisper.transcribeWithTimestampsAndSyllables(s3UrlNotEncrypt);
                        System.out.println(transcript);
                        File mp3File = prosodyService.downloadAudioFile(s3UrlNotEncrypt);
                        File wavFile = prosodyService.convertMp3ToWav(mp3File);
                        String transcriptText = transcript.has("text") ? transcript.get("text").asText() : null;
                        //Azure
                        AzurePronunciationResult azureResult = azurePronunciationService.assessAndSave(wavFile, transcriptText, s3UrlNotEncrypt);

                        //ThongSoCoBanProsody
                        FleCohAnswer prosodyFeatures = prosodyService.analyzeProsodyFeatures(s3UrlNotEncrypt, transcript);
                        //PHan Viet
                        SpeakingAnswerQuestion sp = aiSpeakingService.evaluateSpeaking(transcript, qa.getQuestion(),1,prosodyFeatures,azureResult.getFluencyScore(),null);
                        // Tích hợp Azure Pronunciation Assessment

                        //Praat va AI
                        PronunciationAnswer pa = prosodyService.analyze(azureResult,s3UrlNotEncrypt,transcript,3);
                        qa.setTranscript(sp.getTranscript());
                        qa.setGrammarAnswer(sp.getGrammarAnswer());
                        qa.setLexicalAnswer(sp.getLexicalAnswer());
                        qa.setFluencyCohAnswer(sp.getFluencyCohAnswer());
                        qa.setPronunciationAnswer(pa);
                        //qa.setAzurePronunciationResult(azureResult); // Cần thêm trường này vào model nếu muốn lưu
                        //totalScore += eval.getScore();
                        double grammar = sp.getGrammarAnswer().getScore();
                        double lexical = sp.getLexicalAnswer().getScore();
                        double fluency = sp.getFluencyCohAnswer().getScore();
                        double pronunciation = pa.getScore();

                        double averageForThisQuestion = (grammar + lexical + fluency + pronunciation) / 4.0;
                        qa.setScore(averageForThisQuestion);

                        totalScore += averageForThisQuestion;
                        validQuestionCount++;


                    } catch (Exception e) {

                        e.printStackTrace();
                    }



            }
            double avgScore = validQuestionCount > 0 ? (totalScore / validQuestionCount) : 0.0;
            avgScore = new BigDecimal(avgScore).setScale(1, RoundingMode.HALF_UP).doubleValue();
            part3.setAverageScore(avgScore);
            part3Score = part3.getAverageScore();


        }
        double band = part1Score + part2Score + part3Score;
        double avgBand = Math.round((band / 3.0) * 2) / 2.0;
        speakingAnswer.setBand(avgBand);
    }
    private String extractFileName(String blobUrl) {

        try {
            return blobUrl.substring(blobUrl.lastIndexOf("/") + 1);
        } catch (Exception e) {
            return blobUrl; // fallback
        }
    }


    public SpeakingAnswer saveSubmission(SpeakingAnswer submission) {
        return speakingAnswerRepository.save(submission);
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