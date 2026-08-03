package web.ielts.FileUpload;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<Map<String, String>> uploadAudio(@RequestParam("file") MultipartFile file) {
        return handleUpload(file, "audio");
    }

    @PostMapping("/image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        return handleUpload(file, "image");
    }

    private ResponseEntity<Map<String, String>> handleUpload(MultipartFile file, String folder) {
        Map<String, String> response = new HashMap<>();
        try {
            String url = fileUploadService.uploadFile(file, folder);
            response.put("url", url);
            response.put("message", "Upload successful");
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            response.put("error", "Upload failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
