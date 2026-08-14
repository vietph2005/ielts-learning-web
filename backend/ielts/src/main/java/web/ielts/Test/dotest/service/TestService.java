package web.ielts.Test.dotest.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web.ielts.Test.dotest.repository.*;
import web.ielts.Test.dotest.dto.ListTest;
import web.ielts.Test.dotest.model.Test;
import web.ielts.Test.dotest.model.Listening;
import web.ielts.Test.dotest.model.Reading;
import web.ielts.Test.dotest.model.Writing;
import web.ielts.Test.dotest.model.Speaking;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class TestService {
    @Autowired
    private TestRepository testRepository;

    @Autowired
    private ListeningRepository listeningRepository;

    @Autowired
    private ReadingRepository readingRepository;

    @Autowired
    private WritingRepository writingRepository;

    @Autowired
    private SpeakingRepository speakingRepository;

    public Map<Integer, List<ListTest>> getTestsGroupedByYear() {
        return testRepository.findAll().stream()
                .filter(t -> t.getCreatedAt() != null && !t.getCreatedAt().isEmpty())
                .map(this::toListTest)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(ListTest::getYear));
    }

    public Map<Integer, List<ListTest>> getListeningTestsByYear() {
        return getTestsBySkill(listeningRepository.findAll());
    }

    public Map<Integer, List<ListTest>> getReadingTestsByYear() {
        return getTestsBySkill(readingRepository.findAll());
    }

    public Map<Integer, List<ListTest>> getWritingTestsByYear() {
        return getTestsBySkill(writingRepository.findAll());
    }

    public Map<Integer, List<ListTest>> getSpeakingTestsByYear() {
        return getTestsBySkill(speakingRepository.findAll());
    }

    private <T> Map<Integer, List<ListTest>> getTestsBySkill(List<T> skills) {
        Map<String, Test> testMap = testRepository.findAll().stream()
                .collect(Collectors.toMap(Test::getTestId, t -> t));

        return skills.stream()
                .map(skill -> {
                    String testId = null;
                    if (skill instanceof Listening) testId = ((Listening) skill).getTestId();
                    else if (skill instanceof Reading) testId = ((Reading) skill).getTestId();
                    else if (skill instanceof Writing) testId = ((Writing) skill).getTestId();
                    else if (skill instanceof Speaking) testId = ((Speaking) skill).getTestId();

                    Test test = testMap.get(testId);
                    return toListTest(test);
                })
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.groupingBy(ListTest::getYear));
    }

    private ListTest toListTest(Test test) {
        if (test == null || test.getCreatedAt() == null || test.getCreatedAt().isEmpty()) return null;
        try {
            int year = LocalDate.parse(test.getCreatedAt()).getYear();
            return new ListTest(test.getTestId(), test.getTestTitle(), year);
        } catch (DateTimeParseException e) {
            return null;
        }
    }
}
