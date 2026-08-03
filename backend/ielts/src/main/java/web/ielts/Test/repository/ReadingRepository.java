package web.ielts.Test.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import web.ielts.Test.model.Reading;

public interface ReadingRepository extends MongoRepository<Reading, String> {
    Reading findByTestId(String testId);
}