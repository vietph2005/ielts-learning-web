package web.ielts.Test.ai.model;

import java.util.List;

public class PronunciationAnswer {
    private double score;
    private String stressTranscript;
    private List<StressMismatch> stressMismatchesDetailed;
    private String transcript;
    private List<IntonationSentence> importantWords;
    private List<IntonationSentence> emphasizedWords;
    private List<IntonationSentence> correctEmphasizedWords;
    private List<IntonationSentence> overEmphasis;
    private List<IntonationSentence> missingEmphasis;
    private String comment;
    private double wordStressScore;
    private double sentenceStressScore;
    private double phonemeScore;
    private double connectedSpeechScore;
    private double wordStressAccuracy;
    private double f1Score;

    public PronunciationAnswer() {
    }

    public PronunciationAnswer(double score, String stressTranscript, List<StressMismatch> stressMismatchesDetailed, String transcript, List<IntonationSentence> importantWords, List<IntonationSentence> emphasizedWords, List<IntonationSentence> correctEmphasizedWords, List<IntonationSentence> overEmphasis, List<IntonationSentence> missingEmphasis, String comment) {
        this.score = score;
        this.stressTranscript = stressTranscript;
        this.stressMismatchesDetailed = stressMismatchesDetailed;
        this.transcript = transcript;
        this.importantWords = importantWords;
        this.emphasizedWords = emphasizedWords;
        this.correctEmphasizedWords = correctEmphasizedWords;
        this.overEmphasis = overEmphasis;
        this.missingEmphasis = missingEmphasis;
        this.comment = comment;
    }

    public PronunciationAnswer(double score, String stressTranscript, List<StressMismatch> stressMismatchesDetailed, String transcript, List<IntonationSentence> importantWords, List<IntonationSentence> emphasizedWords, List<IntonationSentence> correctEmphasizedWords, List<IntonationSentence> overEmphasis, List<IntonationSentence> missingEmphasis) {
        this.score = score;
        this.stressTranscript = stressTranscript;
        this.stressMismatchesDetailed = stressMismatchesDetailed;
        this.transcript = transcript;
        this.importantWords = importantWords;
        this.emphasizedWords = emphasizedWords;
        this.correctEmphasizedWords = correctEmphasizedWords;
        this.overEmphasis = overEmphasis;
        this.missingEmphasis = missingEmphasis;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public String getStressTranscript() {
        return stressTranscript;
    }

    public void setStressTranscript(String stressTranscript) {
        this.stressTranscript = stressTranscript;
    }

    public List<StressMismatch> getStressMismatchesDetailed() {
        return stressMismatchesDetailed;
    }

    public void setStressMismatchesDetailed(List<StressMismatch> stressMismatchesDetailed) {
        this.stressMismatchesDetailed = stressMismatchesDetailed;
    }

    public String getTranscript() {
        return transcript;
    }

    public void setTranscript(String transcript) {
        this.transcript = transcript;
    }

    public List<IntonationSentence> getImportantWords() {
        return importantWords;
    }

    public void setImportantWords(List<IntonationSentence> importantWords) {
        this.importantWords = importantWords;
    }

    public List<IntonationSentence> getEmphasizedWords() {
        return emphasizedWords;
    }

    public void setEmphasizedWords(List<IntonationSentence> emphasizedWords) {
        this.emphasizedWords = emphasizedWords;
    }

    public List<IntonationSentence> getCorrectEmphasizedWords() {
        return correctEmphasizedWords;
    }

    public void setCorrectEmphasizedWords(List<IntonationSentence> correctEmphasizedWords) {
        this.correctEmphasizedWords = correctEmphasizedWords;
    }

    public List<IntonationSentence> getOverEmphasis() {
        return overEmphasis;
    }

    public void setOverEmphasis(List<IntonationSentence> overEmphasis) {
        this.overEmphasis = overEmphasis;
    }

    public List<IntonationSentence> getMissingEmphasis() {
        return missingEmphasis;
    }

    public void setMissingEmphasis(List<IntonationSentence> missingEmphasis) {
        this.missingEmphasis = missingEmphasis;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public double getWordStressScore() {
        return wordStressScore;
    }

    public void setWordStressScore(double wordStressScore) {
        this.wordStressScore = wordStressScore;
    }

    public double getSentenceStressScore() {
        return sentenceStressScore;
    }

    public void setSentenceStressScore(double sentenceStressScore) {
        this.sentenceStressScore = sentenceStressScore;
    }

    public double getPhonemeScore() {
        return phonemeScore;
    }

    public void setPhonemeScore(double phonemeScore) {
        this.phonemeScore = phonemeScore;
    }

    public double getConnectedSpeechScore() {
        return connectedSpeechScore;
    }

    public void setConnectedSpeechScore(double connectedSpeechScore) {
        this.connectedSpeechScore = connectedSpeechScore;
    }

    public double getWordStressAccuracy() {
        return wordStressAccuracy;
    }

    public void setWordStressAccuracy(double wordStressAccuracy) {
        this.wordStressAccuracy = wordStressAccuracy;
    }

    public double getF1Score() {
        return f1Score;
    }

    public void setF1Score(double f1Score) {
        this.f1Score = f1Score;
    }
}
