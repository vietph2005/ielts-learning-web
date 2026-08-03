package web.ielts.Practice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "vocabularies")
public class Vocabulary {
    @Id
    private String id;
    private String word;
    private String translate;
    private String explanation;
    private String topic;
    private String band;
    private List<ExampleSentence> exp;
    private String partOfSpeech;
    private String pronunciation;

    public Vocabulary() {}

    public Vocabulary(String word, String translate, String explanation, String topic, String band, List<ExampleSentence> exp, String partOfSpeech, String pronunciation) {
        this.word = word;
        this.translate = translate;
        this.explanation = explanation;
        this.topic = topic;
        this.band = band;
        this.exp = exp;
        this.partOfSpeech = partOfSpeech;
        this.pronunciation = pronunciation;
    }

    // Getter & Setter

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getWord() { return word; }
    public void setWord(String word) { this.word = word; }

    public String getTranslate() { return translate; }
    public void setTranslate(String translate) { this.translate = translate; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getBand() { return band; }
    public void setBand(String band) { this.band = band; }

    public List<ExampleSentence> getExp() { return exp; }
    public void setExp(List<ExampleSentence> exp) { this.exp = exp; }

    public String getPartOfSpeech() { return partOfSpeech; }
    public void setPartOfSpeech(String partOfSpeech) { this.partOfSpeech = partOfSpeech; }

    public String getPronunciation() { return pronunciation; }
    public void setPronunciation(String pronunciation) { this.pronunciation = pronunciation; }
}