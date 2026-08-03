package web.ielts.Payment.model;

import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "coursePremium")
public class Course {
    private String id;
    private String name;
    private long price;
    private long originalPrice;
    private String description;
    private long duration;

    public Course() {
    }

    public Course(String id, String name, long price, long originalPrice, String description, long duration) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.originalPrice = originalPrice;
        this.description = description;
        this.duration = duration;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public long getPrice() {
        return price;
    }

    public void setPrice(long price) {
        this.price = price;
    }

    public long getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(long originalPrice) {
        this.originalPrice = originalPrice;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public long getDuration() {
        return duration;
    }

    public void setDuration(long duration) {
        this.duration = duration;
    }

    @Override
    public String toString() {
        return "Course{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", price=" + price +
                ", originalPrice=" + originalPrice +
                ", description='" + description + '\'' +
                ", duration='" + duration + '\'' +
                '}';
    }
}