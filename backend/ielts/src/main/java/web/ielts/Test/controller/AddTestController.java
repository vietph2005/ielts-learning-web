package web.ielts.Test.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import web.ielts.Test.model.*;
import web.ielts.Test.model.add.*;
import web.ielts.Test.repository.*;
import web.ielts.Test.repository.add.*;
import web.ielts.Test.service.AddTestService;

import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RestController
@RequestMapping("/api")
public class AddTestController {

    @Autowired
    private AddTestService testService;
    @Autowired
    private AddTestService addTestService;
    @Autowired
    private AddTestRepository addTestRepo;
    @Autowired
    private AddListeningRepository addListeningRepo;
    @Autowired
    private AddReadingRepository addReadingRepo;
    @Autowired
    private AddWritingRepository addWritingRepo;
    @Autowired
    private AddSpeakingRepository addSpeakingRepo;
    @Autowired
    private TestRepository testRepo;
    @Autowired
    private ListeningRepository listeningRepo;
    @Autowired
    private ReadingRepository readingRepo;
    @Autowired
    private WritingRepository writingRepo;
    @Autowired
    private SpeakingRepository speakingRepo;

    @PostMapping("/teacher/request-test")
    public ResponseEntity<String> saveTest(@RequestBody AddTestRequest request) {
        try {
            testService.saveFullTest(request);
            return ResponseEntity.ok("Test saved successfully!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to save test");
        }
    }

    @GetMapping("/teacher/tests")
    public ResponseEntity<List<Map<String, Object>>> getTeacherTests() {
        try {
            List<Map<String, Object>> tests = testService.getAllTestsForTeacher();
            return ResponseEntity.ok(tests);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/teacher/test/{testId}")
    public ResponseEntity<Map<String, Object>> getTestForEdit(@PathVariable String testId) {
        try {
            Map<String, Object> details = testService.getFullTestDetails(testId);
            if (details == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/teacher/test/{testId}")
    public ResponseEntity<String> updateTest(@PathVariable String testId, @RequestBody AddTestRequest request) {
        try {
            testService.updateFullTest(testId, request);
            return ResponseEntity.ok("Test updated successfully!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to update test: " + e.getMessage());
        }
    }

    @GetMapping("/manager/request-tests")
    public ResponseEntity<List<AddTest>> getAllRequestTests() {
        try {
            List<AddTest> tests = addTestRepo.findAll();
            return ResponseEntity.ok(tests);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/manager/request-test/{testId}")
    public ResponseEntity<Map<String, Object>> getRequestTestDetail(@PathVariable String testId) {
        try {
            AddTest addTest = addTestRepo.findById(testId).orElse(null);
            if (addTest == null) {
                return ResponseEntity.notFound().build();
            }

            AddListening addListening = addListeningRepo.findByTestId(testId);
            AddReading addReading = addReadingRepo.findByTestId(testId);
            AddWriting addWriting = addWritingRepo.findByTestId(testId);
            AddSpeaking addSpeaking = addSpeakingRepo.findByTestId(testId);

            Map<String, Object> response = new HashMap<>();
            response.put("test", addTest);
            response.put("listening", addListening);
            response.put("reading", addReading);
            response.put("writing", addWriting);
            response.put("speaking", addSpeaking);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/manager/request-test/{testId}")
    public ResponseEntity<String> deleteRequestTest(@PathVariable String testId) {
        try {
            AddTest addTest = addTestRepo.findById(testId).orElse(null);
            if (addTest == null) {
                return ResponseEntity.badRequest().body("Test not found");
            }

            // Xóa tất cả dữ liệu liên quan
            addTestRepo.deleteById(testId);

            AddListening addListening = addListeningRepo.findByTestId(testId);
            if (addListening != null) addListeningRepo.delete(addListening);

            AddReading addReading = addReadingRepo.findByTestId(testId);
            if (addReading != null) addReadingRepo.delete(addReading);

            AddWriting addWriting = addWritingRepo.findByTestId(testId);
            if (addWriting != null) addWritingRepo.delete(addWriting);

            AddSpeaking addSpeaking = addSpeakingRepo.findByTestId(testId);
            if (addSpeaking != null) addSpeakingRepo.delete(addSpeaking);

            return ResponseEntity.ok("Test deleted successfully!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to delete test");
        }
    }

    @PostMapping("/manager/accept-test/{testId}")
    public ResponseEntity<String> acceptTest(@PathVariable("testId") String testId) {
        try {
            AddTest addTest = addTestRepo.findById(testId).orElse(null);
            AddListening addListening = addListeningRepo.findByTestId(testId);
            AddReading addReading = addReadingRepo.findByTestId(testId);
            AddWriting addWriting = addWritingRepo.findByTestId(testId);
            AddSpeaking addSpeaking = addSpeakingRepo.findByTestId(testId);

            if (addTest == null) return ResponseEntity.badRequest().body("Test not found");

            String newTestId = testService.generateNextTestId();

            Listening listening = addTestService.convertAddListeningToListening(addListening, newTestId);
            if (listening != null) listeningRepo.save(listening);

            Reading reading = addTestService.convertAddReadingToReading(addReading, newTestId);
            if (reading != null) readingRepo.save(reading);

            Writing writing = addTestService.convertAddWritingToWriting(addWriting, newTestId);
            if (writing != null) writingRepo.save(writing);

            Speaking speaking = addTestService.convertAddSpeakingToSpeaking(addSpeaking, newTestId);
            if (speaking != null) speakingRepo.save(speaking);

            Test test = new Test();
            test.setTestId(newTestId);
            test.setTestTitle(addTest.getTestTitle());
            test.setTags(addTest.getTags());
            SimpleDateFormat isoFormat = new SimpleDateFormat("yyyy-MM-dd");
            test.setCreatedAt(isoFormat.format(addTest.getCreateAt()));
            testRepo.save(test);

            // Xóa bản ghi request
            addTestRepo.deleteById(testId);
            if (addListening != null) addListeningRepo.delete(addListening);
            if (addReading != null) addReadingRepo.delete(addReading);
            if (addWriting != null) addWritingRepo.delete(addWriting);
            if (addSpeaking != null) addSpeakingRepo.delete(addSpeaking);

            return ResponseEntity.ok("Accepted and moved to main database!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to accept test");
        }
    }
}