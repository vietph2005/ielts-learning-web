package web.ielts.Payment.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaymentResponse {
    public String code;
    public String message;
    public String paymentUrl;
}