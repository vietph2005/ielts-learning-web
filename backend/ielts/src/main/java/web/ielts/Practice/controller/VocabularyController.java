package web.ielts.Practice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import web.ielts.Practice.model.Vocabulary;
import web.ielts.Practice.service.VocabularyService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/practice/vocabulary")
public class VocabularyController {
    @Autowired
    private VocabularyService vocabularyService;

    @GetMapping
    public ResponseEntity<List<Vocabulary>> getAllVocabularies() {
        return ResponseEntity.ok(vocabularyService.getAllVocabularies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vocabulary> getVocabularyById(@PathVariable String id) {
        Optional<Vocabulary> vocabulary = vocabularyService.getVocabularyById(id);
        return vocabulary.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/add")
    public ResponseEntity<Vocabulary> addVocabulary(@RequestBody Vocabulary vocabulary) {
        return ResponseEntity.ok(vocabularyService.addVocabulary(vocabulary));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vocabulary> updateVocabulary(@PathVariable String id, @RequestBody Vocabulary vocabulary) {
        return ResponseEntity.ok(vocabularyService.updateVocabulary(id, vocabulary));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVocabulary(@PathVariable String id) {
        vocabularyService.deleteVocabulary(id);
        return ResponseEntity.noContent().build();
    }

    // Phân trang + tìm kiếm + filter topic/band
    @GetMapping("/filter")
    public ResponseEntity<Page<Vocabulary>> filterVocabularies(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String band,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<Vocabulary> result = vocabularyService.searchAndPaginate(keyword, topic, band, page, size);
        return ResponseEntity.ok(result);
    }
    @GetMapping("/topics")
    public ResponseEntity<List<String>> getAllTopics() {
        return ResponseEntity.ok(vocabularyService.getAllTopics());
    }

    @GetMapping("/bands")
    public ResponseEntity<List<String>> getAllBands() {
        return ResponseEntity.ok(vocabularyService.getAllBands());
    }
}