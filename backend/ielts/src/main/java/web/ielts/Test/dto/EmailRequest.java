package web.ielts.Test.dto;

public class EmailRequest {
    private String recipient;  // Email người nhận
    private String subject;    // Tiêu đề email
    private String message;    // Nội dung email
    private Double score;      // Điểm số (nếu cần)

    public EmailRequest() {
    }

    public EmailRequest(String recipient, String subject, String message, Double score) {
        this.recipient = recipient;
        this.subject = subject;
        this.message = message;
        this.score = score;
    }

    public String getRecipient() {
        return recipient;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    @Override
    public String toString() {
        return "EmailRequest{" +
                "recipient='" + recipient + '\'' +
                ", subject='" + subject + '\'' +
                ", message='" + message + '\'' +
                ", score=" + score +
                '}';
    }
}
