package web.ielts.Tips.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web.ielts.Tips.dto.TipDTO;
import web.ielts.Tips.model.ListeningTips;
import web.ielts.Tips.model.ReadingTips;
import web.ielts.Tips.model.SpeakingTips;
import web.ielts.Tips.model.WritingTips;
import web.ielts.Tips.repository.ListeningTipRepository;
import web.ielts.Tips.repository.ReadingTipRepository;
import web.ielts.Tips.repository.SpeakingTipRepository;
import web.ielts.Tips.repository.WritingTipRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TipsService {

    @Autowired
    private ListeningTipRepository listeningTipRepo;

    @Autowired
    private SpeakingTipRepository speakingTipRepo;

    @Autowired
    private ReadingTipRepository readingTipRepo;

    @Autowired
    private WritingTipRepository writingTipRepo;

    /**
     * Convert a Tip entity (ListeningTips, SpeakingTips, ReadingTips, WritingTips)
     * to a TipDTO object for consistent response format.
     *
     * @param tip the tip object (can be one of 4 types)
     * @return TipDTO object containing id, skill, type, and description
     */
    public TipDTO mapToDTO(Object tip) { //Unit Test mapToDTO
        if (tip instanceof ListeningTips) {
            ListeningTips t = (ListeningTips) tip;
            return new TipDTO(t.getId(), t.getSkill(), t.getType(), t.getDescription());
        } else if (tip instanceof SpeakingTips) {
            SpeakingTips t = (SpeakingTips) tip;
            return new TipDTO(t.getId(), t.getSkill(), t.getType(), t.getDescription());
        } else if (tip instanceof ReadingTips) {
            ReadingTips t = (ReadingTips) tip;
            return new TipDTO(t.getId(), t.getSkill(), t.getType(), t.getDescription());
        } else if (tip instanceof WritingTips) {
            WritingTips t = (WritingTips) tip;
            return new TipDTO(t.getId(), t.getSkill(), t.getType(), t.getDescription());
        } else {
            throw new IllegalArgumentException("Unsupported tip type: " + tip.getClass().getName());
        }
    }

    // ----------- GET ALL TIPS BY CATEGORY -----------

    /**
     * Get all Reading Tips from database.
     */
    public List<ReadingTips> getAllTipsReading() {
        return readingTipRepo.findAll();
    }

    /**
     * Get all Listening Tips from database.
     */
    public List<ListeningTips> getAllTipsListening() {
        return listeningTipRepo.findAll();
    }

    /**
     * Get all Writing Tips from database.
     */
    public List<WritingTips> getAllTipsWriting() {
        return writingTipRepo.findAll();
    }

    /**
     * Get all Speaking Tips from database.
     */
    public List<SpeakingTips> getAllTipsSpeaking() {
        return speakingTipRepo.findAll();
    }

    // ----------- GET TIPS BY SKILL TYPE -----------

    /**
     * Get Reading Tips by skill (e.g. "general", "academic").
     */
    public List<ReadingTips> getTipsByReadingSkill(String skill) {
        return readingTipRepo.findBySkill(skill);
    }

    /**
     * Get Listening Tips by skill.
     */
    public List<ListeningTips> getTipsByListeningSkill(String skill) {
        return listeningTipRepo.findBySkill(skill);
    }

    /**
     * Get Writing Tips by skill.
     */
    public List<WritingTips> getTipsByWritingSkill(String skill) {
        return writingTipRepo.findBySkill(skill);
    }

    /**
     * Get Speaking Tips by skill.
     */
    public List<SpeakingTips> getTipsBySpeakingSkill(String skill) {
        return speakingTipRepo.findBySkill(skill);
    }

    // ----------- GET SINGLE TIP BY ID -----------

    /**
     * Get a Reading Tip by its ID.
     */
    public ReadingTips getTipByIdReading(String id) {
        return readingTipRepo.findById(id).orElse(null);
    }

    /**
     * Get a Listening Tip by its ID.
     */
    public ListeningTips getTipByListening(String id) {
        return listeningTipRepo.findById(id).orElse(null);
    }

    /**
     * Get a Writing Tip by its ID.
     */
    public WritingTips getTipByWriting(String id) {
        return writingTipRepo.findById(id).orElse(null);
    }

    /**
     * Get a Speaking Tip by its ID.
     */
    public SpeakingTips getTipBySpeaking(String id) {
        return speakingTipRepo.findById(id).orElse(null);
    }

    // ----------- GET LATEST TIP OF EACH SKILL -----------

    /**
     * Get the latest (most recently added) tip for each skill:
     * - listeningTip
     * - speakingTip
     * - readingTip
     * - writingTip
     *
     * @return Map<String, TipDTO> where key is skill name and value is the latest TipDTO.
     */
    public Map<String, TipDTO> getOneTipEachSkill() {
        Map<String, TipDTO> tips = new HashMap<>();

        // Get latest Listening Tip if exists
        listeningTipRepo.findTopByOrderByIdDesc()
                .ifPresent(tip -> tips.put("listeningTip", mapToDTO(tip)));

        // Get latest Speaking Tip if exists
        speakingTipRepo.findTopByOrderByIdDesc()
                .ifPresent(tip -> tips.put("speakingTip", mapToDTO(tip)));

        // Get latest Reading Tip if exists
        readingTipRepo.findTopByOrderByIdDesc()
                .ifPresent(tip -> tips.put("readingTip", mapToDTO(tip)));

        // Get latest Writing Tip if exists
        writingTipRepo.findTopByOrderByIdDesc()
                .ifPresent(tip -> tips.put("writingTip", mapToDTO(tip)));

        return tips;
    }

    /**
     * (Redundant - already exists as getAllTipsReading)
     * Get all Reading Tips from database.
     */
    public List<ReadingTips> getAllReadingTips() {
        return readingTipRepo.findAll();
    }
}
