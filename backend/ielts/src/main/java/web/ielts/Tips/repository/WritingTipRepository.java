package web.ielts.Tips.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import web.ielts.Tips.model.ListeningTips;
import web.ielts.Tips.model.WritingTips;

import java.util.List;
import java.util.Optional;

public interface WritingTipRepository extends MongoRepository<WritingTips, String> {
    Optional<WritingTips> findTopByOrderByIdDesc();
    List<WritingTips> findBySkill(String skill);
}
