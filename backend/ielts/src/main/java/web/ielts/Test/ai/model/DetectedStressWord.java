package web.ielts.Test.ai.model;

public class DetectedStressWord {
    private String word;
    private int detectedPosition;

    public DetectedStressWord() {
    }

    public DetectedStressWord(String word, int detectedPosition) {
        this.word = word;
        this.detectedPosition = detectedPosition;
    }

    public String getWord() {
        return word;
    }

    public void setWord(String word) {
        this.word = word;
    }

    public int getDetectedPosition() {
        return detectedPosition;
    }

    public void setDetectedPosition(int detectedPosition) {
        this.detectedPosition = detectedPosition;
    }
}
