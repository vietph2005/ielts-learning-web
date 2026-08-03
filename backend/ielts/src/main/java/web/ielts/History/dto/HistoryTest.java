package web.ielts.History.dto;

import java.time.LocalDateTime;

public class HistoryTest {
    private String testID;
    private String username;
    private String skill;
    private LocalDateTime submittedAt;
    private double band;

    public HistoryTest() {
    }

    public HistoryTest(String testID, String username, String skill, LocalDateTime submittedAt, double band) {
        this.testID = testID;
        this.username = username;
        this.skill = skill;
        this.submittedAt = submittedAt;
        this.band = band;
    }

    public String getTestID() {
        return testID;
    }

    public void setTestID(String testID) {
        this.testID = testID;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getSkill() {
        return skill;
    }

    public void setSkill(String skill) {
        this.skill = skill;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public double getBand() {
        return band;
    }

    public void setBand(double band) {
        this.band = band;
    }
}
