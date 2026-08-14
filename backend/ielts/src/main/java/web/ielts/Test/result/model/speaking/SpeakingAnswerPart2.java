package web.ielts.Test.result.model.speaking;

import web.ielts.Test.ai.model.FleCohAnswer;
import web.ielts.Test.ai.model.PronunciationAnswer;

import java.util.List;

public class SpeakingAnswerPart2 {
    private int partNumber;
    private String title;
    private String question;
    private String transcript;
    private String audioAnswer;
    private double score;
    private GrammarAnswer grammarAnswer;
    private GrammarAnswer lexicalAnswer;
    private PronunciationAnswer pronunciationAnswer;
    private FleCohAnswer fluencyCohAnswer;
    private List<String> cueCards;

    public SpeakingAnswerPart2() {
    }

    public int getPartNumber() {
        return partNumber;
    }

    public void setPartNumber(int partNumber) {
        this.partNumber = partNumber;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getTranscript() {
        return transcript;
    }

    public void setTranscript(String transcript) {
        this.transcript = transcript;
    }

    public String getAudioAnswer() {
        return audioAnswer;
    }

    public void setAudioAnswer(String audioAnswer) {
        this.audioAnswer = audioAnswer;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public GrammarAnswer getGrammarAnswer() {
        return grammarAnswer;
    }

    public void setGrammarAnswer(GrammarAnswer grammarAnswer) {
        this.grammarAnswer = grammarAnswer;
    }

    public GrammarAnswer getLexicalAnswer() {
        return lexicalAnswer;
    }

    public void setLexicalAnswer(GrammarAnswer lexicalAnswer) {
        this.lexicalAnswer = lexicalAnswer;
    }

    public PronunciationAnswer getPronunciationAnswer() {
        return pronunciationAnswer;
    }

    public void setPronunciationAnswer(PronunciationAnswer pronunciationAnswer) {
        this.pronunciationAnswer = pronunciationAnswer;
    }

    public FleCohAnswer getFluencyCohAnswer() {
        return fluencyCohAnswer;
    }

    public void setFluencyCohAnswer(FleCohAnswer fluencyCohAnswer) {
        this.fluencyCohAnswer = fluencyCohAnswer;
    }

    public List<String> getCueCards() {
        return cueCards;
    }

    public void setCueCards(List<String> cueCards) {
        this.cueCards = cueCards;
    }
}
