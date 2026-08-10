package web.ielts;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.test.util.ReflectionTestUtils;
import web.ielts.Auth.service.CustomOAuth2SuccessHandler;
import web.ielts.Auth.repository.AuthRepository;
import web.ielts.User.User;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.*;

class CustomOAuth2SuccessHandlerTest {

    private AuthRepository loginRepository;
    private CustomOAuth2SuccessHandler successHandler;
    private HttpServletRequest request;
    private HttpServletResponse response;
    private Authentication authentication;

    @BeforeEach
    void setup() {
        loginRepository = mock(AuthRepository.class);
        successHandler = new CustomOAuth2SuccessHandler();
        successHandler.loginRepository = loginRepository;

        ReflectionTestUtils.setField(successHandler, "frontendUrl", "https://www.languages.io.vn");

        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        authentication = mock(Authentication.class);
    }

    @Test
    void whenNewUser_thenSavedAndRedirectedAsStudent() throws IOException {
        DefaultOAuth2User oAuth2User = new DefaultOAuth2User(
                List.of(),
                Map.of("email", "test@example.com", "sub", "google-123"),
                "email"
        );

        when(authentication.getPrincipal()).thenReturn(oAuth2User);

        HttpSession session = mock(HttpSession.class);
        when(request.getSession()).thenReturn(session);
        when(session.getAttribute("oauth2_role")).thenReturn("student");

        when(loginRepository.findByEmail("test@example.com")).thenReturn(null);
        when(loginRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        successHandler.onAuthenticationSuccess(request, response, authentication);

        verify(loginRepository).save(any(User.class));
        verify(response).addHeader(eq("Set-Cookie"), contains("jwt_token"));
        verify(response).sendRedirect("https://www.languages.io.vn/");
    }

    @Test
    void whenExistingUserWithoutRole_thenDoNothing() throws IOException {
        User existingUser = new User();
        existingUser.setEmail("old@example.com");
        existingUser.setRole(new java.util.ArrayList<>(List.of("student")));

        DefaultOAuth2User oAuth2User = new DefaultOAuth2User(
                List.of(),
                Map.of("email", "old@example.com", "sub", "google-456"),
                "email"
        );

        when(authentication.getPrincipal()).thenReturn(oAuth2User);

        HttpSession session = mock(HttpSession.class);
        when(request.getSession()).thenReturn(session);
        when(session.getAttribute("oauth2_role")).thenReturn("admin");

        when(loginRepository.findByEmail("old@example.com")).thenReturn(existingUser);
        when(loginRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        successHandler.onAuthenticationSuccess(request, response, authentication);

        verify(loginRepository).save(any(User.class));
        verify(response).sendRedirect("https://www.languages.io.vn/admin-page");
    }

}
