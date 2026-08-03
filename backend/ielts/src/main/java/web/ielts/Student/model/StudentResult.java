package web.ielts.Student.model;

import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Date;

@Data
@Document(collection = "answers")
public class StudentResult {
    private String username;
    private String skill;
    private Double band;
    private Integer totalCorrect;
    private LocalDateTime submittedAt;
}
