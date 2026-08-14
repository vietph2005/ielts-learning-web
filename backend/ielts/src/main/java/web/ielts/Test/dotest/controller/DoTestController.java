package web.ielts.Test.dotest.controller;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import web.ielts.Common.dto.ApiResponse;
import web.ielts.Common.exception.BadRequestException;
import web.ielts.Common.exception.ResourceNotFoundException;
import web.ielts.Test.dotest.model.*;
import web.ielts.Test.result.model.TestAnswer;
import web.ielts.Test.result.model.listening.ListeningAnswer;
import web.ielts.Test.result.model.reading.ReadingAnswer;
import web.ielts.Test.result.model.speaking.SpeakingAnswer;
import web.ielts.Test.result.model.writing.WritingAnswer;
import web.ielts.Test.dotest.service.*;
import web.ielts.Test.result.service.TestAnswerService;
import web.ielts.User.User;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/tests")
public class DoTestController {

    @Autowired
    private DoTestService doTestService;

    @Autowired
    private ReadingTestService readingTestService;

    @Autowired
    private ListeningTestService listeningTestService;

    @Autowired
    private WritingTestService writingTestService;

    @Autowired
    private SpeakingTestService speakingTestService;

    @Autowired
    private TestAnswerService testAnswerService;

    @GetMapping("/{testId}")
    public ApiResponse<Test> getFullTestByTestId(@PathVariable String testId) {
        Test test = doTestService.getTestByTestId(testId);
        if (test == null) {
            throw new ResourceNotFoundException("Không tìm thấy bài test: " + testId);
        }
        return ApiResponse.success(test, "Lấy thông tin bài test thành công");
    }

    @GetMapping("/{testId}/writing")
    public ApiResponse<Writing> getWritingByTestId(@PathVariable String testId) {
        Writing writing = writingTestService.getWritingByTestId(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề Writing của testId: " + testId));
        return ApiResponse.success(writing, "Lấy đề Writing thành công");
    }

    @GetMapping("/{testId}/listening")
    public ApiResponse<Listening> getListeningByTestId(@PathVariable String testId) {
        Listening listening = listeningTestService.getListeningByTestId(testId);
        if (listening == null) {
            throw new ResourceNotFoundException("Không tìm thấy đề Listening của testId: " + testId);
        }
        return ApiResponse.success(listening, "Lấy đề Listening thành công");
    }

    @GetMapping("/{testId}/reading")
    public ApiResponse<Reading> getReadingByTestId(@PathVariable String testId) {
        Reading reading = readingTestService.getReadingByTestId(testId);
        if (reading == null) {
            throw new ResourceNotFoundException("Không tìm thấy đề Reading của testId: " + testId);
        }
        return ApiResponse.success(reading, "Lấy đề Reading thành công");
    }

    @GetMapping("/{testId}/speaking")
    public ApiResponse<Speaking> getSpeakingByTestId(@PathVariable String testId) {
        Speaking speaking = speakingTestService.getSpeakingByTestId(testId);
        if (speaking == null) {
            throw new ResourceNotFoundException("Không tìm thấy đề Speaking của testId: " + testId);
        }
        return ApiResponse.success(speaking, "Lấy đề Speaking thành công");
    }
}
