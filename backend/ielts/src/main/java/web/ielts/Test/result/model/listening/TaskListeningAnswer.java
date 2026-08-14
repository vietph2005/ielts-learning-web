package web.ielts.Test.result.model.listening;

import java.util.List;

public class TaskListeningAnswer {
    private int taskNumber;
    private List<SectionListeningAnswer> sections;

    public TaskListeningAnswer() {
    }

    public TaskListeningAnswer(int taskNumber, List<SectionListeningAnswer> sections) {
        this.taskNumber = taskNumber;
        this.sections = sections;
    }

    public int getTaskNumber() {
        return taskNumber;
    }

    public void setTaskNumber(int taskNumber) {
        this.taskNumber = taskNumber;
    }

    public List<SectionListeningAnswer> getSections() {
        return sections;
    }

    @Override
    public String toString() {
        return "TaskAnswer{" +
                "taskNumber=" + taskNumber +
                ", sections=" + sections +
                '}';
    }

    public void setSections(List<SectionListeningAnswer> sections) {
        this.sections = sections;
    }
}
