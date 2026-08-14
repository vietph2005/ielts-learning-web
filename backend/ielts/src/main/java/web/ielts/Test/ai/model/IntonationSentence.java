package web.ielts.Test.ai.model;

public class IntonationSentence {
    private String text;
    private int index;

    public IntonationSentence() {
    }

    public IntonationSentence(String text, int index) {
        this.text = text;
        this.index = index;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public int getIndex() {
        return index;
    }

    public void setIndex(int index) {
        this.index = index;
    }

    @Override
    public String toString() {
        return "IntonationSentence{" +
                "text='" + text + '\'' +
                ", index=" + index +
                '}';
    }
}
