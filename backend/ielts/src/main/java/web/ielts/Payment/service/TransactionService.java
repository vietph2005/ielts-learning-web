package web.ielts.Payment.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web.ielts.Payment.model.PaymentTransactions;
import web.ielts.Payment.repository.TransactionRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {
    @Autowired
    private TransactionRepository repository;

    public List<PaymentTransactions> getAll() {
        return repository.findAll();
    }

    public PaymentTransactions getById(String id) {
        return repository.findById(id).orElse(null);
    }

    public PaymentTransactions save(PaymentTransactions transaction) {
        return repository.save(transaction);
    }

    public void saveTransaction(String email, String type, long amount, String method, String status, String message, String transactionId) {
        PaymentTransactions tx = new PaymentTransactions();
        tx.setEmail(email);
        tx.setType(type);
        tx.setAmount(amount);
        tx.setPaymentMethod(method);
        tx.setStatus(status);
        tx.setMessage(message);
        tx.setTransactionId(transactionId);
        tx.setCreatedAt(LocalDateTime.now(ZoneOffset.UTC));
        repository.save(tx);
    }

    public List<PaymentTransactions> getUserTransactions(String email) {
        List<PaymentTransactions> transactions = repository.findByEmailOrderByCreatedAtDesc(email);
        return transactions.stream().map(tx -> {
            PaymentTransactions transaction = new PaymentTransactions();
            transaction.setEmail(tx.getEmail());
            transaction.setType(tx.getType());
            transaction.setAmount(tx.getAmount());
            transaction.setPaymentMethod(tx.getPaymentMethod());
            transaction.setStatus(tx.getStatus());
            transaction.setMessage(tx.getMessage());
            transaction.setTransactionId(tx.getTransactionId());
            transaction.setCreatedAt(tx.getCreatedAt());
            return transaction;
        }).collect(Collectors.toList());
    }


    public void delete(String id) {
        repository.deleteById(id);
    }
}
