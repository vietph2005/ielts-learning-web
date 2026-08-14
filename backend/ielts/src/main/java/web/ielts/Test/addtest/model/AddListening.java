package web.ielts.Test.addtest.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "RequestListening")
public class AddListening {
    @Id
    private String id;
    private String testId;
    private String audioUrl;
    private List<AddListeningTask> tasks;

    public AddListening() {}

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

    public String getAudioUrl() {
        return audioUrl;
    }

    public void setAudioUrl(String audioUrl) {
        this.audioUrl = audioUrl;
    }

    public List<AddListeningTask> getTasks() {
        return tasks;
    }

    public void setTasks(List<AddListeningTask> tasks) {
        this.tasks = tasks;
    }
}
