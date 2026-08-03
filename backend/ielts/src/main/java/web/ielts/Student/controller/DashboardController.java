package web.ielts.Student.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity; //
import org.springframework.web.bind.annotation.*;
import web.ielts.Student.dto.AggregatedStudent;
import web.ielts.Student.model.StudentResult;
import web.ielts.Student.service.DashboardService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/top10")
    public ResponseEntity<?> getTop10() {
        {
            List<AggregatedStudent> result = dashboardService.getTop10Students();
            return ResponseEntity.ok(result);
        }
    }


    @GetMapping("/top3-skills")
    public ResponseEntity<Map<String, List<StudentResult>>> getTop3EachSkill() {
        return ResponseEntity.ok(dashboardService.getTop3EachSkill());
    }
}
