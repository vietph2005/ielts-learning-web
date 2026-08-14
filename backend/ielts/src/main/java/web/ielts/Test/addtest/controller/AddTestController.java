package web.ielts.Test.addtest.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import web.ielts.Common.dto.ApiResponse;
import web.ielts.Common.exception.ResourceNotFoundException;
import web.ielts.Test.addtest.model.*;
import web.ielts.Test.addtest.service.AddTestService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/test-requests")
public class AddTestController {

    @Autowired
    private AddTestService addTestService;

    @PostMapping
    public ApiResponse<String> saveTest(@RequestBody AddTestRequest request) {
        addTestService.saveFullTest(request);
        return ApiResponse.success("Lưu yêu cầu đề thi thành công!");
    }

    @GetMapping
    public ApiResponse<?> getTestRequests(@RequestParam(required = false) String role) {
        if ("teacher".equalsIgnoreCase(role)) {
            List<Map<String, Object>> tests = addTestService.getAllTestsForTeacher();
            return ApiResponse.success(tests, "Lấy danh sách yêu cầu đề thi cho giáo viên thành công");
        }
        List<AddTest> tests = addTestService.getAllPendingTests();
        return ApiResponse.success(tests, "Lấy toàn bộ danh sách yêu cầu đề thi thành công");
    }

    @GetMapping("/{testId}")
    public ApiResponse<Map<String, Object>> getTestRequestDetail(@PathVariable String testId, @RequestParam(required = false) String role) {
        if ("teacher".equalsIgnoreCase(role)) {
            Map<String, Object> details = addTestService.getFullTestDetails(testId);
            if (details == null) {
                throw new ResourceNotFoundException("Không tìm thấy yêu cầu đề thi: " + testId);
            }
            return ApiResponse.success(details, "Lấy chi tiết đề thi thành công");
        }

        Map<String, Object> details = addTestService.getPendingTestDetails(testId);
        return ApiResponse.success(details, "Lấy chi tiết yêu cầu đề thi thành công");
    }

    @PutMapping("/{testId}")
    public ApiResponse<String> updateTest(@PathVariable String testId, @RequestBody AddTestRequest request) {
        addTestService.updateFullTest(testId, request);
        return ApiResponse.success("Cập nhật yêu cầu đề thi thành công!");
    }

    @DeleteMapping("/{testId}")
    public ApiResponse<String> deleteRequestTest(@PathVariable String testId) {
        addTestService.deleteRequestTest(testId);
        return ApiResponse.success("Xóa yêu cầu đề thi thành công!");
    }

    @PostMapping("/{testId}/acceptances")
    public ApiResponse<String> acceptTest(@PathVariable("testId") String testId) {
        addTestService.acceptTest(testId);
        return ApiResponse.success("Duyệt đề thi và đưa vào ngân hàng đề thành công!");
    }
}
