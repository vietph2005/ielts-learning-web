package web.ielts.Auth.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import web.ielts.Auth.dto.AuthDTO;
import web.ielts.Auth.dto.RegisterDTO;
import web.ielts.Auth.service.AuthService;
import web.ielts.Common.dto.ApiResponse;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ApiResponse<String> register(@RequestBody RegisterDTO registerDto) {
        return authService.register(registerDto);
    }

    @PostMapping("/forgot-password")
    public ApiResponse<String> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        return authService.forgotPassword(email);
    }

    @PostMapping("/reset-password")
    public ApiResponse<String> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        return authService.resetPassword(token, newPassword);
    }

    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<String>> verifyEmail(@RequestParam("token") String token) {
        return authService.verifyEmail(token);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@RequestBody AuthDTO loginRequest) {
        return authService.login(
                loginRequest.getEmail(),
                loginRequest.getPassword(),
                loginRequest.getRole()
        );
    }

    @GetMapping("/me")
    public ApiResponse<Map<String, Object>> getUserInfo(@CookieValue(value = "jwt_token", required = false) String token) {
        String username = authService.getUsernameFromToken(token);
        String role = authService.getRoleFromToken(token);
        boolean isPremium = authService.isPremium(token);

        Map<String, Object> data = new HashMap<>();
        data.put("username", username);
        data.put("role", role);
        data.put("isPremium", isPremium);

        return ApiResponse.success(data, "Lấy thông tin người dùng thành công");
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserUpdateInfo(@CookieValue(value = "jwt_token", required = false) String token) {
        String username = authService.getUsernameFromToken(token);
        String role = authService.getRoleFromToken(token);
        boolean isPremium = authService.updatePremium(username);

        ResponseCookie newJwtCookie = authService.createJwtCookie(username, role, isPremium);

        Map<String, Object> data = new HashMap<>();
        data.put("username", username);
        data.put("role", role);
        data.put("isPremium", isPremium);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, newJwtCookie.toString())
                .body(ApiResponse.success(data, "Cập nhật token thành công"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(HttpServletRequest request) {
        List<ResponseCookie> cookies = authService.logout(request);

        HttpHeaders headers = new HttpHeaders();
        for (ResponseCookie cookie : cookies) {
            headers.add(HttpHeaders.SET_COOKIE, cookie.toString());
        }

        return ResponseEntity.ok()
                .headers(headers)
                .body(ApiResponse.success("Đăng xuất thành công", "Đăng xuất thành công"));
    }
}
