package web.ielts.User.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import web.ielts.Auth.repository.AuthRepository;
import web.ielts.Auth.service.AuthService;
import web.ielts.User.User;
import web.ielts.User.UserDTO;
import web.ielts.User.UserService;
import web.ielts.User.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthRepository authRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    // ✅ Lấy thông tin user theo username
    @GetMapping("/{username}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String username) {
        Optional<User> userOpt = userRepository.findById(username);
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(new UserDTO(userOpt.get()));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ Cập nhật thông tin user
    @PutMapping("/{username}")
    public ResponseEntity<?> updateUser(@PathVariable String username, @RequestBody UserDTO updatedUserDto) {
        Optional<User> userOpt = userRepository.findById(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User existingUser = userOpt.get();
        existingUser.setFirstName(updatedUserDto.getFirstName());
        existingUser.setLastName(updatedUserDto.getLastName());
        existingUser.setBirthDate(updatedUserDto.getBirthDate());
        existingUser.setGender(updatedUserDto.getGender());
        existingUser.setPhone(updatedUserDto.getPhone());

        userRepository.save(existingUser);

        return ResponseEntity.ok(new UserDTO(existingUser));
    }

    // ✅ Gộp nâng cấp premium từ cả AuthenticationPrincipal và JWT token
    @PostMapping("/upgrade-premium")
    public ResponseEntity<?> upgradePremium(
            @AuthenticationPrincipal User user,
            @CookieValue(value = "jwt_token", required = false) String token
    ) {
        try {
            if (user != null) {
                System.out.println("de bug em hoat dong ko");
                userService.upgradeToPremium(user.getEmail());
                return ResponseEntity.ok("Đã nâng cấp premium thành công (qua authentication principal)");
            }

            if (token != null && !token.isEmpty()) {
                String username = authService.getUsernameFromToken(token);
                User tokenUser = authRepository.findByEmail(username);
                if (tokenUser == null) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
                }

                tokenUser.setPremium(true);
                authRepository.save(tokenUser);
                return ResponseEntity.ok("Đã nâng cấp premium thành công (qua token)");
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Không có thông tin đăng nhập");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi: " + e.getMessage());
        }
    }

    // ✅ Lấy thông tin người dùng và tự reset premium nếu hết hạn
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Không có thông tin đăng nhập");
        }
        User updatedUser = userService.resetPremiumIfExpired(user);
        return ResponseEntity.ok(new UserDTO(updatedUser));
    }

     //Lấy danh sách tất cả user (cho manager)
    @GetMapping("/all")
    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream().map(UserDTO::new).collect(Collectors.toList());
    }

     //Lấy danh sách user theo role (cho manager)
    @GetMapping("/role/{role}")
    public List<UserDTO> getUsersByRole(@PathVariable String role) {
        List<User> users = userRepository.findAll();
        return users.stream()
            .filter(user -> user.getRole() != null && user.getRole().contains(role))
            .map(UserDTO::new)
            .collect(Collectors.toList());
    }

    // Xóa user theo email (cho manager)
    @DeleteMapping("/{username}")
    public ResponseEntity<?> deleteUser(@PathVariable String username) {
        userRepository.deleteById(username);
        return ResponseEntity.ok().build();
    }
}