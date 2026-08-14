package web.ielts.Test.result.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import web.ielts.Common.dto.ApiResponse;
import web.ielts.Common.exception.ResourceNotFoundException;
import web.ielts.Common.exception.UnauthorizedException;
import web.ielts.Test.result.model.TestAnswer;
import web.ielts.Test.result.model.listening.ListeningAnswer;
import web.ielts.Test.result.model.reading.ReadingAnswer;
import web.ielts.Test.result.model.speaking.SpeakingAnswer;
import web.ielts.Test.result.model.writing.WritingAnswer;
import web.ielts.Test.result.service.ResultService;
import web.ielts.Test.result.service.TestAnswerService;
import web.ielts.User.User;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/test-results")
public class ResultTestController {

    @Autowired
    private ResultService resultService;

    @Autowired
    private TestAnswerService testAnswerService;

    @GetMapping("/writing/{id}")
    public ApiResponse<WritingAnswer> getWritingById(@PathVariable String id) {
        WritingAnswer answer = resultService.findWritingById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy kết quả Writing: " + id));
        return ApiResponse.success(answer, "Lấy kết quả Writing thành công");
    }

    @GetMapping("/speaking/{id}")
    public ApiResponse<SpeakingAnswer> getSpeakingAnswerById(@PathVariable String id) {
        SpeakingAnswer answer = resultService.findSpeakingById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy kết quả Speaking: " + id));
        return ApiResponse.success(answer, "Lấy kết quả Speaking thành công");
    }

    @GetMapping("/listening/{id}")
    public ApiResponse<ListeningAnswer> getListeningAnswerById(@PathVariable String id) {
        ListeningAnswer answer = resultService.findListeningById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy kết quả Listening: " + id));
        return ApiResponse.success(answer, "Lấy kết quả Listening thành công");
    }

    @GetMapping("/reading/{id}")
    public ApiResponse<ReadingAnswer> getReadingAnswerById(@PathVariable String id) {
        ReadingAnswer answer = resultService.findReadingById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy kết quả Reading: " + id));
        return ApiResponse.success(answer, "Lấy kết quả Reading thành công");
    }

    @GetMapping("/full-tests/{testAnswerId}")
    public ApiResponse<Map<String, Object>> getFullTestResult(@PathVariable String testAnswerId, @AuthenticationPrincipal User user) {
        if (user == null) {
            throw new UnauthorizedException("Yêu cầu đăng nhập");
        }
        TestAnswer testAnswer = testAnswerService.getById(testAnswerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy kết quả bài thi: " + testAnswerId));

        Map<String, Object> result = new HashMap<>();
        result.put("testAnswerId", testAnswer.getId());
        if (testAnswer.getListeningAnswerId() != null) {
            result.put("listening", resultService.findListeningById(testAnswer.getListeningAnswerId()).orElse(null));
        }
        if (testAnswer.getReadingAnswerId() != null) {
            result.put("reading", resultService.findReadingById(testAnswer.getReadingAnswerId()).orElse(null));
        }
        if (testAnswer.getWritingAnswerId() != null) {
            result.put("writing", resultService.findWritingById(testAnswer.getWritingAnswerId()).orElse(null));
        }
        if (testAnswer.getSpeakingAnswerId() != null) {
            result.put("speaking", resultService.findSpeakingById(testAnswer.getSpeakingAnswerId()).orElse(null));
        }
        return ApiResponse.success(result, "Lấy kết quả bài thi thành công");
    }
}
