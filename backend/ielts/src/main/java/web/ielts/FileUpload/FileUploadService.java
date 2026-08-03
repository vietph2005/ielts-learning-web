package web.ielts.FileUpload;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;

@Service
public class FileUploadService {

    @Value("${firebase.storage.bucket:projectsavefileandaudio.firebasestorage.app}")
    private String bucketName;

    @Autowired
    private Storage storage;

    public FileUploadService() {
    }

    public FileUploadService(String bucketName, Storage storage) {
        this.bucketName = bucketName;
        this.storage = storage;
    }

    public String uploadFile(MultipartFile file, String folder) throws IOException {
        String filePath = generateFilePathWithTimestamp(folder, file.getOriginalFilename());

        BlobId blobId = BlobId.of(bucketName, filePath);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();

        storage.create(blobInfo, file.getBytes());

        String encodedPath = URLEncoder.encode(filePath, StandardCharsets.UTF_8);
        return String.format("https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media", bucketName, encodedPath);
    }

    private String generateFilePathWithTimestamp(String folder, String originalFilename) {
        if (originalFilename == null) {
            originalFilename = "file";
        }
        String baseName = originalFilename.contains(".") ?
                originalFilename.substring(0, originalFilename.lastIndexOf(".")) :
                originalFilename;

        String extension = originalFilename.contains(".") ?
                originalFilename.substring(originalFilename.lastIndexOf(".")) :
                "";

        long timestamp = Instant.now().toEpochMilli();

        return String.format("%s/test/%s_%d%s", folder, baseName, timestamp, extension);
    }
}
