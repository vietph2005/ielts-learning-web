package web.ielts.Test.addtest.model;

public class AddWritingTask {
    private int taskNumber;
    private String imageUrl;
    private String question;
    private String chartData;

    public AddWritingTask() {}

    public int getTaskNumber() {
        return taskNumber;
    }

    public void setTaskNumber(int taskNumber) {
        this.taskNumber = taskNumber;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getChartData() {
        return chartData;
    }

    public void setChartData(String chartData) {
        this.chartData = chartData;
    }
}
