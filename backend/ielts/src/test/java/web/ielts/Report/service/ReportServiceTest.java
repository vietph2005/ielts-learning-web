package web.ielts.Report.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import web.ielts.Report.model.Report;
import web.ielts.Report.repository.ReportRepository;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReportServiceTest {

    @Mock
    private ReportRepository reportRepository;

    @InjectMocks
    private ReportService reportService;

    @Test
    void testSubmitFeedback() {
        Report report = new Report();
        reportService.submitFeedback(report);
        verify(reportRepository, times(1)).save(report);
    }
}
