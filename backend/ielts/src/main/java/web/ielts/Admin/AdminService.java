package web.ielts.Admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web.ielts.User.User;
import web.ielts.User.UserDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service

public class AdminService {
    @Autowired
    private AdminRepository adminRepository;
    public List<UserDTO> getUsersByRole(String role) {
        List<User> users = adminRepository.findByRoleContaining(role);
        return users.stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());
    }



    public void updateUser(String email, List<String> role) {
        User user = adminRepository.findByEmail(email);
        if (user != null) {
            user.setRole(role); // Cập nhật danh sách roles mới gồm "student", "manager"
            adminRepository.save(user);
        }
    }

    public void deleteUserByEmail(String email) {
        adminRepository.deleteByEmail(email);
    }
    public boolean existsByEmail(String email) {
        return adminRepository.existsByEmail(email);
    }
}
