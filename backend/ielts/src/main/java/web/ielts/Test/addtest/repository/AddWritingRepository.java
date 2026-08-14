package web.ielts.Test.addtest.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web.ielts.Test.addtest.model.AddWriting;

@Repository
public interface AddWritingRepository extends MongoRepository<AddWriting, String> {
    AddWriting findByTestId(String testId);
}
