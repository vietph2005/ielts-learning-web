package web.ielts;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import web.ielts.Common.dto.ApiResponse;

import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public ApiResponse<Map<String, String>> home() {
        return ApiResponse.success(Map.of(
                "status", "UP",
                "message", "Welcome to IELTS Learning API v1",
                "version", "1.0.0"
        ), "Hệ thống đang hoạt động bình thường");
    }

    @GetMapping("/health")
    public ApiResponse<String> health() {
        return ApiResponse.success("OK", "Service is healthy");
    }
}
