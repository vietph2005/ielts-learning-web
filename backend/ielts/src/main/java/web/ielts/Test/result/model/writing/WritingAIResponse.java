package web.ielts.Test.result.model.writing;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class WritingAIResponse {
    private Feedback feedback;
    @JsonProperty("evaluation")
    private EvaluationWritingAnswer evaluation;
    @JsonProperty("sampleAnswer")
    private String sampleAnswer;
    @JsonProperty("score")
    private String score;

    public String getScore() {
        return score;
    }

    public void setScore(String score) {
        this.score = score;
    }

    public Feedback getFeedback() {
        return feedback;
    }

    public void setFeedback(Feedback feedback) {
        this.feedback = feedback;
    }

    public EvaluationWritingAnswer getEvaluation() {
        return evaluation;
    }

    public void setEvaluation(EvaluationWritingAnswer evaluation) {
        this.evaluation = evaluation;
    }

    public String getSampleAnswer() {
        return sampleAnswer;
    }

    public void setSampleAnswer(String sampleAnswer) {
        this.sampleAnswer = sampleAnswer;
    }

    public static class Feedback {
        private List<ErrorCorrection> errorCorrections;
        private List<SentenceImprovement> sentenceImprovements;
        private String overallComment;

        public List<ErrorCorrection> getErrorCorrections() {
            return errorCorrections;
        }

        public void setErrorCorrections(List<ErrorCorrection> errorCorrections) {
            this.errorCorrections = errorCorrections;
        }

        public List<SentenceImprovement> getSentenceImprovements() {
            return sentenceImprovements;
        }

        public void setSentenceImprovements(List<SentenceImprovement> sentenceImprovements) {
            this.sentenceImprovements = sentenceImprovements;
        }

        public String getOverallComment() {
            return overallComment;
        }

        public void setOverallComment(String overallComment) {
            this.overallComment = overallComment;
        }

        @Override
        public String toString() {
            return "Feedback{" +
                    "errorCorrections=" + errorCorrections +
                    ", sentenceImprovements=" + sentenceImprovements +
                    ", overallComment='" + overallComment + '\'' +
                    '}';
        }
    }

    public static class ErrorCorrection {
        private String originalText;
        private String correctedText;
        private String errorType;
        private String explanation;
        private String sentenceContext;

        public String getOriginalText() {
            return originalText;
        }

        public void setOriginalText(String originalText) {
            this.originalText = originalText;
        }

        public String getCorrectedText() {
            return correctedText;
        }

        public void setCorrectedText(String correctedText) {
            this.correctedText = correctedText;
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

        @Override
        public String toString() {
            return "ErrorCorrection{" +
                    "originalText='" + originalText + '\'' +
                    ", correctedText='" + correctedText + '\'' +
                    ", errorType='" + errorType + '\'' +
                    ", explanation='" + explanation + '\'' +
                    ", sentenceContext='" + sentenceContext + '\'' +
                    '}';
        }
    }

    public static class SentenceImprovement {
        private String originalSentence;
        private String improvedSentence;
        private List<String> techniquesUsed;
        private String explanation;
        private String bandBoost;

        public String getExplanation() {
            return explanation;
        }

        public void setExplanation(String explanation) {
            this.explanation = explanation;
        }

        public String getOriginalSentence() {
            return originalSentence;
        }

        public void setOriginalSentence(String originalSentence) {
            this.originalSentence = originalSentence;
        }

        public String getImprovedSentence() {
            return improvedSentence;
        }

        public void setImprovedSentence(String improvedSentence) {
            this.improvedSentence = improvedSentence;
        }

        public List<String> getTechniquesUsed() {
            return techniquesUsed;
        }

        public void setTechniquesUsed(List<String> techniquesUsed) {
            this.techniquesUsed = techniquesUsed;
        }

        public String getBandBoost() {
            return bandBoost;
        }

        public void setBandBoost(String bandBoost) {
            this.bandBoost = bandBoost;
        }
    }

    @Override
    public String toString() {
        return "WritingAIResponse{" +
                "feedback=" + feedback +
                ", evaluation=" + evaluation +
                ", sampleAnswer='" + sampleAnswer + '\'' +
                ", score='" + score + '\'' +
                '}';
    }
}
