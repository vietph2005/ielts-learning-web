package web.ielts.Payment.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import web.ielts.Payment.model.PaymentTransactions;
import web.ielts.Payment.repository.TransactionRepository;
import web.ielts.Payment.service.TransactionService;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class TransactionController {

    @Autowired
    private TransactionService service;

    @Autowired
    private TransactionRepository transactionRepository;


    @GetMapping("payment/transactions")
    public List<PaymentTransactions> getAllTransactions() {
        return transactionRepository.findAll();
    }

    // Lấy 1 giao dịch theo ID
    @GetMapping("/{id}")
    public PaymentTransactions getById(@PathVariable String id) {
        return service.getById(id);
    }

    // Tạo mới giao dịch
    @PostMapping
    public PaymentTransactions create(@RequestBody PaymentTransactions transaction) {
        return service.save(transaction);
    }

    // Xóa giao dịch theo ID
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }

    // Lưu giao dịch từ client gửi đến (sử dụng DTO và Principal để lấy email từ token)
    @PostMapping("/transactions/save")
    public ResponseEntity<String> recordTransaction(@RequestBody PaymentTransactions transaction, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized: missing user info");
        }
        // Validate required fields
        if (transaction.getType() == null || transaction.getAmount() == 0 || transaction.getPaymentMethod() == null || transaction.getStatus() == null || transaction.getTransactionId() == null) {
            return ResponseEntity.badRequest().body("Thiếu thông tin giao dịch bắt buộc");
        }
        String email = principal.getName();
        service.saveTransaction(
                email,
                transaction.getType(),
                transaction.getAmount(),
                transaction.getPaymentMethod(),
                transaction.getStatus(),
                transaction.getMessage(),
                transaction.getTransactionId()
        );
        return ResponseEntity.ok("Giao dịch đã được lưu");
    }

    // Lấy danh sách giao dịch của người dùng hiện tại
    @GetMapping("/user/transactions")
    public ResponseEntity<List<PaymentTransactions>> getMyTransactions(Principal principal) {
        String email = principal.getName();
        return ResponseEntity.ok(service.getUserTransactions(email));
    }

    // API trả về thống kê tổng tiền theo ngày/tuần/tháng/năm
    @GetMapping("/payment/transactions/statistics")
    public List<Stat> getStatistics(
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

            keyToTotal.put(key, keyToTotal.getOrDefault(key, 0L) + (long)tx.getAmount());
        }

        // Trả về danh sách đã sắp xếp theo key (ngày/tháng/năm/tuần)
        return keyToTotal.entrySet().stream()
                .map(e -> new Stat(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(Stat::getKey))
                .collect(Collectors.toList());
    }

    // DTO thống kê
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
