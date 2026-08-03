
package web.ielts.Auth;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Date;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;


public class JwtToken {
    private static final String SECRET = "a-string-secret-at-least-256-bits-long";
    private static final Key key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    private static final long ACCESS_TOKEN_EXPIRATION = 1000 * 60 * 60 * 5;

    // Hàm private dùng chung để tạo token
    private static String generateToken(String email, String role, long expirationTime,boolean isPremium) {
        long now = System.currentTimeMillis();
        Date issuedAt = new Date(now);
        Date expiration = new Date(now + expirationTime);

        ZonedDateTime nowVn = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        ZonedDateTime expireVn = nowVn.plusSeconds(expirationTime / 1000);

        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        String issuedAtLocal = nowVn.format(formatter);
        String expirationLocal = expireVn.format(formatter);

        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .claim("isPremium", isPremium)
                .claim("issuedAtLocal", issuedAtLocal)
                .claim("expiresAtLocal", expirationLocal)
                .setIssuedAt(issuedAt)
                .setExpiration(expiration)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Tạo Access Token
    public static String generateAccessToken(String email, String role,boolean isPremium) {
        return generateToken(email, role, ACCESS_TOKEN_EXPIRATION, isPremium);
    }

    // Tạo Refresh Token


    public static String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public static String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }
    public static Boolean extractIsPremium(String token) {
        return extractAllClaims(token).get("isPremium", Boolean.class);
    }
    private static Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (SignatureException e) {
            throw new RuntimeException("Invalid JWT signature");
        } catch (Exception e) {
            throw new RuntimeException("Invalid token");
        }
    }

    public static boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    public static boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }
}


