package web.ielts.Test.dotest.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web.ielts.Test.dotest.model.Speaking;

@Repository
public interface SpeakingRepository extends MongoRepository<Speaking, String> {
    Speaking findByTestId(String testId);
}
