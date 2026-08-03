package web.ielts.History.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import web.ielts.History.dto.HistoryTest;
import web.ielts.History.service.HistoryService;
import web.ielts.Test.model.Test;
import web.ielts.Test.service.DoTestService;

import java.util.ArrayList;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RestController
@RequestMapping("/api")
public class HistoryController {

    @Autowired
    private HistoryService historyService;

    @Autowired
    private DoTestService doTestService;

    @GetMapping("/students/{username}/history")
    public List<HistoryTest> getAllHistoryByUsername(@PathVariable String username, 
                                                   @RequestParam(required = false) String skill) {
        System.out.println("DEBUG: Requesting history for username: " + username);
        System.out.println("DEBUG: Skill filter: " + skill);
        
        if (skill != null && !skill.isEmpty()) {
            switch (skill.toLowerCase()) {
                case "listening":
                    return historyService.getListeningByUsername(username);
                case "reading":
                    return historyService.getReadingByUsername(username);
                case "writing":
                    return historyService.getWritingByUsername(username);
                case "speaking":
                    return historyService.getSpeakingByUsername(username);
                case "fulltest":
                    return historyService.getFullTestByUsername(username);
                default:
                    return new ArrayList<>();
            }
        } else {
            // Return all skills combined
            List<HistoryTest> allHistory = new ArrayList<>();
            allHistory.addAll(historyService.getListeningByUsername(username));
            allHistory.addAll(historyService.getReadingByUsername(username));
            allHistory.addAll(historyService.getWritingByUsername(username));
            allHistory.addAll(historyService.getSpeakingByUsername(username));
            
            System.out.println("DEBUG: Total history items found: " + allHistory.size());
            return allHistory;
        }
    }

    @GetMapping("/tests/{testId}")
    public Test getTestDetails(@PathVariable String testId) {
        return doTestService.getTestByTestId(testId);
    }

    @GetMapping("/history/listening/{username}")
    public List<HistoryTest> getListeningAnswerByTestId(@PathVariable String username) {
        return historyService.getListeningByUsername(username);
    }
    
    @GetMapping("/history/reading/{username}")
    public List<HistoryTest> getReadingAnswerByTestId(@PathVariable String username) {
        return historyService.getReadingByUsername(username);
    }
    
    @GetMapping("/history/writing/{username}")
    public List<HistoryTest> getWritingAnswerByTestId(@PathVariable String username) {
        return historyService.getWritingByUsername(username);
    }
    
    @GetMapping("/history/speaking/{username}")
    public List<HistoryTest> getSpeakingAnswerByTestId(@PathVariable String username) {
        return historyService.getSpeakingByUsername(username);
    }
}
