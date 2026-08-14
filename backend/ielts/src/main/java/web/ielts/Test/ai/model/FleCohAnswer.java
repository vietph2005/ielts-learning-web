package web.ielts.Test.ai.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import net.minidev.json.annotate.JsonIgnore;
import java.util.Locale;

@JsonIgnoreProperties(ignoreUnknown = true)
public class FleCohAnswer {

    private double score;
    @JsonIgnore
    private String meanIntensity;
    @JsonIgnore
    private String pauseCount;
    @JsonIgnore
    private String speechRate;
    @JsonIgnore
    private String totalDuration;
    @JsonIgnore
    private String totalPauseDuration;
    @JsonIgnore
    private String wordCount;
    @JsonIgnore
    private String pauseRate;
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

    public String getTotalDuration() {
        return totalDuration;
    }

    public void setTotalDuration(String totalDuration) {
        this.totalDuration = totalDuration;
    }

    public String getTotalPauseDuration() {
        return totalPauseDuration;
    }

    public void setTotalPauseDuration(String totalPauseDuration) {
        this.totalPauseDuration = totalPauseDuration;
    }

    public String getWordCount() {
        return wordCount;
    }

    public void setWordCount(String wordCount) {
        this.wordCount = wordCount;
    }

    public String getPauseRate() {
        return pauseRate;
    }

    public void setPauseRate(String pauseRate) {
        this.pauseRate = pauseRate;
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

    public double getCalculatedPauseRate() {
        if (pauseRate != null && !pauseRate.isEmpty()) {
            try {
                return Double.parseDouble(pauseRate);
            } catch (Exception ignored) {}
        }
        try {
            double dur = totalDuration != null ? Double.parseDouble(totalDuration) : 0.0;
            int pauses = pauseCount != null ? Integer.parseInt(pauseCount) : 0;
            if (dur > 0) {
                return pauses / (dur / 60.0);
            }
        } catch (Exception ignored) {}
        return 0.0;
    }

    @Override
    public String toString() {
        return String.format(Locale.US,
                "Speech Rate: %s wps, Pause Count: %s, Pause Rate: %.2f pauses/min, Total Duration: %ss, Word Count: %s",
                speechRate != null ? speechRate : "N/A",
                pauseCount != null ? pauseCount : "N/A",
                getCalculatedPauseRate(),
                totalDuration != null ? totalDuration : "N/A",
                wordCount != null ? wordCount : "N/A"
        );
    }
}
