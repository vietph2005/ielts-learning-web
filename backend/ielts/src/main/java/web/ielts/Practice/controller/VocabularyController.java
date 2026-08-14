package web.ielts.Practice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import web.ielts.Common.dto.ApiResponse;
import web.ielts.Common.dto.PageResponse;
import web.ielts.Common.exception.ResourceNotFoundException;
import web.ielts.Practice.model.Vocabulary;
import web.ielts.Practice.service.VocabularyService;

import java.util.List;

@RestController
@RequestMapping("/vocabularies")
public class VocabularyController {

    @Autowired
    private VocabularyService vocabularyService;

    @GetMapping
    public ApiResponse<List<Vocabulary>> getAllVocabularies() {
        return ApiResponse.success(vocabularyService.getAllVocabularies(), "Lấy toàn bộ từ vựng thành công");
    }

    @GetMapping("/{id}")
    public ApiResponse<Vocabulary> getVocabularyById(@PathVariable String id) {
        Vocabulary vocabulary = vocabularyService.getVocabularyById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy từ vựng với ID: " + id));
        return ApiResponse.success(vocabulary, "Lấy thông tin từ vựng thành công");
    }

    @PostMapping
    public ApiResponse<Vocabulary> addVocabulary(@RequestBody Vocabulary vocabulary) {
        return ApiResponse.success(vocabularyService.addVocabulary(vocabulary), "Thêm từ vựng mới thành công");
    }

    @PutMapping("/{id}")
    public ApiResponse<Vocabulary> updateVocabulary(@PathVariable String id, @RequestBody Vocabulary vocabulary) {
        return ApiResponse.success(vocabularyService.updateVocabulary(id, vocabulary), "Cập nhật từ vựng thành công");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteVocabulary(@PathVariable String id) {
        vocabularyService.deleteVocabulary(id);
        return ApiResponse.success(null, "Xóa từ vựng thành công");
    }

    // Phân trang + tìm kiếm + filter topic/band (Hỗ trợ 0-indexed và 1-indexed)
    @GetMapping("/search")
    public ApiResponse<PageResponse<Vocabulary>> searchVocabularies(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String band,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        int pageIndex = Math.max(0, page > 0 ? page - 1 : page);
        Page<Vocabulary> pageResult = vocabularyService.searchAndPaginate(keyword, topic, band, pageIndex, size);
        return ApiResponse.success(PageResponse.from(pageResult), "Tìm kiếm và phân trang từ vựng thành công");
    }

    @GetMapping("/topics")
    public ApiResponse<List<String>> getAllTopics() {
        return ApiResponse.success(vocabularyService.getAllTopics(), "Lấy danh sách chủ đề thành công");
    }

    @GetMapping("/bands")
    public ApiResponse<List<String>> getAllBands() {
        return ApiResponse.success(vocabularyService.getAllBands(), "Lấy danh sách band thành công");
    }
}