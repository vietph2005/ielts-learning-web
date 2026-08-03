package web.ielts.Test.model.answer.writing;

public class TaskWritingAnswer {
    private String type;
    private String question;
    private String imageUrl;
    private String answer;
    private String wordCount;
    private String score;
    private WritingAIResponse.Feedback feedback;
    private EvaluationWritingAnswer evaluation;
    private String sampleAnswer;

    public String getScore() {
        return score;
    }

    public void setScore(String score) {
        this.score = score;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public String getWordCount() {
        return wordCount;
    }

    public void setWordCount(String wordCount) {
        this.wordCount = wordCount;
    }

    public WritingAIResponse.Feedback getFeedback() {
        return feedback;
    }

    public void setFeedback(WritingAIResponse.Feedback feedback) {
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

    @Override
    public String toString() {
        return "TaskWritingAnswer{" +
                "type='" + type + '\'' +
                ", question='" + question + '\'' +
                ", imageUrl='" + imageUrl + '\'' +
                ", answer='" + answer + '\'' +
                ", wordCount='" + wordCount + '\'' +
                ", score='" + score + '\'' +
                ", feedback=" + feedback +
                ", evaluation=" + evaluation +
                ", sampleAnswer='" + sampleAnswer + '\'' +
                '}';
    }
}
