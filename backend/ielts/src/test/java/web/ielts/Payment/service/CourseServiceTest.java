package web.ielts.Payment.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import web.ielts.Payment.model.Course;
import web.ielts.Payment.repository.CourseRepository;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CourseServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @InjectMocks
    private CourseService courseService;

    @Test
    void testGetAllCourses() {
        Course c1 = new Course();
        Course c2 = new Course();
        when(courseRepository.findAll()).thenReturn(List.of(c1, c2));

        List<Course> result = courseService.getAllCourses();
        assertEquals(2, result.size());
    }

    @Test
    void testGetCourseById() {
        Course course = new Course();
        when(courseRepository.findById("id123")).thenReturn(Optional.of(course));

        Optional<Course> result = courseService.getCourseById("id123");
        assertTrue(result.isPresent());
        assertEquals(course, result.get());
    }

    @Test
    void testSaveCourse() {
        Course course = new Course();
        when(courseRepository.save(course)).thenReturn(course);

        Course result = courseService.saveCourse(course);
        assertNotNull(result);
        verify(courseRepository, times(1)).save(course);
    }

    @Test
    void testDeleteCourse() {
        courseService.deleteCourse("id123");
        verify(courseRepository, times(1)).deleteById("id123");
    }
}
