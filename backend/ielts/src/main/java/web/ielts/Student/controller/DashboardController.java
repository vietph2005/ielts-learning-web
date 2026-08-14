package web.ielts.Student.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import web.ielts.Common.dto.ApiResponse;
import web.ielts.Student.dto.AggregatedStudent;
import web.ielts.Student.model.StudentResult;
import web.ielts.Student.service.DashboardService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboards")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/top-students")
    public ApiResponse<List<AggregatedStudent>> getTopStudents() {
        List<AggregatedStudent> result = dashboardService.getTop10Students();
        return ApiResponse.success(result, "Lấy danh sách top học sinh xuất sắc thành công");
    }

    @GetMapping("/top-skills")
    public ApiResponse<Map<String, List<StudentResult>>> getTopSkills() {
        Map<String, List<StudentResult>> result = dashboardService.getTop3EachSkill();
        return ApiResponse.success(result, "Lấy danh sách top kỹ năng thành công");
    }
}
