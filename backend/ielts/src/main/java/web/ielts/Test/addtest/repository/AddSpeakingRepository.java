package web.ielts.Test.addtest.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web.ielts.Test.addtest.model.AddSpeaking;

@Repository
public interface AddSpeakingRepository extends MongoRepository<AddSpeaking, String> {
    AddSpeaking findByTestId(String testId);
}
