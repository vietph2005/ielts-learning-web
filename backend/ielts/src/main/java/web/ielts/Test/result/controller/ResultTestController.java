package web.ielts.Test.result.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import web.ielts.Test.result.model.listening.ListeningAnswer;
import web.ielts.Test.result.model.reading.ReadingAnswer;
import web.ielts.Test.result.model.speaking.SpeakingAnswer;
import web.ielts.Test.result.model.writing.WritingAnswer;
import web.ielts.Test.result.model.TestAnswer;
import web.ielts.Test.result.repository.WritingAnswerRepository;
import web.ielts.Test.result.service.ResultService;
import web.ielts.Test.result.service.TestAnswerService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import web.ielts.User.User;

import java.util.Map;

@RestController
@RequestMapping("/api/result")
public class ResultTestController {
    @Autowired
    private WritingAnswerRepository writingAnswerRepository;
    @Autowired
    private ResultService resultService;
    @Autowired
    private TestAnswerService testAnswerService;

    @GetMapping("/{id}")
    public ResponseEntity<WritingAnswer> getWritingById(@PathVariable String id) {
        return writingAnswerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/speaking/{id}")
    public ResponseEntity<SpeakingAnswer> getSpeakingAnswerById(@PathVariable String id) {
        return resultService.findSpeakingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/listening")
    public ResponseEntity<?> submitListeningAnswer(@RequestBody ListeningAnswer answer) {
        ListeningAnswer saved = resultService.saveAnswer(answer);
        return ResponseEntity.ok(Map.of(
                "message", "Saved successfully",
                "answerId", saved.getId()
        ));
    }

    @GetMapping("/listening/by-id")
    public ResponseEntity<?> getListeningAnswerById(@RequestParam String answerId) {
        return resultService.findListeningById(answerId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/reading")
    public ResponseEntity<?> submitReadingAnswer(@RequestBody ReadingAnswer answer) {
        ReadingAnswer saved = resultService.saveAnswer(answer);
        return ResponseEntity.ok(Map.of(
                "message", "Saved successfully",
                "answerId", saved.getId()
        ));
    }

    @GetMapping("/reading/by-id")
    public ResponseEntity<?> getReadingAnswerById(@RequestParam String answerId) {
        return resultService.findReadingById(answerId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/fulltest/{testAnswerId}")
    public ResponseEntity<?> getFullTestResult(@PathVariable String testAnswerId, @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        TestAnswer testAnswer = testAnswerService.getById(testAnswerId).orElse(null);
        if (testAnswer == null) return ResponseEntity.notFound().build();

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("testAnswerId", testAnswer.getId());
        if (testAnswer.getListeningAnswerId() != null) {
            result.put("listening", resultService.findListeningById(testAnswer.getListeningAnswerId()).orElse(null));
        }
        if (testAnswer.getReadingAnswerId() != null) {
            result.put("reading", resultService.findReadingById(testAnswer.getReadingAnswerId()).orElse(null));
        }
        if (testAnswer.getWritingAnswerId() != null) {
            result.put("writing", writingAnswerRepository.findById(testAnswer.getWritingAnswerId()).orElse(null));
        }
        if (testAnswer.getSpeakingAnswerId() != null) {
            result.put("speaking", resultService.findSpeakingById(testAnswer.getSpeakingAnswerId()).orElse(null));
        }
        return ResponseEntity.ok(result);
    }
}
