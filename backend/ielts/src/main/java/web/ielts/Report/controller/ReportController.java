package web.ielts.Report.controller;

import org.springframework.web.bind.annotation.*;
import web.ielts.Common.dto.ApiResponse;
import web.ielts.Report.model.Report;
import web.ielts.Report.service.ReportService;

import java.util.List;

@RestController
@RequestMapping("/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    public ApiResponse<List<Report>> getAllReports() {
        return ApiResponse.success(reportService.getAllReports(), "Lấy danh sách phản hồi/báo cáo thành công");
    }

    @PostMapping
    public ApiResponse<String> submitFeedback(@RequestBody Report report) {
        reportService.submitFeedback(report);
        return ApiResponse.success("Gửi phản hồi thành công");
    }
}
