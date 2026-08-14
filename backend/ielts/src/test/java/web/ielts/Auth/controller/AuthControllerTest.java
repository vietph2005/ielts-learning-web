package web.ielts.Auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import web.ielts.Auth.dto.AuthDTO;
import web.ielts.Auth.dto.RegisterDTO;
import web.ielts.Auth.service.AuthService;
import web.ielts.Common.dto.ApiResponse;

import jakarta.servlet.http.Cookie;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }

    @Test
    void testRegister_Success() throws Exception {
        Map<String, Object> registerRequest = new HashMap<>();
        registerRequest.put("email", "test@example.com");
        registerRequest.put("password", "Password123");
        registerRequest.put("role", List.of("student"));

        doReturn(ApiResponse.success("SUCCESS"))
                .when(authService).register(any(RegisterDTO.class));

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testForgotPassword_Success() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", "user@example.com");

        doReturn(ApiResponse.success("SUCCESS"))
                .when(authService).forgotPassword("user@example.com");

        mockMvc.perform(post("/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testResetPassword_Success() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("token", "token123");
        request.put("newPassword", "NewPassword123");

        doReturn(ApiResponse.success("Đặt lại mật khẩu thành công"))
                .when(authService).resetPassword("token123", "NewPassword123");

        mockMvc.perform(post("/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testVerifyEmail_Success() throws Exception {
        doReturn(ResponseEntity.ok(ApiResponse.success("SUCCESS")))
                .when(authService).verifyEmail("token123");

        mockMvc.perform(get("/auth/verify-email")
                        .param("token", "token123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testLogin_Success() throws Exception {
        AuthDTO loginRequest = new AuthDTO();
        loginRequest.setEmail("student@example.com");
        loginRequest.setPassword("Password123");
        loginRequest.setRole("student");

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("status", "success");
        responseBody.put("message", "Login successful");
        responseBody.put("redirectUrl", "/");

        ResponseEntity<ApiResponse<Map<String, Object>>> serviceResponse = ResponseEntity.ok(ApiResponse.success(responseBody));

        doReturn(serviceResponse)
                .when(authService).login("student@example.com", "Password123", "student");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("success"));
    }

    @Test
    void testGetUserInfo_Success() throws Exception {
        String token = "valid-jwt-token";
        Cookie cookie = new Cookie("jwt_token", token);

        when(authService.getUsernameFromToken(token)).thenReturn("user@example.com");
        when(authService.getRoleFromToken(token)).thenReturn("student");
        when(authService.isPremium(token)).thenReturn(false);

        mockMvc.perform(get("/auth/me")
                        .cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("user@example.com"))
                .andExpect(jsonPath("$.data.role").value("student"));
    }

    @Test
    void testLogout_Success() throws Exception {
        ResponseCookie jwtCookie = ResponseCookie.from("jwt_token", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .build();

        when(authService.logout(any())).thenReturn(List.of(jwtCookie));

        mockMvc.perform(post("/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Đăng xuất thành công"));
    }
}
