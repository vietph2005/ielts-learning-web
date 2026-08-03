package web.ielts.Test.dto;


import org.springframework.data.annotation.Id;

public class ListTest {
    @Id
    private String id;
    private String title;
    private int year;

    public ListTest(String id, String title, int year) {
        this.id = id;
        this.title = title;
        this.year = year;
    }
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public int getYear() {
        return year;
    }
    public void setYear(int year) {
        this.year = year;
    }
}