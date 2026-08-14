package web.ielts.Test.dotest.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web.ielts.Test.dotest.model.Test;

@Repository
public interface TestRepository extends MongoRepository<Test, String> {
}
