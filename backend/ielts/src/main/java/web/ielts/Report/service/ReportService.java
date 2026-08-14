package web.ielts.Report.service;

import org.springframework.stereotype.Service;
import web.ielts.Report.model.Report;
import web.ielts.Report.repository.ReportRepository;

import java.util.List;

@Service
public class ReportService {

    private final ReportRepository reportRepository;

    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public void submitFeedback(Report report) {
        reportRepository.save(report);
    }
}
