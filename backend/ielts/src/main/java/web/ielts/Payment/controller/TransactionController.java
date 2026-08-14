package web.ielts.Payment.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import web.ielts.Common.dto.ApiResponse;
import web.ielts.Common.exception.BadRequestException;
import web.ielts.Common.exception.ResourceNotFoundException;
import web.ielts.Common.exception.UnauthorizedException;
import web.ielts.Payment.model.PaymentTransactions;

import web.ielts.Payment.service.TransactionService;

import java.security.Principal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/transactions")
public class TransactionController {

    @Autowired
    private TransactionService service;

    @GetMapping
    public ApiResponse<List<PaymentTransactions>> getAllTransactions() {
        return ApiResponse.success(service.getAll(), "Lấy danh sách giao dịch thành công");
    }

    @GetMapping("/{id}")
    public ApiResponse<PaymentTransactions> getById(@PathVariable String id) {
        PaymentTransactions transaction = service.getById(id);
        if (transaction == null) {
            throw new ResourceNotFoundException("Không tìm thấy giao dịch với ID: " + id);
        }
        return ApiResponse.success(transaction, "Lấy chi tiết giao dịch thành công");
    }

    @PostMapping
    public ApiResponse<PaymentTransactions> createTransaction(@RequestBody PaymentTransactions transaction, Principal principal) {
        if (principal != null && (transaction.getEmail() == null || transaction.getEmail().isEmpty())) {
            transaction.setEmail(principal.getName());
        }
        if (transaction.getType() == null || transaction.getAmount() == 0 || transaction.getPaymentMethod() == null || transaction.getStatus() == null || transaction.getTransactionId() == null) {
            throw new BadRequestException("Thiếu thông tin giao dịch bắt buộc");
        }
        PaymentTransactions saved = service.save(transaction);
        return ApiResponse.success(saved, "Lưu giao dịch thành công");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ApiResponse.success(null, "Xóa giao dịch thành công");
    }

    @GetMapping("/me")
    public ApiResponse<List<PaymentTransactions>> getMyTransactions(Principal principal) {
        if (principal == null) {
            throw new UnauthorizedException("Yêu cầu đăng nhập");
        }
        String email = principal.getName();
        return ApiResponse.success(service.getUserTransactions(email), "Lấy danh sách giao dịch của bạn thành công");
    }

    @GetMapping("/statistics")
    public ApiResponse<List<Stat>> getStatistics(
            @RequestParam(defaultValue = "month") String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDateTime endDate
    ) {
        List<PaymentTransactions> all = service.getAll();
        if (startDate != null) {
            all = all.stream().filter(tx -> tx.getCreatedAt() != null && !tx.getCreatedAt().isBefore(startDate)).collect(Collectors.toList());
        }
        if (endDate != null) {
            all = all.stream().filter(tx -> tx.getCreatedAt() != null && !tx.getCreatedAt().isAfter(endDate)).collect(Collectors.toList());
        }
        Map<String, Long> keyToTotal = new HashMap<>();
        DateTimeFormatter fmt;

        for (PaymentTransactions tx : all) {
            if (tx.getCreatedAt() == null) continue;

            LocalDateTime date = tx.getCreatedAt();
            String key;

            switch (type) {
                case "day":
                    fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                    key = date.format(fmt);
                    break;
                case "week":
                    WeekFields weekFields = WeekFields.of(Locale.getDefault());
                    int weekNum = date.get(weekFields.weekOfWeekBasedYear());
                    key = date.getYear() + "-W" + String.format("%02d", weekNum);
                    break;
                case "year":
                    key = String.valueOf(date.getYear());
                    break;
                case "month":
                default:
                    fmt = DateTimeFormatter.ofPattern("yyyy-MM");
                    key = date.format(fmt);
                    break;
            }

            keyToTotal.put(key, keyToTotal.getOrDefault(key, 0L) + (long) tx.getAmount());
        }

        List<Stat> stats = keyToTotal.entrySet().stream()
                .map(e -> new Stat(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(Stat::getKey))
                .collect(Collectors.toList());

        return ApiResponse.success(stats, "Lấy thống kê doanh thu thành công");
    }

    public static class Stat {
        private String key;
        private long totalAmount;

        public Stat(String key, long totalAmount) {
            this.key = key;
            this.totalAmount = totalAmount;
        }

        public String getKey() {
            return key;
        }

        public long getTotalAmount() {
            return totalAmount;
        }
    }
}
