package web.ielts.Practice.service;
import org.springframework.data.domain.Page;

import org.springframework.data.domain.PageRequest;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;
import org.springframework.data.mongodb.core.query.Query;
import  web.ielts.Practice.model.*;
import  web.ielts.Practice.repository.*;

import java.util.List;
import java.util.Optional;

@Service
public class VocabularyService {
    @Autowired
    private VocabularyRepository vocabularyRepository;
    @Autowired
    private MongoTemplate mongoTemplate;

    public List<Vocabulary> getAllVocabularies() {
        return vocabularyRepository.findAll();
    }

    public Optional<Vocabulary> getVocabularyById(String id) {
        return vocabularyRepository.findById(id);
    }

    public Vocabulary addVocabulary(Vocabulary vocabulary) {
        return vocabularyRepository.save(vocabulary);
    }

    public void deleteVocabulary(String id) {
        vocabularyRepository.deleteById(id);
    }

    public Vocabulary updateVocabulary(String id, Vocabulary vocabulary) {
        vocabulary.setId(id);
        return vocabularyRepository.save(vocabulary);
    }
    public List<String> getAllTopics() {
        return mongoTemplate.findDistinct(new Query(), "topic", "vocabularies", String.class);
    }

    // Lấy danh sách band thực tế từ database
    public List<String> getAllBands() {
        return mongoTemplate.findDistinct(new Query(), "band", "vocabularies", String.class);
    }
    public Page<Vocabulary> searchAndPaginate(String keyword, String topic, String band, int page, int size) {
        return vocabularyRepository
                .findByWordContainingIgnoreCaseAndTopicContainingIgnoreCaseAndBandContainingIgnoreCase(
                        keyword == null ? "" : keyword,
                        topic == null ? "" : topic,
                        band == null ? "" : band,
                        PageRequest.of(page, size)
                );
    }

}