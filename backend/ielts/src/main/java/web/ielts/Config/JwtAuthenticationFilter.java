package web.ielts.Config;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import web.ielts.Auth.service.JwtToken;
import web.ielts.User.CustomUserDetailsService;


import java.io.IOException;
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Autowired
    protected CustomUserDetailsService userDetailsService;


    @Override
    public void doFilterInternal(HttpServletRequest request,
                                 HttpServletResponse response,
                                 FilterChain filterChain)
            throws IOException, ServletException {
        String path = request.getRequestURI();

//        if (path.startsWith("/oauth2/") ||
//                path.startsWith("/login/oauth2/") ||
//                pat h.equals("/api/login")) {
//            filterChain.doFilter(request, response);
//            return;
//        }

        String token = getTokenFromCookies(request);

        if (token != null) {
            try {
                String username = JwtToken.extractUsername(token);

                if (username != null && !(SecurityContextHolder.getContext().getAuthentication()
                        instanceof UsernamePasswordAuthenticationToken)) {

                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    if (JwtToken.isTokenValid(token, userDetails)) {
                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }

                }
            } catch (Exception e) {
                System.out.println("Token invalid: " + e.getMessage());
            }
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
    private String getTokenFromCookies(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if ("jwt_token".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }

}