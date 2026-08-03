//package web.ielts.Test.controller;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.RestController;
//import web.ielts.Test.model.answer.listening.ListeningAnswer;
//import web.ielts.Test.model.answer.reading.ReadingAnswer;
//import web.ielts.Test.model.answer.speaking.SpeakingAnswer;
//import web.ielts.Test.service.ResultService;
//
//import java.util.Optional;
//
//@RestController
//@RequestMapping("/api/result")
//public class ResultController {
//    @Autowired
//    private ResultService resultService;
//
//    @GetMapping("/listening")
//    public ResponseEntity<?> getListeningResult(@RequestParam String testId, @RequestParam String username) {
//        Optional<ListeningAnswer> answer = resultService.getListeningResult(testId, username);
//        return answer.map(ResponseEntity::ok)
//                .orElseGet(() -> ResponseEntity.notFound().build());
//    }
//
//
//    @GetMapping("/reading")
//    public ResponseEntity<?> getReadingResult(@RequestParam String testId, @RequestParam String username) {
//        Optional<ReadingAnswer> answer = resultService.getReadingResult(testId, username);
//        return answer.map(ResponseEntity::ok)
//                .orElseGet(() -> ResponseEntity.notFound().build());
//    }
//
//
//}