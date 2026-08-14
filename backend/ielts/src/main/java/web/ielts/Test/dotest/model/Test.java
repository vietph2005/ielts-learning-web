package web.ielts.Test.dotest.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Document(collection = "Test")
public class Test {
    @Id
    private String testId;
    private String testTitle;
    private List<String> tags;
    private String createdAt;

    public Test() {
    }

    public Test(String testId, String testTitle, List<String> tags, String createdAt) {
        this.testId = testId;
        this.testTitle = testTitle;
        this.tags = tags;
        this.createdAt = createdAt;
    }

    public String getTestId() {
        return testId;
    }

    public void setTestId(String testId) {
        this.testId = testId;
    }

    public String getTestTitle() {
        return testTitle;
    }

    public void setTestTitle(String testTitle) {
        this.testTitle = testTitle;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDate getCreatedAtDate() {
        try {
            return LocalDate.parse(createdAt, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        } catch (Exception e) {
            return null;
        }
    }

    public Integer getCreatedAtYear() {
        LocalDate date = getCreatedAtDate();
        return date != null ? date.getYear() : null;
    }
}
