package web.ielts.Test.repository.add;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web.ielts.Test.model.add.AddReading;

@Repository
public interface AddReadingRepository extends MongoRepository<AddReading, String> {
    AddReading findByTestId(String testId);
}
