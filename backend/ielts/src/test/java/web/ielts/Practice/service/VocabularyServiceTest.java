package web.ielts.Practice.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import web.ielts.Practice.model.Vocabulary;
import web.ielts.Practice.repository.VocabularyRepository;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class VocabularyServiceTest {

    @Mock
    private VocabularyRepository vocabularyRepository;

    @Mock
    private MongoTemplate mongoTemplate;

    @InjectMocks
    private VocabularyService vocabularyService;

    @Test
    void testGetAllVocabularies() {
        Vocabulary v = new Vocabulary();
        when(vocabularyRepository.findAll()).thenReturn(List.of(v));

        List<Vocabulary> result = vocabularyService.getAllVocabularies();
        assertEquals(1, result.size());
    }

    @Test
    void testGetVocabularyById() {
        Vocabulary v = new Vocabulary();
        when(vocabularyRepository.findById("v123")).thenReturn(Optional.of(v));

        Optional<Vocabulary> result = vocabularyService.getVocabularyById("v123");
        assertTrue(result.isPresent());
        assertEquals(v, result.get());
    }

    @Test
    void testAddVocabulary() {
        Vocabulary v = new Vocabulary();
        when(vocabularyRepository.save(v)).thenReturn(v);

        Vocabulary result = vocabularyService.addVocabulary(v);
        assertNotNull(result);
    }

    @Test
    void testDeleteVocabulary() {
        vocabularyService.deleteVocabulary("v123");
        verify(vocabularyRepository, times(1)).deleteById("v123");
    }

    @Test
    void testUpdateVocabulary() {
        Vocabulary v = new Vocabulary();
        v.setWord("hello");
        when(vocabularyRepository.save(v)).thenReturn(v);

        Vocabulary result = vocabularyService.updateVocabulary("v123", v);
        assertEquals("v123", result.getId());
    }

    @Test
    void testGetAllTopics() {
        when(mongoTemplate.findDistinct(any(Query.class), eq("topic"), eq("vocabularies"), eq(String.class)))
                .thenReturn(List.of("Topic1", "Topic2"));

        List<String> result = vocabularyService.getAllTopics();
        assertEquals(2, result.size());
        assertEquals("Topic1", result.get(0));
    }

    @Test
    void testGetAllBands() {
        when(mongoTemplate.findDistinct(any(Query.class), eq("band"), eq("vocabularies"), eq(String.class)))
                .thenReturn(List.of("5.0", "6.0"));

        List<String> result = vocabularyService.getAllBands();
        assertEquals(2, result.size());
        assertEquals("5.0", result.get(0));
    }

    @Test
    void testSearchAndPaginate() {
        Vocabulary v = new Vocabulary();
        Page<Vocabulary> pageMock = new PageImpl<>(List.of(v));

        when(vocabularyRepository.findByWordContainingIgnoreCaseAndTopicContainingIgnoreCaseAndBandContainingIgnoreCase(
                eq("keyword"), eq("topic"), eq("band"), any(PageRequest.class)
        )).thenReturn(pageMock);

        Page<Vocabulary> result = vocabularyService.searchAndPaginate("keyword", "topic", "band", 0, 10);

        assertEquals(1, result.getTotalElements());
    }
}
