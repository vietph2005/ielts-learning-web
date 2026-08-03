package web.ielts.Test.repository.answer;


import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web.ielts.Test.model.answer.listening.ListeningAnswer;
import web.ielts.Test.model.answer.reading.ReadingAnswer;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReadingAnswerRepository extends MongoRepository<ReadingAnswer, String> {
    List<ReadingAnswer> findByUsername(String username);
}