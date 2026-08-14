package web.ielts.Test.dotest.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import web.ielts.Common.dto.ApiResponse;
import web.ielts.Common.exception.ResourceNotFoundException;
import web.ielts.Config.EmailConfig;
import web.ielts.Test.result.model.writing.WritingAnswer;
import web.ielts.Test.dotest.service.DoTestTeacherService;

import java.util.List;

@RestController
@RequestMapping("/writing-evaluations")
public class DoTestTeacherController {

    @Autowired
    private DoTestTeacherService doTestTeacherService;

    @Autowired
    private EmailConfig emailConfig;

    @GetMapping("/{testId}")
    public ApiResponse<WritingAnswer> getWritingAnswerByTestId(@PathVariable String testId) {
        WritingAnswer answer = doTestTeacherService.getWritingAnswerByTestId(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết chấm điểm cho test: " + testId));
        return ApiResponse.success(answer, "Lấy thông tin bài chấm thành công");
    }

    @PostMapping
    public ApiResponse<WritingAnswer> saveWritingAnswer(@RequestBody WritingAnswer answer) {
        WritingAnswer savedAnswer = doTestTeacherService.saveWritingAnswer(answer);
        emailConfig.sendNotificationToStudent(
                savedAnswer.getUsername(),
                savedAnswer.getTestId(),
                savedAnswer.getBand()
        );
        return ApiResponse.success(savedAnswer, "Chấm điểm và gửi thông báo thành công");
    }

    @GetMapping("/graded")
    public ApiResponse<List<WritingAnswer>> getTeacherGradedAnswers() {
        return ApiResponse.success(doTestTeacherService.getTeacherGradedAnswers(), "Lấy danh sách bài đã chấm thành công");
    }

    @GetMapping("/all")
    public ApiResponse<List<WritingAnswer>> getAllWritingAnswers() {
        return ApiResponse.success(doTestTeacherService.getAllWritingAnswers(), "Lấy toàn bộ danh sách bài viết thành công");
    }
}
