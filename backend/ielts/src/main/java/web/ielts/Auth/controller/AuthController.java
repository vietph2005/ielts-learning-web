package web.ielts.Auth.controller;


import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import web.ielts.Auth.dto.AuthDTO;
import web.ielts.Auth.dto.RegisterDTO;
import web.ielts.Auth.service.AuthService;
import web.ielts.User.User;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private AuthService authservice;


    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterDTO registerDto) {

        return authservice.register(registerDto);
    }
    @PostMapping("/forgotpassword")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
         String email = request.get("email");


        return authservice.forgotpassword(email);

    }
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        return authservice.resetPassword(token, newPassword);
    }
    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam("token") String token) {


        return authservice.verifyEmail(token);
    }
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody AuthDTO loginRequest) {

       // in ra /loginadmin
        return authservice.login(
                loginRequest.getEmail(),
                loginRequest.getPassword(),
                loginRequest.getRole()

        );
    }

    @GetMapping("/user-info")
    public ResponseEntity<?> getUserInfo(@CookieValue(value = "jwt_token", required = false) String token) {

        try {
            String username = authservice.getUsernameFromToken(token);
           String role = authservice.getRoleFromToken(token);
            boolean isPremium = authservice.isPremium(token);

            return ResponseEntity.ok(Map.of(
                    "username", username,
                    "role", role,
                       "isPremium",isPremium
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or missing token");
        }
    }
    @GetMapping("/update-info")
    public ResponseEntity<?> getUserUpdateInfo(@CookieValue(value = "jwt_token", required = false) String token) {
        try {
            String username = authservice.getUsernameFromToken(token);
            String role = authservice.getRoleFromToken(token);
            boolean isPremium = authservice.updatePrenium(username);

            // Tạo lại JWT mới với trạng thái premium mới nhất
            ResponseCookie newJwtCookie = authservice.createJwtCookie(username, role, isPremium);

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, newJwtCookie.toString())
                    .body(Map.of(
                            "username", username,
                            "role", role,
                            "isPremium", isPremium
                    ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or missing token");
        }
    }
    @PostMapping("/logout")
public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request) {
    List<ResponseCookie> cookies = authservice.logout(request);

    HttpHeaders headers = new HttpHeaders();
    for (ResponseCookie cookie : cookies) {
        headers.add(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    Map<String, Object> response = new HashMap<>();
    response.put("status", "success");
    response.put("message", "Logged out");

    return ResponseEntity.ok()
            .headers(headers)
            .body(response);
}
}
