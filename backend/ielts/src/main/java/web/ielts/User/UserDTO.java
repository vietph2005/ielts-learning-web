package web.ielts.User;

import java.time.LocalDateTime;
import java.util.List;

public class UserDTO {

    private List<String> roles;
    private String firstName;
    private String lastName;
    private String email;
    private boolean premium;
    private LocalDateTime premiumExpiry;
    private String birthDate;
    private String gender;
    private String phone;
    private String createdAt;
    private String country;
    private String timeZone;
    private String cuurency;
    private String userName;

    public UserDTO() {
    }

    public UserDTO(User user) {
        if (user != null) {
            this.userName = user.getEmail();
            this.email = user.getEmail();
            this.firstName = user.getFirstName();
            this.lastName = user.getLastName();
            this.roles = user.getRole();
            this.premium = user.isPremium();
            this.premiumExpiry = user.getPremiumExpiry();
            this.birthDate = user.getBirthDate();
            this.gender = user.getGender();
            this.phone = user.getPhone();
            this.createdAt = user.getCreatedAt();
        }
    }

    public UserDTO(String email, List<String> roles) {
        this.email = email;
        this.userName = email;
        this.roles = roles;
    }

    public UserDTO(List<String> roles, String firstName, String lastName, String email, boolean premium, String birthDate, String gender, String phone, String createdAt, String country, String timeZone, String cuurency, String userName) {
        this.roles = roles;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.premium = premium;
        this.birthDate = birthDate;
        this.gender = gender;
        this.phone = phone;
        this.createdAt = createdAt;
        this.country = country;
        this.timeZone = timeZone;
        this.cuurency = cuurency;
        this.userName = userName;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

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

    public boolean isPremium() {
        return premium;
    }

    public void setPremium(boolean premium) {
        this.premium = premium;
    }

    public LocalDateTime getPremiumExpiry() {
        return premiumExpiry;
    }

    public void setPremiumExpiry(LocalDateTime premiumExpiry) {
        this.premiumExpiry = premiumExpiry;
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

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getTimeZone() {
        return timeZone;
    }

    public void setTimeZone(String timeZone) {
        this.timeZone = timeZone;
    }

    public String getCuurency() {
        return cuurency;
    }

    public void setCuurency(String cuurency) {
        this.cuurency = cuurency;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }
}