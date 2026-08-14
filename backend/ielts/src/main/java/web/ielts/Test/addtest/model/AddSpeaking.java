package web.ielts.Test.addtest.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "RequestSpeaking")
public class AddSpeaking {
    @Id
    private String id;
    private String testId;
    private AddSpeakingPart part1;
    private AddSpeakingPart2 part2;
    private AddSpeakingPart part3;

    public AddSpeaking() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTestId() {
        return testId;
    }

    public void setTestId(String testId) {
        this.testId = testId;
    }

    public AddSpeakingPart getPart1() {
        return part1;
    }

    public void setPart1(AddSpeakingPart part1) {
        this.part1 = part1;
    }

    public AddSpeakingPart2 getPart2() {
        return part2;
    }

    public void setPart2(AddSpeakingPart2 part2) {
        this.part2 = part2;
    }

    public AddSpeakingPart getPart3() {
        return part3;
    }

    public void setPart3(AddSpeakingPart part3) {
        this.part3 = part3;
    }
}
