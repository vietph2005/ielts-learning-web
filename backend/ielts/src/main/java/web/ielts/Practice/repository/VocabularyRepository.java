package web.ielts.Practice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.mongodb.repository.MongoRepository;
import  web.ielts.Practice.model.*;

import org.springframework.data.domain.Pageable;



public interface VocabularyRepository extends MongoRepository<Vocabulary, String> {

    Page<Vocabulary> findByWordContainingIgnoreCaseAndTopicContainingIgnoreCaseAndBandContainingIgnoreCase(
            String word, String topic, String band, Pageable pageable
    );
}
