package web.ielts.Practice.model;

public class ExampleSentence {
    private String eSentence;
    private String vSentence;

    public ExampleSentence(String eSentence, String vSentence) {
        this.eSentence = eSentence;
        this.vSentence = vSentence;
    }

    public String getESentence() {
        return eSentence;
    }

    public void setESentence(String eSentence) {
        this.eSentence = eSentence;
    }

    public String getVSentence() {
        return vSentence;
    }

    public void setVSentence(String vSentence) {
        this.vSentence = vSentence;
    }
}