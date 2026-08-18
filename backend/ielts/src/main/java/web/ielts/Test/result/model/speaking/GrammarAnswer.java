package web.ielts.Test.result.model.speaking;

import java.util.ArrayList;
import java.util.List;

public class GrammarAnswer {

    private double score;
    private String errorText;
    private String correctText;
    private String errorType;
    private String explanation;
    private String sentenceContext;
    private List<ErrorDetail> errors = new ArrayList<>();

    public GrammarAnswer() {
    }

    public GrammarAnswer(double score, String errorText, String correctText, String errorType, String explanation, String sentenceContext) {
        this.score = score;
        this.errorText = errorText;
        this.correctText = correctText;
        this.errorType = errorType;
        this.explanation = explanation;
        this.sentenceContext = sentenceContext;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public List<ErrorDetail> getErrors() {
        return errors;
    }

    public void setErrors(List<ErrorDetail> errors) {
        this.errors = errors;
        if (errors != null && !errors.isEmpty() && (this.errorText == null || this.errorText.isEmpty())) {
            ErrorDetail first = errors.get(0);
            this.errorText = first.getErrorText();
            this.correctText = first.getCorrectText();
            this.errorType = first.getErrorType();
            this.explanation = first.getExplanation();
            this.sentenceContext = first.getSentenceContext();
        }
    }

    public String getSentenceContext() {
        return sentenceContext;
    }

    public void setSentenceContext(String sentenceContext) {
        this.sentenceContext = sentenceContext;
    }

    public String getCorrectText() {
        return correctText;
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

    private String comment;

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getErrorText() {
        return errorText;
    }

    public void setErrorText(String errorText) {
        this.errorText = errorText;
    }

    public static class ErrorDetail {
        private String errorText;
        private String correctText;
        private String errorType;
        private String explanation;
        private String sentenceContext;

        public ErrorDetail() {
        }

        public ErrorDetail(String errorText, String correctText, String errorType, String explanation, String sentenceContext) {
            this.errorText = errorText;
            this.correctText = correctText;
            this.errorType = errorType;
            this.explanation = explanation;
            this.sentenceContext = sentenceContext;
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

        public String getSentenceContext() {
            return sentenceContext;
        }

        public void setSentenceContext(String sentenceContext) {
            this.sentenceContext = sentenceContext;
        }
    }
}
