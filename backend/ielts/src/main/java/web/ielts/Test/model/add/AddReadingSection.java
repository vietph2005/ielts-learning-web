package web.ielts.Test.model.add;

import java.util.List;

public class AddReadingSection {
    private int sectionNumber;
    private String type;
    private String imageUrl;
    private String introduction;
    private List<AddReadingQuestion> questions;

    public AddReadingSection() {}

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

    public List<AddReadingQuestion> getQuestions() {
        return questions;
    }

    public void setQuestions(List<AddReadingQuestion> questions) {
        this.questions = questions;
    }
}
