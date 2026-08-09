import { API_URL } from "@/config/api";
import { useEffect, useState } from "react"
import { ChevronDown, ChevronUp, Award, FileText, MessageSquare, BookOpen, Target, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import {useNavigate, useParams} from "react-router-dom";
import { DetailExplanationModal } from "@/components/modals/DetailExplanationModal";

interface Review {
    scoreEva: string;
    reviewEva: string;
}
interface Evaluation {
    TaskAchievement: Review;
    CoherenceCohesion: Review;
    LexicalResource: Review;
    Grammar: Review;
}

interface WritingAnswer {
    id: string;
    username?: string;
    testId: string;
    task1: TaskWritingAnswer;
    task2: TaskWritingAnswer;
}
interface ErrorCorrection {
    originalText: string;
    correctedText: string;
    errorType: string;
    explanation: string;
    sentenceContext: string;
}


interface SentenceImprovement {
    originalSentence: string;
    improvedSentence: string;
    techniquesUsed: string[];
    bandBoost: string;
    startIndex: number;
    endIndex: number;
}

interface Feedback {
    errorCorrections: ErrorCorrection[];
    sentenceImprovements: SentenceImprovement[];
    overallComment: string;
}

interface TaskWritingAnswer {
    score: string;
    type: string;
    question: string;
    imageUrl?: string;
    answer: string;
    wordCount: string;
    feedback: Feedback;
    evaluation?: Evaluation;
    sampleAnswer: string;
}



export default function WritingResult() {
    const [data, setData] = useState<WritingAnswer | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTask, setActiveTask] = useState<"task1" | "task2">("task1")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const navigate = useNavigate()
    const [openSections, setOpenSections] = useState<{
        question: boolean
        review: boolean
        scoring: boolean
        sample: boolean
    }>({
        question: false,
        review: true,
        scoring: false,
        sample: false,
    })
    const { resultId } = useParams  <{ resultId: string }>();

    const [feedbackView, setFeedbackView] = useState<"errors" | "improvements">("errors")
    useEffect(() => {
        fetch(`${API_URL}/api/result/${resultId}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch data");
                return res.json();
            })
            .then(json => setData(json))
            .catch(err => console.error("Fetch error:", err))
            .finally(() => setLoading(false));
    }, [resultId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-slate-600 font-medium">Loading your results...</p>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <Card className="max-w-md mx-auto">
                    <CardContent className="p-8 text-center">
                        <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">No results found</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const getScoreColor = (score: string) => {
        const numScore = Number.parseFloat(score)
        if (numScore >= 7.0) return "text-emerald-600 bg-emerald-100"
        if (numScore >= 6.0) return "text-amber-600 bg-amber-100"
        return "text-red-600 bg-red-100"
    }

    const calculateOverallScore = () => {
        const task1Score = data.task1 && data.task1.score ? Number.parseFloat(data.task1.score) : 0;
        const task2Score = data.task2 && data.task2.score ? Number.parseFloat(data.task2.score) : 0;
        // Nếu cả hai task đều không có thì trả về "_"
        if (!data.task1 && !data.task2) return "_";
        // Nếu chỉ có 1 task thì lấy điểm task đó
        if (!data.task1) return roundIeltsScore(task2Score);
        if (!data.task2) return roundIeltsScore(task1Score);
        // Nếu có cả hai thì tính bình thường
        const avg = (task1Score + task2Score * 2) / 3;
        return roundIeltsScore(avg);
    }

    // Quy tắc làm tròn điểm IELTS
    function roundIeltsScore(score: number) {
        const decimal = score - Math.floor(score);
        let rounded;
        if (decimal < 0.25) {
            rounded = Math.floor(score);
        } else if (decimal < 0.75) {
            rounded = Math.floor(score) + 0.5;
        } else {
            rounded = Math.ceil(score);
        }
        // Đảm bảo luôn có 1 số thập phân
        return rounded.toFixed(1);
    }

    const overallScore = calculateOverallScore();
    // Highlight errors by matching originalText only in the correct sentenceContext
    const renderTextWithCorrectionsBySentenceContext = (answer: string, corrections: ErrorCorrection[]) => {
        if (!corrections || corrections.length === 0) {
            return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="whitespace-pre-line p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-slate-700 leading-relaxed">{answer}</p>
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <div className="bg-emerald-100 p-4 rounded-xl border border-green-200">
                            <p className="text-green-700 text-sm font-medium">✓ No errors found</p>
                        </div>
                    </div>
                </div>
            )
        }

        // Tạo mảng các câu trong answer
        const sentences = answer.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [answer];
        // Đánh dấu các câu đã được sửa
        const sentenceUsed: Record<number, boolean> = {};
        // Tạo bản sao sentences để highlight
        let highlightedSentences: React.ReactNode[] = [...sentences];
        corrections.forEach((correction, idx) => {
            // Tìm index của câu context trong bài (ưu tiên lần đầu tiên)
            const contextIdx = sentences.findIndex((s, i) => !sentenceUsed[i] && s.trim() === correction.sentenceContext.trim());
            if (contextIdx === -1) return; // Không tìm thấy câu phù hợp
            sentenceUsed[contextIdx] = true;
            // Tìm vị trí từ cần sửa trong câu
            const context = sentences[contextIdx];
            const wordIdx = context.indexOf(correction.originalText);
            if (wordIdx === -1) return;
            // Chia câu thành 3 phần: trước, từ lỗi, sau
            const before = context.slice(0, wordIdx);
            const errorWord = context.slice(wordIdx, wordIdx + correction.originalText.length);
            const after = context.slice(wordIdx + correction.originalText.length);
            // Highlight từ lỗi
            highlightedSentences[contextIdx] = (
                <span key={`sentence-${idx}`}>
                    {before}
                    <mark
                        className="bg-red-100 text-red-800 font-medium rounded-md px-2 py-1 cursor-help transition-colors hover:bg-red-200 relative"
                        title={correction.explanation}
                    >
                        {errorWord}
                        <span
                            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {idx + 1}
                        </span>
                    </mark>
                    {after}
                </span>
            );
        });

        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Text with highlights */}
                <div className="lg:col-span-2">
                    <div className="whitespace-pre-line p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="leading-relaxed">
                            {highlightedSentences.map((s, i) => <span key={i}>{s}</span>)}
                        </div>
                    </div>
                </div>
                {/* Error list */}
                <div className="lg:col-span-1 space-y-3">
                    <h4 className="font-semibold text-slate-800 mb-3">Error Details</h4>
                    {corrections.map((error, index) => (
                        <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4 relative">
                            <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                {index + 1}
                            </div>
                            <div className="space-y-2 ml-2">
                                <Badge variant="outline" className="text-xs border-red-300 text-red-700 mb-2">
                                    {error.errorType}
                                </Badge>
                                <div className="space-y-1">
                                    <p className="text-sm">
                                        <span className="font-medium text-slate-700">Error:</span>{" "}
                                        <span className="text-red-600 font-medium">{error.originalText}</span>
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-medium text-slate-700">Fix:</span>{" "}
                                        <span className="text-green-600 font-medium">{error.correctedText}</span>
                                    </p>
                                </div>
                                <p className="text-xs text-slate-600 bg-white p-2 rounded border">{error.explanation}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const renderTextWithSentenceImprovementsByContent = (answer: string, improvements: SentenceImprovement[]) => {
        if (!improvements || improvements.length === 0) {
            return (
                <div className="whitespace-pre-line p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-700 leading-relaxed">{answer}</p>
                </div>
            )
        }

        let remainingText = answer
        const elements: React.ReactNode[] = []

        improvements.forEach((improvement, index) => {
            const sentence = improvement.originalSentence
            const sentenceIndex = remainingText.indexOf(sentence)

            if (sentenceIndex !== -1) {
                if (sentenceIndex > 0) {
                    elements.push(
                        <span key={`text-before-${index}`} className="text-slate-700">
              {remainingText.slice(0, sentenceIndex)}
            </span>,
                    )
                }

                elements.push(
                    <mark
                        key={`improve-mark-${index}`}
                        className="bg-amber-100 text-amber-900 font-medium rounded-md px-2 py-1 cursor-help transition-colors hover:bg-amber-200"
                        title={`Improved: ${improvement.improvedSentence}\nTechniques: ${improvement.techniquesUsed.join(", ")}\nBoost: ${improvement.bandBoost}`}
                    >
                        {sentence}
                    </mark>,
                )

                remainingText = remainingText.slice(sentenceIndex + sentence.length)
            }
        })

        if (remainingText.length > 0) {
            elements.push(
                <span key="text-final" className="text-slate-700">
          {remainingText}
        </span>,
            )
        }

        return (
            <div className="whitespace-pre-line p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="leading-relaxed">{elements}</div>
            </div>
        )
    }

    const renderFeedback = (originalText: string, feedback: Feedback) => (
        <div className="space-y-6">
            {/* Feedback Navigation */}
            <div className="flex space-x-2 bg-slate-100 p-1 rounded-lg">
                <button
                    onClick={() => setFeedbackView("errors")}
                    className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        feedbackView === "errors" ? "bg-white text-red-600 shadow-sm" : "text-slate-600 hover:text-slate-800"
                    }`}
                >
                    <Target className="h-4 w-4" />
                    <span>Error Corrections</span>
                    {feedback.errorCorrections.length > 0 && (
                        <Badge variant="secondary" className="bg-red-100 text-red-700 ml-1">
                            {feedback.errorCorrections.length}
                        </Badge>
                    )}
                </button>

                <button
                    onClick={() => setFeedbackView("improvements")}
                    className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        feedbackView === "improvements"
                            ? "bg-white text-amber-600 shadow-sm"
                            : "text-slate-600 hover:text-slate-800"
                    }`}
                >
                    <Zap className="h-4 w-4" />
                    <span>Improvements</span>
                    {feedback.sentenceImprovements.length > 0 && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 ml-1">
                            {feedback.sentenceImprovements.length}
                        </Badge>
                    )}
                </button>
            </div>

            {/* Content based on selected view */}
            {feedbackView === "errors" && (
                <div className="space-y-4">
                    {feedback.errorCorrections.length > 0 ? (
                        renderTextWithCorrectionsBySentenceContext(originalText, feedback.errorCorrections)
                    ) : (
                        <div className="bg-green-50 p-6 rounded-xl border border-green-200 text-center">
                            <div className="text-green-600 mb-2">
                                <Target className="h-8 w-8 mx-auto mb-2" />
                            </div>
                            <p className="text-green-700 font-medium">✓ No errors found</p>
                        </div>
                    )}
                </div>
            )}

            {feedbackView === "improvements" && (
                <div className="space-y-4">
                    {feedback.sentenceImprovements.length > 0 ? (
                        <>
                            {renderTextWithSentenceImprovementsByContent(originalText, feedback.sentenceImprovements)}

                            <div className="space-y-4 mt-6">
                                <h4 className="font-semibold text-slate-800">Improvement Suggestions</h4>
                                {feedback.sentenceImprovements.map((item, index) => (
                                    <Card key={index} className="border-amber-200 bg-amber-50/50">
                                        <CardContent className="p-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-amber-600 hover:bg-amber-700">{item.bandBoost}</Badge>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="p-3 bg-white rounded-lg border">
                                                        <p className="text-sm font-medium text-slate-600 mb-1">Original:</p>
                                                        <p className="text-sm text-slate-800">{item.originalSentence}</p>
                                                    </div>
                                                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                                        <p className="text-sm font-medium text-green-700 mb-1">Improved:</p>
                                                        <p className="text-sm text-green-800">{item.improvedSentence}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {item.techniquesUsed.map((technique, techIndex) => (
                                                        <Badge key={techIndex} variant="outline" className="text-xs">
                                                            {technique}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="bg-green-50 p-6 rounded-xl border border-green-200 text-center">
                            <div className="text-green-600 mb-2">
                                <Zap className="h-8 w-8 mx-auto mb-2" />
                            </div>
                            <p className="text-green-700 font-medium">No improvement suggestions</p>
                        </div>
                    )}
                </div>
            )}

            {/* Overall Comment - Always visible */}
            <Card className="border-emerald-200 bg-emerald-50/50 mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-emerald-600">
                        <MessageSquare className="h-5 w-5" />
                        Overall Feedback
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">{feedback.overallComment}</p>
                </CardContent>
            </Card>
        </div>
    )

    const renderTaskContent = (task: TaskWritingAnswer) => (
        <Card className="overflow-hidden shadow-lg border-0">
            {/* Question Section */}
            <Collapsible
                open={openSections.question}
                onOpenChange={(v) => setOpenSections((prev) => ({ ...prev, question: v }))}
            >
                <CollapsibleTrigger asChild>
                    <Button
                        variant="ghost"
                        className="w-full justify-between p-6 h-auto bg-slate-50 hover:bg-slate-100 border-b border-slate-200 rounded-none"
                    >
                        <div className="flex items-center gap-3">
                            <BookOpen className="h-5 w-5 text-slate-600" />
                            <span className="font-semibold text-slate-700">Question</span>
                        </div>
                        {openSections.question ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="p-6 bg-white border-b border-slate-200">
                        <p className="text-slate-700 leading-relaxed">{task.question}</p>
                        {task.imageUrl && (
                            <img
                                src={task.imageUrl || "/placeholder.svg"}
                                alt="Task image"
                                className="mt-4 rounded-lg shadow-sm max-w-full h-auto"
                            />
                        )}
                    </div>
                </CollapsibleContent>
            </Collapsible>

            {/* Review Section */}
            <Collapsible open={openSections.review} onOpenChange={(v) => setOpenSections((prev) => ({ ...prev, review: v }))}>
                <CollapsibleTrigger asChild>
                    <Button
                        variant="ghost"
                        className="w-full justify-between p-6 h-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-none">
                        <div className="flex items-center gap-3">
                            <Target className="h-5 w-5" />
                            <span className="font-semibold">Detailed Review & Feedback</span>
                        </div>
                        {openSections.review ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50">
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className="bg-white">
                                    Word Count: {task.wordCount}
                                </Badge>
                            </div>
                        </div>
                        {task.feedback && renderFeedback(task.answer, task.feedback)}
                    </div>
                </CollapsibleContent>
            </Collapsible>

            {/* Scoring Breakdown */}
            <Collapsible
                open={openSections.scoring}
                onOpenChange={(v) => setOpenSections((prev) => ({ ...prev, scoring: v }))}
            >
                <CollapsibleTrigger asChild>
                    <Button
                        variant="ghost"
                        className="w-full justify-between p-6 h-auto bg-slate-50 hover:bg-slate-100 border-b border-slate-200 rounded-none"
                    >
                        <div className="flex items-center gap-3">
                            <Award className="h-5 w-5 text-slate-600" />
                            <span className="font-semibold text-slate-700">Scoring Breakdown</span>
                        </div>
                        {openSections.scoring ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="p-6 bg-white border-b border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                {/* Task Achievement */}
                                <div className="p-3 bg-slate-50 rounded-lg space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-slate-700">Task Achievement</span>
                                        <Badge className={getScoreColor(task.evaluation?.TaskAchievement.scoreEva || "0")}>
                                            {task.evaluation?.TaskAchievement.scoreEva}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-600 bg-white p-2 rounded border">
                                        {task.evaluation?.TaskAchievement.reviewEva}
                                    </p>
                                </div>

                                {/* Coherence & Cohesion */}
                                <div className="p-3 bg-slate-50 rounded-lg space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-slate-700">Coherence & Cohesion</span>
                                        <Badge className={getScoreColor(task.evaluation?.CoherenceCohesion.scoreEva || "0")}>
                                            {task.evaluation?.CoherenceCohesion.scoreEva}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-600 bg-white p-2 rounded border">
                                        {task.evaluation?.CoherenceCohesion.reviewEva}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Lexical Resource */}
                                <div className="p-3 bg-slate-50 rounded-lg space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-slate-700">Lexical Resource</span>
                                        <Badge className={getScoreColor(task.evaluation?.LexicalResource.scoreEva || "0")}>
                                            {task.evaluation?.LexicalResource.scoreEva}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-600 bg-white p-2 rounded border">
                                        {task.evaluation?.LexicalResource.reviewEva}
                                    </p>
                                </div>

                                {/* Grammar */}
                                <div className="p-3 bg-slate-50 rounded-lg space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-slate-700">Grammar</span>
                                        <Badge className={getScoreColor(task.evaluation?.Grammar.scoreEva || "0")}>
                                            {task.evaluation?.Grammar.scoreEva}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-600 bg-white p-2 rounded border">
                                        {task.evaluation?.Grammar.reviewEva}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>

            {/* Sample Answer */}
            <Collapsible open={openSections.sample} onOpenChange={(v) => setOpenSections((prev) => ({ ...prev, sample: v }))}>
                <CollapsibleTrigger asChild>
                    <Button
                        variant="ghost"
                        className="w-full justify-between p-6 h-auto bg-slate-50 hover:bg-slate-100 rounded-none rounded-b-lg"
                    >
                        <div className="flex items-center gap-3">
                            <BookOpen className="h-5 w-5 text-slate-600" />
                            <span className="font-semibold text-slate-700">Sample Answer</span>
                        </div>
                        {openSections.sample ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="p-6 bg-white border-b border-slate-200">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-slate-700 leading-relaxed whitespace-pre-line">{task.sampleAnswer}</p>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    )

    // =============================================================================================================
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ">
                <Button
                    onClick={() => navigate(-1)}
                    variant="outline"
                    className="mb-4 border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
                >
                    ← Back to Full Test
                </Button>
                {/*/!* Header *!/*/}
                {/*<div className="text-center mb-12">*/}
                {/*    <h1 className="text-4xl font-bold text-slate-800 mb-4">IELTS Writing Results</h1>*/}
                {/*    <p className="text-slate-600 text-lg">AI-Powered Evaluation & Feedback</p>*/}
                {/*</div>*/}

                {/* Score Overview */}
                <Card className="mb-8 overflow-hidden shadow-2xl border-0 bg-gradient-to-r from-emerald-600 to-emerald-700">
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-8">
                        <div className="text-center mb-8">
                            <div className="text-sm text-blue-100 uppercase tracking-wide font-medium">Final Score</div>
                            <div className="text-3xl font-bold mt-2">AI Examiner Evaluation</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="bg-lime-50 border-white/20">
                                <CardContent className="p-6 text-center">
                                    <div className="text-sm text-emerald-600 mb-2">Overall Score</div>
                                    <div className="text-5xl font-bold text-emerald-900 mb-2">{overallScore || "_"}</div>
                                    <div className="text-xs text-emerald-500">Weighted Average</div>
                                </CardContent>
                            </Card>

                            <Card className="bg-lime-50 border-white/20">
                                <CardContent className="p-6 text-center">
                                    <div className="text-sm text-emerald-600 mb-2">Task 1</div>
                                    <div className="text-5xl font-bold text-emerald-900 mb-2">{data.task1 && data.task1.score ? data.task1.score : "_"}</div>
                                    <div className="text-xs text-emerald-500">Academic Writing</div>
                                </CardContent>
                            </Card>

                            <Card className="bg-lime-50 border-white/20">
                                <CardContent className="p-6 text-center">
                                    <div className="text-sm text-emerald-600 mb-2">Task 2</div>
                                    <div className="text-5xl font-bold text-emerald-900 mb-2">{data.task2 && data.task2.score ? data.task2.score : "_"}</div>
                                    <div className="text-xs text-emerald-500">Essay Writing</div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </Card>

                {/* Task Tabs */}
                <div className="mb-8">
                    <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTask("task1")}
                            className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all duration-200 ${
                                activeTask === "task1" ? "bg-white text-emerald-600 shadow-md" : "text-emerald-700 hover:text-emerald-900"
                            }`}
                        >
                            <div className="flex items-center justify-center gap-3">
                                <FileText className="h-5 w-5" />
                                <div>
                                    <div className="text-lg">Task 1</div>
                                    <div className="text-sm opacity-75">Academic Writing</div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(data.task1 && data.task1.score ? data.task1.score : "0")}`}>
                                    {data.task1 && data.task1.score ? data.task1.score : "_"}
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTask("task2")}
                            className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all duration-200 ${
                                activeTask === "task2" ? "bg-white text-emerald-600 shadow-md" : "text-emerald-700 hover:text-emerald-900"
                            }`}
                        >
                            <div className="flex items-center justify-center gap-3">
                                <FileText className="h-5 w-5" />
                                <div>
                                    <div className="text-lg">Task 2</div>
                                    <div className="text-sm opacity-75">Essay Writing</div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(data.task2 && data.task2.score ? data.task2.score : "0")}`}>
                                    {data.task2 && data.task2.score ? data.task2.score : "_"}
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Active Task Content */}
                <div className="space-y-6">
                  {activeTask === "task1"
                    ? (data.task1 ? renderTaskContent(data.task1) : <Card className="p-8 text-center">No data for Task 1</Card>)
                    : (data.task2 ? renderTaskContent(data.task2) : <Card className="p-8 text-center">No data for Task 2</Card>)}
                </div>

                <div className="flex justify-center mt-8">
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg"
                    >
                        🔍 Xem Chi Tiết Giải Thích (Pop-up)
                    </Button>
                </div>
            </div>

            <DetailExplanationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                resultId={resultId}
                skill="writing"
                initialData={data}
            />
        </div>
    )
}
