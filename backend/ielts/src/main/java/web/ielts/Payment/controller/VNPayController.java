package web.ielts.Payment.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import web.ielts.Common.dto.ApiResponse;
import web.ielts.Common.exception.BadRequestException;
import web.ielts.Payment.model.PaymentRequest;
import web.ielts.Payment.model.PaymentResponse;
import web.ielts.Payment.service.VNPayService;

import java.util.Map;

@RestController
@RequestMapping("/payments/vn-pay")
public class VNPayController {

    @Autowired
    private VNPayService vnPayService;

    // Tạo thanh toán VNPay
    @PostMapping
    public ApiResponse<Map<String, String>> createPayment(@RequestBody Map<String, Object> payload, HttpServletRequest request) {
        Object amountObj = payload.get("amount");
        Object infoObj = payload.get("orderInfo");

        if (amountObj == null || infoObj == null) {
            throw new BadRequestException("Thiếu dữ liệu thanh toán bắt buộc (amount hoặc orderInfo)");
        }

        long amount;
        try {
            amount = Long.parseLong(amountObj.toString());
        } catch (NumberFormatException e) {
            throw new BadRequestException("Số tiền không đúng định dạng: " + amountObj);
        }

        String orderInfo = infoObj.toString();
        PaymentResponse paymentResponse = vnPayService.createVnPayPayment(amount, orderInfo, request);
        return ApiResponse.success(Map.of("payUrl", paymentResponse.getPaymentUrl()), "Tạo URL thanh toán VNPay thành công");
    }

    // Callback từ VNPay - Giữ nguyên định dạng riêng cho bên thứ 3 (Edge Case 4)
    @GetMapping("/callback")
    public PaymentRequest<PaymentResponse> payCallbackHandler(HttpServletRequest request) {
        String status = request.getParameter("vnp_ResponseCode");
        if ("00".equals(status)) {
            return new PaymentRequest<>(HttpStatus.OK, "Success", new PaymentResponse("00", "Success", ""));
        } else {
            return new PaymentRequest<>(HttpStatus.BAD_REQUEST, "Failed", null);
        }
    }
}
