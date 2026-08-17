package web.ielts.Test.dotest.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import web.ielts.Test.addtest.repository.AddTestRepository;
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
    private AddTestRepository addTestRepository;

    @Autowired
    private ListeningRepository listeningRepository;

    @Autowired
    private ReadingRepository readingRepository;

    @Autowired
    private WritingRepository writingRepository;

    @Autowired
    private SpeakingRepository speakingRepository;

    public Page<Test> getTests(int page, int size) {
        return testRepository.findAll(PageRequest.of(page, size));
    }

    public long countTests() {
        return addTestRepository.count();
    }

    public Map<Integer, List<ListTest>> getTestsGroupedByYear() {
        return testRepository.findAll().stream()
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
                .filter(t -> t.getTestId() != null)
                .collect(Collectors.toMap(Test::getTestId, t -> t, (existing, replacement) -> existing));

        return skills.stream()
                .map(skill -> {
                    String testId = null;
                    if (skill instanceof Listening) testId = ((Listening) skill).getTestId();
                    else if (skill instanceof Reading) testId = ((Reading) skill).getTestId();
                    else if (skill instanceof Writing) testId = ((Writing) skill).getTestId();
                    else if (skill instanceof Speaking) testId = ((Speaking) skill).getTestId();

                    Test test = testMap.get(testId);
                    if (test != null) {
                        return toListTest(test);
                    } else if (testId != null) {
                        return new ListTest(testId, testId, LocalDate.now().getYear());
                    }
                    return null;
                })
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.groupingBy(ListTest::getYear));
    }

    private ListTest toListTest(Test test) {
        if (test == null || test.getTestId() == null) return null;
        int year = LocalDate.now().getYear();
        if (test.getCreatedAt() != null && !test.getCreatedAt().isEmpty()) {
            try {
                year = LocalDate.parse(test.getCreatedAt().substring(0, Math.min(10, test.getCreatedAt().length()))).getYear();
            } catch (Exception e) {
                try {
                    java.util.regex.Matcher m = java.util.regex.Pattern.compile("\\b(20\\d{2})\\b").matcher(test.getCreatedAt());
                    if (m.find()) {
                        year = Integer.parseInt(m.group(1));
                    }
                } catch (Exception ignored) {}
            }
        }
        String title = test.getTestTitle() != null ? test.getTestTitle() : test.getTestId();
        return new ListTest(test.getTestId(), title, year);
    }
}
