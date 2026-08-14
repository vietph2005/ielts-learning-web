package web.ielts.Auth.service;

import java.time.LocalDateTime;
import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import web.ielts.Auth.dto.RegisterDTO;
import web.ielts.Auth.model.VerificationToken;
import web.ielts.Auth.repository.VerificationTokenRepository;
import web.ielts.Auth.repository.AuthRepository;
import web.ielts.Common.dto.ApiResponse;
import web.ielts.Common.exception.BadRequestException;
import web.ielts.Common.exception.ConflictException;
import web.ielts.Common.exception.ForbiddenException;
import web.ielts.Common.exception.ResourceNotFoundException;
import web.ielts.Common.exception.UnauthorizedException;
import web.ielts.Config.EmailConfig;
import web.ielts.Config.EmailForgetPasswordConfig;
import web.ielts.User.User;

import static web.ielts.Auth.service.JwtToken.*;

@Service
public class AuthService {

    @Autowired
    private AuthRepository authRepository;
    @Autowired
    private VerificationTokenRepository tokenRepository;
    @Autowired
    private EmailConfig emailConfig;
    @Autowired
    private EmailForgetPasswordConfig emailForgetPasswordConfig;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    @Value("${jwt.secret:J4gKu2KJ3Z5vP8t5NmE+lw6aD3vJ6GpN1kILUBo=}")
    private String jwtSecret;

    // Đăng ký tài khoản mới và gửi email xác thực
    public ApiResponse<String> register(RegisterDTO registerDto) {
        if (authRepository.findByEmail(registerDto.getEmail()) != null) {
            throw new ConflictException("Email đã được đăng ký trong hệ thống");
        }

        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken(
                token,
                registerDto.getEmail(),
                registerDto.getPassword(),
                LocalDateTime.now().plusHours(24),
                "student"
        );

        tokenRepository.save(verificationToken);
        emailConfig.sendVerificationEmail(registerDto.getEmail(), token);

        return ApiResponse.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.", "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.");
    }

    public ApiResponse<String> forgotPassword(String email) {
        User user = authRepository.findByEmail(email);
        if (user == null) {
            throw new ResourceNotFoundException("Không tìm thấy tài khoản với email: " + email);
        }

        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken(
                token,
                user.getEmail(),
                user.getPassword(),
                LocalDateTime.now().plusHours(24),
                null
        );
        tokenRepository.save(verificationToken);

        emailForgetPasswordConfig.sendResetPasswordEmail(verificationToken.getUserEmail(), token);
        return ApiResponse.success("Gửi email thành công, vui lòng kiểm tra hộp thư của bạn.", "Gửi email thành công, vui lòng kiểm tra hộp thư của bạn.");
    }

    public ApiResponse<String> resetPassword(String token, String newPassword) {
        VerificationToken verificationToken = tokenRepository.findByToken(token);
        if (verificationToken == null) {
            throw new BadRequestException("Token không hợp lệ");
        }

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Token đã hết hạn");
        }

        User user = authRepository.findByEmail(verificationToken.getUserEmail());
        if (user == null) {
            throw new ResourceNotFoundException("Tài khoản người dùng không tồn tại");
        }

        user.setPassword(encoder.encode(newPassword));
        authRepository.save(user);

        return ApiResponse.success("Đặt lại mật khẩu thành công", "Đặt lại mật khẩu thành công");
    }

    public ResponseCookie createJwtCookie(String email, String role, boolean isPremium) {
        String tokenJwt = generateAccessToken(email, role, isPremium);

        return ResponseCookie.from("jwt_token", tokenJwt)
                .httpOnly(true)
                .secure(false) // đổi thành true trên môi trường HTTPS
                .path("/")
                .maxAge(24 * 60 * 60)
                .sameSite("Lax")
                .build();
    }

    public ResponseEntity<ApiResponse<String>> verifyEmail(String token) {
        VerificationToken verificationToken = tokenRepository.findByToken(token);
        if (verificationToken == null) {
            throw new BadRequestException("Token không hợp lệ");
        }

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Token đã hết hạn");
        }

        User user = new User(
                verificationToken.getUserEmail(),
                verificationToken.getPassword(),
                List.of(verificationToken.getRole() != null ? verificationToken.getRole() : "student")
        );
        user.setPassword(encoder.encode(user.getPassword()));
        authRepository.save(user);

        ResponseCookie cookie = createJwtCookie(user.getEmail(), "student", user.isPremium());
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok()
                .headers(headers)
                .body(ApiResponse.success("Xác thực email thành công! Bạn có thể đăng nhập.", "Xác thực email thành công! Bạn có thể đăng nhập."));
    }

    public ResponseEntity<ApiResponse<Map<String, Object>>> login(String email, String password, String role) {
        User user = authRepository.findByEmail(email);
        if (user == null || !encoder.matches(password, user.getPassword())) {
            throw new UnauthorizedException("Email hoặc mật khẩu không chính xác");
        }

        List<String> roles = user.getRole();
        if (roles == null || !roles.contains(role)) {
            throw new ForbiddenException("Bạn không có quyền đăng nhập với vai trò " + role);
        }

        ResponseCookie accessTokenCookie = createJwtCookie(user.getEmail(), role, user.isPremium());

        String redirectUrl;
        switch (role) {
            case "student":
                redirectUrl = "/";
                break;
            case "teacher":
                redirectUrl = "/staff-page";
                break;
            case "admin":
                redirectUrl = "/admin-page";
                break;
            default:
                redirectUrl = "/staff-page";
                break;
        }

        Map<String, Object> data = new HashMap<>();
        data.put("status", "success");
        data.put("redirectUrl", redirectUrl);
        data.put("username", user.getEmail());
        data.put("role", role);
        data.put("isPremium", user.isPremium());

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());

        return ResponseEntity.ok()
                .headers(headers)
                .body(ApiResponse.success(data, "Đăng nhập thành công"));
    }

    public String getUsernameFromToken(String token) {
        if (token == null || token.isEmpty()) {
            throw new UnauthorizedException("Thiếu token xác thực");
        }
        return JwtToken.extractUsername(token);
    }

    public String getRoleFromToken(String token) {
        if (token == null || token.isEmpty()) {
            throw new UnauthorizedException("Thiếu token xác thực");
        }
        return JwtToken.extractRole(token);
    }

    public boolean isPremium(String token) {
        if (token == null || token.isEmpty()) {
            throw new UnauthorizedException("Thiếu token xác thực");
        }
        return JwtToken.extractIsPremium(token);
    }

    public List<ResponseCookie> logout(HttpServletRequest request) {
        ResponseCookie jwtCookie = ResponseCookie.from("jwt_token", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        ResponseCookie jsessionidCookie = ResponseCookie.from("JSESSIONID", "")
                .path("/")
                .maxAge(0)
                .build();

        return List.of(jwtCookie, jsessionidCookie, refreshTokenCookie);
    }

    public User getUserByEmail(String email) {
        return authRepository.findByEmail(email);
    }

    public boolean updatePremium(String email) {
        User user = authRepository.findByEmail(email);
        if (user == null) {
            throw new ResourceNotFoundException("User không tồn tại");
        }
        user.setPremium(true);
        authRepository.save(user);
        return user.isPremium();
    }
}
