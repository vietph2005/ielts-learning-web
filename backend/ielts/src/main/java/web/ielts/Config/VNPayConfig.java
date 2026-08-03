package web.ielts.Config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import web.ielts.Payment.service.VNPayService;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Configuration
@Getter
public class VNPayConfig {

    @Value(value="${vnPay.pay-url}")
    private String payUrl;

    @Value(value="${vnPay.return-url}")
    private String returnUrl;

    @Value(value="${vnPay.tmn-code}")
    private String tmnCode;

    @Value(value="${vnPay.secret-key}")
    private String accessKey;
}