package web.ielts.Test.dotest.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web.ielts.Test.result.model.writing.WritingAnswer;
import web.ielts.Test.result.repository.WritingAnswerRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DoTestTeacherService {
    @Autowired
    private WritingAnswerRepository writingAnswerRepository;

    public Optional<WritingAnswer> getWritingAnswerByTestId(String testId) {
        return writingAnswerRepository.findById(testId);
    }

    public WritingAnswer saveWritingAnswer(WritingAnswer writingAnswer) {
        writingAnswer.setSubmittedAt(LocalDateTime.now());
        return writingAnswerRepository.save(writingAnswer);
    }

    public List<WritingAnswer> getTeacherGradedAnswers() {
        return writingAnswerRepository.findTeacherGradedButNotScoredAnswers();
    }

    public List<WritingAnswer> getAllWritingAnswers() {
        return writingAnswerRepository.findAll();
    }
}
