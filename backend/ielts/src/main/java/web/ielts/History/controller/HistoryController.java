package web.ielts.History.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import web.ielts.Common.dto.ApiResponse;
import web.ielts.History.dto.HistoryTest;
import web.ielts.History.service.HistoryService;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/students/{username}/histories")
public class HistoryController {

    @Autowired
    private HistoryService historyService;

    @GetMapping
    public ApiResponse<List<HistoryTest>> getStudentHistory(
            @PathVariable String username,
            @RequestParam(required = false) String skill
    ) {
        if (skill != null && !skill.trim().isEmpty()) {
            List<HistoryTest> skillHistory;
            switch (skill.toLowerCase()) {
                case "listening":
                    skillHistory = historyService.getListeningByUsername(username);
                    break;
                case "reading":
                    skillHistory = historyService.getReadingByUsername(username);
                    break;
                case "writing":
                    skillHistory = historyService.getWritingByUsername(username);
                    break;
                case "speaking":
                    skillHistory = historyService.getSpeakingByUsername(username);
                    break;
                case "fulltest":
                    skillHistory = historyService.getFullTestByUsername(username);
                    break;
                default:
                    skillHistory = new ArrayList<>();
                    break;
            }
            return ApiResponse.success(skillHistory, "Lấy lịch sử làm bài theo kỹ năng thành công");
        } else {
            List<HistoryTest> allHistory = new ArrayList<>();
            allHistory.addAll(historyService.getListeningByUsername(username));
            allHistory.addAll(historyService.getReadingByUsername(username));
            allHistory.addAll(historyService.getWritingByUsername(username));
            allHistory.addAll(historyService.getSpeakingByUsername(username));
            return ApiResponse.success(allHistory, "Lấy toàn bộ lịch sử làm bài thành công");
        }
    }
}
