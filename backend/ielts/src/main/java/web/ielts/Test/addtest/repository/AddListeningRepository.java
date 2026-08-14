package web.ielts.Test.addtest.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web.ielts.Test.addtest.model.AddListening;

@Repository
public interface AddListeningRepository extends MongoRepository<AddListening, String> {
    AddListening findByTestId(String testId);
}
