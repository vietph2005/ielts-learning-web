package web.ielts.Admin;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web.ielts.User.User;
import web.ielts.User.UserDTO;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminRepository extends MongoRepository<User, String> {
    List<User> findByRoleContaining(String role);
    boolean existsByEmail(String email);

    User findByEmail(String email);
    void deleteByEmail(String email);
}