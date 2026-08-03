package web.ielts.Test.repository.add;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web.ielts.Test.model.add.AddSpeaking;

@Repository
public interface AddSpeakingRepository extends MongoRepository<AddSpeaking, String> {
    AddSpeaking findByTestId(String testId);
}
