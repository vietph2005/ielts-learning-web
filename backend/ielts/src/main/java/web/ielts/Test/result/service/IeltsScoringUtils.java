package web.ielts.Test.result.service;

public class IeltsScoringUtils {

    /**
     * So sánh đáp án của học sinh với đáp án chuẩn theo từng dạng câu hỏi.
     */
    public static boolean isAnswerCorrect(String type, String correctAnswer, String studentAnswer) {
        if (correctAnswer == null || studentAnswer == null) return false;

        correctAnswer = correctAnswer.trim().toLowerCase();
        studentAnswer = studentAnswer.trim().toLowerCase();

        if (type == null) {
            return correctAnswer.equals(studentAnswer);
        }

        switch (type.toLowerCase()) {
            case "multiple-choice":
            case "dropdown":
                return !correctAnswer.isEmpty() && !studentAnswer.isEmpty() &&
                        correctAnswer.charAt(0) == studentAnswer.charAt(0);
            default:
                return correctAnswer.equals(studentAnswer);
        }
    }

    /**
     * Quy đổi số câu đúng trên tổng số câu (chuẩn 40 câu) sang thang điểm IELTS Band (1.0 - 9.0).
     */
    public static double calculateIeltsBand(int correctAnswers, int totalQuestions) {
        if (totalQuestions == 0) return 0.0;
        int scaled = (int) Math.round(((double) correctAnswers / totalQuestions) * 40);
        if (scaled >= 39) return 9.0;
        if (scaled >= 37) return 8.5;
        if (scaled >= 35) return 8.0;
        if (scaled >= 32) return 7.5;
        if (scaled >= 30) return 7.0;
        if (scaled >= 27) return 6.5;
        if (scaled >= 23) return 6.0;
        if (scaled >= 19) return 5.5;
        if (scaled >= 15) return 5.0;
        if (scaled >= 13) return 4.5;
        if (scaled >= 10) return 4.0;
        if (scaled >= 7)  return 3.5;
        if (scaled >= 5)  return 3.0;
        if (scaled >= 3)  return 2.5;
        if (scaled >= 1)  return 2.0;
        return 1.0;
    }

    /**
     * Làm tròn điểm trung bình theo quy tắc chuẩn của IELTS:
     * - decimalPart >= 0.75 -> +1.0
     * - decimalPart >= 0.25 -> +0.5
     * - decimalPart < 0.25  -> +0.0
     */
    public static double calculateIeltsRounding(double average) {
        double wholePart = Math.floor(average);
        double decimalPart = average - wholePart;
        if (decimalPart >= 0.75) {
            return wholePart + 1.0;
        } else if (decimalPart >= 0.25) {
            return wholePart + 0.5;
        } else {
            return wholePart;
        }
    }
}
