package web.ielts.FileUpload;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    @Autowired
    private FileUploadService fileUploadService;

    @PostMapping("/audio")
    public ResponseEntity<Map<String, String>> uploadAudio(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "subfolder", required = false, defaultValue = "listening") String subfolder,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "username", required = false) String username) {
        return handleUpload(file, "audio", subfolder, role, username);
    }

    @PostMapping("/image")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "subfolder", required = false, defaultValue = "listening") String subfolder,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "username", required = false) String username) {
        return handleUpload(file, "image", subfolder, role, username);
    }

    private ResponseEntity<Map<String, String>> handleUpload(
            MultipartFile file,
            String folder,
            String subfolder,
            String role,
            String username) {
        Map<String, String> response = new HashMap<>();
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
            response.put("url", url);
            response.put("message", "Upload successful");
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            response.put("error", "Upload failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
