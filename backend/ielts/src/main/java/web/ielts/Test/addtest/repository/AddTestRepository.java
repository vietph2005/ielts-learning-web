package web.ielts.Test.addtest.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web.ielts.Test.addtest.model.AddTest;

@Repository
public interface AddTestRepository extends MongoRepository<AddTest, String> {
}
