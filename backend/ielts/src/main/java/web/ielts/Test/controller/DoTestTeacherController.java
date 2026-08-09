package web.ielts.Test.controller;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import web.ielts.Config.EmailConfig;
import web.ielts.Test.model.Writing;
import web.ielts.Test.model.answer.writing.WritingAnswer;

import java.util.List;

@RestController
@RequestMapping("/verify")
public class DoTestTeacherController {
    @Autowired
    private DoTestTeacherService doTestTeacherService;
    @Autowired
    private EmailConfig emailConfig;
    @GetMapping("writingbyteacher/{testId}")
    public ResponseEntity<WritingAnswer> getWritingAnswerByTestId(@PathVariable String testId) {
        return doTestTeacherService.getWritingAnswerByTestId(testId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/writingteachersubmit")
    public ResponseEntity<WritingAnswer> saveWritingAnswer(@RequestBody WritingAnswer answer) {
        WritingAnswer savedAnswer = doTestTeacherService.saveWritingAnswer(answer);
        // Gửi thông báo (giả sử username là email)
        emailConfig.sendNotificationToStudent(
                savedAnswer.getUsername(),
                savedAnswer.getTestId(),
                savedAnswer.getBand()
        );

        return ResponseEntity.ok(savedAnswer);
        //return ResponseEntity.ok(doTestTeacherService.saveWritingAnswer(answer));
    }
    @GetMapping("/listwriting")
    public List<WritingAnswer> getTeacherGradedAnswers() {
        return doTestTeacherService.getTeacherGradedAnswers();
    }

    @GetMapping("/allwriting")
    public List<WritingAnswer> getAllWritingAnswers() {
        return doTestTeacherService.getAllWritingAnswers();
    }

}