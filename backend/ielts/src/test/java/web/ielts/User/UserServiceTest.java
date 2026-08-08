package web.ielts.User;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import web.ielts.Payment.model.PaymentTransactions;
import web.ielts.Payment.repository.PaymentTransactionRepository;
import web.ielts.User.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PaymentTransactionRepository paymentTransactionRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void testFindByEmail() {
        User user = new User();
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        Optional<User> result = userService.findByEmail("test@example.com");
        assertTrue(result.isPresent());
        assertEquals(user, result.get());
    }

    @Test
    void testResetPremiumIfExpired_Expired() {
        User user = new User();
        user.setPremium(true);
        // Expiry date in the past
        user.setPremiumExpiry(LocalDateTime.now().minusDays(1));

        User result = userService.resetPremiumIfExpired(user);

        assertFalse(result.isPremium());
        assertNull(result.getPremiumExpiry());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void testResetPremiumIfExpired_NotExpired() {
        User user = new User();
        user.setPremium(true);
        // Expiry date in the future
        user.setPremiumExpiry(LocalDateTime.now().plusDays(5));

        User result = userService.resetPremiumIfExpired(user);

        assertTrue(result.isPremium());
        assertNotNull(result.getPremiumExpiry());
        verify(userRepository, never()).save(user);
    }

    @Test
    void testUpgradeToPremium_ConsolidateExpiry() {
        User user = new User();
        user.setEmail("premium@example.com");
        user.setPremium(true);
        // Hạn cũ còn 10 ngày nữa
        LocalDateTime oldExpiry = LocalDateTime.now().plusDays(10);
        user.setPremiumExpiry(oldExpiry);

        PaymentTransactions tx = new PaymentTransactions();
        tx.setEmail("premium@example.com");
        tx.setType("1 tháng"); // cộng 30 ngày
        tx.setStatus("success");

        when(userRepository.findByEmail("premium@example.com")).thenReturn(Optional.of(user));
        when(paymentTransactionRepository.findLatestSuccessTransaction("premium@example.com")).thenReturn(Optional.of(tx));

        userService.upgradeToPremium("premium@example.com");

        assertTrue(user.isPremium());
        // Thời hạn mới phải là cũ (10 ngày) + 30 ngày = 40 ngày (sửa lỗi logic đè hạn cũ)
        assertNotNull(user.getPremiumExpiry());
        assertTrue(user.getPremiumExpiry().isAfter(LocalDateTime.now().plusDays(39)));
        assertTrue(user.getPremiumExpiry().isBefore(LocalDateTime.now().plusDays(41)));
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void testUpgradeToPremium_InvalidTypeException() {
        User user = new User();
        user.setEmail("premium@example.com");

        PaymentTransactions tx = new PaymentTransactions();
        tx.setEmail("premium@example.com");
        tx.setType("Gói lạ"); // Trả về daysToAdd = 0

        when(userRepository.findByEmail("premium@example.com")).thenReturn(Optional.of(user));
        when(paymentTransactionRepository.findLatestSuccessTransaction("premium@example.com")).thenReturn(Optional.of(tx));

        // Mong đợi ném ra RuntimeException do gói không hợp lệ (sửa lỗi logic)
        assertThrows(RuntimeException.class, () -> {
            userService.upgradeToPremium("premium@example.com");
        });

        verify(userRepository, never()).save(any());
    }
}
