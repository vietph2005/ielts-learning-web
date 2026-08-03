package web.ielts.Test.model.answer.speaking;

import net.minidev.json.annotate.JsonIgnore;

public class FleCohAnswer {


    private double score;
    @JsonIgnore
    private String meanIntensity;
    @JsonIgnore
    private String pauseCount;
    @JsonIgnore
    private String speechRate;
    private String comment;

    public String getMeanIntensity() {
        return meanIntensity;
    }

    public void setMeanIntensity(String meanIntensity) {
        this.meanIntensity = meanIntensity;
    }

    public String getPauseCount() {
        return pauseCount;
    }

    public void setPauseCount(String pauseCount) {
        this.pauseCount = pauseCount;
    }

    public String getSpeechRate() {
        return speechRate;
    }

    public void setSpeechRate(String speechRate) {
        this.speechRate = speechRate;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public String getComment() {
        return comment;
    }


    public void setComment(String comment) {
        this.comment = comment;
    }
}
