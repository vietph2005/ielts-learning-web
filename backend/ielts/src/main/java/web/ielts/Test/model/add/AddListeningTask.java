package web.ielts.Test.model.add;

import java.util.List;

public class AddListeningTask {
    private int taskNumber;
    private List<AddListeningSection> sections;

    public AddListeningTask() {}

    public int getTaskNumber() {
        return taskNumber;
    }

    public void setTaskNumber(int taskNumber) {
        this.taskNumber = taskNumber;
    }

    public List<AddListeningSection> getSections() {
        return sections;
    }

    public void setSections(List<AddListeningSection> sections) {
        this.sections = sections;
    }
}
