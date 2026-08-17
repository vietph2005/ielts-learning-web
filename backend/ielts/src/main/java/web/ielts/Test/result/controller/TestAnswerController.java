package web.ielts.Test.result.controller;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import web.ielts.Common.dto.ApiResponse;
import web.ielts.Common.exception.BadRequestException;
import web.ielts.Test.dotest.service.ListeningTestService;
import web.ielts.Test.dotest.service.ReadingTestService;
import web.ielts.Test.dotest.service.SpeakingTestService;
import web.ielts.Test.dotest.service.WritingTestService;
import web.ielts.Test.result.model.TestAnswer;
import web.ielts.Test.result.model.listening.ListeningAnswer;
import web.ielts.Test.result.model.reading.ReadingAnswer;
import web.ielts.Test.result.model.speaking.SpeakingAnswer;
import web.ielts.Test.result.model.writing.WritingAnswer;
import web.ielts.Test.result.service.TestAnswerService;
import web.ielts.User.User;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/test-answers")
public class TestAnswerController {

    @Autowired
    private TestAnswerService testAnswerService;

    @Autowired
    private ReadingTestService readingTestService;

    @Autowired
    private ListeningTestService listeningTestService;

    @Autowired
    private WritingTestService writingTestService;

    @Autowired
    private SpeakingTestService speakingTestService;

    @PostMapping
    public ApiResponse<TestAnswer> createTestAnswer(
            @RequestParam String testId,
            @RequestParam String username
    ) {
        TestAnswer testAnswer = testAnswerService.createTestAnswer(testId, username);
        return ApiResponse.success(testAnswer, "Khởi tạo phiên làm bài thành công");
    }

    @PostMapping("/reading")
    public ApiResponse<ReadingAnswer> submitReadingAnswer(
            @RequestBody ReadingAnswer answer,
            @RequestParam(required = false) String testAnswerId
    ) {
        ReadingAnswer saved = readingTestService.saveReadingAnswer(answer);
        if (testAnswerId != null && !testAnswerId.isEmpty()) {
            testAnswerService.updateReadingAnswer(testAnswerId, saved.getId());
        }
        return ApiResponse.success(saved, "Nộp bài Reading thành công");
    }

    @PostMapping("/writing")
    public ApiResponse<WritingAnswer> submitWritingAnswer(
            @RequestBody WritingAnswer answer,
            @RequestParam(required = false) String testAnswerId
    ) {
        answer.setSubmittedAt(java.time.LocalDateTime.now());
        // saveWritingAnswer sẽ lưu ngay và kick off async grading
        WritingAnswer saved = writingTestService.saveWritingAnswer(answer);
        if (testAnswerId != null && !testAnswerId.isEmpty()) {
            testAnswerService.updateWritingAnswer(testAnswerId, saved.getId());
        }
        return ApiResponse.success(saved, "Nộp bài Writing thành công - đang chấm điểm AI");
    }

    /**
     * Polling endpoint: Frontend gọi mỗi 3s để kiểm tra trạng thái chấm AI.
     * gradingStatus: "grading" | "graded" | "grading_failed" | "submitted"
     */
    @GetMapping("/writing/{id}/status")
    public ApiResponse<Map<String, Object>> getWritingGradingStatus(@PathVariable String id) {
        return writingTestService.getWritingAnswerById(id)
                .map(answer -> {
                    Map<String, Object> statusData = new HashMap<>();
                    statusData.put("id", answer.getId());
                    statusData.put("gradingStatus", answer.getGradingStatus());
                    statusData.put("band", answer.getBand());
                    // Chỉ trả task scores khi đã chấm xong
                    if ("graded".equals(answer.getGradingStatus())) {
                        statusData.put("task1Score", answer.getTask1() != null ? answer.getTask1().getScore() : null);
                        statusData.put("task2Score", answer.getTask2() != null ? answer.getTask2().getScore() : null);
                    }
                    return ApiResponse.success(statusData, "OK");
                })
                .orElse(ApiResponse.success(Map.of("gradingStatus", "not_found"), "Not found"));
    }

    @PostMapping("/listening")
    public ApiResponse<ListeningAnswer> submitListeningAnswer(
            @RequestBody ListeningAnswer answer,
            @RequestParam(required = false) String testAnswerId
    ) {
        ListeningAnswer saved = listeningTestService.saveListeningAnswer(answer);
        if (testAnswerId != null && !testAnswerId.isEmpty()) {
            testAnswerService.updateListeningAnswer(testAnswerId, saved.getId());
        }
        return ApiResponse.success(saved, "Nộp bài Listening thành công");
    }

    @PostMapping(value = "/speaking", consumes = "multipart/form-data")
    public ApiResponse<Map<String, Object>> submitSpeakingAnswer(
            @RequestPart("metadata") MultipartFile metadataJson,
            @RequestPart(value = "files", required = false) MultipartFile[] files,
            @RequestParam(required = false) String testAnswerId,
            @AuthenticationPrincipal User user
    ) {
        String studentUsername = (user != null && user.getUsername() != null) ? user.getUsername() : "anonymous";
        String userRole = (user != null && user.getRole() != null && !user.getRole().isEmpty()) ? user.getRole().get(0) : "STUDENT";

        SpeakingAnswer submission;
        SpeakingAnswer saved;

        try {
            String jsonString = new String(metadataJson.getBytes(), StandardCharsets.UTF_8);
            ObjectMapper mapper = new ObjectMapper();
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

            submission = mapper.readValue(jsonString, SpeakingAnswer.class);
            submission.setUsername(studentUsername);
            saved = speakingTestService.saveSubmission(submission);
        } catch (IOException e) {
            throw new BadRequestException("Lỗi khi đọc hoặc lưu metadata JSON: " + e.getMessage());
        }

        Map<String, String> fileUrlMap = new HashMap<>();
        if (files != null && files.length > 0) {
            for (MultipartFile file : files) {
                try {
                    String url = speakingTestService.uploadFile(file, "speaking", userRole, studentUsername);
                    fileUrlMap.put(file.getOriginalFilename(), url);
                } catch (IOException e) {
                    throw new BadRequestException("Upload speaking file thất bại: " + e.getMessage());
                }
            }
        }

        speakingTestService.updateAnswerUrls(saved, fileUrlMap);
        speakingTestService.saveSubmission(saved);

        if (testAnswerId != null && !testAnswerId.isEmpty()) {
            testAnswerService.updateSpeakingAnswer(testAnswerId, saved.getId());
        }

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("id", saved.getId());
        return ApiResponse.success(responseData, "Nộp bài Speaking thành công");
    }
}
