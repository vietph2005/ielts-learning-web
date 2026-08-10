package web.ielts;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, String> home() {
        return Map.of(
            "status", "UP",
            "message", "Welcome to the IELTS Learning Web API! The backend is running successfully.",
            "version", "1.0.0"
        );
    }
}
