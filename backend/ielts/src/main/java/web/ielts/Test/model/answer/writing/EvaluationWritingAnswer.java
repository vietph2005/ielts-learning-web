package web.ielts.Test.model.answer.writing;

import com.fasterxml.jackson.annotation.JsonProperty;

public class EvaluationWritingAnswer {
    @JsonProperty("TaskAchievement")
    private Review TaskAchievement;

    @JsonProperty("CoherenceCohesion")
    private Review CoherenceCohesion;
    @JsonProperty("LexicalResource")
    private Review LexicalResource;
    @JsonProperty("Grammar")
    private Review Grammar;

    public Review getTaskAchievement() {
        return TaskAchievement;
    }

    public void setTaskAchievement(Review taskAchievement) {
        TaskAchievement = taskAchievement;
    }

    public Review getCoherenceCohesion() {
        return CoherenceCohesion;
    }

    public void setCoherenceCohesion(Review coherenceCohesion) {
        CoherenceCohesion = coherenceCohesion;
    }

    public Review getLexicalResource() {
        return LexicalResource;
    }

    public void setLexicalResource(Review lexicalResource) {
        LexicalResource = lexicalResource;
    }

    public Review getGrammar() {
        return Grammar;
    }

    public void setGrammar(Review grammar) {
        Grammar = grammar;
    }
}
