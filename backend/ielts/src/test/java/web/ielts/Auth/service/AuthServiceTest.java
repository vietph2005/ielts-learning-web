package web.ielts.Auth.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import web.ielts.Auth.dto.RegisterDTO;
import web.ielts.Auth.model.VerificationToken;
import web.ielts.Auth.repository.AuthRepository;
import web.ielts.Auth.repository.VerificationTokenRepository;
import web.ielts.Common.dto.ApiResponse;
import web.ielts.Common.exception.BadRequestException;
import web.ielts.Common.exception.ConflictException;
import web.ielts.Common.exception.ForbiddenException;
import web.ielts.Common.exception.UnauthorizedException;
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
        ReflectionTestUtils.setField(authService, "jwtSecret", "J4gKu2KJ3Z5vP8t5NmE+lw6aD3vJ6GpN1kILUBo=");
    }

    // --- TEST REGISTER ---

    @Test
    void testRegister_Success() {
        RegisterDTO newRegister = new RegisterDTO();
        newRegister.setEmail("newuser@example.com");
        newRegister.setPassword("Password123");

        when(authRepository.findByEmail(newRegister.getEmail())).thenReturn(null);

        ApiResponse<String> response = authService.register(newRegister);

        assertTrue(response.isSuccess());
        assertEquals("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.", response.getMessage());

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

        assertThrows(ConflictException.class, () -> authService.register(existingRegister));

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

        ResponseEntity<ApiResponse<String>> response = authService.verifyEmail(token);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertTrue(response.getBody().getMessage().contains("Xác thực email thành công!"));

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

        assertThrows(BadRequestException.class, () -> authService.verifyEmail(token));
        verify(authRepository, never()).save(any());
    }

    @Test
    void testVerifyEmail_ExpiredToken() {
        String token = "expired-token";
        VerificationToken verificationToken = new VerificationToken(
                token,
                "user@example.com",
                "Password123",
                LocalDateTime.now().minusHours(1),
                "student"
        );

        when(tokenRepository.findByToken(token)).thenReturn(verificationToken);

        assertThrows(BadRequestException.class, () -> authService.verifyEmail(token));
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

        ResponseEntity<ApiResponse<Map<String, Object>>> response = authService.login(email, password, "student");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Object> body = response.getBody().getData();
        assertNotNull(body);
        assertEquals("success", body.get("status"));
        assertEquals("/", body.get("redirectUrl"));

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

        ResponseEntity<ApiResponse<Map<String, Object>>> response = authService.login(email, password, "teacher");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("/staff-page", response.getBody().getData().get("redirectUrl"));
    }

    @Test
    void testLogin_Success_Admin() {
        String email = "admin@example.com";
        String password = "Password123";
        String hashedPassword = encoder.encode(password);

        User user = new User(email, hashedPassword, List.of("admin"));

        when(authRepository.findByEmail(email)).thenReturn(user);

        ResponseEntity<ApiResponse<Map<String, Object>>> response = authService.login(email, password, "admin");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("/admin-page", response.getBody().getData().get("redirectUrl"));
    }

    @Test
    void testLogin_RoleMismatch() {
        String email = "student@example.com";
        String password = "Password123";
        String hashedPassword = encoder.encode(password);

        User user = new User(email, hashedPassword, List.of("student"));

        when(authRepository.findByEmail(email)).thenReturn(user);

        assertThrows(ForbiddenException.class, () -> authService.login(email, password, "teacher"));
    }

    @Test
    void testLogin_WrongPassword() {
        String email = "student@example.com";
        String password = "Password123";
        String hashedPassword = encoder.encode(password);

        User user = new User(email, hashedPassword, List.of("student"));

        when(authRepository.findByEmail(email)).thenReturn(user);

        assertThrows(UnauthorizedException.class, () -> authService.login(email, "WrongPassword", "student"));
    }

    @Test
    void testLogin_UserNotFound() {
        String email = "notfound@example.com";
        when(authRepository.findByEmail(email)).thenReturn(null);

        assertThrows(UnauthorizedException.class, () -> authService.login(email, "Password123", "student"));
    }

    // --- TEST FORGOT / RESET PASSWORD ---

    @Test
    void testForgotPassword_Success() {
        String email = "user@example.com";
        User user = new User();
        user.setEmail(email);
        user.setPassword("hashedPass");

        when(authRepository.findByEmail(email)).thenReturn(user);

        ApiResponse<String> response = authService.forgotPassword(email);

        assertTrue(response.isSuccess());
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

        ApiResponse<String> response = authService.resetPassword(token, newPassword);

        assertTrue(response.isSuccess());
        assertEquals("Đặt lại mật khẩu thành công", response.getMessage());

        verify(authRepository, times(1)).save(argThat(u -> 
            u.getEmail().equals("user@example.com") &&
            encoder.matches(newPassword, u.getPassword())
        ));
    }

    @Test
    void testResetPassword_TokenNotFound() {
        String token = "invalid-token";
        when(tokenRepository.findByToken(token)).thenReturn(null);

        assertThrows(BadRequestException.class, () -> authService.resetPassword(token, "NewPassword123"));
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

        assertThrows(BadRequestException.class, () -> authService.resetPassword(token, "NewPassword123"));
        verify(authRepository, never()).save(any());
    }
}
