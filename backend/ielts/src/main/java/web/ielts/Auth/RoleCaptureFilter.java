package web.ielts.Auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@Component
public class RoleCaptureFilter extends OncePerRequestFilter {

    private static final Set<String> ALLOWED_ROLES = Set.of("student", "teacher", "admin", "manager");

    // Chỉ áp dụng Filter này cho duy nhất URL bắt đầu luồng OAuth2
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        // Nếu KHÔNG PHẢI URL khởi tạo OAuth2 thì BỎ QUA Filter này
        return !path.startsWith("/oauth2/authorization");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String role = request.getParameter("role");
        if (role != null && !role.trim().isEmpty()) {
            String sanitizedRole = role.trim().toLowerCase();
            if (ALLOWED_ROLES.contains(sanitizedRole)) {
                request.getSession().setAttribute("oauth2_role", sanitizedRole);
            }
        }

        filterChain.doFilter(request, response);
    }
}
