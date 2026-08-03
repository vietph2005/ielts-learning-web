package web.ielts.Payment.dto;

public class PaymentTransactionDto {
    private String type;
    private long amount;
    private String paymentMethod;
    private String status;
    private String message;
    private String transactionId;

    public PaymentTransactionDto(String type, long amount, String paymentMethod, String status, String message, String transactionId) {
        this.type = type;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.status = status;
        this.message = message;
        this.transactionId = transactionId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public long getAmount() {
        return amount;
    }

    public void setAmount(long amount) {
        this.amount = amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }
}
