package web.ielts.Test.model.add;

import java.util.List;

public class AddReadingTask {
    private int taskNumber;
    private String paragraph;
    private List<AddReadingSection> sections;

    public AddReadingTask() {}

    public int getTaskNumber() {
        return taskNumber;
    }

    public void setTaskNumber(int taskNumber) {
        this.taskNumber = taskNumber;
    }

    public String getParagraph() {
        return paragraph;
    }

    public void setParagraph(String paragraph) {
        this.paragraph = paragraph;
    }

    public List<AddReadingSection> getSections() {
        return sections;
    }

    public void setSections(List<AddReadingSection> sections) {
        this.sections = sections;
    }
}
