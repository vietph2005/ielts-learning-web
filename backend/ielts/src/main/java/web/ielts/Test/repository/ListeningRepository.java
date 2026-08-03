package web.ielts.Test.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import web.ielts.Test.model.Listening;
import web.ielts.Test.model.Reading;

import java.util.Optional;

public interface ListeningRepository extends MongoRepository<Listening, String> {
    Listening findByTestId(String testId);
}