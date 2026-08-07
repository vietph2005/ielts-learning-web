package web.ielts.Test.model.answer.listening;

public class QuestionListeningAnswer {
    private String question;
    private String answer;
    private String studentAnswer;
    private String explanation;

    public QuestionListeningAnswer() {
    }

    public QuestionListeningAnswer(String question, String answer, String studentAnswer) {
        this.question = question;
        this.answer = answer;
        this.studentAnswer = studentAnswer;
    }

    public QuestionListeningAnswer(String question, String answer, String studentAnswer, String explanation) {
        this.question = question;
        this.answer = answer;
        this.studentAnswer = studentAnswer;
        this.explanation = explanation;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public String getStudentAnswer() {
        return studentAnswer;
    }

    public void setStudentAnswer(String studentAnswer) {
        this.studentAnswer = studentAnswer;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    @Override
    public String toString() {
        return "QuestionAnswer{" +
                "question='" + question + '\'' +
                ", answer='" + answer + '\'' +
                ", studentAnswer='" + studentAnswer + '\'' +
                ", explanation='" + explanation + '\'' +
                '}';
    }
}