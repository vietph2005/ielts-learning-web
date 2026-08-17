package web.ielts.Test.result.model.writing;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "WritingAnswer")
public class WritingAnswer {
    @Id
    private String id;
    private String username;
    private String testId;
    private TaskWritingAnswer task1;
    private TaskWritingAnswer task2;
    private String gradingMethod;
    private String gradingStatus; // "grading" | "graded" | "grading_failed"

    private String skill;
    private double band;
    private LocalDateTime submittedAt;

    public WritingAnswer() {
    }

    public WritingAnswer(String id, String username, String testId, TaskWritingAnswer task1, TaskWritingAnswer task2, String gradingMethod, double band, LocalDateTime submittedAt) {
        this.id = id;
        this.username = username;
        this.testId = testId;
        this.task1 = task1;
        this.task2 = task2;
        this.gradingMethod = gradingMethod;
        this.band = band;
        this.submittedAt = submittedAt;
    }

    public String getGradingMethod() {
        return gradingMethod;
    }

    public String getGradingStatus() {
        return gradingStatus;
    }

    public void setGradingStatus(String gradingStatus) {
        this.gradingStatus = gradingStatus;
    }

    @Override
    public String toString() {
        return "WritingAnswer{" +
                "id='" + id + '\'' +
                ", username='" + username + '\'' +
                ", testId='" + testId + '\'' +
                ", task1=" + task1 +
                ", task2=" + task2 +
                ", gradingMethod='" + gradingMethod + '\'' +
                ", band=" + band +
                ", submittedAt=" + submittedAt +
                '}';
    }

    public String getSkill() {
        return skill;
    }

    public void setSkill(String skill) {
        this.skill = skill;
    }

    public void setGradingMethod(String gradingMethod) {
        this.gradingMethod = gradingMethod;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTestId() {
        return testId;
    }

    public void setTestId(String testId) {
        this.testId = testId;
    }

    public TaskWritingAnswer getTask1() {
        return task1;
    }

    public void setTask1(TaskWritingAnswer task1) {
        this.task1 = task1;
    }

    public TaskWritingAnswer getTask2() {
        return task2;
    }

    public void setTask2(TaskWritingAnswer task2) {
        this.task2 = task2;
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
