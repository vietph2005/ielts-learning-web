package web.ielts.Test.addtest.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web.ielts.Test.addtest.model.AddReading;

@Repository
public interface AddReadingRepository extends MongoRepository<AddReading, String> {
    AddReading findByTestId(String testId);
}
