
package web.ielts.Auth.service;

import java.time.LocalDateTime;
import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import web.ielts.Auth.model.VerificationToken;
import web.ielts.Auth.repository.VerificationTokenRepository;
import web.ielts.Auth.repository.AuthRepository;
import web.ielts.Config.EmailConfig;
import web.ielts.Config.EmailForgetPasswordConfig;
import web.ielts.User.User;

import static web.ielts.Auth.service.JwtToken.*;

@Component
public class AuthService {

    @Autowired
    private AuthRepository authRepository;
    @Autowired
    private VerificationTokenRepository tokenRepository;
    @Autowired
    private EmailConfig emailConfig;
    @Autowired
    private EmailForgetPasswordConfig emailForgetPasswordConfig;
    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
    @Value("${jwt.secret}")
    private final String jwtSecret = "J4gKu2KJ3Z5vP8t5NmE+lw6aD3vJ6GpN1kILUBo=";

    // Đăng ký tài khoản mới và gửi email xác thực
    public ResponseEntity<?> register(User newUser) {
        if (authRepository.findByEmail(newUser.getEmail()) != null) {
            System.out.println("dang bi loi gmail");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email đã được đăng ký");
        };
        // Tạo token xác thực
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken(
                token,
                newUser.getEmail(),
                newUser.getPassword(),
                LocalDateTime.now().plusHours(24)
                ,"student"
        );

        tokenRepository.save(verificationToken);


        emailConfig.sendVerificationEmail(newUser.getEmail(), token);

        return ResponseEntity.ok("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.");
    }
    public ResponseEntity<?> forgotpassword(String email) {
        User user = authRepository.findByEmail(email);
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken(
                token,
                user.getEmail(),
                user.getPassword(),
                LocalDateTime.now().plusHours(24)
                ,null
        );// giả định tìm theo token hoặc email
        tokenRepository.save(verificationToken);

                // Token hợp lệ
                // Thực hiện reset password hoặc gửi email xác nhận
                emailForgetPasswordConfig.sendResetPasswordEmail(verificationToken.getUserEmail(), token);

                return ResponseEntity.ok("Gửi email thành công, vui lòng kiểm tra email.");
            }





        public ResponseEntity<?> resetPassword(String token, String newPassword) {
        VerificationToken verificationToken = tokenRepository.findByToken(token);
        if (verificationToken == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token không hợp lệ");
        }

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token đã hết hạn");
        }

        // Thêm check password mới


        User user = authRepository.findByEmail(verificationToken.getUserEmail());
        if(user == null){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User không tồn tại");
        }

        user.setPassword(encoder.encode(newPassword));
        authRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đặt lại mật khẩu thành công");


        return ResponseEntity.ok(response);
    }
    public ResponseCookie createJwtCookie(String email, String role,boolean isPremium) {
        String tokenJwt = generateAccessToken(email, role,isPremium);

        return ResponseCookie.from("jwt_token", tokenJwt)
                .httpOnly(true)
                .secure(false) // lên production thì đổi thành true (nếu có https)
                .path("/")
                .maxAge(24 * 60 * 60)
                .sameSite("Lax")
                .build();
    }

    public ResponseEntity<?> verifyEmail(String token) {
        VerificationToken verificationToken = tokenRepository.findByToken(token);
        if (verificationToken == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token không hợp lệ");
        }
        System.out.println(verificationToken.toString());

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token đã hết hạn");
        }

        User user = new User(
                verificationToken.getUserEmail(),
                verificationToken.getPassword(),
                List.of(verificationToken.getRole()) // tạo list chứa 1 phần tử role
        );
        if (user == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Không tìm thấy tài khoản");
        }
        user.setPassword(encoder.encode(user.getPassword()));

        authRepository.save(user);
        ResponseCookie cookie = createJwtCookie(user.getEmail(),"student",user.isPremium());

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, cookie.toString());


        return ResponseEntity.ok()
                .headers(headers)
                .body("Xác thực email thành công! Bạn có thể đăng nhập.");
    }

    public ResponseEntity<Map<String, Object>> login(String email, String password, String role) {
        Map<String, Object> response = new HashMap<>();

        User user = authRepository.findByEmail(email);
        if (user != null && encoder.matches(password, user.getPassword())) {
            List<String> roles = user.getRole(); // ["student", "teacher", "admin"]

            if (!roles.contains(role)) {
                response.put("status", "fail");
                response.put("message", "You do not have the required role to log in");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            // ✅ Tạo token
            ResponseCookie accessTokenCookie = createJwtCookie(user.getEmail(), role, user.isPremium());


            // ✅ Chọn URL redirect tương ứng với từng role
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
                    redirectUrl = "/staff-page"; // fallback nếu có lỗi
                    break;
            }

            response.put("status", "success");
            response.put("message", "Login successful");
            response.put("redirectUrl", redirectUrl);

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());


            return ResponseEntity.ok()
                    .headers(headers)
                    .body(response);
        } else {
            response.put("status", "fail");
            response.put("message", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    public String getUsernameFromToken(String token) {
        if (token == null || token.isEmpty()) {
            throw new RuntimeException("Missing token");
        }

        return JwtToken.extractUsername(token);
    }
    public String getRoleFromToken(String token) {
        if (token == null || token.isEmpty()) {
            throw new RuntimeException("Missing token");
        }

        return JwtToken.extractRole(token);
    }
    public boolean isPremium(String token) {
        if (token == null || token.isEmpty()) {
            throw new RuntimeException("Missing token");
        }

        return JwtToken.extractIsPremium(token);
    }
   public List<ResponseCookie> logout(HttpServletRequest request) {
    // Xoá session


    // Xoá jwt_token
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
    // Xoá JSESSIONID
    ResponseCookie jsessionidCookie = ResponseCookie.from("JSESSIONID", "")
            .path("/")
            .maxAge(0)
            .build();

    return List.of(jwtCookie, jsessionidCookie,refreshTokenCookie);
}




    public User getUserByEmail(String email) {
        return authRepository.findByEmail(email);
    }


    public boolean updatePrenium(String email) {
        User user = authRepository.findByEmail(email);
        user.setPremium(true);
        return user.isPremium();
    }
}
