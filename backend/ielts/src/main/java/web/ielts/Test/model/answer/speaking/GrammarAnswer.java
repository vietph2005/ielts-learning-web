package web.ielts.Test.model.answer.speaking;

public class GrammarAnswer {


    private double score;
    private String errorText;
    private String correctText;
    private String errorType;
    private String explanation;
    private String sentenceContext;

    public String getSentenceContext() {
        return sentenceContext;
    }

    public void setSentenceContext(String sentenceContext) {
        this.sentenceContext = sentenceContext;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public void setCorrectText(String correctText) {
        this.correctText = correctText;
    }

    public String getErrorType() {
        return errorType;
    }

    public void setErrorType(String errorType) {
        this.errorType = errorType;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getErrorText() {
        return errorText;
    }

    public void setErrorText(String errorText) {
        this.errorText = errorText;
    }

    public String getCorrectText() {
        return correctText;
    }

    
}
