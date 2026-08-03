package web.ielts.Payment.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import web.ielts.Payment.model.PaymentTransactions;

import java.util.List;
import java.util.Optional;

public interface PaymentTransactionRepository extends MongoRepository<PaymentTransactions, String> {
    // Có thể thêm custom query nếu cần
    @Query("{ 'email': ?0, 'status': 'Success' }")
    List<PaymentTransactions> findSuccessfulTransactions(String email);

    // ✅ Hàm bạn cần: Lấy giao dịch thành công mới nhất
    default Optional<PaymentTransactions> findLatestSuccessTransaction(String email) {
        List<PaymentTransactions> list = findSuccessfulTransactions(email);
        return list.stream()
                .max((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()));
    }
} 