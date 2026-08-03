package web.ielts.User.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import web.ielts.User.User;

import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    // Tìm user theo email (email là @Id trong class User)
    Optional<User> findByEmail(String email);

    Optional<User> findById(String id);

    List<User> findByPremiumExpiryBefore(Date date);
    
    List<User> findByRole(String role);
}
