package web.ielts.Test.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import web.ielts.Test.model.Speaking;

public interface SpeakingRepository extends MongoRepository<Speaking, String> {
    Speaking findByTestId(String testId);
}