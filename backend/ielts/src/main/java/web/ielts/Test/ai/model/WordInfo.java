package web.ielts.Test.ai.model;

public class WordInfo {
    private String word;
    private double start;
    private double end;
    private int index;

    public WordInfo(String word, double start, double end, int index) {
        this.word = word;
        this.start = start;
        this.end = end;
        this.index = index;
    }

    public String getWord() {
        return word;
    }

    public void setWord(String word) {
        this.word = word;
    }

    public double getStart() {
        return start;
    }

    public void setStart(double start) {
        this.start = start;
    }

    public double getEnd() {
        return end;
    }

    public void setEnd(double end) {
        this.end = end;
    }

    public int getIndex() {
        return index;
    }

    public void setIndex(int index) {
        this.index = index;
    }
}
