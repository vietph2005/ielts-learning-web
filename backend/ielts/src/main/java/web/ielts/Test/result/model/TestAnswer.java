package web.ielts.Test.result.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "TestAnswer")
public class TestAnswer {
    @Id
    private String id;
    private String testId;
    private String username;
    private String listeningAnswerId;
    private String readingAnswerId;
    private String writingAnswerId;
    private String speakingAnswerId;
    private LocalDateTime createdAt;
    private LocalDateTime submittedAt;

    public TestAnswer() {}

    public TestAnswer(String testId, String username) {
        this.testId = testId;
        this.username = username;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTestId() { return testId; }
    public void setTestId(String testId) { this.testId = testId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getListeningAnswerId() { return listeningAnswerId; }
    public void setListeningAnswerId(String listeningAnswerId) { this.listeningAnswerId = listeningAnswerId; }
    public String getReadingAnswerId() { return readingAnswerId; }
    public void setReadingAnswerId(String readingAnswerId) { this.readingAnswerId = readingAnswerId; }
    public String getWritingAnswerId() { return writingAnswerId; }
    public void setWritingAnswerId(String writingAnswerId) { this.writingAnswerId = writingAnswerId; }
    public String getSpeakingAnswerId() { return speakingAnswerId; }
    public void setSpeakingAnswerId(String speakingAnswerId) { this.speakingAnswerId = speakingAnswerId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}
