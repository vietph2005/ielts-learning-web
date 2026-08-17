package web.ielts.Test.ai.rubrics;

/**
 * Standardized IELTS Writing Assessment Rubrics & Prompt Builders.
 * Fully aligned with official IELTS Writing Public Band Descriptors (British Council / IDP / Cambridge).
 */
public class IeltsWritingRubrics {

    // =========================================================================
    // 1. OFFICIAL IELTS WRITING TASK 1 BAND DESCRIPTORS (Bands 1 - 9)
    // =========================================================================

    public static final String TASK_1_TASK_ACHIEVEMENT = """
            - IELTS Writing Task 1: Task Achievement (25%):
              • Band 9: Fully satisfies all requirements of the task. Clearly presents a comprehensive overview with key features expertly selected, highlighted, and clearly illustrated with accurate data.
              • Band 8: Covers all requirements of the task sufficiently. Presents a clear overview of main trends, differences, or stages. Clearly presents and highlights key features, but could be more fully extended with data.
              • Band 7: Covers the requirements of the task. Presents a clear overview of main trends, differences, or stages. Clearly presents and highlights key features, but there may be minor lapses, omissions, or slight inaccuracies in data detail.
              • Band 6: Addresses the requirements of the task. Presents an overview with information appropriately selected. Key features are presented and adequately highlighted, but some details may be irrelevant, inappropriate, or inaccurate.
              • Band 5: Generally addresses the task; the format may be inappropriate in places. Recounts detail mechanically with no clear overview, or overview lacks clarity. Key features are insufficiently covered or data is inaccurate.
              • Band 4: Attempts to address the task but does not cover all key features. The format may be inappropriate. Key features are largely omitted or unclear. Data is inaccurate or copied directly.
              • Band 3: Fails to address the task; gives limited information, largely irrelevant or inaccurate.
              • Band 2-1: Answer is barely related to the task or extremely short (< 50 words).
            """;

    public static final String TASK_1_COHERENCE_COHESION = """
            - IELTS Writing Task 1: Coherence and Cohesion (25%):
              • Band 9: Uses cohesion in such a way that it attracts no attention. Skilfully manages paragraphing (Intro, Overview, Body Paragraphs).
              • Band 8: Sequences information and ideas logically. Manages all aspects of cohesion well. Uses paragraphing sufficiently and appropriately.
              • Band 7: Logically organises information and ideas; there is clear progression throughout. Uses a range of cohesive devices appropriately although there may be some under-/over-use.
              • Band 6: Arranges information and ideas coherently and there is a clear overall progression. Uses cohesive devices effectively, but cohesion within and/or between sentences may be faulty or mechanical.
              • Band 5: Presents information with some organisation but there may be a lack of overall progression. Makes inadequate, inaccurate, or over-use of cohesive devices. Paragraphing may be missing or inadequate.
              • Band 4: Presents information and ideas but these are not arranged coherently and there is no clear progression. Uses some basic cohesive devices, but these may be inaccurate or repetitive.
              • Band 3-1: Lack of logical flow, disjointed sentences.
            """;

    public static final String TASK_1_LEXICAL_RESOURCE = """
            - IELTS Writing Task 1: Lexical Resource (25%):
              • Band 9: Uses a wide range of vocabulary with very natural and sophisticated control of lexical features; rare minor slips. Skilful use of academic data description vocabulary (e.g., plummeted, exponential surge, plateaued).
              • Band 8: Uses a wide range of vocabulary fluently and flexibly to convey precise meanings. Skilfully uses uncommon lexical items with only rare inaccuracies.
              • Band 7: Uses a sufficient range of vocabulary to allow some flexibility and precision. Uses less common lexical items with some awareness of style and collocation. Produces rare errors in spelling and/or word formation.
              • Band 6: Uses an adequate range of vocabulary for the task. Attempts to use less common vocabulary but with some inaccuracy. Makes some errors in spelling and/or word formation, but they do not impede communication.
              • Band 5: Uses a limited range of vocabulary; but this is minimally adequate for the task. Noticeable errors in spelling and/or word formation may cause some difficulty for the reader.
              • Band 4-1: Extremely basic or inadequate vocabulary; severe spelling errors.
            """;

    public static final String TASK_1_GRAMMATICAL_RANGE_ACCURACY = """
            - IELTS Writing Task 1: Grammatical Range and Accuracy (25%):
              • Band 9: Uses a wide range of structures with full flexibility and accuracy; rare minor slips only.
              • Band 8: Uses a wide range of structures. The majority of sentences are error-free. Makes only occasional non-systematic errors and minor inappropriacies.
              • Band 7: Uses a variety of complex structures (e.g. passive voice, comparative clauses, participle phrases). Produces frequent error-free sentences. Has good control of grammar and punctuation but may make a few errors.
              • Band 6: Uses a mix of simple and complex sentence forms. Makes some errors in grammar and punctuation but they rarely reduce communication.
              • Band 5: Uses only a limited range of structures. Attempts complex sentences but these tend to be faulty, and the greatest accuracy is achieved on simple sentences. Grammatical errors are frequent.
              • Band 4-1: Basic sentence forms dominate with frequent errors that impede communication.
            """;

    // =========================================================================
    // 2. OFFICIAL IELTS WRITING TASK 2 BAND DESCRIPTORS (Bands 1 - 9)
    // =========================================================================

    public static final String TASK_2_TASK_RESPONSE = """
            - IELTS Writing Task 2: Task Response (25%):
              • Band 9: Fully addresses all parts of the task. Presents a fully developed position in answer to the question with relevant, fully extended and well-supported ideas.
              • Band 8: Sufficiently addresses all parts of the task. Presents a well-developed response to the question with relevant, extended and supported ideas.
              • Band 7: Addresses all parts of the task. Presents a clear position throughout the response. Extends and supports main ideas, though there may be a tendency to over-generalise or lack occasional focus.
              • Band 6: Addresses all parts of the task although some parts may be more fully covered than others. Presents a relevant position although the conclusions may become unclear or repetitive. Presents relevant main ideas but some may be inadequately developed/unclear.
              • Band 5: Addresses the task only partially; the format may be inappropriate in places. Expresses a position but the development is not always clear. Presents some main ideas but these are limited and not sufficiently developed; there may be irrelevant detail.
              • Band 4: Responds to the task only in a minimal way or the answer is tangential/off-topic. Presents a position but this is unclear. Ideas are difficult to identify or underdeveloped.
              • Band 3: Does not adequately address any part of the task. Does not express a clear position. Ideas are few and mostly irrelevant.
              • Band 2-1: Barely responds to the task or response is completely memorised / under 50 words.
            """;

    public static final String TASK_2_COHERENCE_COHESION = """
            - IELTS Writing Task 2: Coherence and Cohesion (25%):
              • Band 9: Uses cohesion in such a way that it attracts no attention. Skilfully manages paragraphing throughout (Clear Intro with thesis, Body paragraphs with distinct topic sentences, Conclusion).
              • Band 8: Sequences information and ideas logically. Manages all aspects of cohesion well. Uses paragraphing sufficiently and appropriately with clear central topic in each paragraph.
              • Band 7: Logically organises information and ideas; there is clear progression throughout. Uses a range of cohesive devices appropriately although there may be some under-/over-use. Clear central topic in each paragraph.
              • Band 6: Arranges information and ideas coherently and there is a clear overall progression. Uses cohesive devices effectively, but cohesion within and/or between sentences may be faulty or mechanical. Uses paragraphing, but not always logically.
              • Band 5: Presents information with some organisation but there may be a lack of overall progression. Makes inadequate, inaccurate or over-use of cohesive devices. May lack adequate paragraphing.
              • Band 4: Presents information and ideas but these are not arranged coherently and there is no clear progression. Uses basic cohesive devices, but these may be inaccurate or repetitive.
              • Band 3-1: Severely disorganized, lack of logical connections.
            """;

    public static final String TASK_2_LEXICAL_RESOURCE = """
            - IELTS Writing Task 2: Lexical Resource (25%):
              • Band 9: Uses a wide range of vocabulary with very natural and sophisticated control of lexical features; rare minor slips only. Precise academic collocations and nuanced expressions.
              • Band 8: Uses a wide range of vocabulary fluently and flexibly to convey precise meanings. Skilfully uses uncommon lexical items and idiomatic phrases with only rare inaccuracies.
              • Band 7: Uses a sufficient range of vocabulary to allow some flexibility and precision. Uses less common lexical items with some awareness of style and collocation. May produce occasional errors in word choice, spelling and/or word formation.
              • Band 6: Uses an adequate range of vocabulary for the task. Attempts to use less common vocabulary but with some inaccuracy. Makes some errors in spelling and/or word formation, but they do not impede communication.
              • Band 5: Uses a limited range of vocabulary; but this is minimally adequate for the task. May make noticeable errors in spelling and/or word formation that cause some difficulty for the reader.
              • Band 4-1: Extremely limited vocabulary; inappropriate word choices predominate.
            """;

    public static final String TASK_2_GRAMMATICAL_RANGE_ACCURACY = """
            - IELTS Writing Task 2: Grammatical Range and Accuracy (25%):
              • Band 9: Uses a wide range of complex structures with full flexibility and accuracy; rare minor slips only. Perfect punctuation throughout.
              • Band 8: Uses a wide range of structures. The majority of sentences are error-free. Makes only occasional non-systematic errors and minor inappropriacies. Punctuation is well controlled.
              • Band 7: Uses a variety of complex structures (inversion, conditionals, relative clauses, cleft sentences). Frequent error-free sentences. Good control of grammar and punctuation with few persistent errors.
              • Band 6: Uses a mix of simple and complex sentence forms. Makes some errors in grammar and punctuation but they rarely reduce communication.
              • Band 5: Uses only a limited range of structures. Attempts complex sentences but these tend to be faulty, and the greatest accuracy is achieved on simple sentences. Frequent grammatical errors may cause difficulty for the reader.
              • Band 4-1: Heavy grammatical errors predominate; meaning is severely obscured.
            """;

    // =========================================================================
    // 3. PROMPT BUILDERS FOR WRITING TASK 1 & TASK 2
    // =========================================================================

    /**
     * Builds the prompt for IELTS Writing Task 1 (Report on Graph / Chart / Map / Process).
     */
    public static String buildTask1Prompt(String question, String answer) {
        return """
                You must return your response STRICTLY in JSON format. Return raw JSON only, no markdown code blocks.
                You are a certified IELTS Writing Examiner evaluating an authentic IELTS Writing Task 1 report.
                
                IMPORTANT: Evaluate based ONLY on the question/prompt text below (no image is provided).
                The question describes the visual data (graph, chart, map, or process) that the student was given.
                Cross-reference the student's reported data and trends against what is described in the question.
                
                EVALUATION PROTOCOL FOR WRITING TASK 1:
                1. Check Word Count: Minimum 150 words recommended. If significantly under 150 words, deduct accordingly under Task Achievement.
                2. Data & Feature Verification: Based on the question description, verify if student's reported trends/data seem plausible.
                3. Overview Requirement: An effective overview highlighting main trends, stages, or contrasts is mandatory for Band 6.0+.
                4. Objective Tone: No personal opinion or speculation should be included in Task 1.
                
                OFFICIAL TASK 1 DESCRIPTORS:
                %s
                %s
                %s
                %s
                
                FEEDBACK REQUIREMENTS:
                - errorCorrections: Identify specific word choice / vocabulary / spelling / collocation errors in the student's text.
                - sentenceImprovements: Identify 2-3 key sentences that can be upgraded with higher-level academic vocabulary or complex grammar structures.
                - evaluation: Provide scores (e.g. "6.5", "7.0") and concise reviews for TaskAchievement, CoherenceCohesion, LexicalResource, and Grammar.
                - sampleAnswer: Provide a well-structured Band 8.5-9.0 model answer based on the question prompt.
                - score: Provide overall Band Score for Task 1 (e.g. "6.5").
                
                REQUIRED JSON OUTPUT STRUCTURE:
                {
                  "score": "6.5",
                  "feedback": {
                    "errorCorrections": [
                      {
                        "originalText": "exact text from essay",
                        "correctedText": "corrected text",
                        "errorType": "Vocabulary: word choice",
                        "explanation": "concise explanation",
                        "sentenceContext": "full sentence from essay containing originalText"
                      }
                    ],
                    "sentenceImprovements": [
                      {
                        "originalSentence": "original sentence from student",
                        "improvedSentence": "enhanced band 8+ sentence",
                        "techniquesUsed": ["Academic Collocation", "Passive Voice", "Nominalisation"],
                        "explanation": "why this improves the score",
                        "bandBoost": "6.0 -> 7.5"
                      }
                    ],
                    "overallComment": "Detailed examiner commentary covering strengths and actionable improvements."
                  },
                  "evaluation": {
                    "TaskAchievement": {
                      "scoreEva": "6.5",
                      "reviewEva": "Detailed commentary on overview, key features, and data accuracy."
                    },
                    "CoherenceCohesion": {
                      "scoreEva": "6.5",
                      "reviewEva": "Detailed commentary on logical organization, paragraphing, and cohesive devices."
                    },
                    "LexicalResource": {
                      "scoreEva": "6.5",
                      "reviewEva": "Detailed commentary on data-descriptive vocabulary, precision, and spelling."
                    },
                    "Grammar": {
                      "scoreEva": "6.5",
                      "reviewEva": "Detailed commentary on sentence variety, tense consistency, and punctuation."
                    }
                  },
                  "sampleAnswer": "Band 9 model answer..."
                }
                
                Question / Prompt (describes the visual data):
                %s
                
                Student Essay:
                %s
                """.formatted(
                TASK_1_TASK_ACHIEVEMENT,
                TASK_1_COHERENCE_COHESION,
                TASK_1_LEXICAL_RESOURCE,
                TASK_1_GRAMMATICAL_RANGE_ACCURACY,
                question,
                answer
        );
    }


    /**
     * Builds the prompt for IELTS Writing Task 2 (Discursive / Argumentative Essay).
     */
    public static String buildTask2Prompt(String question, String answer) {
        return """
                You must return your response STRICTLY in JSON format. Return raw JSON only, no markdown code blocks.
                You are a certified IELTS Writing Examiner evaluating an authentic IELTS Writing Task 2 essay.

                
                EVALUATION PROTOCOL FOR WRITING TASK 2:
                1. Word Count Requirement: Minimum 250 words. If under 250 words, reflect penalty in Task Response.
                2. Task Response: Ensure the essay directly addresses ALL parts of the prompt (all viewpoints, causes, solutions, or questions). Check for a clear thesis/position throughout and well-developed arguments with relevant explanations and examples.
                3. Coherence & Cohesion: Ensure logical structure (Introduction with clear stance, 2-3 body paragraphs with topic sentences and unified focus, Conclusion summarizing key ideas). Ensure natural, non-mechanical cohesive devices.
                4. Lexical Resource: Evaluate range of topic-specific academic vocabulary, precision of expression, collocations, style/register, and spelling.
                5. Grammatical Range & Accuracy: Evaluate complex sentence structures (conditionals, relative clauses, inversion, passive forms), proportion of error-free sentences, and punctuation accuracy.
                
                OFFICIAL TASK 2 DESCRIPTORS:
                %s
                %s
                %s
                %s
                
                FEEDBACK REQUIREMENTS:
                - errorCorrections: Identify specific word choice / vocabulary / spelling / collocation errors in the student's text.
                - sentenceImprovements: Identify 2-3 key sentences that can be upgraded with higher-level academic vocabulary or complex grammar structures.
                - evaluation: Provide scores (e.g. "6.5", "7.0") and concise reviews for TaskAchievement (evaluating Task Response), CoherenceCohesion, LexicalResource, and Grammar.
                - sampleAnswer: Provide a well-structured Band 8.5-9.0 model essay.
                - score: Provide overall Band Score for Task 2 (e.g. "6.5").
                
                REQUIRED JSON OUTPUT STRUCTURE:
                {
                  "score": "6.5",
                  "feedback": {
                    "errorCorrections": [
                      {
                        "originalText": "exact text from essay",
                        "correctedText": "corrected text",
                        "errorType": "Vocabulary: word choice",
                        "explanation": "concise explanation",
                        "sentenceContext": "full sentence from essay containing originalText"
                      }
                    ],
                    "sentenceImprovements": [
                      {
                        "originalSentence": "original sentence from student",
                        "improvedSentence": "enhanced band 8+ sentence",
                        "techniquesUsed": ["Subordinate Clause", "Academic Collocation", "Cleft Sentence"],
                        "explanation": "why this improves the score",
                        "bandBoost": "6.0 -> 7.5"
                      }
                    ],
                    "overallComment": "Detailed examiner commentary analyzing Task Response, arguments, coherence, vocabulary, and grammar."
                  },
                  "evaluation": {
                    "TaskAchievement": {
                      "scoreEva": "6.5",
                      "reviewEva": "Detailed commentary on Task Response: addressing all parts of prompt, clear position, and argument depth."
                    },
                    "CoherenceCohesion": {
                      "scoreEva": "6.5",
                      "reviewEva": "Detailed commentary on paragraph structure, progression, and linking devices."
                    },
                    "LexicalResource": {
                      "scoreEva": "6.5",
                      "reviewEva": "Detailed commentary on academic vocabulary, precision, collocations, and spelling."
                    },
                    "Grammar": {
                      "scoreEva": "6.5",
                      "reviewEva": "Detailed commentary on grammatical complexity, accuracy, and punctuation."
                    }
                  },
                  "sampleAnswer": "Band 9 model essay..."
                }
                
                Question / Prompt:
                %s
                
                Student Essay:
                %s
                """.formatted(
                TASK_2_TASK_RESPONSE,
                TASK_2_COHERENCE_COHESION,
                TASK_2_LEXICAL_RESOURCE,
                TASK_2_GRAMMATICAL_RANGE_ACCURACY,
                question,
                answer
        );
    }
}
