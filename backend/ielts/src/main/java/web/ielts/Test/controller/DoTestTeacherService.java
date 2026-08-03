package web.ielts.Test.controller;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Service;
import web.ielts.Test.model.answer.writing.WritingAnswer;
import web.ielts.Test.repository.answer.WritingAnswerRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
@Service
public class DoTestTeacherService {
    @Autowired
    private WritingAnswerRepository writingAnswerRepository;
    public Optional<WritingAnswer> getWritingAnswerByTestId(String testId) {
        System.out.println(writingAnswerRepository.findById(testId).toString());
        return writingAnswerRepository.findById(testId);
    }
    public WritingAnswer saveWritingAnswer(WritingAnswer writingAnswer) {
        writingAnswer.setSubmittedAt(LocalDateTime.now());
        System.out.println(writingAnswerRepository.save(writingAnswer));
        return writingAnswerRepository.save(writingAnswer);
    }
    // Cách 1: Trả về danh sách toàn bộ WritingAnswer
    public List<WritingAnswer> getTeacherGradedAnswers() {
        System.out.println(writingAnswerRepository.findTeacherGradedButNotScoredAnswers());
        return writingAnswerRepository.findTeacherGradedButNotScoredAnswers();
    }

    public List<WritingAnswer> getAllWritingAnswers() {
        return writingAnswerRepository.findAll();
    }

}