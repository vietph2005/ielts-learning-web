package web.ielts.Test.result.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import web.ielts.Test.result.model.writing.WritingAnswer;

import java.util.List;

@Repository
public interface WritingAnswerRepository extends MongoRepository<WritingAnswer, String> {
    List<WritingAnswer> findByUsername(String username);

    @Query("{ 'gradingMethod': { $in: ['teacher', 'human'] }, 'band': 0 }")
    List<WritingAnswer> findTeacherGradedButNotScoredAnswers();
}
