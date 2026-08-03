package web.ielts.Test.repository.answer;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web.ielts.Test.model.answer.listening.ListeningAnswer;

import java.util.List;

@Repository
public interface ListeningAnswerRepository extends MongoRepository<ListeningAnswer, String> {
    List<ListeningAnswer> findByUsername(String username);
}
