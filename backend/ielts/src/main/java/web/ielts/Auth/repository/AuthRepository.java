package web.ielts.Auth.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import web.ielts.User.User;

@Repository
public interface AuthRepository extends MongoRepository<User, String> {
    User findByEmail(String email);
}