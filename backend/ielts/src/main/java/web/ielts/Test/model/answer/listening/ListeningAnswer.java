package web.ielts.Test.model.answer.listening;



import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document("ListeningAnswer")
public class ListeningAnswer {
    @Id
    private String id;
    private String testId;

    private List<TaskListeningAnswer> tasks;
    private String username;
    private String skill;
    private int totalQuestions;
    private int totalCorrect;
    private double band;
    private LocalDateTime submittedAt;

    public ListeningAnswer(String id, String testId, List<TaskListeningAnswer> tasks, String username, String skill, int totalQuestions, int totalCorrect, double band, LocalDateTime submittedAt) {
        this.id = id;
        this.testId = testId;
        this.tasks = tasks;
        this.username = username;
        this.skill = skill;
        this.totalQuestions = totalQuestions;
        this.totalCorrect = totalCorrect;
        this.band = band;
        this.submittedAt = submittedAt;
    }

    public ListeningAnswer() {
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

    public List<TaskListeningAnswer> getTasks() {
        return tasks;
    }

    public void setTasks(List<TaskListeningAnswer> tasks) {
        this.tasks = tasks;
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

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(int totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public int getTotalCorrect() {
        return totalCorrect;
    }

    public void setTotalCorrect(int totalCorrect) {
        this.totalCorrect = totalCorrect;
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