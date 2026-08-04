package web.ielts.Test.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
@Document(collection = "Listening")

public class Listening {
    @Id
    private String testId;
    private String audioUrl;
    private List<TaskListening> tasks;


    // getters & setters
    public String getTestId() { return testId; }
    public void setTestId(String testId) { this.testId = testId; }
    public String getAudioUrl() { return audioUrl; }
    public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }
    public List<TaskListening> getTasks() { return tasks; }
    public void setTasks(List<TaskListening> tasks) { this.tasks = tasks; }

    public static class TaskListening {
        private int taskNumber;
        private String audioUrl;
        private List<Section> sections;
        public int getTaskNumber() { return taskNumber; }
        public void setTaskNumber(int taskNumber) { this.taskNumber = taskNumber; }
        public String getAudioUrl() { return audioUrl; }
        public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }
        public List<Section> getSections() { return sections; }
        public void setSections(List<Section> sections) { this.sections = sections; }
    }

    public static class Section {
        private int sectionNumber;
        private String type;
        private String imageUrl;
        private String introduction;
        private List<Question> questions;
        public int getSectionNumber() { return sectionNumber; }
        public void setSectionNumber(int sectionNumber) { this.sectionNumber = sectionNumber; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public String getIntroduction() { return introduction; }
        public void setIntroduction(String introduction) { this.introduction = introduction; }
        public List<Question> getQuestions() { return questions; }
        public void setQuestions(List<Question> questions) { this.questions = questions; }
    }

    public static class Question {
        private String question;
        private String answer;
        private String explanation;
        private List<String> options;
        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }
        public String getAnswer() { return answer; }
        public void setAnswer(String answer) { this.answer = answer; }
        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
        public List<String> getOptions() { return options; }
        public void setOptions(List<String> options) { this.options = options; }
    }
}