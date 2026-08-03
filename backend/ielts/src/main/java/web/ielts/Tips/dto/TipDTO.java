package web.ielts.Tips.dto;

public class TipDTO {
    private String id;
    private String skill;
    private String type;
    private String description;

    // Constructor, getter, setter
    public TipDTO(String id, String skill, String type, String description) {
        this.id = id;
        this.skill = skill;
        this.type = type;
        this.description = description;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSkill() {
        return skill;
    }

    public void setSkill(String skill) {
        this.skill = skill;
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
}
