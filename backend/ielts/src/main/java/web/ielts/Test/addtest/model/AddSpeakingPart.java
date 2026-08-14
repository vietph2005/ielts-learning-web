package web.ielts.Test.addtest.model;

import java.util.List;

public class AddSpeakingPart {
    private int partNumber;
    private String title;
    private List<AddSpeakingQuestion> questions;

    public AddSpeakingPart() {}

    public int getPartNumber() {
        return partNumber;
    }

    public void setPartNumber(int partNumber) {
        this.partNumber = partNumber;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<AddSpeakingQuestion> getQuestions() {
        return questions;
    }

    public void setQuestions(List<AddSpeakingQuestion> questions) {
        this.questions = questions;
    }
}
