package web.ielts.Admin;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import web.ielts.User.User;
import web.ielts.User.UserDTO;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdminServiceTest {

    @Mock
    private AdminRepository adminRepository;

    @InjectMocks
    private AdminService adminService;

    @Test
    void testGetUsersByRole() {
        User u1 = new User();
        u1.setEmail("u1@example.com");
        u1.setRole(List.of("student"));

        User u2 = new User();
        u2.setEmail("u2@example.com");
        u2.setRole(List.of("student", "teacher"));

        when(adminRepository.findByRoleContaining("student")).thenReturn(List.of(u1, u2));

        List<UserDTO> result = adminService.getUsersByRole("student");

        assertEquals(2, result.size());
        assertEquals("u1@example.com", result.get(0).getEmail());
        assertEquals("u2@example.com", result.get(1).getEmail());
    }

    @Test
    void testUpdateUser_Success() {
        User user = new User();
        user.setEmail("user@example.com");
        user.setRole(List.of("student"));

        when(adminRepository.findByEmail("user@example.com")).thenReturn(user);

        adminService.updateUser("user@example.com", List.of("student", "manager"));

        assertEquals(List.of("student", "manager"), user.getRole());
        verify(adminRepository, times(1)).save(user);
    }

    @Test
    void testUpdateUser_NotFound() {
        when(adminRepository.findByEmail("nonexistent@example.com")).thenReturn(null);

        adminService.updateUser("nonexistent@example.com", List.of("student"));

        verify(adminRepository, never()).save(any());
    }

    @Test
    void testDeleteUserByEmail() {
        adminService.deleteUserByEmail("delete@example.com");
        verify(adminRepository, times(1)).deleteByEmail("delete@example.com");
    }

    @Test
    void testExistsByEmail() {
        when(adminRepository.existsByEmail("exists@example.com")).thenReturn(true);
        assertTrue(adminService.existsByEmail("exists@example.com"));

        when(adminRepository.existsByEmail("not@example.com")).thenReturn(false);
        assertFalse(adminService.existsByEmail("not@example.com"));
    }
}
