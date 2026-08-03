package web.ielts.Student.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import web.ielts.Student.model.Student;

import java.util.Optional;

public interface StudentRepository extends MongoRepository<Student, String> {
    Optional<Student> findByUsername(String username);
}
