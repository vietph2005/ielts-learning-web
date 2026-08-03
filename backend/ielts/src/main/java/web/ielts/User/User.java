package web.ielts.User;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Document(collection = "user")
public class User implements UserDetails {

    private String firstName;
    private String lastName;

    @Id
    private String email;

    private String password;
    private List<String> role;


    private LocalDateTime premiumExpiry;

    private boolean premium;

    private String googleID;
    private String createdAt;
    private String birthDate;
    private String gender;
    private String phone;

    public User() {
    }

    public User(String email, String password, List<String> role) {
        this.email = email;
        this.password = password;
        this.role = role;
    }

    public User(String firstName, String lastName, String email, String password, List<String> role,
                LocalDateTime premiumExpiry, boolean premium, String googleID,
                String createdAt, String birthDate, String gender, String phone) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.role = role;
        this.premiumExpiry = premiumExpiry;
        this.premium = premium;
        this.googleID = googleID;
        this.createdAt = createdAt;
        this.birthDate = birthDate;
        this.gender = gender;
        this.phone = phone;
    }

    public boolean isPremiumExpired() {
        return premiumExpiry != null && premiumExpiry.isBefore(LocalDateTime.now());
    }

    // --- Getters & Setters ---

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public List<String> getRole() {
        return role;
    }

    public void setRole(List<String> role) {
        this.role = role;
    }

    public LocalDateTime getPremiumExpiry() {
        return premiumExpiry;
    }

    public void setPremiumExpiry(LocalDateTime premiumExpiry) {
        this.premiumExpiry = premiumExpiry;
    }

    public boolean isPremium() {
        return premium;
    }

    public void setPremium(boolean premium) {
        this.premium = premium;
    }

    public String getGoogleID() {
        return googleID;
    }

    public void setGoogleID(String googleID) {
        this.googleID = googleID;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(String birthDate) {
        this.birthDate = birthDate;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    // --- Spring Security Overrides ---
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return role.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                .collect(Collectors.toList());
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Có thể tuỳ chỉnh nếu muốn khóa tài khoản sau thời gian
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Tuỳ chỉnh nếu có tính năng khóa tài khoản
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Kiểm soát thời hạn password
    }

    @Override
    public String toString() {
        return "User{" +
                "firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", password='" + password + '\'' +
                ", role='" + role + '\'' +
                ", premiumExpiry=" + premiumExpiry +
                ", premium=" + premium +
                ", googleID='" + googleID + '\'' +
                ", createdAt='" + createdAt + '\'' +
                ", birthDate='" + birthDate + '\'' +
                ", gender='" + gender + '\'' +
                ", phone='" + phone + '\'' +
                '}';
    }

    @Override
    public boolean isEnabled() {
        return true; // Có thể tuỳ biến bật/tắt người dùng
    }
}
