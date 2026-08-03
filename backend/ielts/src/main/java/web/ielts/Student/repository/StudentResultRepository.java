package web.ielts.Student.repository;

import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import web.ielts.Student.model.StudentResult;

import java.util.List;

public interface StudentResultRepository extends MongoRepository<StudentResult, String> {

    @Aggregation(pipeline = {
            "{ $match: { skill: { $in: ['listening', 'reading', 'writing', 'speaking'] } } }",
            "{ $group: { _id: '$username', avgTotalCorrect: { $avg: '$totalCorrect' }, " +
                    "bandWriting: { $max: { $cond: [ { $eq: ['$skill', 'writing'] }, '$band', null ] } }, " +
                    "bandReading: { $max: { $cond: [ { $eq: ['$skill', 'reading'] }, '$band', null ] } }, " +
                    "bandListening: { $max: { $cond: [ { $eq: ['$skill', 'listening'] }, '$band', null ] } }, " +
                    "bandSpeaking: { $max: { $cond: [ { $eq: ['$skill', 'speaking'] }, '$band', null ] } } } }",
            "{ $sort: { avgTotalCorrect: -1 } }",
            "{ $limit: 10 }"
    })
    List<Object> getTop10Students();

    @Aggregation(pipeline = {
            "{ $match: { skill: ?0 } }",
            "{ $sort: { band: -1 } }",
            "{ $limit: 3 }"
    })
    List<StudentResult> getTop3BySkill(String skill);
}
