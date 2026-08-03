package web.ielts.Payment.repository;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web.ielts.Payment.model.PaymentTransactions;

import java.util.List;

@Repository
public interface TransactionRepository extends MongoRepository<PaymentTransactions, String> {
    List<PaymentTransactions> findByEmailOrderByCreatedAtDesc(String email);
}
