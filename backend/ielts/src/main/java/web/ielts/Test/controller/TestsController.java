package web.ielts.Test.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;
import web.ielts.Test.dto.ListTest;
import web.ielts.Test.model.*;
import web.ielts.Test.repository.*;
import web.ielts.Test.repository.add.AddTestRepository;
import web.ielts.Test.service.AI.ProsodyService;
import web.ielts.Test.service.AI.AIService;
import web.ielts.Test.service.TestService;

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RestController
@RequestMapping("/api")
public class TestsController {
    @Autowired
    private ProsodyService prosodyService;

    @Autowired
    private TestService testService;
    
    @Autowired
    private TestRepository testRepo;
    @Autowired
    private AddTestRepository addTestRepo;
    @Autowired
    private AIService aiService;


    @GetMapping("/test/all-skill")
    public Map<Integer, List<ListTest>> getTestsGroupedByYear() {
        return testService.getTestsGroupedByYear();
    }

    @GetMapping("/test/listening")
    public Map<Integer, List<ListTest>> getListeningTestsGroupedByYear() {
        return testService.getListeningTestsByYear();
    }

    @GetMapping("/test/reading")
    public Map<Integer, List<ListTest>> getReadingTestsGroupedByYear() {
        return testService.getReadingTestsByYear();
    }

    @GetMapping("/test/writing")
    public Map<Integer, List<ListTest>> getWritingTestsGroupedByYear() {
        return testService.getWritingTestsByYear();
    }

    @GetMapping("/test/speaking")
    public Map<Integer, List<ListTest>> getSpeakingTestsGroupedByYear() {
        return testService.getSpeakingTestsByYear();
    }

    @GetMapping("/3-tests")
    public List<Test> getThreeTests() {
        return testRepo.findAll(PageRequest.of(0, 3)).getContent();
    }

    @GetMapping("/test/count")
    public int volumeOfTest() {
        return (int) addTestRepo.count();
    }
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("OK");
    }

    @PostMapping("/ai-chat")
    public ResponseEntity<String> aiChat(@RequestBody Map<String, Object> body) {
        // Nhận mảng messages từ frontend
        Object messagesObj = body.get("messages");
        String prompt = (String) body.getOrDefault("prompt", "");
        try {
            // System prompt: chỉ trả lời bằng tiếng Việt, chỉ thêm tiếng Anh nếu học sinh yêu cầu ví dụ, đặt câu, hoặc dịch sang tiếng Anh
            String systemPrompt = "Bạn là trợ lý AI cho học sinh Việt Nam. Mặc định, bạn CHỈ trả lời bằng tiếng Việt. Nếu học sinh yêu cầu ví dụ, " +
                    "đặt câu, hoặc dịch sang tiếng Anh thì mới trả lời thêm tiếng Anh. Nếu không, tuyệt đối không trả lời song ngữ." +
                    " Nếu học sinh hỏi nghĩa từ, giải thích, ngữ pháp, ... chỉ trả lời tiếng Việt. Nếu học sinh hỏi 'đặt câu', 'ví dụ', 'example', 'sentence', " +
                    "'dịch sang tiếng Anh', 'translate to English'... thì trả lời cả hai ngôn ngữ, trong đó tiếng Việt trước, tiếng Anh sau.\n\n" +
                    "Ví dụ:\nQ: Nghĩa của từ 'flow'?\nA: 'Flow' nghĩa là sự chuyển động liên tục của chất lỏng, khí hoặc điện. " +
                    "Nó cũng có thể chỉ sự tiến triển trôi chảy của một quá trình hoặc ý tưởng.\n---\nQ: Đặt câu với từ 'flow'?\nA:" +
                    "" +
                    " Tiếng Việt: Dòng sông chảy rất mạnh sau cơn mưa lớn.\nTiếng Anh: The river flows very strongly after the heavy rain.\n---";
            // Xây dựng mảng messages cho OpenAI
            List<Map<String, String>> messages = new java.util.ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));
            if (messagesObj instanceof List<?>) {
                for (Object m : (List<?>) messagesObj) {
                    if (m instanceof Map) {
                        Map<?,?> mm = (Map<?,?>) m;
                        String role = String.valueOf(mm.get("role"));
                        String content = String.valueOf(mm.get("content"));
                        if (role != null && content != null && !content.trim().isEmpty()) {
                            // Chuyển role user/assistant đúng chuẩn OpenAI
                            if (role.equals("user") || role.equals("assistant")) {
                                messages.add(Map.of("role", role, "content", content));
                            }
                        }
                    }
                }
            } else if (prompt != null && !prompt.trim().isEmpty()) {
                messages.add(Map.of("role", "user", "content", prompt));
            }
            // Gọi AIService với mảng messages
            String result = aiService.callChatWithMessages(messages);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("AI error: " + e.getMessage());
        }
    }
//    @GetMapping("/evaluate")
//    public void evaluate() throws IOException {
//        String jsonString = """
//        {
//            "task": "transcribe",
//            "language": "english",
//            "duration": 5.34,
//            "text": "Hello, my name Gustavo, but you can call me Gus.",
//            "words": [
//              {
//                "word": "Hello",
//                "syllables": 2,
//                "start": 0.0,
//                "end": 0.82
//              },
//              {
//                "word": "my",
//                "syllables": 1,
//                "start": 1.26,
//                "end": 1.34
//              },
//              {
//                "word": "name",
//                "syllables": 1,
//                "start": 1.34,
//                "end": 1.56
//              },
//              {
//                "word": "Gustavo",
//                "syllables": 3,
//                "start": 1.56,
//                "end": 2.12
//              },
//              {
//                "word": "but",
//                "syllables": 1,
//                "start": 2.68,
//                "end": 2.68
//              },
//              {
//                "word": "you",
//                "syllables": 1,
//                "start": 2.68,
//                "end": 2.78
//              },
//              {
//                "word": "can",
//                "syllables": 1,
//                "start": 2.78,
//                "end": 3.0
//              },
//              {
//                "word": "call",
//                "syllables": 1,
//                "start": 3.0,
//                "end": 3.16
//              },
//              {
//                "word": "me",
//                "syllables": 1,
//                "start": 3.16,
//                "end": 3.32
//              },
//              {
//                "word": "Gus",
//                "syllables": 1,
//                "start": 3.32,
//                "end": 3.52
//              }
//            ],
//            "usage": {
//              "type": "duration",
//              "seconds": 6
//            }
//          }
//
//        """;
//
//        JsonNode transcript = null;
//        try {
//            ObjectMapper mapper = new ObjectMapper();
//            transcript = mapper.readTree(jsonString);
//
//            // Example: print the text field
//            System.out.println("Transcript Text: " + transcript.get("text").asText());
//
//            // Example: print number of words
//            System.out.println("Total words: " + transcript.get("words").size());
//
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//
//        String url = "https://swpieltsbucket.s3.ap-southeast-1.amazonaws.com/audio/user/phamhoangviet05052005%40gmail.com/T002_686e3b5c5f452736dfdd9a9e/part1-1.mp3";
////        Map<String, Object> pronunciationAnalysis = prosodyService.analyzePronunciation(url, transcript);
//    }

}
