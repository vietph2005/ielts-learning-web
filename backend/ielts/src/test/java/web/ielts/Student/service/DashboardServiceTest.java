package web.ielts.Student.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import web.ielts.Student.dto.AggregatedStudent;
import web.ielts.Student.model.StudentResult;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DashboardServiceTest {

    @Mock
    private MongoTemplate mongoTemplate;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void testGetTop10Students_AggregationAndSorting() {
        // Mock các bản ghi nộp bài Reading, Listening, Speaking, Writing
        // Student 1: Listening = 6.0, Reading = 8.0, Speaking = 7.0, Writing = 7.0. Avg = 7.0
        StudentResult r1_list = new StudentResult();
        r1_list.setUsername("student1");
        r1_list.setBand(6.0);

        StudentResult r1_read = new StudentResult();
        r1_read.setUsername("student1");
        r1_read.setBand(8.0);

        // Bản ghi Reading thứ 2 của student1 có band thấp hơn (để test logic chọn điểm cao nhất)
        StudentResult r1_read_lower = new StudentResult();
        r1_read_lower.setUsername("student1");
        r1_read_lower.setBand(5.0);

        // Bản ghi Reading thứ 3 của student1 có band cao hơn (để test logic chọn điểm cao nhất)
        StudentResult r1_read_higher = new StudentResult();
        r1_read_higher.setUsername("student1");
        r1_read_higher.setBand(7.5); // Thực tế 7.5 < 8.0 nên không đè lên 8.0

        StudentResult r1_speak = new StudentResult();
        r1_speak.setUsername("student1");
        r1_speak.setBand(7.0);

        StudentResult r1_write = new StudentResult();
        r1_write.setUsername("student1");
        r1_write.setBand(7.0);

        // Student 2: Listening = 8.0. Avg = 8.0 (Nên xếp trước Student 1)
        StudentResult r2_list = new StudentResult();
        r2_list.setUsername("student2");
        r2_list.setBand(8.0);

        // Cấu hình Mockito
        when(mongoTemplate.findAll(StudentResult.class, "ListeningAnswer")).thenReturn(List.of(r1_list, r2_list));
        when(mongoTemplate.findAll(StudentResult.class, "ReadingAnswer")).thenReturn(List.of(r1_read, r1_read_lower, r1_read_higher));
        when(mongoTemplate.findAll(StudentResult.class, "SpeakingAnswer")).thenReturn(List.of(r1_speak));
        when(mongoTemplate.findAll(StudentResult.class, "WritingAnswer")).thenReturn(List.of(r1_write));

        List<AggregatedStudent> top10 = dashboardService.getTop10Students();

        assertEquals(2, top10.size());
        
        // Student 2 đứng thứ nhất vì Avg = 8.0
        assertEquals("student2", top10.get(0).getUsername());
        assertEquals(8.0, top10.get(0).getAverageBand());

        // Student 1 đứng thứ hai vì Avg = (6.0 + 8.0 + 7.0 + 7.0) / 4 = 7.0 (chứng minh 8.0 không bị đè bởi 5.0 hay 7.5)
        assertEquals("student1", top10.get(1).getUsername());
        assertEquals(8.0, top10.get(1).getBandReading()); // Điểm Reading được giữ là 8.0 (cao nhất)
        assertEquals(7.0, top10.get(1).getAverageBand());
    }

    @Test
    void testGetTop3EachSkill() {
        StudentResult r1 = new StudentResult();
        r1.setUsername("student1");
        r1.setBand(8.0);

        when(mongoTemplate.find(any(Query.class), eq(StudentResult.class), anyString())).thenReturn(List.of(r1));

        Map<String, List<StudentResult>> result = dashboardService.getTop3EachSkill();

        assertEquals(4, result.size());
        assertTrue(result.containsKey("writing"));
        assertTrue(result.containsKey("listening"));
        assertTrue(result.containsKey("speaking"));
        assertTrue(result.containsKey("reading"));
        assertEquals("student1", result.get("writing").get(0).getUsername());
    }
}
