package web.ielts.Test.repository.add;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web.ielts.Test.model.add.AddTest;

@Repository
public interface AddTestRepository extends MongoRepository<AddTest, String> {
    // Bạn có thể thêm phương thức custom nếu cần, ví dụ:
    // Optional<AddTest> findByTestTitle(String title);
}