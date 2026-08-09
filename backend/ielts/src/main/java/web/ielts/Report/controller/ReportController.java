package web.ielts.Report.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import web.ielts.Report.model.Report;
import web.ielts.Report.repository.ReportRepository;

import java.util.List;

import web.ielts.Report.service.ReportService;

@RestController
@RequestMapping("/api/report")
public class ReportController {

    private final ReportService reportService;
    private final ReportRepository reportRepository;

    @GetMapping
    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }


    public ReportController(ReportService reportService, ReportRepository reportRepository) {
        this.reportService = reportService;
        this.reportRepository = reportRepository;
    }

    @PostMapping
    public ResponseEntity<String> submitFeedback(@RequestBody Report report) {
        reportService.submitFeedback(report);
        return ResponseEntity.ok("Feedback submitted successfully.");
    }
}
