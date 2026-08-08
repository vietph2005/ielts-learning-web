package web.ielts.Payment.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import web.ielts.Payment.model.PaymentTransactions;
import web.ielts.Payment.repository.TransactionRepository;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TransactionServiceTest {

    @Mock
    private TransactionRepository repository;

    @InjectMocks
    private TransactionService transactionService;

    @Test
    void testGetAll() {
        PaymentTransactions tx = new PaymentTransactions();
        when(repository.findAll()).thenReturn(List.of(tx));

        List<PaymentTransactions> result = transactionService.getAll();
        assertEquals(1, result.size());
    }

    @Test
    void testGetById() {
        PaymentTransactions tx = new PaymentTransactions();
        when(repository.findById("tx123")).thenReturn(Optional.of(tx));

        PaymentTransactions result = transactionService.getById("tx123");
        assertNotNull(result);
        assertEquals(tx, result);
    }

    @Test
    void testSave() {
        PaymentTransactions tx = new PaymentTransactions();
        when(repository.save(tx)).thenReturn(tx);

        PaymentTransactions result = transactionService.save(tx);
        assertNotNull(result);
    }

    @Test
    void testSaveTransaction() {
        transactionService.saveTransaction(
                "user@example.com",
                "1 tháng",
                100000L,
                "vnpay",
                "success",
                "Nạp tiền",
                "vnpay123"
        );

        verify(repository, times(1)).save(any(PaymentTransactions.class));
    }

    @Test
    void testGetUserTransactions_ShouldPreserveId() {
        PaymentTransactions tx = new PaymentTransactions();
        tx.setId("mongodb-id-123");
        tx.setEmail("user@example.com");
        tx.setType("1 tháng");

        when(repository.findByEmailOrderByCreatedAtDesc("user@example.com")).thenReturn(List.of(tx));

        List<PaymentTransactions> result = transactionService.getUserTransactions("user@example.com");

        assertEquals(1, result.size());
        // Xác minh xem ID của giao dịch có được giữ nguyên hay không (sửa lỗi logic)
        assertEquals("mongodb-id-123", result.get(0).getId());
        assertEquals("user@example.com", result.get(0).getEmail());
    }

    @Test
    void testDelete() {
        transactionService.delete("tx123");
        verify(repository, times(1)).deleteById("tx123");
    }
}
