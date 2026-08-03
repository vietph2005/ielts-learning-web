package web.ielts.Test.model.add;

public class AddTestRequest {
    private AddTest test;
    private AddListening listening;
    private AddReading reading;
    private AddWriting writing;
    private AddSpeaking speaking;

    public AddTestRequest() {}

    public AddTest getTest() {
        return test;
    }

    public void setTest(AddTest test) {
        this.test = test;
    }

    public AddListening getListening() {
        return listening;
    }

    public void setListening(AddListening listening) {
        this.listening = listening;
    }

    public AddReading getReading() {
        return reading;
    }

    public void setReading(AddReading reading) {
        this.reading = reading;
    }

    public AddWriting getWriting() {
        return writing;
    }

    public void setWriting(AddWriting writing) {
        this.writing = writing;
    }

    public AddSpeaking getSpeaking() {
        return speaking;
    }

    public void setSpeaking(AddSpeaking speaking) {
        this.speaking = speaking;
    }
}