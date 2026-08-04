package web.ielts.Test.model.add;

import java.util.List;

public class AddListeningTask {
    private int taskNumber;
    private String audioUrl;
    private List<AddListeningSection> sections;

    public AddListeningTask() {}

    public int getTaskNumber() {
        return taskNumber;
    }

    public void setTaskNumber(int taskNumber) {
        this.taskNumber = taskNumber;
    }

    public String getAudioUrl() {
        return audioUrl;
    }

    public void setAudioUrl(String audioUrl) {
        this.audioUrl = audioUrl;
    }

    public List<AddListeningSection> getSections() {
        return sections;
    }

    public void setSections(List<AddListeningSection> sections) {
        this.sections = sections;
    }
}
