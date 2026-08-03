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

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
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
            User user = userOpt.get();
            UserDTO dto = new UserDTO();
            dto.setUserName(user.getEmail());
            dto.setFirstName(user.getFirstName());
            dto.setLastName(user.getLastName());
            dto.setBirthDate(user.getBirthDate());
            dto.setGender(user.getGender());
            dto.setPhone(user.getPhone());
            return ResponseEntity.ok(dto);
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

        UserDTO responseDto = new UserDTO();
        responseDto.setUserName(existingUser.getEmail());
        responseDto.setFirstName(existingUser.getFirstName());
        responseDto.setLastName(existingUser.getLastName());
        responseDto.setBirthDate(existingUser.getBirthDate());
        responseDto.setGender(existingUser.getGender());
        responseDto.setPhone(existingUser.getPhone());

        return ResponseEntity.ok(responseDto);
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
    public User getCurrentUser(@AuthenticationPrincipal User user) {
        return userService.resetPremiumIfExpired(user);
    }

     //Lấy danh sách tất cả user (cho manager)
    @GetMapping("/all")
    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream().map(user -> {
            UserDTO dto = new UserDTO();
            dto.setUserName(user.getEmail());
            dto.setFirstName(user.getFirstName());
            dto.setLastName(user.getLastName());
            dto.setBirthDate(user.getBirthDate());
            dto.setGender(user.getGender());
            dto.setPhone(user.getPhone());
            dto.setRoles(user.getRole());
            dto.setPremium(user.isPremium());
            dto.setCreatedAt(user.getCreatedAt());
            return dto;
        }).collect(Collectors.toList());
    }

     //Lấy danh sách user theo role (cho manager)
    @GetMapping("/role/{role}")
    public List<UserDTO> getUsersByRole(@PathVariable String role) {
        List<User> users = userRepository.findAll();
        return users.stream()
            .filter(user -> user.getRole() != null && user.getRole().contains(role))
            .map(user -> {
                UserDTO dto = new UserDTO();
                dto.setUserName(user.getEmail());
                dto.setFirstName(user.getFirstName());
                dto.setLastName(user.getLastName());
                dto.setBirthDate(user.getBirthDate());
                dto.setGender(user.getGender());
                dto.setPhone(user.getPhone());
                dto.setRoles(user.getRole());
                dto.setPremium(user.isPremium());
                dto.setCreatedAt(user.getCreatedAt());
                return dto;
            }).collect(Collectors.toList());
    }

    // Xóa user theo email (cho manager)
    @DeleteMapping("/{username}")
    public ResponseEntity<?> deleteUser(@PathVariable String username) {
        userRepository.deleteById(username);
        return ResponseEntity.ok().build();
    }
}