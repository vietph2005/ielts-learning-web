package web.ielts.Test.model.answer.speaking;

public class FeedBackAI {
    private double score;
    private String comment;

    public FeedBackAI() {
    }

    public FeedBackAI(double score, String comment) {
        this.score = score;
        this.comment = comment;
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
