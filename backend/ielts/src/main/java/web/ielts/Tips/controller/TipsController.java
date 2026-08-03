package web.ielts.Tips.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import web.ielts.Tips.dto.TipDTO;
import web.ielts.Tips.model.ListeningTips;
import web.ielts.Tips.model.ReadingTips;
import web.ielts.Tips.model.SpeakingTips;
import web.ielts.Tips.model.WritingTips;
import web.ielts.Tips.service.TipsService;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")

@RestController
@RequestMapping("/api")
public class TipsController {

    @Autowired
    private TipsService tipsService;



    @GetMapping("/all/tips-summary")
    public ResponseEntity<Map<String, TipDTO>> getTipsSummary() {
        Map<String, TipDTO> tips = tipsService.getOneTipEachSkill();
        return ResponseEntity.ok(tips);
    }

    @GetMapping("/student/Reading")
    public List<ReadingTips> getAllReading() {
        return tipsService.getAllTipsReading();
    }

    @GetMapping("/student/Listening")
    public List<ListeningTips> getAllListening() {
        return tipsService.getAllTipsListening();
    }

    @GetMapping("/student/Writing")
    public List<WritingTips> getAllWriting() {
        return tipsService.getAllTipsWriting();
    }

    @GetMapping("/student/Speaking")
    public List<SpeakingTips> getAllSpeaking() {
        return tipsService.getAllTipsSpeaking();
    }



    @GetMapping("/Reading/{id}")
    public ReadingTips getTipByIdRead(@PathVariable String id) {
        return tipsService.getTipByIdReading(id);
    }

    @GetMapping("/Listening/{id}")
    public ListeningTips getTipByIdLis(@PathVariable String id) {
        return tipsService.getTipByListening(id);
    }

    @GetMapping("/Writing/{id}")
    public WritingTips getTipByIdWrite(@PathVariable String id) {
        return tipsService.getTipByWriting(id);
    }

    @GetMapping("/Speaking/{id}")
    public SpeakingTips getTipByIdSpeak(@PathVariable String id) {
        return tipsService.getTipBySpeaking(id);
    }
}
