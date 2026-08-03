package web.ielts.Report.service;

import org.springframework.stereotype.Service;
import web.ielts.Report.model.Report;
import web.ielts.Report.repository.ReportRepository;

@Service
public class ReportService {

    private final ReportRepository reportRepository;

    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    public void submitFeedback(Report report) {
        reportRepository.save(report);
    }
}
