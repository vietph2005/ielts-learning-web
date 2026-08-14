package web.ielts.Test.result.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web.ielts.Test.result.model.TestAnswer;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestAnswerRepository extends MongoRepository<TestAnswer, String> {
    Optional<TestAnswer> findByTestIdAndUsername(String testId, String username);
    List<TestAnswer> findAllByTestIdAndUsername(String testId, String username);
    List<TestAnswer> findAllByUsername(String username);
}
