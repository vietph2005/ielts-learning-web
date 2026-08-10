package web.ielts.Auth.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import web.ielts.Auth.dto.RegisterDTO;
import web.ielts.Auth.model.VerificationToken;
import web.ielts.Auth.repository.AuthRepository;
import web.ielts.Auth.repository.VerificationTokenRepository;
import web.ielts.Config.EmailConfig;
import web.ielts.Config.EmailForgetPasswordConfig;
import web.ielts.User.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private AuthRepository authRepository;

    @Mock
    private VerificationTokenRepository tokenRepository;

    @Mock
    private EmailConfig emailConfig;

    @Mock
    private EmailForgetPasswordConfig emailForgetPasswordConfig;

    @InjectMocks
    private AuthService authService;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    @BeforeEach
    void setUp() {
        // Cấu hình jwt.secret phòng trường hợp Reflection injection cần thiết
        ReflectionTestUtils.setField(authService, "jwtSecret", "J4gKu2KJ3Z5vP8t5NmE+lw6aD3vJ6GpN1kILUBo=");
    }

    // --- TEST REGISTER ---

    @Test
    void testRegister_Success() {
        RegisterDTO newRegister = new RegisterDTO();
        newRegister.setEmail("newuser@example.com");
        newRegister.setPassword("Password123");

        when(authRepository.findByEmail(newRegister.getEmail())).thenReturn(null);

        ResponseEntity<?> response = authService.register(newRegister);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.", response.getBody());

        verify(tokenRepository, times(1)).save(any(VerificationToken.class));
        verify(emailConfig, times(1)).sendVerificationEmail(eq(newRegister.getEmail()), anyString());
    }

    @Test
    void testRegister_EmailAlreadyExists() {
        RegisterDTO existingRegister = new RegisterDTO();
        existingRegister.setEmail("existing@example.com");
        existingRegister.setPassword("Password123");

        User existingUser = new User();
        existingUser.setEmail("existing@example.com");
        existingUser.setPassword("Password123");

        when(authRepository.findByEmail(existingRegister.getEmail())).thenReturn(existingUser);

        ResponseEntity<?> response = authService.register(existingRegister);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Email đã được đăng ký", response.getBody());

        verify(tokenRepository, never()).save(any());
        verify(emailConfig, never()).sendVerificationEmail(anyString(), anyString());
    }

    // --- TEST VERIFY EMAIL ---

    @Test
    void testVerifyEmail_Success() {
        String token = "valid-token";
        VerificationToken verificationToken = new VerificationToken(
                token,
                "user@example.com",
                "RawPassword123",
                LocalDateTime.now().plusHours(24),
                "student"
        );

        when(tokenRepository.findByToken(token)).thenReturn(verificationToken);

        ResponseEntity<?> response = authService.verifyEmail(token);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().toString().contains("Xác thực email thành công!"));

        verify(authRepository, times(1)).save(argThat(user -> 
            user.getEmail().equals("user@example.com") &&
            encoder.matches("RawPassword123", user.getPassword()) &&
            user.getRole().contains("student")
        ));
    }

    @Test
    void testVerifyEmail_InvalidToken() {
        String token = "invalid-token";
        when(tokenRepository.findByToken(token)).thenReturn(null);

        ResponseEntity<?> response = authService.verifyEmail(token);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Token không hợp lệ", response.getBody());
        verify(authRepository, never()).save(any());
    }

    @Test
    void testVerifyEmail_ExpiredToken() {
        String token = "expired-token";
        VerificationToken verificationToken = new VerificationToken(
                token,
                "user@example.com",
                "Password123",
                LocalDateTime.now().minusHours(1), // Hết hạn 1 tiếng trước
                "student"
        );

        when(tokenRepository.findByToken(token)).thenReturn(verificationToken);

        ResponseEntity<?> response = authService.verifyEmail(token);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Token đã hết hạn", response.getBody());
        verify(authRepository, never()).save(any());
    }

    // --- TEST LOGIN ---

    @Test
    void testLogin_Success_Student() {
        String email = "student@example.com";
        String password = "Password123";
        String hashedPassword = encoder.encode(password);

        User user = new User(email, hashedPassword, List.of("student"));

        when(authRepository.findByEmail(email)).thenReturn(user);

        ResponseEntity<Map<String, Object>> response = authService.login(email, password, "student");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals("success", body.get("status"));
        assertEquals("Login successful", body.get("message"));
        assertEquals("/", body.get("redirectUrl"));

        // Verify Set-Cookie header exists and is set
        List<String> cookieHeaders = response.getHeaders().get("Set-Cookie");
        assertNotNull(cookieHeaders);
        assertFalse(cookieHeaders.isEmpty());
        assertTrue(cookieHeaders.get(0).contains("jwt_token="));
    }

    @Test
    void testLogin_Success_Teacher() {
        String email = "teacher@example.com";
        String password = "Password123";
        String hashedPassword = encoder.encode(password);

        User user = new User(email, hashedPassword, List.of("teacher"));

        when(authRepository.findByEmail(email)).thenReturn(user);

        ResponseEntity<Map<String, Object>> response = authService.login(email, password, "teacher");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("/staff-page", response.getBody().get("redirectUrl"));
    }

    @Test
    void testLogin_Success_Admin() {
        String email = "admin@example.com";
        String password = "Password123";
        String hashedPassword = encoder.encode(password);

        User user = new User(email, hashedPassword, List.of("admin"));

        when(authRepository.findByEmail(email)).thenReturn(user);

        ResponseEntity<Map<String, Object>> response = authService.login(email, password, "admin");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("/admin-page", response.getBody().get("redirectUrl"));
    }

    @Test
    void testLogin_RoleMismatch() {
        String email = "student@example.com";
        String password = "Password123";
        String hashedPassword = encoder.encode(password);

        // User chỉ có role student
        User user = new User(email, hashedPassword, List.of("student"));

        when(authRepository.findByEmail(email)).thenReturn(user);

        // Đăng nhập với role teacher
        ResponseEntity<Map<String, Object>> response = authService.login(email, password, "teacher");

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("fail", response.getBody().get("status"));
        assertEquals("You do not have the required role to log in", response.getBody().get("message"));
    }

    @Test
    void testLogin_WrongPassword() {
        String email = "student@example.com";
        String password = "Password123";
        String hashedPassword = encoder.encode(password);

        User user = new User(email, hashedPassword, List.of("student"));

        when(authRepository.findByEmail(email)).thenReturn(user);

        // Nhập sai mật khẩu
        ResponseEntity<Map<String, Object>> response = authService.login(email, "WrongPassword", "student");

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("fail", response.getBody().get("status"));
        assertEquals("Invalid email or password", response.getBody().get("message"));
    }

    @Test
    void testLogin_UserNotFound() {
        String email = "notfound@example.com";
        when(authRepository.findByEmail(email)).thenReturn(null);

        ResponseEntity<Map<String, Object>> response = authService.login(email, "Password123", "student");

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("fail", response.getBody().get("status"));
        assertEquals("Invalid email or password", response.getBody().get("message"));
    }

    // --- TEST FORGOT / RESET PASSWORD ---

    @Test
    void testForgotPassword_Success() {
        String email = "user@example.com";
        User user = new User();
        user.setEmail(email);
        user.setPassword("hashedPass");

        when(authRepository.findByEmail(email)).thenReturn(user);

        ResponseEntity<?> response = authService.forgotpassword(email);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Gửi email thành công, vui lòng kiểm tra email.", response.getBody());
        verify(tokenRepository, times(1)).save(any(VerificationToken.class));
        verify(emailForgetPasswordConfig, times(1)).sendResetPasswordEmail(eq(email), anyString());
    }

    @Test
    void testResetPassword_Success() {
        String token = "reset-token";
        String newPassword = "NewPassword123";
        VerificationToken verificationToken = new VerificationToken(
                token,
                "user@example.com",
                "oldHashedPassword",
                LocalDateTime.now().plusHours(24),
                null
        );

        User user = new User();
        user.setEmail("user@example.com");
        user.setPassword("oldHashedPassword");

        when(tokenRepository.findByToken(token)).thenReturn(verificationToken);
        when(authRepository.findByEmail("user@example.com")).thenReturn(user);

        ResponseEntity<?> response = authService.resetPassword(token, newPassword);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertEquals("Đặt lại mật khẩu thành công", body.get("message"));

        verify(authRepository, times(1)).save(argThat(u -> 
            u.getEmail().equals("user@example.com") &&
            encoder.matches(newPassword, u.getPassword())
        ));
    }

    @Test
    void testResetPassword_TokenNotFound() {
        String token = "invalid-token";
        when(tokenRepository.findByToken(token)).thenReturn(null);

        ResponseEntity<?> response = authService.resetPassword(token, "NewPassword123");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Token không hợp lệ", response.getBody());
        verify(authRepository, never()).save(any());
    }

    @Test
    void testResetPassword_TokenExpired() {
        String token = "expired-token";
        VerificationToken verificationToken = new VerificationToken(
                token,
                "user@example.com",
                "oldHashedPassword",
                LocalDateTime.now().minusHours(1),
                null
        );

        when(tokenRepository.findByToken(token)).thenReturn(verificationToken);

        ResponseEntity<?> response = authService.resetPassword(token, "NewPassword123");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Token đã hết hạn", response.getBody());
        verify(authRepository, never()).save(any());
    }
}
