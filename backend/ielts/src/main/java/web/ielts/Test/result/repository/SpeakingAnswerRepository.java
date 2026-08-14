package web.ielts.Test.result.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web.ielts.Test.result.model.speaking.SpeakingAnswer;

import java.util.List;

@Repository
public interface SpeakingAnswerRepository extends MongoRepository<SpeakingAnswer, String> {
    List<SpeakingAnswer> findByUsername(String username);
}
