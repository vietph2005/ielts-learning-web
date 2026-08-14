package web.ielts.Test.result.model.speaking;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "SpeakingAnswer")
public class SpeakingAnswer {
    public SpeakingAnswer() {
    }
    @Id
    private String id;
    private String testId;
    private String username;
    private String skill;
    private SpeakingAnswerPart13 part1;
    private SpeakingAnswerPart2 part2;
    private SpeakingAnswerPart13 part3;

    private double band;
    private LocalDateTime submittedAt;

    public SpeakingAnswer(String testId) {
        this.testId = testId;
    }

    public String getTestId() {
        return testId;
    }

    public void setTestId(String testId) {
        this.testId = testId;
    }

    public SpeakingAnswerPart13 getPart1() {
        return part1;
    }

    public void setPart1(SpeakingAnswerPart13 part1) {
        this.part1 = part1;
    }

    public SpeakingAnswerPart2 getPart2() {
        return part2;
    }

    public void setPart2(SpeakingAnswerPart2 part2) {
        this.part2 = part2;
    }

    public SpeakingAnswerPart13 getPart3() {
        return part3;
    }

    public void setPart3(SpeakingAnswerPart13 part3) {
        this.part3 = part3;
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

    public String getId() {
        return id;
    }

    public SpeakingAnswer(String id, String testId, String username, String skill, SpeakingAnswerPart13 part1, SpeakingAnswerPart2 part2, SpeakingAnswerPart13 part3) {
        this.id = id;
        this.testId = testId;
        this.username = username;
        this.skill = skill;
        this.part1 = part1;
        this.part2 = part2;
        this.part3 = part3;
    }

    @Override
    public String toString() {
        return "SpeakingAnswer{" +
                "id='" + id + '\'' +
                ", testId='" + testId + '\'' +
                ", username='" + username + '\'' +
                ", skill='" + skill + '\'' +
                ", part1=" + part1 +
                ", part2=" + part2 +
                ", part3=" + part3 +
                ", band=" + band +
                ", submittedAt=" + submittedAt +
                '}';
    }

    public void setId(String id) {
        this.id = id;
    }

    public double getBand() {
        return band;
    }

    public void setBand(double band) {
        this.band = band;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
}
