package web.ielts.Config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import web.ielts.User.User;
import web.ielts.User.repository.UserRepository;

import web.ielts.Student.model.Student;
import web.ielts.Student.model.StudentResult;
import web.ielts.Student.repository.StudentRepository;
import web.ielts.Student.repository.StudentResultRepository;

import web.ielts.Report.model.Report;
import web.ielts.Report.repository.ReportRepository;

import web.ielts.Payment.model.Course;
import web.ielts.Payment.model.PaymentTransactions;
import web.ielts.Payment.repository.CourseRepository;
import web.ielts.Payment.repository.TransactionRepository;

import web.ielts.Practice.model.Vocabulary;
import web.ielts.Practice.model.ExampleSentence;
import web.ielts.Practice.repository.VocabularyRepository;

import web.ielts.Tips.model.ListeningTips;
import web.ielts.Tips.model.ReadingTips;
import web.ielts.Tips.model.SpeakingTips;
import web.ielts.Tips.model.WritingTips;
import web.ielts.Tips.repository.ListeningTipRepository;
import web.ielts.Tips.repository.ReadingTipRepository;
import web.ielts.Tips.repository.SpeakingTipRepository;
import web.ielts.Tips.repository.WritingTipRepository;

import web.ielts.Test.model.*;
import web.ielts.Test.repository.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private StudentResultRepository studentResultRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private VocabularyRepository vocabularyRepository;

    @Autowired
    private ListeningTipRepository listeningTipRepository;

    @Autowired
    private ReadingTipRepository readingTipRepository;

    @Autowired
    private SpeakingTipRepository speakingTipRepository;

    @Autowired
    private WritingTipRepository writingTipRepository;

    @Autowired
    private TestRepository testRepository;

    @Autowired
    private ListeningRepository listeningRepository;

    @Autowired
    private ReadingRepository readingRepository;

    @Autowired
    private SpeakingRepository speakingRepository;

    @Autowired
    private WritingRepository writingRepository;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    @Override
    public void run(String... args) throws Exception {
        System.out.println("====== STARTING DATABASE INITIALIZATION / DATA SEEDING ======");

        seedUsers();
        seedStudents();
        seedStudentResults();
        seedReports();
        seedCourses();
        seedPaymentTransactions();
        seedVocabulary();
        seedTips();
        seedIeltsTests();

        System.out.println("====== DATABASE INITIALIZATION / DATA SEEDING COMPLETED ======");
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            System.out.println("Seeding users...");

            // Admin
            User admin = new User("admin@ielts.com", encoder.encode("admin123"), Arrays.asList("admin"));
            admin.setFirstName("System");
            admin.setLastName("Admin");
            admin.setPremium(false);
            admin.setCreatedAt(LocalDate.now().toString());
            userRepository.save(admin);

            // Teacher
            User teacher = new User("teacher@ielts.com", encoder.encode("teacher123"), Arrays.asList("teacher"));
            teacher.setFirstName("IELTS");
            teacher.setLastName("Instructor");
            teacher.setPremium(false);
            teacher.setCreatedAt(LocalDate.now().toString());
            userRepository.save(teacher);

            // Student (Free)
            User student = new User("student@ielts.com", encoder.encode("student123"), Arrays.asList("student"));
            student.setFirstName("John");
            student.setLastName("Doe");
            student.setPremium(false);
            student.setCreatedAt(LocalDate.now().toString());
            userRepository.save(student);

            // Student (Premium)
            User premium = new User("premium@ielts.com", encoder.encode("premium123"), Arrays.asList("student"));
            premium.setFirstName("Jane");
            premium.setLastName("Smith");
            premium.setPremium(true);
            premium.setPremiumExpiry(LocalDateTime.now().plusMonths(6));
            premium.setCreatedAt(LocalDate.now().toString());
            userRepository.save(premium);

            System.out.println("Seeded 4 default users (admin, teacher, student, premium).");
        }
    }

    private void seedStudents() {
        if (studentRepository.count() == 0) {
            System.out.println("Seeding student profiles...");

            Student john = new Student();
            john.setUsername("student@ielts.com");
            john.setFirstName("John");
            john.setLastName("Doe");
            studentRepository.save(john);

            Student jane = new Student();
            jane.setUsername("premium@ielts.com");
            jane.setFirstName("Jane");
            jane.setLastName("Smith");
            studentRepository.save(jane);

            System.out.println("Seeded student profiles.");
        }
    }

    private void seedStudentResults() {
        if (studentResultRepository.count() == 0) {
            System.out.println("Seeding student practice test results...");

            StudentResult r1 = new StudentResult();
            r1.setUsername("student@ielts.com");
            r1.setSkill("Reading");
            r1.setBand(6.5);
            r1.setTotalCorrect(28);
            r1.setSubmittedAt(LocalDateTime.now().minusDays(5));
            studentResultRepository.save(r1);

            StudentResult r2 = new StudentResult();
            r2.setUsername("student@ielts.com");
            r2.setSkill("Listening");
            r2.setBand(7.0);
            r2.setTotalCorrect(30);
            r2.setSubmittedAt(LocalDateTime.now().minusDays(3));
            studentResultRepository.save(r2);

            StudentResult r3 = new StudentResult();
            r3.setUsername("premium@ielts.com");
            r3.setSkill("Reading");
            r3.setBand(7.5);
            r3.setTotalCorrect(33);
            r3.setSubmittedAt(LocalDateTime.now().minusDays(2));
            studentResultRepository.save(r3);

            StudentResult r4 = new StudentResult();
            r4.setUsername("premium@ielts.com");
            r4.setSkill("Listening");
            r4.setBand(8.0);
            r4.setTotalCorrect(35);
            r4.setSubmittedAt(LocalDateTime.now().minusDays(1));
            studentResultRepository.save(r4);

            System.out.println("Seeded student practice test results.");
        }
    }

    private void seedReports() {
        if (reportRepository.count() == 0) {
            System.out.println("Seeding system feedback / reports...");

            Report report1 = new Report();
            report1.setUsername("student@ielts.com");
            report1.setCategory("Technical");
            report1.setSubject("Audio connection issue");
            report1.setMessage("Hello, when I start the Listening test, the audio fails to load properly on Safari. Works fine on Chrome.");
            report1.setCreatedAt(Instant.now().minusSeconds(86400 * 3));
            reportRepository.save(report1);

            Report report2 = new Report();
            report2.setUsername("premium@ielts.com");
            report2.setCategory("Suggestions");
            report2.setSubject("More speaking questions");
            report2.setMessage("I really like the AI feedback feature. It would be amazing to have more actual exam cue cards for Speaking Part 2.");
            report2.setCreatedAt(Instant.now().minusSeconds(86400));
            reportRepository.save(report2);

            System.out.println("Seeded feedback reports.");
        }
    }

    private void seedCourses() {
        if (courseRepository.count() == 0) {
            System.out.println("Seeding premium packages...");

            Course silver = new Course("silver_package", "Silver Package", 150000L, 200000L, "Basic access to practice tests and core vocabulary sets for 30 days.", 30L);
            courseRepository.save(silver);

            Course gold = new Course("gold_package", "Gold Package", 600000L, 800000L, "Full access to all IELTS Mock Tests (4 skills), speaking evaluations, writing tips, and analytics for 180 days.", 180L);
            courseRepository.save(gold);

            Course platinum = new Course("platinum_package", "Platinum Package", 1000000L, 1500000L, "Ultimate preparation bundle with full access, unlimited AI speaking scoring, direct feedback from tutors, and VIP support for 365 days.", 365L);
            courseRepository.save(platinum);

            System.out.println("Seeded course premium packages.");
        }
    }

    private void seedPaymentTransactions() {
        if (transactionRepository.count() == 0) {
            System.out.println("Seeding payment transactions...");

            PaymentTransactions t1 = new PaymentTransactions(
                    null,
                    "premium@ielts.com",
                    "Gold Package",
                    600000L,
                    "VNPAY",
                    "success",
                    LocalDateTime.now().minusDays(10),
                    "Payment Completed Successfully",
                    "VNPAY88997766"
            );
            transactionRepository.save(t1);

            PaymentTransactions t2 = new PaymentTransactions(
                    null,
                    "student@ielts.com",
                    "Silver Package",
                    150000L,
                    "VNPAY",
                    "pending",
                    LocalDateTime.now().minusHours(4),
                    "Awaiting Payment confirmation from VNPAY sandbox",
                    "VNPAY88997780"
            );
            transactionRepository.save(t2);

            System.out.println("Seeded payment transactions.");
        }
    }

    private void seedVocabulary() {
        if (vocabularyRepository.count() == 0) {
            System.out.println("Seeding vocabulary vocabularies...");

            List<Vocabulary> list = new ArrayList<>();

            // Technology
            List<ExampleSentence> exp1 = Arrays.asList(
                    new ExampleSentence("The new smartphone features a cutting-edge processor.", "Chiếc điện thoại mới sở hữu một bộ vi xử lý tối tân."),
                    new ExampleSentence("We are looking for cutting-edge technologies to implement.", "Chúng tôi đang tìm kiếm các công nghệ tiên phong để áp dụng.")
            );
            list.add(new Vocabulary("cutting-edge", "tối tân, tiên phong", "extremely modern and at the front of development in a particular field", "Technology", "7.5", exp1, "adjective", "/ˌkʌt.ɪŋˈedʒ/"));

            List<ExampleSentence> exp2 = Arrays.asList(
                    new ExampleSentence("Gas lamps became obsolete after the invention of electric light.", "Đèn ga trở nên lỗi thời sau khi phát minh ra bóng điện."),
                    new ExampleSentence("Many jobs are being made obsolete by AI and automation.", "Nhiều công việc đang trở nên lỗi thời do trí tuệ nhân tạo và tự động hóa.")
            );
            list.add(new Vocabulary("obsolete", "lỗi thời, cổ xưa", "not in use any more, having been replaced by something newer and better", "Technology", "7.0", exp2, "adjective", "/ˌɒb.səlˈiːt/"));

            // Environment
            List<ExampleSentence> exp3 = Arrays.asList(
                    new ExampleSentence("Biodiversity is essential for maintaining ecosystem stability.", "Đa dạng sinh học là cực kỳ cần thiết để duy trì sự ổn định của hệ sinh thái."),
                    new ExampleSentence("The region is known for its rich biodiversity.", "Vùng này nổi tiếng vì sự đa dạng sinh học phong phú.")
            );
            list.add(new Vocabulary("biodiversity", "đa dạng sinh học", "the number and variety of plants and animals that live in a particular area", "Environment", "7.0", exp3, "noun", "/ˌbaɪ.oʊ.daɪˈvɜːr.sə.t̬i/"));

            List<ExampleSentence> exp4 = Arrays.asList(
                    new ExampleSentence("Heavy rains can cause severe soil erosion in hilly regions.", "Mưa lớn có thể gây xói mòn đất nghiêm trọng ở các vùng đồi núi."),
                    new ExampleSentence("Wind erosion is a major problem in dry agricultural land.", "Xói mòn do gió là một vấn đề lớn ở vùng đất nông nghiệp khô cằn.")
            );
            list.add(new Vocabulary("erosion", "sự xói mòn", "the gradual wearing away of land or soil by wind, water, or other natural agents", "Environment", "6.5", exp4, "noun", "/ɪˈroʊ.ʒən/"));

            // Education
            List<ExampleSentence> exp5 = Arrays.asList(
                    new ExampleSentence("Modern schools focus on collaborative pedagogy rather than traditional lectures.", "Các trường học hiện đại tập trung vào phương pháp sư phạm mang tính hợp tác thay vì các bài giảng truyền thống."),
                    new ExampleSentence("Teachers study different pedagogies during their training.", "Giáo viên nghiên cứu các phương pháp sư phạm khác nhau trong quá trình đào tạo.")
            );
            list.add(new Vocabulary("pedagogy", "phương pháp sư phạm", "the study of the methods and activities of teaching", "Education", "8.0", exp5, "noun", "/ˈped.ə.ɡɒdʒ.i/"));

            List<ExampleSentence> exp6 = Arrays.asList(
                    new ExampleSentence("The university curriculum is updated every three years.", "Chương trình học của trường đại học được cập nhật ba năm một lần."),
                    new ExampleSentence("Art and music are essential parts of the school curriculum.", "Nghệ thuật và âm nhạc là những phần thiết yếu của chương trình học phổ thông.")
            );
            list.add(new Vocabulary("curriculum", "chương trình giảng dạy", "the subjects comprising a course of study in a school or college", "Education", "6.5", exp6, "noun", "/kəˈrɪk.jə.ləm/"));

            // Health
            List<ExampleSentence> exp7 = Arrays.asList(
                    new ExampleSentence("A balanced diet and regular exercise promote overall well-being.", "Chế độ ăn cân đối và tập thể dục thường xuyên giúp nâng cao sức khỏe toàn diện."),
                    new ExampleSentence("Emotional well-being is just as important as physical fitness.", "Sức khỏe tinh thần cũng quan trọng tương tự như thể lực thể chất.")
            );
            list.add(new Vocabulary("well-being", "tình trạng hạnh phúc, khỏe mạnh", "the state of being comfortable, healthy, or happy", "Health", "6.5", exp7, "noun", "/ˌwelˈbiː.ɪŋ/"));

            vocabularyRepository.saveAll(list);
            System.out.println("Seeded 7 vocabulary words across topics.");
        }
    }

    private void seedTips() {
        if (listeningTipRepository.count() == 0) {
            System.out.println("Seeding Listening tips...");
            ListeningTips tip = new ListeningTips("list_tip_001", "Multiple Choice", "Tips to solve Listening Part 3 Multiple Choice questions", "Listening");
            tip.setStrategy(Arrays.asList("Read the questions and underline keywords during the preparation time.", "Listen for synonyms or paraphrasing instead of exact word matches.", "Do not choose an option immediately just because you hear a word from it."));
            tip.setTips(Arrays.asList("Distractors: Speakers will mention multiple options but change their minds.", "Note-taking: Jot down short keywords near choices."));

            ListeningTips.Exercise ex = new ListeningTips.Exercise();
            ex.setAudioUrl("https://swpieltsbucket.s3.ap-southeast-1.amazonaws.com/sample_audio.mp3");
            ex.setInstruction("Listen to the conversation and choose the correct answer A, B, or C.");

            ListeningTips.Exercise.Section sec = new ListeningTips.Exercise.Section();
            sec.setQuestion(Arrays.asList("What project topic did the students choose?"));
            sec.setOptions(Arrays.asList("A. Coastal erosion", "B. Wind turbines energy", "C. Smart agricultural sensors"));
            sec.setAnswer("C");
            sec.setExplanation("The speaker explicitly says: 'We eventually agreed to build smart agricultural sensors rather than investigating wind turbines or coastal lines'.");
            ex.setSection(Arrays.asList(sec));
            tip.setExercises(Arrays.asList(ex));

            listeningTipRepository.save(tip);
            System.out.println("Seeded Listening tips.");
        }

        if (readingTipRepository.count() == 0) {
            System.out.println("Seeding Reading tips...");
            ReadingTips tip = new ReadingTips("read_tip_001", "True/False/Not Given", "Mastering True False Not Given questions", "Reading");
            tip.setStrategy(Arrays.asList("True: The statement agrees with the information in the passage.", "False: The statement contradicts or is opposite to the passage.", "Not Given: There is no information or it is impossible to confirm."));
            tip.setTips(Arrays.asList("Focus on qualifying words like 'all', 'some', 'always', 'occasionally'.", "Look for synonyms."));

            ReadingTips.Exercise ex = new ReadingTips.Exercise();
            ex.setParagraph("Vitamins are essential nutrients. However, taking high doses of synthetic Vitamin C can lead to stomach irritation, whereas natural sources have no known negative effects.");
            ex.setInstruction("Determine if the statement is TRUE, FALSE, or NOT GIVEN.");

            ReadingTips.Exercise.Section sec = new ReadingTips.Exercise.Section();
            sec.setQuestion(Arrays.asList("Synthetic Vitamin C in large amounts can trigger stomach discomfort."));
            sec.setOptions(Arrays.asList("TRUE", "FALSE", "NOT GIVEN"));
            sec.setAnswer("TRUE");
            sec.setExplanation("The passage states high doses of synthetic Vitamin C can lead to 'stomach irritation', which is synonymous with 'trigger stomach discomfort'.");
            ex.setSection(Arrays.asList(sec));
            tip.setExercises(Arrays.asList(ex));

            readingTipRepository.save(tip);
            System.out.println("Seeded Reading tips.");
        }

        if (speakingTipRepository.count() == 0) {
            System.out.println("Seeding Speaking tips...");
            SpeakingTips tip = new SpeakingTips("speak_tip_001", "Part 2 Cue Card", "Strategies for organizing your talk in Part 2", "Speaking");
            tip.setStrategy(Arrays.asList("Use the 1 minute preparation time to make a quick mind-map.", "Speak continuously until the examiner stops you (roughly 2 minutes).", "Structure your speech using the prompts (Who, When, Where, What, Why)."));
            tip.setTips(Arrays.asList("Maintain eye contact if in person.", "Use signposting phrases: 'Firstly', 'Moving on to', 'As for'."));

            SpeakingTips.Exercise ex = new SpeakingTips.Exercise();
            ex.setInstruction("Prepare your talk based on the prompt below. Record your response.");

            SpeakingTips.Exercise.Section sec = new SpeakingTips.Exercise.Section();
            sec.setQuestion(Arrays.asList("Describe a piece of technology that you use frequently. You should say: what it is, how often you use it, what you use it for, and explain why it is important to you."));
            sec.setAnswer("A good response would structure: Introduction (Smart phone), detail of features (calendar, communication), personal importance (manages my work day, stays connected with family).");
            ex.setSection(Arrays.asList(sec));
            tip.setExercises(Arrays.asList(ex));

            speakingTipRepository.save(tip);
            System.out.println("Seeded Speaking tips.");
        }

        if (writingTipRepository.count() == 0) {
            System.out.println("Seeding Writing tips...");
            WritingTips tip = new WritingTips("write_tip_001", "Task 2 Structure", "How to structure an Opinion Essay", "Writing");
            tip.setStrategy(Arrays.asList("Introduction: Paraphrase the prompt & state your clear opinion.", "Body Paragraph 1: First reason supporting your view with examples.", "Body Paragraph 2: Second reason supporting your view with examples.", "Conclusion: Summarize your opinion and main arguments."));
            tip.setTips(Arrays.asList("Write at least 250 words.", "Use academic linkers: 'Furthermore', 'Consequently', 'On the other hand'."));

            WritingTips.Exercise ex = new WritingTips.Exercise();
            ex.setInstruction("Read the prompt and write your thesis statement.");

            WritingTips.Exercise.Section sec = new WritingTips.Exercise.Section();
            sec.setQuestion(Arrays.asList("Some people believe that university education should be free for everyone. To what extent do you agree or disagree?"));
            sec.setAnswer("Example Thesis: 'I completely agree with the notion that tertiary education should be fully funded by governments, as it reduces economic disparity and fosters innovation.'");
            ex.setSection(Arrays.asList(sec));
            tip.setExercises(Arrays.asList(ex));

            writingTipRepository.save(tip);
            System.out.println("Seeded Writing tips.");
        }
    }

    private void seedIeltsTests() {
        String testId = "T001";
        System.out.println("Force updating / Seeding IELTS Full Test T001...");

            // Test
            Test test = new Test(testId, "IELTS Academic Practice Test Vol 1", Arrays.asList("Academic", "Practice", "2026"), LocalDate.now().toString());
            testRepository.save(test);

            // 1. Listening (4 Parts - 40 Questions)
            Listening listening = new Listening();
            listening.setTestId(testId);
            listening.setAudioUrl("https://firebasestorage.googleapis.com/v0/b/projectsavefileandaudio.firebasestorage.app/o/audios%2Fsample_listening_test01.mp3?alt=media");

            List<Listening.TaskListening> lTasks = new ArrayList<>();

            // Part 1 (10 Questions - ECO-FARM Note & Table Completion)
            Listening.TaskListening lTask1 = new Listening.TaskListening();
            lTask1.setTaskNumber(1);
            lTask1.setAudioUrl("https://vtgwqleicwbaefsnpxxd.supabase.co/storage/v1/object/public/audio/part1.mp3");
            Listening.Section lSec1_1 = new Listening.Section();
            lSec1_1.setSectionNumber(1);
            lSec1_1.setType("note-completion");
            lSec1_1.setIntroduction("Questions 1-5: Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.");
            List<Listening.Question> lqList1 = new ArrayList<>();
            String[][] p1Notes = {
                {"1. Name: Helen _______", "West", "Helen West"},
                {"2. E-mail address (work): helen123@ _______ .com", "mail", "helen123@mail.com"},
                {"3. Home address: _______ Road, Sheffield", "Green", "Green Road"},
                {"4. Source of information: _______", "website", "Found on website"},
                {"5. Membership number: _______", "5482", "Member #5482"}
            };
            for (String[] q : p1Notes) {
                Listening.Question lq = new Listening.Question();
                lq.setQuestion(q[0]);
                lq.setAnswer(q[1]);
                lq.setExplanation(q[2]);
                lq.setOptions(new ArrayList<>());
                lqList1.add(lq);
            }
            lSec1_1.setQuestions(lqList1);

            Listening.Section lSec1_2 = new Listening.Section();
            lSec1_2.setSectionNumber(2);
            lSec1_2.setType("table-completion");
            lSec1_2.setIntroduction("Questions 6-10: Complete the table below. Write ONE WORD ONLY for each answer.");
            List<Listening.Question> lqList1_2 = new ArrayList<>();
            String[][] p1Table = {
                {"6. Accommodation type: Lodges / A (6) _______", "cabin", "Option A cabin"},
                {"7. Accommodation location: Near the farm or in the (7) _______", "forest", "Located in the forest"},
                {"8. Food: Meat, seafood and (8) _______ food", "organic", "Organic food provided"},
                {"9. Transport: Ferry and van / Train or (9) _______", "bus", "Train or bus"},
                {"10. Courses: Active courses (e.g. a (10) _______ course)", "cooking", "A cooking course"}
            };
            for (String[] q : p1Table) {
                Listening.Question lq = new Listening.Question();
                lq.setQuestion(q[0]);
                lq.setAnswer(q[1]);
                lq.setExplanation(q[2]);
                lq.setOptions(new ArrayList<>());
                lqList1_2.add(lq);
            }
            lSec1_2.setQuestions(lqList1_2);
            lTask1.setSections(Arrays.asList(lSec1_1, lSec1_2));
            lTasks.add(lTask1);

            // Part 2 (10 Questions - Responsible Tasks & Destination Features)
            Listening.TaskListening lTask2 = new Listening.TaskListening();
            lTask2.setTaskNumber(2);
            lTask2.setAudioUrl("https://vtgwqleicwbaefsnpxxd.supabase.co/storage/v1/object/public/audio/part2.mp3");
            Listening.Section lSec2_1 = new Listening.Section();
            lSec2_1.setSectionNumber(1);
            lSec2_1.setType("matching");
            lSec2_1.setIntroduction("Questions 11-16: Who will be responsible for each of the following tasks?\nA. Members must do | B. Members can choose to do or not | C. Organizers will do");
            List<Listening.Question> lqList2_1 = new ArrayList<>();
            String[][] p2Matching1 = {
                {"11. Bringing camp tents", "A"},
                {"12. Booking the campsite", "C"},
                {"13. Taking bikes", "B"},
                {"14. Buying train tickets", "C"},
                {"15. Buying football match tickets", "B"},
                {"16. Collecting travel information", "A"}
            };
            for (String[] q : p2Matching1) {
                Listening.Question lq = new Listening.Question();
                lq.setQuestion(q[0]);
                lq.setAnswer(q[1]);
                lq.setExplanation("Responsibility option " + q[1]);
                lq.setOptions(Arrays.asList("A", "B", "C"));
                lqList2_1.add(lq);
            }
            lSec2_1.setQuestions(lqList2_1);

            Listening.Section lSec2_2 = new Listening.Section();
            lSec2_2.setSectionNumber(2);
            lSec2_2.setType("dropdown");
            lSec2_2.setIntroduction("Questions 17-20: What is each destination famous for?\nA. horse riding | B. farming museum | C. locally produced food | D. transport museum | E. historical ruins | F. clothing market");
            List<Listening.Question> lqList2_2 = new ArrayList<>();
            String[][] p2Matching2 = {
                {"17. Capefield", "C"},
                {"18. Milton", "A"},
                {"19. Wellington", "E"},
                {"20. Landywood", "D"}
            };
            for (String[] q : p2Matching2) {
                Listening.Question lq = new Listening.Question();
                lq.setQuestion(q[0]);
                lq.setAnswer(q[1]);
                lq.setExplanation("Destination famous for option " + q[1]);
                lq.setOptions(Arrays.asList("A. horse riding", "B. farming museum", "C. locally produced food", "D. transport museum", "E. historical ruins", "F. clothing market"));
                lqList2_2.add(lq);
            }
            lSec2_2.setQuestions(lqList2_2);
            lTask2.setSections(Arrays.asList(lSec2_1, lSec2_2));
            lTasks.add(lTask2);

            // Part 3 (10 Questions - Experiments & Diagram Labeling)
            Listening.TaskListening lTask3 = new Listening.TaskListening();
            lTask3.setTaskNumber(3);
            lTask3.setAudioUrl("https://vtgwqleicwbaefsnpxxd.supabase.co/storage/v1/object/public/audio/part3.mp3");
            Listening.Section lSec3_1 = new Listening.Section();
            lSec3_1.setSectionNumber(1);
            lSec3_1.setType("dropdown");
            lSec3_1.setIntroduction("Questions 21-26: Subject of Experiments\nA. very boring | B. too difficult | C. specialised equipment needed | D. very expensive | E. immediate results | F. useful practice for maths | G. cheap to do | H. takes longer than usual to do");
            List<Listening.Question> lqList3_1 = new ArrayList<>();
            String[][] p3Exp = {
                {"21. Steam engine", "C"},
                {"22. Breakfast cereals", "E"},
                {"23. Bouncing balls", "F"},
                {"24. Making paper", "G"},
                {"25. Tie-dyeing", "D"},
                {"26. Glue from milk", "H"}
            };
            for (String[] q : p3Exp) {
                Listening.Question lq = new Listening.Question();
                lq.setQuestion(q[0]);
                lq.setAnswer(q[1]);
                lq.setExplanation("Experiment comment option " + q[1]);
                lq.setOptions(Arrays.asList("A. very boring", "B. too difficult", "C. specialised equipment needed", "D. very expensive", "E. immediate results", "F. useful practice for maths", "G. cheap to do", "H. takes longer than usual to do"));
                lqList3_1.add(lq);
            }
            lSec3_1.setQuestions(lqList3_1);

            Listening.Section lSec3_2 = new Listening.Section();
            lSec3_2.setSectionNumber(2);
            lSec3_2.setType("map-labeling");
            lSec3_2.setImageUrl("https://vtgwqleicwbaefsnpxxd.supabase.co/storage/v1/object/public/image/diagram_part3.png");
            lSec3_2.setIntroduction("Questions 27-30: Label the diagram below. Write the correct letter, A-G.");
            List<Listening.Question> lqList3_2 = new ArrayList<>();
            String[][] p3Diagram = {
                {"27. Metal container", "B"},
                {"28. Integral strainer", "D"},
                {"29. Drip tip", "A"},
                {"30. Pottery container", "F"}
            };
            for (String[] q : p3Diagram) {
                Listening.Question lq = new Listening.Question();
                lq.setQuestion(q[0]);
                lq.setAnswer(q[1]);
                lq.setExplanation("Diagram part option " + q[1]);
                lq.setOptions(Arrays.asList("A", "B", "C", "D", "E", "F", "G"));
                lqList3_2.add(lq);
            }
            lSec3_2.setQuestions(lqList3_2);
            lTask3.setSections(Arrays.asList(lSec3_1, lSec3_2));
            lTasks.add(lTask3);

            // Part 4 (10 Questions - Note Completion)
            Listening.TaskListening lTask4 = new Listening.TaskListening();
            lTask4.setTaskNumber(4);
            lTask4.setAudioUrl("https://vtgwqleicwbaefsnpxxd.supabase.co/storage/v1/object/public/audio/part4.mp3");
            Listening.Section lSec4 = new Listening.Section();
            lSec4.setSectionNumber(1);
            lSec4.setType("note-completion");
            lSec4.setIntroduction("Questions 31-40: Complete the lecture notes below. Write ONE WORD ONLY for each answer.");
            List<Listening.Question> lqList4 = new ArrayList<>();
            String[] p4Answers = {"ecosystem", "chemosynthesis", "pollution", "dioxide", "temperature", "chain", "forecasting", "plates", "magma", "waves"};
            for (int i = 31; i <= 40; i++) {
                Listening.Question lq = new Listening.Question();
                lq.setQuestion(i + ". Lecture note point on oceanography topic " + (i - 30) + ": _______");
                lq.setAnswer(p4Answers[i - 31]);
                lq.setExplanation("Lecturer mentions " + p4Answers[i - 31]);
                lq.setOptions(new ArrayList<>());
                lqList4.add(lq);
            }
            lSec4.setQuestions(lqList4);
            lTask4.setSections(Arrays.asList(lSec4));
            lTasks.add(lTask4);

            listening.setTasks(lTasks);
            listeningRepository.save(listening);

            // 2. Reading (3 Passages - 40 Questions)
            Reading reading = new Reading();
            reading.setTestId(testId);
            List<Reading.Task> rTasks = new ArrayList<>();

            // Passage 1 (13 Questions)
            Reading.Task rTask1 = new Reading.Task();
            rTask1.setTaskNumber(1);
            rTask1.setTitle("Passage 1: The Architecture of Ancient Roman Aqueducts");
            rTask1.setParagraph("Ancient Roman aqueducts were remarkable feats of engineering that supplied cities with fresh water from distant sources. Constructed using gravity, arches, and subterranean channels, these structures demonstrated advanced hydraulics. Pozzolana concrete made from volcanic ash allowed aqueducts to withstand centuries of weathering...");
            Reading.Section rSec1 = new Reading.Section();
            rSec1.setSectionNumber(1);
            rSec1.setType("True/False/Not Given");
            rSec1.setIntroduction("Questions 1-13: Do the statements agree with Reading Passage 1?");
            List<Reading.Question> rqList1 = new ArrayList<>();
            for (int i = 1; i <= 13; i++) {
                Reading.Question rq = new Reading.Question();
                rq.setQuestionNumber(i);
                rq.setQuestion("Statement " + i + " regarding ancient Roman aqueducts engineering.");
                rq.setAnswer(i % 3 == 1 ? "TRUE" : (i % 3 == 2 ? "FALSE" : "NOT GIVEN"));
                rq.setExplanation("Explanation for reading question " + i);
                rq.setOptions(Arrays.asList("TRUE", "FALSE", "NOT GIVEN"));
                rqList1.add(rq);
            }
            rSec1.setQuestions(rqList1);
            rTask1.setSections(Arrays.asList(rSec1));
            rTasks.add(rTask1);

            // Passage 2 (13 Questions)
            Reading.Task rTask2 = new Reading.Task();
            rTask2.setTaskNumber(2);
            rTask2.setTitle("Passage 2: The Cognitive Benefits of Bilingualism");
            rTask2.setParagraph("For decades, educators believed that raising children with two languages would cause cognitive confusion. Modern neuroimaging studies have completely overturned this view, revealing that bilingual individuals enjoy significant cognitive advantages across their lifespan...");
            Reading.Section rSec2 = new Reading.Section();
            rSec2.setSectionNumber(2);
            rSec2.setType("Multiple Choice");
            rSec2.setIntroduction("Questions 14-26: Choose the correct option A, B, C, or D.");
            List<Reading.Question> rqList2 = new ArrayList<>();
            for (int i = 14; i <= 26; i++) {
                Reading.Question rq = new Reading.Question();
                rq.setQuestionNumber(i);
                rq.setQuestion(i + ". According to paragraph " + ((i - 13) / 3 + 1) + ", the study indicates that:");
                rq.setAnswer(i % 4 == 0 ? "A" : (i % 4 == 1 ? "B" : (i % 4 == 2 ? "C" : "D")));
                rq.setExplanation("Explanation for passage 2 question " + i);
                rq.setOptions(Arrays.asList("A. Cognitive reserve increase", "B. Executive function enhancement", "C. Memory delay suppression", "D. Language processing overlap"));
                rqList2.add(rq);
            }
            rSec2.setQuestions(rqList2);
            rTask2.setSections(Arrays.asList(rSec2));
            rTasks.add(rTask2);

            // Passage 3 (14 Questions)
            Reading.Task rTask3 = new Reading.Task();
            rTask3.setTaskNumber(3);
            rTask3.setTitle("Passage 3: Artificial Intelligence in Agricultural Technology");
            rTask3.setParagraph("As global populations approach 10 billion by 2050, agricultural systems face unprecedented pressure. Artificial Intelligence (AI), autonomous robotics, and precision sensor networks are transforming modern farming...");
            Reading.Section rSec3 = new Reading.Section();
            rSec3.setSectionNumber(3);
            rSec3.setType("Summary Completion");
            rSec3.setIntroduction("Questions 27-40: Complete the summary using words from Passage 3.");
            List<Reading.Question> rqList3 = new ArrayList<>();
            String[] r3Answers = {"resources", "health", "lasers", "schedules", "nitrogen", "infestation", "labor", "humidity", "accuracy", "pollution", "equipment", "statistics", "fertility", "security"};
            for (int i = 27; i <= 40; i++) {
                Reading.Question rq = new Reading.Question();
                rq.setQuestionNumber(i);
                rq.setQuestion(i + ". Modern agricultural technology aims to protect " + (i - 26) + ": _______");
                rq.setAnswer(r3Answers[i - 27]);
                rq.setExplanation("Text mentions " + r3Answers[i - 27]);
                rq.setOptions(new ArrayList<>());
                rqList3.add(rq);
            }
            rSec3.setQuestions(rqList3);
            rTask3.setSections(Arrays.asList(rSec3));
            rTasks.add(rTask3);

            reading.setTasks(rTasks);
            readingRepository.save(reading);

            // 3. Writing (Task 1 & Task 2)
            Writing writing = new Writing();
            writing.setTestId(testId);

            Writing.Task wTask1 = new Writing.Task();
            wTask1.setTaskNumber(1);
            wTask1.setImageUrl("https://firebasestorage.googleapis.com/v0/b/projectsavefileandaudio.firebasestorage.app/o/images%2Fwriting_task1_sample.jpg?alt=media");
            wTask1.setType("Line Graph");
            wTask1.setQuestion("WRITING TASK 1\nYou should spend about 20 minutes on this task.\n\nThe line graph shows the percentage of households with internet access in three countries (Country A, B, C) between 2005 and 2025.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.");

            Writing.Task wTask2 = new Writing.Task();
            wTask2.setTaskNumber(2);
            wTask2.setType("Opinion Essay");
            wTask2.setQuestion("WRITING TASK 2\nYou should spend about 40 minutes on this task.\n\nIn many countries, governments spend large amounts of money on space exploration. Some people believe this money should be spent on solving domestic problems on Earth instead.\n\nTo what extent do you agree or disagree?\n\nWrite at least 250 words.");

            writing.setTasks(Arrays.asList(wTask1, wTask2));
            writingRepository.save(writing);

            // 4. Speaking (Part 1, Part 2, Part 3)
            Speaking speaking = new Speaking();
            speaking.setTestId(testId);

            // Part 1
            Speaking.Part part1 = new Speaking.Part();
            part1.setPartNumber(1);
            part1.setTitle("Part 1: Introduction and Interview");
            part1.setInstruction("Answer general questions about yourself, work, study, and daily topics.");
            part1.setIntroduction("Let's talk about your work, study, and daily interests.");
            List<Speaking.Question> sqList1 = new ArrayList<>();
            String[] p1Speaking = {
                "Work & Study: Do you work or are you a student?",
                "Work & Study: What subject are you studying or what is your job?",
                "Work & Study: Why did you choose this field?",
                "Hometown: Where is your hometown located?",
                "Hometown: What is the most interesting part of your hometown?",
                "Hometown: Has your hometown changed much since childhood?",
                "Hobbies: How often do you use the internet in your daily life?",
                "Hobbies: What apps or websites do you use most frequently?",
                "Hobbies: Do you prefer reading books online or printed books?",
                "Hobbies: What activities help you relax after a busy day?"
            };
            for (int i = 0; i < p1Speaking.length; i++) {
                Speaking.Question sq = new Speaking.Question();
                sq.setQuestionNumber(i + 1);
                sq.setQuestion(p1Speaking[i]);
                sqList1.add(sq);
            }
            part1.setQuestions(sqList1);
            speaking.setPart1(part1);

            // Part 2
            Speaking.Part2 part2 = new Speaking.Part2();
            part2.setPartNumber(2);
            part2.setTitle("Part 2: Individual Long Turn (Cue Card)");
            part2.setInstruction("You have 1 minute to prepare and up to 2 minutes to speak.");
            part2.setQuestion("Describe a memorable journey or trip you took that did not go as planned.");
            part2.setCueCards(Arrays.asList(
                "You should say:",
                "- Where you went and who you were with",
                "- What went wrong during the journey",
                "- How you handled or solved the problem",
                "And explain why this journey remains memorable to you"
            ));
            speaking.setPart2(part2);

            // Part 3
            Speaking.Part part3 = new Speaking.Part();
            part3.setPartNumber(3);
            part3.setTitle("Part 3: Two-way Discussion");
            part3.setInstruction("Discuss broader, more analytical issues related to travel and society.");
            part3.setIntroduction("Let's discuss tourism and travel trends.");
            List<Speaking.Question> sqList3 = new ArrayList<>();
            String[] p3Speaking = {
                "How have people's travel habits changed over the past few decades?",
                "What are the environmental impacts of mass tourism on popular destinations?",
                "Should government investment prioritize high-speed public transport or highways?",
                "Some people say traveling abroad is essential for understanding other cultures. Do you agree?",
                "How might future technological advancements like AI change the way we travel?"
            };
            for (int i = 0; i < p3Speaking.length; i++) {
                Speaking.Question sq = new Speaking.Question();
                sq.setQuestionNumber(i + 1);
                sq.setQuestion(p3Speaking[i]);
                sqList3.add(sq);
            }
            part3.setQuestions(sqList3);
            speaking.setPart3(part3);

            speakingRepository.save(speaking);

            System.out.println("Seeded full IELTS test T001 successfully.");
    }
}
