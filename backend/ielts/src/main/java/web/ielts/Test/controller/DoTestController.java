package web.ielts.Test.controller;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import web.ielts.Test.model.*;
import web.ielts.Test.model.answer.listening.ListeningAnswer;
import web.ielts.Test.model.answer.reading.ReadingAnswer;
import web.ielts.Test.model.answer.speaking.SpeakingAnswer;
import web.ielts.Test.model.answer.writing.WritingAnswer;
import web.ielts.Test.service.DoTestService;
import web.ielts.Test.service.TestAnswerService;
import web.ielts.User.User;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/verify")
public class DoTestController {

    @Autowired
    private DoTestService doTestService;

    @Autowired
    private TestAnswerService testAnswerService;

    @GetMapping("/writing/{testId}")
    public ResponseEntity<Writing> getWritingByTestId(@PathVariable String testId) {
        return doTestService.getWritingByTestId(testId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }


    @GetMapping("/listening/{testId}")
    public ResponseEntity<Listening> getListeningByTestId(@PathVariable String testId) {
        Listening listening = doTestService.getListeningByTestId(testId);
        return listening != null ? ResponseEntity.ok(listening) : ResponseEntity.notFound().build();
    }

    @GetMapping("/reading/{testId}")
    public ResponseEntity<Reading> getReadingByTestId(@PathVariable String testId) {
        Reading reading = doTestService.getReadingByTestId(testId);
        return reading != null ? ResponseEntity.ok(reading) : ResponseEntity.notFound().build();
    }
    @GetMapping("speaking/{testId}")
    public ResponseEntity<Speaking> getSpeakingByTestId(@PathVariable String testId) {
        Speaking speaking = doTestService.getSpeakingByTestId(testId);
        if (speaking != null) {
            return ResponseEntity.ok(speaking);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    @GetMapping("/fullTest/{testId}")
    public ResponseEntity<Test> getFullTestByTestId(@PathVariable String testId, @AuthenticationPrincipal User user) {
        // Không tạo TestAnswer ở đây nữa, chỉ trả về test
        Test test = doTestService.getTestByTestId(testId);
        return test != null ? ResponseEntity.ok(test) : ResponseEntity.notFound().build();
    }
    @PostMapping("/test-answer/create")
    public ResponseEntity<TestAnswer> createTestAnswer(@RequestParam String testId, @RequestParam String username) {
        TestAnswer testAnswer = testAnswerService.createTestAnswer(testId, username);
        return ResponseEntity.ok(testAnswer);
    }
    @PostMapping("/reading/submit")
    public ResponseEntity<ReadingAnswer> saveReadingAnswer(@RequestBody ReadingAnswer answer, @RequestParam(required = false) String testAnswerId) {
        ReadingAnswer saved = doTestService.saveReadingAnswer(answer);
        if (testAnswerId != null && !testAnswerId.isEmpty()) {
            testAnswerService.updateReadingAnswer(testAnswerId, saved.getId());
        }
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/writing/submit")
    public ResponseEntity<WritingAnswer> saveWritingAnswer(@RequestBody WritingAnswer answer, @RequestParam(required = false) String testAnswerId) {
        answer.setSubmittedAt(java.time.LocalDateTime.now()); // Set submission time
        WritingAnswer saved = doTestService.saveWritingAnswer(answer);
        if (testAnswerId != null && !testAnswerId.isEmpty()) {
            testAnswerService.updateWritingAnswer(testAnswerId, saved.getId());
        }
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/listening/submit")
    public ResponseEntity<ListeningAnswer> saveListeningAnswer(@RequestBody ListeningAnswer answer, @RequestParam(required = false) String testAnswerId) {
        ListeningAnswer saved = doTestService.saveListeningAnswer(answer);
        if (testAnswerId != null && !testAnswerId.isEmpty()) {
            testAnswerService.updateListeningAnswer(testAnswerId, saved.getId());
        }
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/speaking/submit")
    public ResponseEntity<Map<String, Object>> uploadFiles(
            @RequestPart("metadata") MultipartFile metadataJson,
            @RequestPart(value = "files", required = false) MultipartFile[] files,
            @RequestParam(required = false) String testAnswerId,
            @AuthenticationPrincipal User user
    ) {
        String studentUsername = (user != null && user.getUsername() != null) ? user.getUsername() : "anonymous";
        String userRole = (user != null && user.getRole() != null && !user.getRole().isEmpty()) ? user.getRole().get(0) : "STUDENT";
        System.out.println("User: " + studentUsername + ", Role: " + userRole);

        String testId;
        SpeakingAnswer submission;
        SpeakingAnswer saved;

        try {
            String jsonString = new String(metadataJson.getBytes(), StandardCharsets.UTF_8);
            ObjectMapper mapper = new ObjectMapper();
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            JsonNode root = mapper.readTree(jsonString);

            testId = root.get("testId").asText();
            submission = mapper.readValue(jsonString, SpeakingAnswer.class);
            submission.setUsername(studentUsername);
             System.out.println(submission.toString());
            saved = doTestService.saveSubmission(submission);
            System.out.println(saved);

        } catch (IOException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi khi đọc hoặc lưu metadata JSON: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }

        Map<String, String> fileUrlMap = new HashMap<>();

        if (files != null && files.length > 0) {
            for (MultipartFile file : files) {
                try {
                    String url = doTestService.uploadFile(file, "speaking", userRole, studentUsername);
                    fileUrlMap.put(file.getOriginalFilename(), url);
                    System.out.println("Uploaded: " + url);
                } catch (IOException e) {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", "Upload failed: " + e.getMessage());
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
                }
            }
        } else {
            System.out.println("No files uploaded, only saving metadata.");
        }

        doTestService.updateAnswerUrls(saved, fileUrlMap);
        doTestService.saveSubmission(saved);
        Map<String, Object> response = new HashMap<>();

        response.put("id", saved.getId());
        response.put("message", "✅ Upload và cập nhật thành công!");

        if (testAnswerId != null && !testAnswerId.isEmpty()) {
            testAnswerService.updateSpeakingAnswer(testAnswerId, saved.getId());
        }
        return ResponseEntity.ok(response);
    }



}
