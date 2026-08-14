package web.ielts.Admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import web.ielts.Common.dto.ApiResponse;
import web.ielts.User.UserDTO;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/users")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping
    public ApiResponse<List<UserDTO>> getUsersByRole(@RequestParam(required = false) String role) {
        List<UserDTO> users = role != null && !role.isEmpty()
                ? adminService.getUsersByRole(role)
                : adminService.getUsersByRole("");
        return ApiResponse.success(users, "Lấy danh sách người dùng theo vai trò thành công");
    }

    @PutMapping("/{email}/roles")
    public ApiResponse<String> updateUserRoles(@PathVariable String email, @RequestBody Map<String, Object> data) {
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) data.get("roles");
        adminService.updateUser(email, roles);
        return ApiResponse.success("Cập nhật vai trò thành công");
    }

    @PostMapping("/{email}/roles")
    public ApiResponse<String> addRole(@PathVariable String email, @RequestBody Map<String, Object> data) {
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) data.get("roles");
        adminService.updateUser(email, roles);
        return ApiResponse.success("Thêm vai trò thành công");
    }

    @DeleteMapping("/{email}/roles")
    public ApiResponse<String> deleteRole(@PathVariable String email, @RequestBody Map<String, Object> data) {
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) data.get("roles");
        adminService.updateUser(email, roles);
        return ApiResponse.success("Xóa vai trò thành công");
    }
}
