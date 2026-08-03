package web.ielts.Auth.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "verificationToken")
public class VerificationToken {
    @Id
    private String id;
    private String token;
    private String userEmail;
    private String password;
    private LocalDateTime expiryDate;
    private String role;
    public VerificationToken() {}


    public VerificationToken(String token, String userEmail, String password, LocalDateTime expiryDate,String role) {
        this.token = token;
        this.userEmail = userEmail;
        this.password = password;
        this.expiryDate = expiryDate;
        this.role = role;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getId() {
        return id;
    }

    public String getToken() {
        return token;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }


    @Override
    public String toString() {
        return "VerificationToken{" +
                "id='" + id + '\'' +
                ", token='" + token + '\'' +
                ", userEmail='" + userEmail + '\'' +
                ", password='" + password + '\'' +
                ", expiryDate=" + expiryDate +
                '}';
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

}