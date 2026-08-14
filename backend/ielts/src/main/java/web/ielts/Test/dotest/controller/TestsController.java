package web.ielts.Test.dotest.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import web.ielts.Common.dto.ApiResponse;
import web.ielts.Common.dto.PageResponse;
import web.ielts.Test.dotest.dto.ListTest;
import web.ielts.Test.dotest.model.Test;
import web.ielts.Test.dotest.service.TestService;

@RestController
@RequestMapping("/tests")
public class TestsController {

    @Autowired
    private TestService testService;

    // Lấy danh sách đề gom nhóm theo năm, hỗ trợ lọc theo kỹ năng: ?skill=listening/reading/writing/speaking/all
    @GetMapping("/grouped")
    public ApiResponse<Map<Integer, List<ListTest>>> getTestsGroupedByYear(@RequestParam(required = false, defaultValue = "all") String skill) {
        Map<Integer, List<ListTest>> result;
        switch (skill.toLowerCase()) {
            case "listening":
                result = testService.getListeningTestsByYear();
                break;
            case "reading":
                result = testService.getReadingTestsByYear();
                break;
            case "writing":
                result = testService.getWritingTestsByYear();
                break;
            case "speaking":
                result = testService.getSpeakingTestsByYear();
                break;
            default:
                result = testService.getTestsGroupedByYear();
                break;
        }
        return ApiResponse.success(result, "Lấy danh sách đề thi theo năm thành công");
    }

    // Lấy danh sách đề thi (hỗ trợ phân trang)
    @GetMapping
    public ApiResponse<PageResponse<Test>> getTests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        int pageIndex = Math.max(0, page > 0 ? page - 1 : page); // Hỗ trợ cả 0-based và 1-based từ client
        Page<Test> testPage = testService.getTests(pageIndex, size);
        return ApiResponse.success(PageResponse.from(testPage), "Lấy danh sách đề thi thành công");
    }

    // Đếm tổng số lượng đề thi
    @GetMapping("/count")
    public ApiResponse<Long> volumeOfTest() {
        return ApiResponse.success(testService.countTests(), "Lấy tổng số lượng đề thi thành công");
    }
}
