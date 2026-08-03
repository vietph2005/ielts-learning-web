package web.ielts.Student.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AggregatedStudent {
    private String username;
    private String displayName;
    private Double averageBand;
    private Double bandWriting;
    private Double bandReading;
    private Double bandSpeaking;
    private Double bandListening;

    public AggregatedStudent(String username) {
        this.username = username;
    }
}
