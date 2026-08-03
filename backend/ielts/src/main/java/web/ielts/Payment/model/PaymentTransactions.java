package web.ielts.Payment.model;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "paymentTransactions")
    public class PaymentTransactions {


        @Id
        private String id;
        private String email;
        private String type;
        private long amount;
        private String paymentMethod;
        private String status;
        private LocalDateTime createdAt;
        private String message;
        private String transactionId;

        public PaymentTransactions() {
        }

        public PaymentTransactions(String id, String email, String type, long amount, String paymentMethod, String status, LocalDateTime createdAt, String message, String transactionId) {
            this.id = id;
            this.email = email;
            this.type = type;
            this.amount = amount;
            this.paymentMethod = paymentMethod;
            this.status = status;
            this.createdAt = createdAt;
            this.message = message;
            this.transactionId = transactionId;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
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

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
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
        @Override
        public String toString() {
            return "PaymentTransactions{" +
                    "id='" + id + '\'' +
                    ", email='" + email + '\'' +
                    ", type='" + type + '\'' +
                    ", amount=" + amount +
                    ", paymentMethod='" + paymentMethod + '\'' +
                    ", status='" + status + '\'' +
                    ", createdAt=" + createdAt +
                    ", message='" + message + '\'' +
                    ", transactionId='" + transactionId + '\'' +
                    '}';
        }
    }
