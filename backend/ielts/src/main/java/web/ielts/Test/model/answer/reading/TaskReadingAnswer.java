package web.ielts.Test.model.answer.reading;

import java.util.List;

public class TaskReadingAnswer {
    private int taskNumber;
    private String title;
    private String paragraph;
    private List<SectionReadingAnswer> sections;

    public TaskReadingAnswer(int taskNumber, String title, String paragraph, List<SectionReadingAnswer> sections) {
        this.taskNumber = taskNumber;
        this.title = title;
        this.paragraph = paragraph;
        this.sections = sections;
    }

    public int getTaskNumber() {
        return taskNumber;
    }

    public TaskReadingAnswer() {
    }

    public void setTaskNumber(int taskNumber) {
        this.taskNumber = taskNumber;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getParagraph() {
        return paragraph;
    }

    public void setParagraph(String paragraph) {
        this.paragraph = paragraph;
    }

    public List<SectionReadingAnswer> getSections() {
        return sections;
    }

    public void setSections(List<SectionReadingAnswer> sections) {
        this.sections = sections;
    }

    @Override
    public String toString() {
        return "TaskReadingAnswer{" +
                "taskNumber=" + taskNumber +
                ", title='" + title + '\'' +
                ", paragraph='" + paragraph + '\'' +
                ", sections=" + sections +
                '}';
    }
}
