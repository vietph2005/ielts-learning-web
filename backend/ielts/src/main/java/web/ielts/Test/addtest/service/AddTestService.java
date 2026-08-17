package web.ielts.Test.addtest.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import web.ielts.Common.exception.ResourceNotFoundException;
import web.ielts.Test.dotest.model.Listening;
import web.ielts.Test.dotest.model.Reading;
import web.ielts.Test.dotest.model.Speaking;
import web.ielts.Test.dotest.model.Writing;
import web.ielts.Test.dotest.model.Test;
import web.ielts.Test.dotest.repository.*;
import web.ielts.Test.addtest.model.*;
import web.ielts.Test.addtest.repository.*;
import web.ielts.Test.dotest.model.Listening.TaskListening;
import web.ielts.Test.dotest.model.Listening.Section;
import web.ielts.Test.ai.service.AIService;
import web.ielts.Test.dotest.model.Listening.Question;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.List;

@Service
public class AddTestService {

    @Autowired
    private AddTestRepository testRepository;

    @Autowired
    private TestRepository testRepo;

    @Autowired
    private AddListeningRepository listeningRepository;

    @Autowired
    private AddReadingRepository readingRepository;

    @Autowired
    private AddWritingRepository writingRepository;

    @Autowired
    private AddSpeakingRepository speakingRepository;

    @Autowired
    private ListeningRepository listeningRepo;

    @Autowired
    private ReadingRepository readingRepo;

    @Autowired
    private WritingRepository writingRepo;

    @Autowired
    private SpeakingRepository speakingRepo;

    @Autowired
    private AIService aiService;

    @Transactional
    public void saveFullTest(AddTestRequest request) {
        testRepository.save(request.getTest());

        String testId = request.getTest().getTestId();

        AddListening listening = request.getListening();
        if (listening != null) {
            listening.setTestId(testId);
            listeningRepository.save(listening);
        }

        AddReading reading = request.getReading();
        if (reading != null) {
            reading.setTestId(testId);
            readingRepository.save(reading);
        }

        AddWriting writing = request.getWriting();
        if (writing != null) {
            writing.setTestId(testId);
            extractChartDataIfMissing(writing);
            writingRepository.save(writing);
        }

        AddSpeaking speaking = request.getSpeaking();
        if (speaking != null) {
            speaking.setTestId(testId);
            speakingRepository.save(speaking);
        }
    }

    public List<AddTest> getAllPendingTests() {
        return testRepository.findAll();
    }

    public List<Map<String, Object>> getAllTestsForTeacher() {
        List<Map<String, Object>> result = new ArrayList<>();

        List<AddTest> pendingTests = testRepository.findAll();
        for (AddTest pt : pendingTests) {
            Map<String, Object> item = new HashMap<>();
            item.put("testId", pt.getTestId());
            item.put("testTitle", pt.getTestTitle());
            item.put("tags", pt.getTags());
            item.put("createdAt", pt.getCreateAt());
            item.put("isPending", true);
            result.add(item);
        }

        List<Test> activeTests = testRepo.findAll();
        for (Test at : activeTests) {
            Map<String, Object> item = new HashMap<>();
            item.put("testId", at.getTestId());
            item.put("testTitle", at.getTestTitle());
            item.put("tags", at.getTags());
            item.put("createdAt", at.getCreatedAt());
            item.put("isPending", false);
            result.add(item);
        }

        return result;
    }

    public Map<String, Object> getPendingTestDetails(String testId) {
        AddTest addTest = testRepository.findById(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu đề thi: " + testId));

        AddListening addListening = listeningRepository.findByTestId(testId);
        AddReading addReading = readingRepository.findByTestId(testId);
        AddWriting addWriting = writingRepository.findByTestId(testId);
        AddSpeaking addSpeaking = speakingRepository.findByTestId(testId);

        Map<String, Object> response = new HashMap<>();
        response.put("test", addTest);
        response.put("listening", addListening);
        response.put("reading", addReading);
        response.put("writing", addWriting);
        response.put("speaking", addSpeaking);
        return response;
    }

    public Map<String, Object> getFullTestDetails(String testId) {
        Map<String, Object> response = new HashMap<>();

        AddTest addTest = testRepository.findById(testId).orElse(null);
        if (addTest != null) {
            response.put("isPending", true);
            response.put("test", addTest);
            response.put("listening", listeningRepository.findByTestId(testId));
            response.put("reading", readingRepository.findByTestId(testId));
            response.put("writing", writingRepository.findByTestId(testId));
            response.put("speaking", speakingRepository.findByTestId(testId));
            return response;
        }

        Test activeTest = testRepo.findById(testId).orElse(null);
        if (activeTest != null) {
            response.put("isPending", false);

            AddTest testMeta = new AddTest();
            testMeta.setTestId(activeTest.getTestId());
            testMeta.setTestTitle(activeTest.getTestTitle());
            testMeta.setTags(activeTest.getTags());

            response.put("test", testMeta);
            response.put("listening", listeningRepo.findByTestId(testId));
            response.put("reading", readingRepo.findByTestId(testId));
            response.put("writing", writingRepo.findByTestId(testId));
            response.put("speaking", speakingRepo.findByTestId(testId));
            return response;
        }

        return null;
    }

    @Transactional
    public void updateFullTest(String testId, AddTestRequest request) {
        AddTest existingAddTest = testRepository.findById(testId).orElse(null);
        if (existingAddTest != null) {
            if (request.getTest() != null) {
                existingAddTest.setTestTitle(request.getTest().getTestTitle());
                existingAddTest.setTags(request.getTest().getTags());
                testRepository.save(existingAddTest);
            }

            if (request.getListening() != null) {
                AddListening listening = request.getListening();
                listening.setTestId(testId);
                AddListening existingL = listeningRepository.findByTestId(testId);
                if (existingL != null) listening.setId(existingL.getId());
                listeningRepository.save(listening);
            }

            if (request.getReading() != null) {
                AddReading reading = request.getReading();
                reading.setTestId(testId);
                AddReading existingR = readingRepository.findByTestId(testId);
                if (existingR != null) reading.setId(existingR.getId());
                readingRepository.save(reading);
            }

            if (request.getWriting() != null) {
                AddWriting writing = request.getWriting();
                writing.setTestId(testId);
                AddWriting existingW = writingRepository.findByTestId(testId);
                if (existingW != null) writing.setId(existingW.getId());
                extractChartDataIfMissing(writing);
                writingRepository.save(writing);
            }

            if (request.getSpeaking() != null) {
                AddSpeaking speaking = request.getSpeaking();
                speaking.setTestId(testId);
                AddSpeaking existingS = speakingRepository.findByTestId(testId);
                if (existingS != null) speaking.setId(existingS.getId());
                speakingRepository.save(speaking);
            }
            return;
        }

        Test existingActiveTest = testRepo.findById(testId).orElse(null);
        if (existingActiveTest != null) {
            if (request.getTest() != null) {
                existingActiveTest.setTestTitle(request.getTest().getTestTitle());
                existingActiveTest.setTags(request.getTest().getTags());
                testRepo.save(existingActiveTest);
            }

            if (request.getListening() != null) {
                Listening l = convertAddListeningToListening(request.getListening(), testId);
                if (l != null) listeningRepo.save(l);
            }

            if (request.getReading() != null) {
                Reading r = convertAddReadingToReading(request.getReading(), testId);
                if (r != null) readingRepo.save(r);
            }

            if (request.getWriting() != null) {
                Writing w = convertAddWritingToWriting(request.getWriting(), testId);
                if (w != null) writingRepo.save(w);
            }

            if (request.getSpeaking() != null) {
                Speaking s = convertAddSpeakingToSpeaking(request.getSpeaking(), testId);
                if (s != null) speakingRepo.save(s);
            }
        }
    }

    @Transactional
    public void deleteRequestTest(String testId) {
        if (!testRepository.existsById(testId)) {
            throw new ResourceNotFoundException("Không tìm thấy yêu cầu đề thi để xóa: " + testId);
        }

        testRepository.deleteById(testId);

        AddListening addListening = listeningRepository.findByTestId(testId);
        if (addListening != null) listeningRepository.delete(addListening);

        AddReading addReading = readingRepository.findByTestId(testId);
        if (addReading != null) readingRepository.delete(addReading);

        AddWriting addWriting = writingRepository.findByTestId(testId);
        if (addWriting != null) writingRepository.delete(addWriting);

        AddSpeaking addSpeaking = speakingRepository.findByTestId(testId);
        if (addSpeaking != null) speakingRepository.delete(addSpeaking);
    }

    @Transactional
    public void acceptTest(String testId) {
        AddTest addTest = testRepository.findById(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu đề thi: " + testId));
        AddListening addListening = listeningRepository.findByTestId(testId);
        AddReading addReading = readingRepository.findByTestId(testId);
        AddWriting addWriting = writingRepository.findByTestId(testId);
        AddSpeaking addSpeaking = speakingRepository.findByTestId(testId);

        String newTestId = generateNextTestId();

        Listening listening = convertAddListeningToListening(addListening, newTestId);
        if (listening != null) listeningRepo.save(listening);

        Reading reading = convertAddReadingToReading(addReading, newTestId);
        if (reading != null) readingRepo.save(reading);

        Writing writing = convertAddWritingToWriting(addWriting, newTestId);
        if (writing != null) writingRepo.save(writing);

        Speaking speaking = convertAddSpeakingToSpeaking(addSpeaking, newTestId);
        if (speaking != null) speakingRepo.save(speaking);

        Test test = new Test();
        test.setTestId(newTestId);
        test.setTestTitle(addTest.getTestTitle());
        test.setTags(addTest.getTags());
        SimpleDateFormat isoFormat = new SimpleDateFormat("yyyy-MM-dd");
        test.setCreatedAt(isoFormat.format(addTest.getCreateAt()));
        testRepo.save(test);

        testRepository.deleteById(testId);
        if (addListening != null) listeningRepository.delete(addListening);
        if (addReading != null) readingRepository.delete(addReading);
        if (addWriting != null) writingRepository.delete(addWriting);
        if (addSpeaking != null) speakingRepository.delete(addSpeaking);
    }

    public String generateNextTestId() {
        long count = testRepo.count() + 1;
        return String.format("T%03d", count);
    }

    public Listening convertAddListeningToListening(AddListening addListening) {
        return convertAddListeningToListening(addListening, generateNextTestId());
    }

    public Listening convertAddListeningToListening(AddListening addListening, String targetTestId) {
        if (addListening == null) return null;

        Listening listening = new Listening();
        listening.setTestId(targetTestId);
        listening.setAudioUrl(addListening.getAudioUrl());

        if (addListening.getTasks() != null) {
            listening.setTasks(
                    addListening.getTasks().stream().map(addTask -> {
                        TaskListening task = new TaskListening();
                        task.setTaskNumber(addTask.getTaskNumber());
                        task.setAudioUrl(addTask.getAudioUrl());
                        if (addTask.getSections() != null) {
                            task.setSections(
                                    addTask.getSections().stream().map(addSection -> {
                                        Section section = new Section();
                                        section.setSectionNumber(addSection.getSectionNumber());
                                        section.setType(addSection.getType());
                                        section.setImageUrl(addSection.getImageUrl());
                                        section.setIntroduction(addSection.getIntroduction());
                                        if (addSection.getQuestions() != null) {
                                             section.setQuestions(
                                                    addSection.getQuestions().stream().map(addQ -> {
                                                        Question q = new Question();
                                                        q.setQuestion(addQ.getQuestion());
                                                        q.setAnswer(addQ.getAnswer());
                                                        q.setExplanation(addQ.getExplanation());
                                                        q.setOptions(addQ.getOptions());
                                                        return q;
                                                    }).collect(Collectors.toList())
                                            );
                                        }
                                        return section;
                                    }).collect(Collectors.toList())
                            );
                        }
                        return task;
                    }).collect(Collectors.toList())
            );
        }

        return listening;
    }

    public Reading convertAddReadingToReading(AddReading addReading) {
        return convertAddReadingToReading(addReading, generateNextTestId());
    }

    public Reading convertAddReadingToReading(AddReading addReading, String targetTestId) {
        if (addReading == null) return null;
        Reading reading = new Reading();
        reading.setTestId(targetTestId);
        if (addReading.getTasks() != null) {
            reading.setTasks(
                addReading.getTasks().stream().map(addTask -> {
                    Reading.Task task = new Reading.Task();
                    task.setTaskNumber(addTask.getTaskNumber());
                    task.setParagraph(addTask.getParagraph());
                    if (addTask.getSections() != null) {
                        task.setSections(
                            addTask.getSections().stream().map(addSection -> {
                                Reading.Section section = new Reading.Section();
                                section.setSectionNumber(addSection.getSectionNumber());
                                section.setType(addSection.getType());
                                section.setImageUrl(addSection.getImageUrl());
                                section.setIntroduction(addSection.getIntroduction());
                                if (addSection.getQuestions() != null) {
                                    section.setQuestions(
                                        addSection.getQuestions().stream().map(addQ -> {
                                            Reading.Question q = new Reading.Question();
                                            q.setQuestion(addQ.getQuestion());
                                            q.setAnswer(addQ.getAnswer());
                                            q.setExplanation(addQ.getExplanation());
                                            q.setOptions(addQ.getOptions());
                                            return q;
                                        }).collect(Collectors.toList())
                                    );
                                }
                                return section;
                            }).collect(Collectors.toList())
                        );
                    }
                    return task;
                }).collect(Collectors.toList())
            );
        }
        return reading;
    }

    public Writing convertAddWritingToWriting(AddWriting addWriting) {
        return convertAddWritingToWriting(addWriting, generateNextTestId());
    }

    public Writing convertAddWritingToWriting(AddWriting addWriting, String targetTestId) {
        if (addWriting == null) {
            return null;
        }

        Writing writing = new Writing();
        writing.setTestId(targetTestId);
        if (addWriting.getTasks() != null) {
            writing.setTasks(
                    addWriting.getTasks().stream().map(addWritingTask -> {
                        Writing.Task task = new Writing.Task();
                        task.setTaskNumber(addWritingTask.getTaskNumber());
                        task.setQuestion(addWritingTask.getQuestion());
                        task.setImageUrl(addWritingTask.getImageUrl());

                        String chartData = addWritingTask.getChartData();
                        if ((chartData == null || chartData.isBlank()) && addWritingTask.getTaskNumber() == 1
                                && addWritingTask.getImageUrl() != null && !addWritingTask.getImageUrl().isBlank()) {
                            try {
                                chartData = aiService.extractChartDataFromImage(addWritingTask.getImageUrl(), addWritingTask.getQuestion());
                                addWritingTask.setChartData(chartData);
                            } catch (Exception e) {
                                System.err.println("⚠️ Vision extraction failed during test conversion: " + e.getMessage());
                            }
                        }
                        task.setChartData(chartData);
                        return task;
                    }).collect(Collectors.toList())
            );
        }

        return writing;
    }

    private void extractChartDataIfMissing(AddWriting writing) {
        if (writing != null && writing.getTasks() != null) {
            for (AddWritingTask task : writing.getTasks()) {
                if (task.getTaskNumber() == 1 && (task.getChartData() == null || task.getChartData().isBlank())
                        && task.getImageUrl() != null && !task.getImageUrl().isBlank()) {
                    try {
                        String data = aiService.extractChartDataFromImage(task.getImageUrl(), task.getQuestion());
                        task.setChartData(data);
                    } catch (Exception e) {
                        System.err.println("⚠️ 1-time Vision chart extraction failed: " + e.getMessage());
                    }
                }
            }
        }
    }

    public Speaking convertAddSpeakingToSpeaking(AddSpeaking addSpeaking) {
        return convertAddSpeakingToSpeaking(addSpeaking, generateNextTestId());
    }

    public Speaking convertAddSpeakingToSpeaking(AddSpeaking addSpeaking, String targetTestId) {
        if (addSpeaking == null) return null;
        Speaking speaking = new Speaking();
        speaking.setTestId(targetTestId);

        // Part 1
        if (addSpeaking.getPart1() != null) {
            Speaking.Part part1 = new Speaking.Part();
            part1.setPartNumber(addSpeaking.getPart1().getPartNumber());
            part1.setTitle(addSpeaking.getPart1().getTitle());
            if (addSpeaking.getPart1().getQuestions() != null) {
                part1.setQuestions(
                    addSpeaking.getPart1().getQuestions().stream().map(addQ -> {
                        Speaking.Question q = new Speaking.Question();
                        q.setQuestion(addQ.getQuestion());
                        return q;
                    }).collect(Collectors.toList())
                );
            }
            speaking.setPart1(part1);
        }

        // Part 2
        if (addSpeaking.getPart2() != null) {
            Speaking.Part2 part2 = new Speaking.Part2();
            part2.setPartNumber(addSpeaking.getPart2().getPartNumber());
            part2.setTitle(addSpeaking.getPart2().getTitle());
            part2.setQuestion(addSpeaking.getPart2().getQuestion());
            part2.setCueCards(addSpeaking.getPart2().getCueCards());
            speaking.setPart2(part2);
        }

        // Part 3
        if (addSpeaking.getPart3() != null) {
            Speaking.Part part3 = new Speaking.Part();
            part3.setPartNumber(addSpeaking.getPart3().getPartNumber());
            part3.setTitle(addSpeaking.getPart3().getTitle());
            if (addSpeaking.getPart3().getQuestions() != null) {
                part3.setQuestions(
                    addSpeaking.getPart3().getQuestions().stream().map(addQ -> {
                        Speaking.Question q = new Speaking.Question();
                        q.setQuestion(addQ.getQuestion());
                        return q;
                    }).collect(Collectors.toList())
                );
            }
            speaking.setPart3(part3);
        }

        return speaking;
    }
}
