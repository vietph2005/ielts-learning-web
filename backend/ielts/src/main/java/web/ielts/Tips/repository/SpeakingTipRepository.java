package web.ielts.Tips.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import web.ielts.Tips.model.ListeningTips;
import web.ielts.Tips.model.SpeakingTips;

import java.util.List;
import java.util.Optional;

public interface SpeakingTipRepository extends MongoRepository<SpeakingTips, String> {
    Optional<SpeakingTips> findTopByOrderByIdDesc();
    List<SpeakingTips> findBySkill(String skill);
}
