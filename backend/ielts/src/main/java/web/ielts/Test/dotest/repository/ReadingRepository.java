package web.ielts.Test.dotest.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web.ielts.Test.dotest.model.Reading;

@Repository
public interface ReadingRepository extends MongoRepository<Reading, String> {
    Reading findByTestId(String testId);
}
