package web.ielts.Tips.model;

import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "ListeningTips")
public class ListeningTips {
    private String id;
    private String type;
    private String description;
    private String skill;
    private List<String> strategy;

    private List<String> tips;

    private List<Exercise> exercises;

    public ListeningTips(String id, String type, String description, String skill) {
        this.id = id;
        this.type = type;
        this.description = description;
        this.skill = skill;
    }

    public static class Exercise {
        private String audioUrl;
        private String instruction;
        private String imageUrl;
        private List<Section> section;

        public static class Section {
            private List<String> question;
            private List<String> options;
            private String answer;
            private String explanation;

            public List<String> getQuestion() {
                return question;
            }

            public void setQuestion(List<String> question) {
                this.question = question;
            }

            public List<String> getOptions() {
                return options;
            }

            public void setOptions(List<String> options) {
                this.options = options;
            }

            public String getAnswer() {
                return answer;
            }

            public void setAnswer(String answer) {
                this.answer = answer;
            }

            public String getExplanation() {
                return explanation;
            }

            public void setExplanation(String explanation) {
                this.explanation = explanation;
            }
        }

        public String getAudioUrl() {
            return audioUrl;
        }

        public void setAudioUrl(String audioUrl) {
            this.audioUrl = audioUrl;
        }

        public String getInstruction() {
            return instruction;
        }

        public void setInstruction(String instruction) {
            this.instruction = instruction;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }

        public List<Section> getSection() {
            return section;
        }

        public void setSection(List<Section> section) {
            this.section = section;
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSkill() {
        return skill;
    }

    public void setSkill(String skill) {
        this.skill = skill;
    }

    public List<String> getStrategy() {
        return strategy;
    }

    public void setStrategy(List<String> strategy) {
        this.strategy = strategy;
    }

    public List<String> getTips() {
        return tips;
    }

    public void setTips(List<String> tips) {
        this.tips = tips;
    }

    public List<Exercise> getExercises() {
        return exercises;
    }

    public void setExercises(List<Exercise> exercises) {
        this.exercises = exercises;
    }
}