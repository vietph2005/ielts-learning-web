package web.ielts.Payment.controller;

//import web.ielts.Payment.model.PaymentRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import web.ielts.Payment.model.PaymentRequest;
import web.ielts.Payment.model.PaymentResponse;
//import web.ielts.Payment.model.MomoCallbackRequest;
//import web.ielts.Payment.model.PaymentTransaction;
//import web.ielts.Payment.repository.PaymentTransactionRepository;
import web.ielts.Payment.service.VNPayService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/vn-pay")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class VNPayController {

    @Autowired
    private VNPayService vnPayService;

    // Tạo thanh toán MoMo
    @PostMapping("/create")
    public ResponseEntity<?> createPayment(@RequestBody Map<String, Object> payload, HttpServletRequest request) {
        try {
            Object amountObj = payload.get("amount");
            Object infoObj = payload.get("orderInfo");

            if (amountObj == null || infoObj == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Thiếu dữ liệu thanh toán"));
            }

            long amount = Long.parseLong(amountObj.toString());
            String orderInfo = infoObj.toString();

            PaymentResponse paymentResponse = vnPayService.createVnPayPayment(amount, orderInfo, request);
            return ResponseEntity.ok(Map.of("payUrl", paymentResponse.getPaymentUrl()));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi tạo thanh toán", "error", e.getMessage()));
        }
    }


    @GetMapping("/vn-pay-callback")
    public PaymentRequest<PaymentResponse> payCallbackHandler(HttpServletRequest request) {
        String status = request.getParameter("vnp_ResponseCode");
        if (status.equals("00")) {
            return new PaymentRequest<>(HttpStatus.OK, "Success", new PaymentResponse("00", "Success", ""));
        } else {
            return new PaymentRequest<>(HttpStatus.BAD_REQUEST, "Failed", null);
        }
    }
}

