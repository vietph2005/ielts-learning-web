package web.ielts.Test.model.answer.speaking;

public class StressMismatch {
    private String word;
    private Integer detectedPosition;
    private Integer standardPosition;
    private double start;
    private double end;
    private int index;

    public StressMismatch() {
    }

    public StressMismatch(String word, Integer detectedPosition, Integer standardPosition, double start, double end, int index) {
        this.word = word;
        this.detectedPosition = detectedPosition;
        this.standardPosition = standardPosition;
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

    public Integer getDetectedPosition() {
        return detectedPosition;
    }

    public void setDetectedPosition(Integer detectedPosition) {
        this.detectedPosition = detectedPosition;
    }

    public Integer getStandardPosition() {
        return standardPosition;
    }

    public void setStandardPosition(Integer standardPosition) {
        this.standardPosition = standardPosition;
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

    @Override
    public String toString() {
        return "StressMismatch{" +
                "word='" + word + '\'' +
                ", detectedPosition=" + detectedPosition +
                ", standardPosition=" + standardPosition +
                ", start=" + start +
                ", end=" + end +
                ", index=" + index +
                '}';
    }
}
