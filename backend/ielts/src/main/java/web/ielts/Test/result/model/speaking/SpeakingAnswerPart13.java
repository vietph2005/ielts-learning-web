package web.ielts.Test.result.model.speaking;

import java.util.List;

public class SpeakingAnswerPart13 {
    private int partNumber;
    private String title;
    private String instruction;
    private List<SpeakingAnswerQuestion> questions;
    private double averageScore;

    public double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(double averageScore) {
        this.averageScore = averageScore;
    }

    public SpeakingAnswerPart13(int partNumber, String title, String instruction, List<SpeakingAnswerQuestion> questions) {
        this.partNumber = partNumber;
        this.title = title;
        this.instruction = instruction;
        this.questions = questions;
    }

    public String getInstruction() {
        return instruction;
    }

    public void setInstruction(String instruction) {
        this.instruction = instruction;
    }

    public int getPartNumber() {
        return partNumber;
    }

    public void setPartNumber(int partNumber) {
        this.partNumber = partNumber;
    }

    public SpeakingAnswerPart13() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<SpeakingAnswerQuestion> getQuestions() {
        return questions;
    }

    public void setQuestions(List<SpeakingAnswerQuestion> questions) {
        this.questions = questions;
    }

    @Override
    public String toString() {
        return "Part1{" +
                "partNumber=" + partNumber +
                ", title='" + title + '\'' +
                ", instruction='" + instruction + '\'' +
                ", questions=" + questions +
                '}';
    }
}
