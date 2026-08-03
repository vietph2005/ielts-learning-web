package web.ielts.Test.repository.add;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web.ielts.Test.model.add.AddListening;

@Repository
public interface AddListeningRepository extends MongoRepository<AddListening, String> {
    AddListening findByTestId(String testId);
}
