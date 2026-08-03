package web.ielts.Payment.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import web.ielts.Payment.model.Course;

public interface CourseRepository extends MongoRepository<Course, String> {
}