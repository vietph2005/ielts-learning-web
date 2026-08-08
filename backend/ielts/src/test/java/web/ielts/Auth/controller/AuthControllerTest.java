package web.ielts.Auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import web.ielts.Auth.dto.AuthDTO;
import web.ielts.Auth.service.AuthService;
import web.ielts.User.User;

import jakarta.servlet.http.Cookie;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
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

        doReturn(ResponseEntity.ok("SUCCESS"))
                .when(authService).register(any(User.class));

        String response = mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8);

        org.junit.jupiter.api.Assertions.assertEquals("SUCCESS", response);
    }

    @Test
    void testForgotPassword_Success() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", "user@example.com");

        doReturn(ResponseEntity.ok("SUCCESS"))
                .when(authService).forgotpassword("user@example.com");

        String response = mockMvc.perform(post("/api/forgotpassword")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8);

        org.junit.jupiter.api.Assertions.assertEquals("SUCCESS", response);
    }

    @Test
    void testResetPassword_Success() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("token", "token123");
        request.put("newPassword", "NewPassword123");

        Map<String, String> responseBody = new HashMap<>();
        responseBody.put("message", "Đặt lại mật khẩu thành công");

        doReturn(ResponseEntity.ok(responseBody))
                .when(authService).resetPassword("token123", "NewPassword123");

        mockMvc.perform(post("/api/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Đặt lại mật khẩu thành công"));
    }

    @Test
    void testVerifyEmail_Success() throws Exception {
        doReturn(ResponseEntity.ok("SUCCESS"))
                .when(authService).verifyEmail("token123");

        String response = mockMvc.perform(get("/api/verify-email")
                        .param("token", "token123"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8);

        org.junit.jupiter.api.Assertions.assertEquals("SUCCESS", response);
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

        ResponseEntity<Map<String, Object>> serviceResponse = ResponseEntity.ok(responseBody);

        doReturn(serviceResponse)
                .when(authService).login("student@example.com", "Password123", "student");

        mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.redirectUrl").value("/"));
    }

    @Test
    void testGetUserInfo_Success() throws Exception {
        String token = "valid-jwt-token";
        Cookie cookie = new Cookie("jwt_token", token);

        when(authService.getUsernameFromToken(token)).thenReturn("user@example.com");
        when(authService.getRoleFromToken(token)).thenReturn("student");
        when(authService.isPremium(token)).thenReturn(false);

        mockMvc.perform(get("/api/user-info")
                        .cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("user@example.com"))
                .andExpect(jsonPath("$.role").value("student"))
                .andExpect(jsonPath("$.isPremium").value(false));
    }

    @Test
    void testGetUserInfo_Unauthorized() throws Exception {
        // Gửi request không có cookie
        mockMvc.perform(get("/api/user-info"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid or missing token"));
    }

    @Test
    void testLogout_Success() throws Exception {
        ResponseCookie jwtCookie = ResponseCookie.from("jwt_token", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .build();

        when(authService.logout(any())).thenReturn(List.of(jwtCookie));

        mockMvc.perform(post("/api/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.message").value("Logged out"));
    }
}
