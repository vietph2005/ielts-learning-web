package web.ielts.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import web.ielts.Auth.repository.AuthRepository;
import web.ielts.Auth.service.AuthService;
import web.ielts.Common.exception.ResourceNotFoundException;
import web.ielts.Payment.model.PaymentTransactions;
import web.ielts.Payment.repository.PaymentTransactionRepository;
import web.ielts.User.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthRepository authRepository;

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Autowired
    private AuthService authService;

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<UserDTO> getUsers(String role) {
        List<User> users = userRepository.findAll();
        return users.stream()
                .filter(u -> role == null || role.trim().isEmpty() || (u.getRole() != null && u.getRole().contains(role)))
                .map(UserDTO::new)
                .collect(Collectors.toList());
    }

    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findById(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + username));
        return new UserDTO(user);
    }

    @Transactional
    public UserDTO updateUser(String username, UserDTO updatedUserDto) {
        User existingUser = userRepository.findById(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + username));

        existingUser.setFirstName(updatedUserDto.getFirstName());
        existingUser.setLastName(updatedUserDto.getLastName());
        existingUser.setBirthDate(updatedUserDto.getBirthDate());
        existingUser.setGender(updatedUserDto.getGender());
        existingUser.setPhone(updatedUserDto.getPhone());

        User saved = userRepository.save(existingUser);
        return new UserDTO(saved);
    }

    @Transactional
    public UserDTO updateUserRoles(String username, List<String> roles) {
        User user = userRepository.findById(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + username));

        if (roles != null) {
            user.setRole(roles);
            userRepository.save(user);
        }
        return new UserDTO(user);
    }

    @Transactional
    public UserDTO addRoleToUser(String username, List<String> roles) {
        User user = userRepository.findById(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + username));

        if (roles != null) {
            if (user.getRole() == null) {
                user.setRole(roles);
            } else {
                for (String role : roles) {
                    if (!user.getRole().contains(role)) {
                        user.getRole().add(role);
                    }
                }
            }
            userRepository.save(user);
        }
        return new UserDTO(user);
    }

    @Transactional
    public UserDTO deleteRoleFromUser(String username, String role) {
        User user = userRepository.findById(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + username));

        if (user.getRole() != null) {
            user.getRole().remove(role);
            userRepository.save(user);
        }
        return new UserDTO(user);
    }

    @Transactional
    public void deleteUser(String username) {
        if (!userRepository.existsById(username)) {
            throw new ResourceNotFoundException("Không tìm thấy người dùng để xóa: " + username);
        }
        userRepository.deleteById(username);
    }

    public User resetPremiumIfExpired(User user) {
        if (user != null && user.isPremiumExpired()) {
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

    @Transactional
    public void upgradeToPremium(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + email));

        PaymentTransactions latestTransaction = paymentTransactionRepository.findLatestSuccessTransaction(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giao dịch thành công nào"));

        int daysToAdd = getDaysFromType(latestTransaction.getType());
        if (daysToAdd <= 0) {
            throw new IllegalArgumentException("Giao dịch không hợp lệ hoặc gói Premium không được hỗ trợ");
        }

        user.setPremium(true);
        LocalDateTime currentExpiry = user.getPremiumExpiry();
        LocalDateTime baseTime = (user.isPremium() && currentExpiry != null && currentExpiry.isAfter(LocalDateTime.now()))
                ? currentExpiry
                : LocalDateTime.now();
        user.setPremiumExpiry(baseTime.plusDays(daysToAdd));

        userRepository.save(user);
    }

    @Transactional
    public void upgradePremiumByToken(String token) {
        String username = authService.getUsernameFromToken(token);
        User tokenUser = authRepository.findByEmail(username);
        if (tokenUser == null) {
            throw new ResourceNotFoundException("Không tìm thấy người dùng");
        }
        tokenUser.setPremium(true);
        authRepository.save(tokenUser);
    }

    public User save(User user) {
        return userRepository.save(user);
    }
}