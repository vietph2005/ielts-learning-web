package web.ielts.Test.repository.answer;


import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import web.ielts.Test.model.answer.writing.WritingAnswer;

import java.util.List;

@Repository
public interface WritingAnswerRepository extends MongoRepository<WritingAnswer, String> {
    List<WritingAnswer> findByUsername(String username);
    @Query("{ 'gradingMethod': { $in: ['teacher', 'human'] }, 'band': 0 }")
    List<WritingAnswer> findTeacherGradedButNotScoredAnswers();
}