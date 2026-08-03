package web.ielts.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web.ielts.Payment.model.PaymentTransactions;
import web.ielts.Payment.repository.PaymentTransactionRepository;
import web.ielts.User.repository.UserRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;


    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User resetPremiumIfExpired(User user) {
        if (user != null  && user.isPremiumExpired()) {
            user.setPremium(false);
            user.setPremiumExpiry(null);
            userRepository.save(user);
        }
        return user;
    }
    private int getDaysFromType(String type) {
        if (type == null) return 0;
        return switch (type.trim()) {
            case "1 tháng" -> 30;
            case "3 tháng" -> 90;
            case "6 tháng" -> 180;

            default -> 0;
        };
    }

    public void upgradeToPremium(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PaymentTransactions latestTransaction = paymentTransactionRepository.findLatestSuccessTransaction(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch thành công nào"));
        System.out.println(latestTransaction.toString());
        int daysToAdd = getDaysFromType(latestTransaction.getType());

        user.setPremium(true);
        user.setPremiumExpiry(LocalDateTime.now().plusDays(daysToAdd));



        userRepository.save(user);
    }
    public User save(User user) {
        return userRepository.save(user);
    }
}