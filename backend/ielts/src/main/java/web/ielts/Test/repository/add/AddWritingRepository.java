package web.ielts.Test.repository.add;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web.ielts.Test.model.add.AddWriting;

@Repository
public interface AddWritingRepository extends MongoRepository<AddWriting, String> {
    AddWriting findByTestId(String testId);
}
