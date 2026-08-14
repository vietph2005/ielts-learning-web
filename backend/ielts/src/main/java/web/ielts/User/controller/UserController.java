package web.ielts.User.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import web.ielts.Common.dto.ApiResponse;
import web.ielts.Common.exception.UnauthorizedException;
import web.ielts.User.User;
import web.ielts.User.UserDTO;
import web.ielts.User.UserService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    // Lấy danh sách users (có thể lọc theo role)
    @GetMapping
    public ApiResponse<List<UserDTO>> getUsers(@RequestParam(required = false) String role) {
        List<UserDTO> dtoList = userService.getUsers(role);
        return ApiResponse.success(dtoList, "Lấy danh sách người dùng thành công");
    }

    // Lấy thông tin user hiện tại
    @GetMapping("/me")
    public ApiResponse<UserDTO> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            throw new UnauthorizedException("Không có thông tin đăng nhập");
        }
        User updatedUser = userService.resetPremiumIfExpired(user);
        return ApiResponse.success(new UserDTO(updatedUser), "Lấy thông tin tài khoản thành công");
    }

    // Lấy thông tin user theo username
    @GetMapping("/{username}")
    public ApiResponse<UserDTO> getUserByUsername(@PathVariable String username) {
        UserDTO userDTO = userService.getUserByUsername(username);
        return ApiResponse.success(userDTO, "Lấy thông tin người dùng thành công");
    }

    // Cập nhật thông tin user
    @PutMapping("/{username}")
    public ApiResponse<UserDTO> updateUser(@PathVariable String username, @RequestBody UserDTO updatedUserDto) {
        UserDTO userDTO = userService.updateUser(username, updatedUserDto);
        return ApiResponse.success(userDTO, "Cập nhật thông tin thành công");
    }

    // Nâng cấp premium
    @PostMapping("/me/premium")
    public ApiResponse<String> upgradePremium(
            @AuthenticationPrincipal User user,
            @CookieValue(value = "jwt_token", required = false) String token
    ) {
        if (user != null) {
            userService.upgradeToPremium(user.getEmail());
            return ApiResponse.success("Đã nâng cấp premium thành công");
        }

        if (token != null && !token.isEmpty()) {
            userService.upgradePremiumByToken(token);
            return ApiResponse.success("Đã nâng cấp premium thành công");
        }

        throw new UnauthorizedException("Không có thông tin đăng nhập");
    }

    // Cập nhật toàn bộ roles của user (dành cho Admin)
    @PutMapping("/{username}/roles")
    public ApiResponse<UserDTO> updateUserRoles(@PathVariable String username, @RequestBody Map<String, Object> data) {
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) data.get("roles");
        UserDTO userDTO = userService.updateUserRoles(username, roles);
        return ApiResponse.success(userDTO, "Cập nhật vai trò thành công");
    }

    // Thêm vai trò cho user (dành cho Admin)
    @PostMapping("/{username}/roles")
    public ApiResponse<UserDTO> addRoleToUser(@PathVariable String username, @RequestBody Map<String, Object> data) {
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) data.get("roles");
        UserDTO userDTO = userService.addRoleToUser(username, roles);
        return ApiResponse.success(userDTO, "Thêm vai trò thành công");
    }

    // Xóa vai trò khỏi user (dành cho Admin)
    @DeleteMapping("/{username}/roles/{role}")
    public ApiResponse<UserDTO> deleteRoleFromUser(@PathVariable String username, @PathVariable String role) {
        UserDTO userDTO = userService.deleteRoleFromUser(username, role);
        return ApiResponse.success(userDTO, "Xóa vai trò thành công");
    }

    // Xóa user theo username (dành cho Admin / Manager)
    @DeleteMapping("/{username}")
    public ApiResponse<Void> deleteUser(@PathVariable String username) {
        userService.deleteUser(username);
        return ApiResponse.success(null, "Xóa người dùng thành công");
    }
}