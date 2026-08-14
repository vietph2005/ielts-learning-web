package web.ielts.FileUpload;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import web.ielts.Common.dto.ApiResponse;
import web.ielts.Common.exception.BadRequestException;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/files")
public class FileUploadController {

    @Autowired
    private FileUploadService fileUploadService;

    @PostMapping("/audio")
    public ApiResponse<Map<String, String>> uploadAudio(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "subfolder", required = false, defaultValue = "listening") String subfolder,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "username", required = false) String username) {
        return handleUpload(file, "audio", subfolder, role, username);
    }

    @PostMapping("/images")
    public ApiResponse<Map<String, String>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "subfolder", required = false, defaultValue = "listening") String subfolder,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "username", required = false) String username) {
        return handleUpload(file, "image", subfolder, role, username);
    }

    // Alias hỗ trợ cả /image
    @PostMapping("/image")
    public ApiResponse<Map<String, String>> uploadImageAlias(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "subfolder", required = false, defaultValue = "listening") String subfolder,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "username", required = false) String username) {
        return handleUpload(file, "image", subfolder, role, username);
    }

    private ApiResponse<Map<String, String>> handleUpload(
            MultipartFile file,
            String folder,
            String subfolder,
            String role,
            String username) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                if (username == null || username.trim().isEmpty()) {
                    username = auth.getName();
                }
                if (role == null || role.trim().isEmpty()) {
                    role = auth.getAuthorities().stream()
                            .map(GrantedAuthority::getAuthority)
                            .findFirst()
                            .orElse("GUEST");
                }
            }

            String url = fileUploadService.uploadFile(file, folder, subfolder, role, username);
            Map<String, String> response = new HashMap<>();
            response.put("url", url);
            return ApiResponse.success(response, "Upload file thành công");
        } catch (IOException e) {
            throw new BadRequestException("Upload file thất bại: " + e.getMessage());
        }
    }
}
