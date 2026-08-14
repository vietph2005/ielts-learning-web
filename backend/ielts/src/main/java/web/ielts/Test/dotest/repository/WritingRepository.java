package web.ielts.Test.dotest.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web.ielts.Test.dotest.model.Writing;

@Repository
public interface WritingRepository extends MongoRepository<Writing, String> {
    Writing findByTestId(String testId);
}
