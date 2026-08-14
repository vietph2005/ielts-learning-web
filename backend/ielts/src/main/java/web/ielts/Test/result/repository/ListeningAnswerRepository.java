package web.ielts.Test.result.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web.ielts.Test.result.model.listening.ListeningAnswer;

import java.util.List;

@Repository
public interface ListeningAnswerRepository extends MongoRepository<ListeningAnswer, String> {
    List<ListeningAnswer> findByUsername(String username);
}
