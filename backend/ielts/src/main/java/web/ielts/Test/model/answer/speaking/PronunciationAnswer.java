package web.ielts.Test.model.answer.speaking;

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
    private AzurePronunciationResult azureResult;
    private String comment;

    public PronunciationAnswer(double score, String stressTranscript, List<StressMismatch> stressMismatchesDetailed, String transcript, List<IntonationSentence> importantWords, List<IntonationSentence> emphasizedWords, List<IntonationSentence> correctEmphasizedWords, List<IntonationSentence> overEmphasis, List<IntonationSentence> missingEmphasis, AzurePronunciationResult azureResult, String comment) {
        this.score = score;
        this.stressTranscript = stressTranscript;
        this.stressMismatchesDetailed = stressMismatchesDetailed;
        this.transcript = transcript;
        this.importantWords = importantWords;
        this.emphasizedWords = emphasizedWords;
        this.correctEmphasizedWords = correctEmphasizedWords;
        this.overEmphasis = overEmphasis;
        this.missingEmphasis = missingEmphasis;
        this.azureResult = azureResult;
        this.comment = comment;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public PronunciationAnswer() {
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

    public AzurePronunciationResult getAzureResult() {
        return azureResult;
    }
    public void setAzureResult(AzurePronunciationResult azureResult) {
        this.azureResult = azureResult;
    }
}
