package web.ielts.Test.addtest.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "RequestReading")
public class AddReading {
    @Id
    private String id;
    private String testId;
    private List<AddReadingTask> tasks;

    public AddReading() {}

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

    public List<AddReadingTask> getTasks() {
        return tasks;
    }

    public void setTasks(List<AddReadingTask> tasks) {
        this.tasks = tasks;
    }
}
