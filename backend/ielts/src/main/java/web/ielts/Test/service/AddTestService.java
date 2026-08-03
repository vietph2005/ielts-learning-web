package web.ielts.Test.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web.ielts.Test.model.Listening;
import web.ielts.Test.model.Reading;
import web.ielts.Test.model.Speaking;
import web.ielts.Test.model.Writing;
import web.ielts.Test.model.add.*;
import web.ielts.Test.repository.TestRepository;
import web.ielts.Test.repository.add.*;
import web.ielts.Test.model.Listening.TaskListening;
import web.ielts.Test.model.Listening.Section;
import web.ielts.Test.model.Listening.Question;

import java.util.ArrayList;
import java.util.stream.Collectors;
import java.util.List;
@Service
public class  AddTestService {

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

    public void saveFullTest(AddTestRequest request) {
        // Lưu test chính
        testRepository.save(request.getTest());

        // Gán testId cho các kỹ năng nếu chưa có
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
            writingRepository.save(writing);
        }

        AddSpeaking speaking = request.getSpeaking();
        if (speaking != null) {
            speaking.setTestId(testId);
            speakingRepository.save(speaking);
        }
    }
    public String generateNextTestId() {
        long count = testRepo.count() + 1;
        return String.format("T%03d", count);
    }

// Chuyển AddListening -> Listening
public Listening convertAddListeningToListening(AddListening addListening) {
    if (addListening == null) return null;

    Listening listening = new Listening();
    listening.setTestId(generateNextTestId());
    listening.setAudioUrl(addListening.getAudioUrl());

    listening.setTasks(
            addListening.getTasks().stream().map(addTask -> {
                TaskListening task = new TaskListening();
                task.setTaskNumber(addTask.getTaskNumber());
                task.setSections(
                        addTask.getSections().stream().map(addSection -> {
                            Section section = new Section();
                            section.setSectionNumber(addSection.getSectionNumber());
                            section.setType(addSection.getType());
                            section.setImageUrl(addSection.getImageUrl());
                            section.setIntroduction(addSection.getIntroduction());
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

                            return section;
                        }).collect(Collectors.toList())
                );

                return task;
            }).collect(Collectors.toList())
    );

    return listening;
}


public Reading convertAddReadingToReading(AddReading addReading) {
    if (addReading == null) return null;
    Reading reading = new Reading();
    reading.setTestId(generateNextTestId());
    reading.setTasks(
        addReading.getTasks().stream().map(addTask -> {
            Reading.Task task = new Reading.Task();
            task.setTaskNumber(addTask.getTaskNumber());
            task.setParagraph(addTask.getParagraph());
            task.setSections(
                addTask.getSections().stream().map(addSection -> {
                    Reading.Section section = new Reading.Section();
                    section.setSectionNumber(addSection.getSectionNumber());
                    section.setType(addSection.getType());
                    section.setImageUrl(addSection.getImageUrl());
                    section.setIntroduction(addSection.getIntroduction());
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
                    return section;
                }).collect(Collectors.toList())
            );
            return task;
        }).collect(Collectors.toList())
    );
    return reading;
}

    public Writing convertAddWritingToWriting(AddWriting addWriting) {
        if (addWriting == null) {
            return null;
        }

        Writing writing = new Writing();
        writing.setTestId(generateNextTestId());
        writing.setTasks(
                addWriting.getTasks().stream().map(AddWritingTask -> {
                    Writing.Task task = new Writing.Task();
                    task.setTaskNumber(AddWritingTask.getTaskNumber());
                    task.setQuestion(AddWritingTask.getQuestion());
                    task.setImageUrl(AddWritingTask.getImageUrl());
                    return task;
                }).collect(Collectors.toList())
        );

        return writing;
    }


public Speaking convertAddSpeakingToSpeaking(AddSpeaking addSpeaking) {
    if (addSpeaking == null) return null;
    Speaking speaking = new Speaking();
    speaking.setTestId(generateNextTestId());

    // Part 1
    if (addSpeaking.getPart1() != null) {
        Speaking.Part part1 = new Speaking.Part();
        part1.setPartNumber(addSpeaking.getPart1().getPartNumber());
        part1.setTitle(addSpeaking.getPart1().getTitle());
        part1.setQuestions(
            addSpeaking.getPart1().getQuestions().stream().map(addQ -> {
                Speaking.Question q = new Speaking.Question();
                q.setQuestion(addQ.getQuestion());
                return q;
            }).collect(Collectors.toList())
        );
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
        part3.setQuestions(
            addSpeaking.getPart3().getQuestions().stream().map(addQ -> {
                Speaking.Question q = new Speaking.Question();
                q.setQuestion(addQ.getQuestion());
                return q;
            }).collect(Collectors.toList())
        );
        speaking.setPart3(part3);
    }

    return speaking;
}

}
