package web.ielts.Test.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import web.ielts.Test.model.answer.listening.ListeningAnswer;
import web.ielts.Test.model.answer.reading.ReadingAnswer;
import web.ielts.Test.model.answer.speaking.SpeakingAnswer;
import web.ielts.Test.repository.answer.ListeningAnswerRepository;
import web.ielts.Test.repository.answer.ReadingAnswerRepository;
import web.ielts.Test.repository.answer.SpeakingAnswerRepository;

import java.util.Optional;

    @Service
    public class ResultService {
        @Autowired
        private ListeningAnswerRepository listeningAnswerRepository;

        @Autowired
        private ReadingAnswerRepository readingAnswerRepository;

        @Autowired
        private SpeakingAnswerRepository speakingAnswerRepository;
        public ListeningAnswer saveAnswer(ListeningAnswer answer) {
            return listeningAnswerRepository.save(answer); // trả về answer có ID
        }

        public Optional<ListeningAnswer> findListeningById(String answerId) {
            return listeningAnswerRepository.findById(answerId);
        }
        public Optional<ListeningAnswer> getListeningResult(String testId, String username) {
            // Giả sử mỗi user chỉ có 1 answer cho 1 testId
            return listeningAnswerRepository.findByUsername(username)
                    .stream()
                    .filter(ans -> ans.getTestId().equals(testId))
                    .findFirst();
        }

        public ReadingAnswer saveAnswer(ReadingAnswer answer) {
            return readingAnswerRepository.save(answer); // trả về answer có ID
        }

        public Optional<ReadingAnswer> findReadingById(String answerId) {
            return readingAnswerRepository.findById(answerId);
        }
        public Optional<ReadingAnswer> getReadingResult(String testId, String username) {
            // Giả sử mỗi user chỉ có 1 answer cho 1 testId
            return readingAnswerRepository.findByUsername(username)
                    .stream()
                    .filter(ans -> ans.getTestId().equals(testId))
                    .findFirst();
        }
        public Optional<SpeakingAnswer> findSpeakingById(String answerId) {
            return speakingAnswerRepository.findById(answerId);
        }

        public Optional<SpeakingAnswer> getSpeakingResult(String testId, String username) {
            // Giả sử mỗi user chỉ có 1 answer cho 1 testId
            return speakingAnswerRepository.findByUsername(username)
                    .stream()
                    .filter(ans -> ans.getTestId().equals(testId))
                    .findFirst();
        }



    }