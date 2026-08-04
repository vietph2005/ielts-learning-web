package web.ielts.FileUpload;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;

@Service
public class FileUploadService {

    @Value("${supabase.url:https://vtgwqleicwbaefsnpxxd.supabase.co}")
    private String supabaseUrl;

    @Value("${supabase.key:}")
    private String supabaseKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public FileUploadService() {
    }

    public String uploadFile(MultipartFile file, String folder) throws IOException {
        String bucket = ("audio".equalsIgnoreCase(folder) || isAudioFile(file.getOriginalFilename())) ? "audio" : "image";
        String destinationFilename = generateFilename(file.getOriginalFilename());

        String uploadUrl = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucket, destinationFilename);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + supabaseKey);
        headers.set("apiKey", supabaseKey);
        headers.set("x-upsert", "true");
        if (file.getContentType() != null && !file.getContentType().isEmpty()) {
            headers.setContentType(MediaType.parseMediaType(file.getContentType()));
        } else {
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        }

        HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

        ResponseEntity<String> response = restTemplate.exchange(uploadUrl, HttpMethod.POST, requestEntity, String.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            return String.format("%s/storage/v1/object/public/%s/%s", supabaseUrl, bucket, destinationFilename);
        } else {
            throw new IOException("Failed to upload file to Supabase Storage: " + response.getBody());
        }
    }

    private boolean isAudioFile(String filename) {
        if (filename == null) return false;
        String lower = filename.toLowerCase();
        return lower.endsWith(".mp3") || lower.endsWith(".wav") || lower.endsWith(".ogg") || lower.endsWith(".m4a");
    }

    private String generateFilename(String originalFilename) {
        if (originalFilename == null || originalFilename.isEmpty()) {
            originalFilename = "file";
        }
        String baseName = originalFilename.contains(".") ?
                originalFilename.substring(0, originalFilename.lastIndexOf(".")) :
                originalFilename;

        String extension = originalFilename.contains(".") ?
                originalFilename.substring(originalFilename.lastIndexOf(".")) :
                "";

        long timestamp = Instant.now().toEpochMilli();

        return String.format("%s_%d%s", baseName.replaceAll("[^a-zA-Z0-9._-]", "_"), timestamp, extension);
    }
}
