package web.ielts.Test.result.model.speaking;

public class Grammar {
    private String scoreEva;
    private String reviewEva;

    public Grammar(String scoreEva, String reviewEva) {
        this.scoreEva = scoreEva;
        this.reviewEva = reviewEva;
    }

    public Grammar() {
    }

    public String getScoreEva() {
        return scoreEva;
    }

    public void setScoreEva(String scoreEva) {
        this.scoreEva = scoreEva;
    }

    public String getReviewEva() {
        return reviewEva;
    }

    public void setReviewEva(String reviewEva) {
        this.reviewEva = reviewEva;
    }

    @Override
    public String toString() {
        return "Grammar{" +
                "scoreEva='" + scoreEva + '\'' +
                ", reviewEva='" + reviewEva + '\'' +
                '}';
    }
}
