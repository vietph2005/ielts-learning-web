package web.ielts.Auth;

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
            // New user registration via Google is ALWAYS restricted to 'student' for security
            user = new User();
            user.setEmail(email);
            user.setRole(new ArrayList<>(List.of("student")));
            user.setPassword(null);
            user.setGoogleID(googleId);
            user.setPremium(false);
            activeRole = "student";
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
                    // Security fallback: User does not possess the requested role
                    System.err.println("OAuth2 Login Warning: User " + email + " attempted unauthorized login as role: " + requestedRole);
                    response.sendRedirect(baseUrl + "/login?error=unauthorized_role");
                    return;
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