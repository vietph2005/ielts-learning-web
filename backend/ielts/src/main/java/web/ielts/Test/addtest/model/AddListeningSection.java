package web.ielts.Test.addtest.model;

import java.util.List;

public class AddListeningSection {
    private int sectionNumber;
    private String type;
    private String imageUrl;
    private String introduction;
    private List<AddListeningQuestion> questions;

    public AddListeningSection() {}

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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getIntroduction() {
        return introduction;
    }

    public void setIntroduction(String introduction) {
        this.introduction = introduction;
    }

    public List<AddListeningQuestion> getQuestions() {
        return questions;
    }

    public void setQuestions(List<AddListeningQuestion> questions) {
        this.questions = questions;
    }
}
