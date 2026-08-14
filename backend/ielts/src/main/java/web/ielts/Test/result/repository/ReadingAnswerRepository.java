package web.ielts.Test.result.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web.ielts.Test.result.model.reading.ReadingAnswer;

import java.util.List;

@Repository
public interface ReadingAnswerRepository extends MongoRepository<ReadingAnswer, String> {
    List<ReadingAnswer> findByUsername(String username);
}
