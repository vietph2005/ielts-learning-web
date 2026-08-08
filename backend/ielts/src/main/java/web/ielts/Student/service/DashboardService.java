package web.ielts.Student.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import web.ielts.Student.dto.AggregatedStudent;
import web.ielts.Student.model.StudentResult;
import org.springframework.data.mongodb.core.query.Criteria;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private MongoTemplate mongoTemplate;

    //private StudentRepository studentRepository;

    public List<AggregatedStudent> getTop10Students() {
        List<String> collections = List.of("ListeningAnswer", "ReadingAnswer", "SpeakingAnswer", "WritingAnswer");

        Map<String, AggregatedStudent> studentMap = new HashMap<>();

        for (String collection : collections) {
            List<StudentResult> results = mongoTemplate.findAll(StudentResult.class, collection);

            for (StudentResult result : results) {
                if (result.getUsername() == null || result.getBand() == null) continue;

                String username = result.getUsername();
                AggregatedStudent student = studentMap.getOrDefault(username, new AggregatedStudent(username));

                switch (collection) {
                    case "ListeningAnswer" -> {
                        if (student.getBandListening() == null || result.getBand() > student.getBandListening()) {
                            student.setBandListening(result.getBand());
                        }
                    }
                    case "ReadingAnswer" -> {
                        if (student.getBandReading() == null || result.getBand() > student.getBandReading()) {
                            student.setBandReading(result.getBand());
                        }
                    }
                    case "SpeakingAnswer" -> {
                        if (student.getBandSpeaking() == null || result.getBand() > student.getBandSpeaking()) {
                            student.setBandSpeaking(result.getBand());
                        }
                    }
                    case "WritingAnswer" -> {
                        if (student.getBandWriting() == null || result.getBand() > student.getBandWriting()) {
                            student.setBandWriting(result.getBand());
                        }
                    }
                }

                studentMap.put(username, student);
            }
        }

        // Tính averageBand
        for (AggregatedStudent student : studentMap.values()) {
            List<Double> bands = new ArrayList<>();
            if (student.getBandListening() != null) bands.add(student.getBandListening());
            if (student.getBandReading() != null) bands.add(student.getBandReading());
            if (student.getBandSpeaking() != null) bands.add(student.getBandSpeaking());
            if (student.getBandWriting() != null) bands.add(student.getBandWriting());

            if (!bands.isEmpty()) {
                double avg = bands.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                student.setAverageBand(avg);
            } else {
                student.setAverageBand(0.0);
            }
        }

        // Trả về top 10
        return studentMap.values().stream()
                .sorted(Comparator.comparingDouble(AggregatedStudent::getAverageBand).reversed())
                .limit(10)
                .collect(Collectors.toList());
    }


    // Lấy Top 3 sinh viên mỗi kỹ năng theo band
    public Map<String, List<StudentResult>> getTop3EachSkill() {
        Map<String, List<StudentResult>> result = new HashMap<>();

        Map<String, String> skillToCollection = Map.of(
                "writing", "WritingAnswer",
                "listening", "ListeningAnswer",
                "speaking", "SpeakingAnswer",
                "reading", "ReadingAnswer"
        );

        for (String skill : skillToCollection.keySet()) {
            Query query = new Query();
            query.addCriteria(Criteria.where("skill").is(skill));
            query.with(Sort.by(Sort.Direction.DESC, "band"));
            query.limit(3);
            String collectionName = skillToCollection.get(skill);
            List<StudentResult> top3 = mongoTemplate.find(query, StudentResult.class, collectionName);
            result.put(skill, top3);
        }

        return result;
    }
}
