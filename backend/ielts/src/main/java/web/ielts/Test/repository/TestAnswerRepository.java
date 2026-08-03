package web.ielts.Test.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web.ielts.Test.model.TestAnswer;

import java.util.Optional;
import java.util.List;

@Repository
public interface TestAnswerRepository extends MongoRepository<TestAnswer, String> {
    Optional<TestAnswer> findByTestIdAndUsername(String testId, String username);
    List<TestAnswer> findAllByTestIdAndUsername(String testId, String username);
    List<TestAnswer> findAllByUsername(String username);
} 