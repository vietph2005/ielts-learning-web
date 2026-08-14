package web.ielts.Test.result.model.reading;

import java.util.List;

public class QuestionReadingAnswer {
    private String question;
    private String answer;
    private List<String> options;
    private String explanation;

    private String studentAnswer;
    private int questionId;

    public QuestionReadingAnswer() {
    }

    public QuestionReadingAnswer(String question, String answer, List<String> options, String explanation, String studentAnswer, int questionId) {
        this.question = question;
        this.answer = answer;
        this.options = options;
        this.explanation = explanation;
        this.studentAnswer = studentAnswer;
        this.questionId = questionId;
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

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getStudentAnswer() {
        return studentAnswer;
    }

    public void setStudentAnswer(String studentAnswer) {
        this.studentAnswer = studentAnswer;
    }

    public int getQuestionId() {
        return questionId;
    }

    public void setQuestionId(int questionId) {
        this.questionId = questionId;
    }

    @Override
    public String toString() {
        return "QuestionAnswerStudent{" +
                "question='" + question + '\'' +
                ", answer='" + answer + '\'' +
                ", options=" + options +
                ", explanation='" + explanation + '\'' +
                ", studentAnswer='" + studentAnswer + '\'' +
                ", questionId=" + questionId +
                '}';
    }
}
