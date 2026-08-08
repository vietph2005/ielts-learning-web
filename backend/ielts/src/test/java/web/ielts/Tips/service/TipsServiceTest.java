package web.ielts.Tips.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import web.ielts.Tips.dto.TipDTO;
import web.ielts.Tips.model.ListeningTips;
import web.ielts.Tips.model.ReadingTips;
import web.ielts.Tips.model.SpeakingTips;
import web.ielts.Tips.model.WritingTips;
import web.ielts.Tips.repository.ListeningTipRepository;
import web.ielts.Tips.repository.ReadingTipRepository;
import web.ielts.Tips.repository.SpeakingTipRepository;
import web.ielts.Tips.repository.WritingTipRepository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TipsServiceTest {

    @Mock
    private ListeningTipRepository listeningTipRepo;

    @Mock
    private SpeakingTipRepository speakingTipRepo;

    @Mock
    private ReadingTipRepository readingTipRepo;

    @Mock
    private WritingTipRepository writingTipRepo;

    @InjectMocks
    private TipsService tipsService;

    @Test
    void testMapToDTO_Success() {
        ListeningTips lTip = new ListeningTips("t1", "general", "Listen for keywords", "listening");

        TipDTO dto = tipsService.mapToDTO(lTip);
        assertEquals("t1", dto.getId());
        assertEquals("listening", dto.getSkill());
        assertEquals("general", dto.getType());
        assertEquals("Listen for keywords", dto.getDescription());

        ReadingTips rTip = new ReadingTips("t2", "academic", "Skim and scan", "reading");

        TipDTO dto2 = tipsService.mapToDTO(rTip);
        assertEquals("t2", dto2.getId());
        assertEquals("reading", dto2.getSkill());
    }

    @Test
    void testMapToDTO_Exception() {
        assertThrows(IllegalArgumentException.class, () -> {
            tipsService.mapToDTO("invalidTypeString");
        });
    }

    @Test
    void testGetAllTipsReading() {
        ReadingTips r = new ReadingTips("r1", "academic", "Skim and scan", "reading");
        when(readingTipRepo.findAll()).thenReturn(List.of(r));

        List<ReadingTips> result = tipsService.getAllTipsReading();
        assertEquals(1, result.size());
    }

    @Test
    void testGetTipsByListeningSkill() {
        ListeningTips l = new ListeningTips("l1", "academic", "Listen", "listening");
        when(listeningTipRepo.findBySkill("academic")).thenReturn(List.of(l));

        List<ListeningTips> result = tipsService.getTipsByListeningSkill("academic");
        assertEquals(1, result.size());
    }

    @Test
    void testGetTipByIdReading() {
        ReadingTips r = new ReadingTips("id123", "academic", "Skim", "reading");
        when(readingTipRepo.findById("id123")).thenReturn(Optional.of(r));

        ReadingTips result = tipsService.getTipByIdReading("id123");
        assertNotNull(result);
    }

    @Test
    void testGetOneTipEachSkill() {
        ListeningTips l = new ListeningTips("l1", "general", "Listen", "listening");
        SpeakingTips s = new SpeakingTips("s1", "general", "Speak", "speaking");

        when(listeningTipRepo.findTopByOrderByIdDesc()).thenReturn(Optional.of(l));
        when(speakingTipRepo.findTopByOrderByIdDesc()).thenReturn(Optional.of(s));
        when(readingTipRepo.findTopByOrderByIdDesc()).thenReturn(Optional.empty());
        when(writingTipRepo.findTopByOrderByIdDesc()).thenReturn(Optional.empty());

        Map<String, TipDTO> result = tipsService.getOneTipEachSkill();

        assertEquals(2, result.size());
        assertTrue(result.containsKey("listeningTip"));
        assertTrue(result.containsKey("speakingTip"));
        assertEquals("l1", result.get("listeningTip").getId());
    }
}
