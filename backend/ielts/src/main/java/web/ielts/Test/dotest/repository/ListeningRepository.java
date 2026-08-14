package web.ielts.Test.dotest.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web.ielts.Test.dotest.model.Listening;

@Repository
public interface ListeningRepository extends MongoRepository<Listening, String> {
    Listening findByTestId(String testId);
}
