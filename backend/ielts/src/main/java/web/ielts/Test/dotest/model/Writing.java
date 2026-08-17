package web.ielts.Test.dotest.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "Writing")
public class Writing {
    @Id
    private String testId;
    private List<Task> tasks;

    public List<Task> getTasks() {
        return tasks;
    }

    public void setTasks(List<Task> tasks) {
        this.tasks = tasks;
    }

    public String getTestId() {
        return testId;
    }

    public void setTestId(String testId) {
        this.testId = testId;
    }

    public static class Task {
        private int taskNumber;
        private String imageUrl;
        private String type;
        private String question;
        private String chartData;

        public int getTaskNumber() { return taskNumber; }
        public void setTaskNumber(int taskNumber) { this.taskNumber = taskNumber; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }
        public String getChartData() { return chartData; }
        public void setChartData(String chartData) { this.chartData = chartData; }
    }
}
