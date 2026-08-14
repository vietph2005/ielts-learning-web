package web.ielts.Payment.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import web.ielts.Common.dto.ApiResponse;
import web.ielts.Common.exception.ResourceNotFoundException;
import web.ielts.Payment.model.Course;
import web.ielts.Payment.service.CourseService;

import java.util.List;

@RestController
@RequestMapping("/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @GetMapping
    public ApiResponse<List<Course>> getAllCourses() {
        return ApiResponse.success(courseService.getAllCourses(), "Lấy danh sách khóa học thành công");
    }

    @GetMapping("/{id}")
    public ApiResponse<Course> getCourseById(@PathVariable String id) {
        Course course = courseService.getCourseById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa học với ID: " + id));
        return ApiResponse.success(course, "Lấy thông tin khóa học thành công");
    }

    @PostMapping
    public ApiResponse<Course> createCourse(@RequestBody Course course) {
        return ApiResponse.success(courseService.saveCourse(course), "Tạo khóa học thành công");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCourse(@PathVariable String id) {
        courseService.deleteCourse(id);
        return ApiResponse.success(null, "Xóa khóa học thành công");
    }
}