package web.ielts.Test.addtest.model;

import java.util.List;

public class AddSpeakingPart2 {
    private int partNumber;
    private String title;
    private String question;
    private List<String> cueCards;

    public AddSpeakingPart2() {}

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

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public List<String> getCueCards() {
        return cueCards;
    }

    public void setCueCards(List<String> cueCards) {
        this.cueCards = cueCards;
    }
}
