package web.ielts.Test.model.answer.listening;


import java.util.List;

public class SectionListeningAnswer {
    private int sectionNumber;
    private String type;
    private List<QuestionListeningAnswer> questions;
    public SectionListeningAnswer() {
    }
    public SectionListeningAnswer(int sectionNumber, String type, List<QuestionListeningAnswer> questions) {
        this.sectionNumber = sectionNumber;
        this.type = type;
        this.questions = questions;
    }

    public int getSectionNumber() {
        return sectionNumber;
    }

    public void setSectionNumber(int sectionNumber) {
        this.sectionNumber = sectionNumber;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<QuestionListeningAnswer> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuestionListeningAnswer> questions) {
        this.questions = questions;
    }

    @Override
    public String toString() {
        return "SectionAnswer{" +
                "sectionNumber=" + sectionNumber +
                ", type='" + type + '\'' +
                ", questions=" + questions +
                '}';
    }
}