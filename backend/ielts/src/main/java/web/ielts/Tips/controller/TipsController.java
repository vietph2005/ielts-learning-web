package web.ielts.Tips.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import web.ielts.Common.dto.ApiResponse;
import web.ielts.Common.exception.ResourceNotFoundException;
import web.ielts.Tips.dto.TipDTO;
import web.ielts.Tips.model.ListeningTips;
import web.ielts.Tips.model.ReadingTips;
import web.ielts.Tips.model.SpeakingTips;
import web.ielts.Tips.model.WritingTips;
import web.ielts.Tips.service.TipsService;

import java.util.Map;

@RestController
@RequestMapping("/tips")
public class TipsController {

    @Autowired
    private TipsService tipsService;

    @GetMapping("/summaries")
    public ApiResponse<Map<String, TipDTO>> getTipsSummary() {
        return ApiResponse.success(tipsService.getOneTipEachSkill(), "Lấy tóm tắt bí quyết thành công");
    }

    @GetMapping
    public ApiResponse<?> getTipsBySkill(@RequestParam(required = false, defaultValue = "reading") String skill) {
        switch (skill.toLowerCase()) {
            case "listening":
                return ApiResponse.success(tipsService.getAllTipsListening(), "Lấy danh sách Listening Tips thành công");
            case "writing":
                return ApiResponse.success(tipsService.getAllTipsWriting(), "Lấy danh sách Writing Tips thành công");
            case "speaking":
                return ApiResponse.success(tipsService.getAllTipsSpeaking(), "Lấy danh sách Speaking Tips thành công");
            case "reading":
            default:
                return ApiResponse.success(tipsService.getAllTipsReading(), "Lấy danh sách Reading Tips thành công");
        }
    }

    @GetMapping("/reading/{id}")
    public ApiResponse<ReadingTips> getTipByIdReading(@PathVariable String id) {
        ReadingTips tip = tipsService.getTipByIdReading(id);
        if (tip == null) {
            throw new ResourceNotFoundException("Không tìm thấy Reading Tip với ID: " + id);
        }
        return ApiResponse.success(tip, "Lấy Reading Tip thành công");
    }

    @GetMapping("/listening/{id}")
    public ApiResponse<ListeningTips> getTipByIdListening(@PathVariable String id) {
        ListeningTips tip = tipsService.getTipByListening(id);
        if (tip == null) {
            throw new ResourceNotFoundException("Không tìm thấy Listening Tip với ID: " + id);
        }
        return ApiResponse.success(tip, "Lấy Listening Tip thành công");
    }

    @GetMapping("/writing/{id}")
    public ApiResponse<WritingTips> getTipByIdWriting(@PathVariable String id) {
        WritingTips tip = tipsService.getTipByWriting(id);
        if (tip == null) {
            throw new ResourceNotFoundException("Không tìm thấy Writing Tip với ID: " + id);
        }
        return ApiResponse.success(tip, "Lấy Writing Tip thành công");
    }

    @GetMapping("/speaking/{id}")
    public ApiResponse<SpeakingTips> getTipByIdSpeaking(@PathVariable String id) {
        SpeakingTips tip = tipsService.getTipBySpeaking(id);
        if (tip == null) {
            throw new ResourceNotFoundException("Không tìm thấy Speaking Tip với ID: " + id);
        }
        return ApiResponse.success(tip, "Lấy Speaking Tip thành công");
    }
}
