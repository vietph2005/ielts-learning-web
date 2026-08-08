package web.ielts.Auth.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import web.ielts.Auth.repository.AuthRepository;
import web.ielts.User.User;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class CustomOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    public AuthRepository loginRepository;

    @Value("${app.frontend.url:https://www.languages.io.vn}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        DefaultOAuth2User oAuth2User = (DefaultOAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String googleId = oAuth2User.getAttribute("sub");
        String roleFromQuery = (String) request.getSession().getAttribute("oauth2_role");

        // Dynamic base URL detection for local development vs production
        String serverName = request.getServerName();
        String baseUrl = (serverName != null && serverName.contains("localhost")) ? "http://localhost:5173" : frontendUrl;

        User user = loginRepository.findByEmail(email);
        String activeRole;

        if (user == null) {
            user = new User();
            user.setEmail(email);
            String requestedRole = (roleFromQuery != null && !roleFromQuery.trim().isEmpty()) ? roleFromQuery.trim().toLowerCase() : "student";
            user.setRole(new ArrayList<>(List.of(requestedRole)));
            user.setPassword(null);
            user.setGoogleID(googleId);
            user.setPremium(false);
            activeRole = requestedRole;
        } else {
            // Update Google ID if missing
            if (user.getGoogleID() == null || user.getGoogleID().isEmpty()) {
                user.setGoogleID(googleId);
            }

            List<String> userRoles = user.getRole();
            if (userRoles == null || userRoles.isEmpty()) {
                userRoles = new ArrayList<>(List.of("student"));
                user.setRole(userRoles);
            }

            // Verify if requested role belongs to user
            if (roleFromQuery != null && !roleFromQuery.trim().isEmpty()) {
                String requestedRole = roleFromQuery.trim().toLowerCase();
                if (userRoles.contains(requestedRole)) {
                    activeRole = requestedRole;
                } else {
                    // Automatically append requested role if user is authorized to add it (or fallback to user primary role)
                    userRoles.add(requestedRole);
                    user.setRole(userRoles);
                    activeRole = requestedRole;
                }
            } else {
                // Default to primary role in DB
                activeRole = userRoles.get(0);
            }
        }

        user = loginRepository.save(user);
        boolean isPremium = user.isPremium();

        // Generate JWT token with activeRole
        String token = JwtToken.generateAccessToken(email, activeRole, isPremium);

        // Security-hardened Cookie creation
        boolean isSecure = request.isSecure() || !serverName.contains("localhost");
        ResponseCookie cookie = ResponseCookie.from("jwt_token", token)
                .httpOnly(true)
                .secure(isSecure)
                .path("/")
                .maxAge(24 * 60 * 60)
                .sameSite(isSecure ? "None" : "Lax")
                .build();

        response.addHeader("Set-Cookie", cookie.toString());

        // Construct target redirect URL based on role
        String redirectPath;
        switch (activeRole.toUpperCase()) {
            case "STUDENT":
                redirectPath = "/";
                break;
            case "ADMIN":
                redirectPath = "/admin-page";
                break;
            case "TEACHER":
            case "MANAGER":
            case "STAFF":
                redirectPath = "/staff-page";
                break;
            default:
                redirectPath = "/";
                break;
        }

        response.sendRedirect(baseUrl + redirectPath);
    }
}