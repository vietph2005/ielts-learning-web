"use client"

import { useEffect, useState } from "react"
import {
    FileText,
    BookOpen,
    Target,
    Zap,
    Mic,
    Volume2,
    Play,
    Pause,
    Clock,
    AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {useNavigate, useParams} from "react-router-dom";
import { urlDecrypt } from "@/lib/utils"

interface StressMismatch {
    word: string
    detectedPosition?: number | string
    standardPosition?: number | string
    start: number
    end: number
    index?: number | string
}

interface PronunciationEvaluation {
    word: string
    feedback?: string
    isCorrect?: boolean
    stress?: string
}

interface GrammarAnswer {
    score?: number
    errorText: string
    correctText: string
    sentenceText: string
    errorType: string
    explanation: string
}

interface FleCohAnswer {
    score?: number
    meanIntensity: string
    pauseCount: string
    speechRate: string
    comment: string
}

interface PronunciationAnswer {
    score: number
    stressTranscript: string
    stressMismatchesDetailed: StressMismatch[]
    pronunciationEvaluation: PronunciationEvaluation[]
    transcript: string;
    overEmphasis: { index: number }[];
    missingEmphasis: { index: number }[];
    correctEmphasizedWords: { index: number }[];
    comment?: string; // Added comment field
}

interface SpeakingAnswerQuestion {
    question: string
    transcript: string
    audioAnswer: string
    score: number
    grammarAnswer: GrammarAnswer
    lexicalAnswer: GrammarAnswer
    pronunciationAnswer: PronunciationAnswer
    fluencyCohAnswer: FleCohAnswer
}

interface SpeakingAnswerPart13 {
    partNumber: number
    title: string
    instruction: string
    questions?: SpeakingAnswerQuestion[]
    averageScore: number
}

interface SpeakingAnswerPart2 {
    partNumber: number
    title: string
    question: string
    transcript: string
    audioAnswer: string
    score: number
    grammarAnswer: GrammarAnswer
    lexicalAnswer: GrammarAnswer
    pronunciationAnswer: PronunciationAnswer
    fluencyCohAnswer: FleCohAnswer
    cueCards: string[]
}

interface SpeakingAnswer {
    id: string
    testId: string
    username?: string
    skill: string
    part1: SpeakingAnswerPart13
    part2: SpeakingAnswerPart2
    part3: SpeakingAnswerPart13
    band?: number
    submittedAt?: string
}

// Đặt hàm renderWordByWordHighlight ở đầu file, trước export default function SpeakingResult hoặc ít nhất trước renderPronunciationDetail
const renderWordByWordHighlight = (
  transcript: string,
  overEmphasis: { index: number }[],
  missingEmphasis: { index: number }[],
  correctEmphasizedWords: { index: number }[]
) => {
  // Tách transcript thành mảng từ giống backend
  const words = transcript.split(/(\s+|(?=[,.!?;:]))/).filter(w => w.trim() !== '' || /[,.!?;:]/.test(w));
  // Tạo map index -> { style, label }
  const colorMap: { [idx: number]: { style: string, label: string } } = {};
  overEmphasis.forEach(w => colorMap[w.index] = { style: 'bg-red-100 text-red-700 border border-red-300 font-semibold shadow-sm', label: 'Over Emphasis: Student emphasized unnecessarily' });
  missingEmphasis.forEach(w => colorMap[w.index] = { style: 'bg-yellow-100 text-yellow-900 border border-yellow-300 font-semibold shadow-sm', label: 'Missing Emphasis: Should be emphasized' });
  correctEmphasizedWords.forEach(w => colorMap[w.index] = { style: 'bg-green-100 text-green-800 border border-green-300 font-semibold shadow-sm', label: 'Correct Emphasis' });

  return (
    <div>
      {/* Legend */}
      <div className="flex gap-4 mb-4 text-sm">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-4 h-4 rounded bg-green-100 border border-green-300"></span> Correct
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-4 h-4 rounded bg-yellow-100 border border-yellow-300"></span> Missing
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-4 h-4 rounded bg-red-100 border border-red-300"></span> Over
        </span>
      </div>
      <div className="whitespace-pre-wrap text-lg leading-relaxed flex flex-wrap gap-y-2">
        {words.map((word, idx) => {
          const color = colorMap[idx];
          // Nếu là dấu cách thì render bình thường
          if (/^\\s+$/.test(word)) return <span key={idx}>{word}</span>;
          return (
            <span
              key={idx}
              className={`inline-block px-2 py-1 mx-[1px] rounded-lg transition-all cursor-pointer ${color?.style || 'bg-gray-50'}`}
              title={color?.label || ''}
              style={{ minWidth: '1.5em', textAlign: 'center' }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default function SpeakingResult() {
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate()
    const [data, setData] = useState<SpeakingAnswer | null>(null)
    const [loading, setLoading] = useState(true)
    const [activePart, setActivePart] = useState<"part1" | "part2" | "part3">("part1")
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
    // State for current question index in part1/part3
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

    const { resultId } = useParams  <{ resultId: string }>();

    useEffect(() => {
        fetch(`${API_URL}/api/result/speaking/${resultId}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch data");
                return res.json();
            })
            .then(json => setData(json))
            .catch(err => console.error("Fetch error:", err))
            .finally(() => setLoading(false));
    }, [resultId]);


    // const calculateOverallScore = () => {
    //     if (!data) return 0
    //     const scores = [data.part1?.averageScore ?? 0, data.part2?.score ?? 0, data.part3?.averageScore ?? 0]
    //     const validScores = scores.filter((s) => typeof s === "number" && !isNaN(s))
    //     if (validScores.length === 0) return 0
    //     const avg = validScores.reduce((a, b) => a + b, 0) / validScores.length
    //     return Math.round(avg * 10) / 10
    // }

    const playAudio = (audioUrl: string) => {
        // Nếu đang phát audio này, thì pause
        if (currentAudio && !currentAudio.paused) {
            currentAudio.pause();
            setIsPlaying(false);
            return;
        }
        // Nếu đang phát audio khác, dừng lại
        if (currentAudio) {
            currentAudio.pause();
        }
        // Giải mã nếu là mã hóa base64url
        let url = audioUrl;
        if (!/^https?:\/\//.test(audioUrl)) {
            try {
                url = urlDecrypt(audioUrl)
            } catch (e) {
                url = audioUrl
            }
        }
        if (!url) return
        const audio = new Audio(url)
        audio.onplay = () => setIsPlaying(true)
        audio.onpause = () => setIsPlaying(false)
        audio.onended = () => setIsPlaying(false)
        audio.onerror = () => setIsPlaying(false)
        setCurrentAudio(audio)
        audio.play().catch(() => setIsPlaying(false))
    }

    // Hiển thị chi tiết Pronunciation (đầy đủ trường mới)
    const renderPronunciationDetail = (pronunciationAnswer?: PronunciationAnswer) => {
        if (!pronunciationAnswer) return <div className="text-red-500">No pronunciation data.</div>;
        const { stressTranscript, stressMismatchesDetailed} = pronunciationAnswer;
        return (
            <div className="space-y-6">
                {/* Stress Transcript */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Mic className="h-5 w-5 text-green-600" />
                        Stress Transcript
                    </h4>
                    <div className="whitespace-pre-line text-base text-gray-700 font-mono bg-gray-50 rounded-xl p-4 border border-gray-100">
                        {stressTranscript || <span className="italic text-gray-400">No stress transcript available.</span>}
                    </div>
                </div>
                {/* Stress Mismatches Table */}
                <div className="bg-white border border-red-200 rounded-2xl p-6">
                    <h4 className="font-semibold text-red-700 mb-4 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        Stress Mismatches
                    </h4>
                    {stressMismatchesDetailed && stressMismatchesDetailed.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm border border-slate-200 rounded-xl">
                                <thead>
                                    <tr className="bg-red-50">
                                        <th className="px-3 py-2 text-left">Word</th>
                                        <th className="px-3 py-2 text-left">Detected Position</th>
                                        <th className="px-3 py-2 text-left">Standard Position</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stressMismatchesDetailed.map((m, idx) => (
                                        <tr key={idx} className="border-t border-slate-100">
                                            <td className="px-3 py-2 font-semibold text-slate-800">{m.word}</td>
                                            <td className="px-3 py-2">{m.detectedPosition}</td>
                                            <td className="px-3 py-2">{m.standardPosition}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-green-600">No stress mismatches detected.</div>
                    )}
                </div>
                {/* Word-by-word analysis */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Mic className="h-5 w-5 text-green-600" />
                        Word-by-Word Analysis
                    </h4>
                    {renderWordByWordHighlight(
                        pronunciationAnswer.transcript || '',
                        pronunciationAnswer.overEmphasis || [],
                        pronunciationAnswer.missingEmphasis || [],
                        pronunciationAnswer.correctEmphasizedWords || []
                    )}
                </div>
                {/* Pronunciation Feedback */}
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
                    <h4 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-purple-600" />
                        Examiner Feedback
                    </h4>
                    <div className="text-base text-gray-800">
                        {pronunciationAnswer.comment ? (
                            <span>{pronunciationAnswer.comment}</span>
                        ) : (
                            <span className="italic text-gray-400">No feedback available.</span>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Thêm hàm mới để highlight lỗi trong transcript cho SpeakingResult (like WritingResult)
    const renderTranscriptWithCorrections = (transcript: string | undefined | null, grammarAnswer: GrammarAnswer, lexicalAnswer: GrammarAnswer) => {
        // Bảo vệ nếu transcript null/undefined
        if (!transcript || typeof transcript !== "string") {
            return (
                <div className="p-6 text-red-500">No transcript available.</div>
            );
        }
        // Gom các lỗi lại (grammar và lexical)
        const errors: Array<GrammarAnswer & { type: string }> = [];
        if (grammarAnswer?.errorText) errors.push({ ...grammarAnswer, type: "Grammar" });
        if (lexicalAnswer?.errorText) errors.push({ ...lexicalAnswer, type: "Lexical" });
        if (errors.length === 0) {
            return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="whitespace-pre-line p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-slate-700 leading-relaxed">{transcript}</p>
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
        // Tách transcript thành các câu
        const sentences = transcript.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [transcript];
        // Gom lỗi theo từng câu (ưu tiên sentenceText, fallback errorText xuất hiện trong câu)
        let highlightedSentences: React.ReactNode[] = sentences.map((sentence, sIdx) => {
            // Lấy các lỗi thuộc về câu này (ưu tiên sentenceText, nếu không có thì errorText xuất hiện trong câu)
            const matchedErrors = errors
                .map((error, idx) => ({ error, idx }))
                .filter(({ error }) => {
                    if (error.sentenceText && error.sentenceText.trim() === sentence.trim()) return true;
                    return sentence.includes(error.errorText);

                });
            if (matchedErrors.length === 0) return sentence;
            // Tìm tất cả vị trí xuất hiện của từng errorText trong câu, highlight lần lượt
            let parts: React.ReactNode[] = [];
            let lastIdx = 0;
            // Tạo mảng các lỗi với vị trí xuất hiện (có thể trùng lặp)
            let errorSpans: { start: number, end: number, error: typeof errors[0], idx: number }[] = [];
            matchedErrors.forEach(({ error, idx }) => {
                let searchStart = 0;
                while (searchStart < sentence.length) {
                    const foundIdx = sentence.indexOf(error.errorText, searchStart);
                    if (foundIdx === -1) break;
                    errorSpans.push({ start: foundIdx, end: foundIdx + error.errorText.length, error, idx });
                    searchStart = foundIdx + error.errorText.length;
                }
            });
            // Sắp xếp theo vị trí xuất hiện
            errorSpans.sort((a, b) => a.start - b.start);
            // Loại bỏ highlight lồng nhau
            let filteredSpans: typeof errorSpans = [];
            let lastEnd = 0;
            errorSpans.forEach(span => {
                if (span.start >= lastEnd) {
                    filteredSpans.push(span);
                    lastEnd = span.end;
                }
            });
            // Tạo các phần tử highlight
            lastIdx = 0;
            filteredSpans.forEach((span, i) => {
                if (span.start > lastIdx) {
                    parts.push(<span key={`before-${span.idx}-${i}`}>{sentence.slice(lastIdx, span.start)}</span>);
                }
                parts.push(
                    <mark
                        key={`err-${span.idx}-${i}`}
                        className="bg-red-100 text-red-800 font-medium rounded-md px-2 py-1 cursor-help transition-colors hover:bg-red-200 relative"
                        title={span.error.explanation}
                    >
                        {sentence.slice(span.start, span.end)}
                        <span
                            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {span.idx + 1}
                        </span>
                    </mark>
                );
                lastIdx = span.end;
            });
            if (lastIdx < sentence.length) {
                parts.push(<span key={`after-last-${sIdx}`}>{sentence.slice(lastIdx)}</span>);
            }
            return <span key={`sentence-${sIdx}`}>{parts}</span>;
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
                    {errors.map((error, index) => (
                        <div key={index} className="bg-red-50 border border-red-200 rounded-md p-2 relative group text-[12px] space-y-1" style={{ overflow: 'visible' }}>
                            <div className="absolute -top-2 -left-2 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                {index + 1}
                            </div>
                            {/* Dấu hỏi ở góc trên phải */}
                            <div className="absolute top-1 right-1">
                                <button
                                    className="text-blue-500 hover:text-blue-700 focus:outline-none"
                                    tabIndex={0}
                                    style={{ verticalAlign: 'top' }}
                                    onFocus={e => e.currentTarget.classList.add('ring-2', 'ring-blue-300')}
                                    onBlur={e => e.currentTarget.classList.remove('ring-2', 'ring-blue-300')}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="inline h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#fff" />
                                        <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#3b82f6" fontWeight="bold">?</text>
                                    </svg>
                                </button>
                                <div className="hidden group-hover:block group-focus-within:block absolute z-50 bottom-full mb-2 right-0 min-w-[140px] max-w-xs bg-white border border-slate-300 rounded-md shadow-lg p-2 text-[11px] text-slate-700 whitespace-pre-line">
                                    {error.explanation}
                                </div>
                            </div>
                            <span className="text-[11px] border-red-300 text-red-700 mb-1 font-semibold">{error.type} Error</span>
                            <div className="flex justify-between items-start w-full">
                                <div className="flex-1 space-y-0.5">
                                    <p className="text-[11px]">
                                        <span className="font-medium text-slate-700">Error:</span>{" "}
                                        <span className="text-red-600 font-medium">{error.errorText}</span>
                                    </p>
                                    <p className="text-[11px]">
                                        <span className="font-medium text-slate-700">Fix:</span>{" "}
                                        <span className="text-green-600 font-medium">{error.correctText}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderPartContent = (part: SpeakingAnswerPart13 | SpeakingAnswerPart2, isPart2 = false) => {
        if (isPart2) {
            // part2: render 1 question
            const currentQuestion: SpeakingAnswerPart2 = part as SpeakingAnswerPart2;
            return (
                <div className="space-y-6">
                    {/* Question Section */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-gray-800">Question</h3>
                                <Button
                                    onClick={() => playAudio(currentQuestion.audioAnswer)}
                                    className="ml-2 bg-green-600 hover:bg-green-700 w-9 h-9 rounded-full shadow"
                                    size="icon"
                                >
                                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                                </Button>
                            </div>
                        </div>
                        <div className="bg-green-50 border-l-4 border-l-green-500 rounded-r-xl p-4 mb-2">
                            <p className="text-gray-800 leading-relaxed font-medium text-base">{currentQuestion.question}</p>
                        </div>
                        {currentQuestion.cueCards && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mt-2">
                                <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2 text-sm">
                                    <FileText className="h-4 w-4" />
                                    Cue Card Points
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {currentQuestion.cueCards.map((cue: string, index: number) => (
                                        <div key={index} className="flex items-center gap-2 bg-white rounded-lg p-2 border border-amber-200">
                                            <div className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                {index + 1}
                                            </div>
                                            <span className="text-amber-800 font-medium text-sm">{cue}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Your Response - full width */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col justify-center">
                        <h4 className="text-base font-semibold text-gray-800 mb-1">Your Response</h4>
                        <p className="text-gray-700 leading-relaxed text-base italic">
                            "{currentQuestion.transcript}"
                        </p>
                    </div>
                    {/* Analysis Tabs - giống part1/part3 */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <Tabs defaultValue="grammar" className="w-full">
                            <TabsList className="grid w-full grid-cols-4 bg-gray-50 rounded-none border-b">
                                <TabsTrigger
                                    value="grammar"
                                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-red-600"
                                >
                                    <Target className="h-4 w-4" />
                                    <span className="hidden sm:inline">Grammar</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="lexical"
                                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-amber-600"
                                >
                                    <BookOpen className="h-4 w-4" />
                                    <span className="hidden sm:inline">Vocabulary</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="fluency"
                                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                                >
                                    <Zap className="h-4 w-4" />
                                    <span className="hidden sm:inline">Fluency</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="pronunciation"
                                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-purple-600"
                                >
                                    <Mic className="h-4 w-4" />
                                    <span className="hidden sm:inline">Pronunciation</span>
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="grammar" className="p-4 space-y-3">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <Target className="h-5 w-5 text-red-600" />
                                        Grammar & Accuracy
                                    </h3>
                                    <div className="text-xl font-bold text-red-600">{currentQuestion.grammarAnswer?.score ?? "-"}</div>
                                </div>
                                {renderTranscriptWithCorrections(
                                    currentQuestion.transcript,
                                    currentQuestion.grammarAnswer,
                                    { ...currentQuestion.lexicalAnswer, errorText: "" },
                                )}
                            </TabsContent>
                            <TabsContent value="lexical" className="p-4 space-y-3">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-amber-600" />
                                        Lexical Resource
                                    </h3>
                                    <div className="text-xl font-bold text-amber-600">{currentQuestion.lexicalAnswer?.score ?? "-"}</div>
                                </div>
                                {renderTranscriptWithCorrections(
                                    currentQuestion.transcript,
                                    { ...currentQuestion.grammarAnswer, errorText: "" },
                                    currentQuestion.lexicalAnswer,
                                )}
                            </TabsContent>
                            <TabsContent value="fluency" className="p-4 space-y-3">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-blue-600" />
                                        Fluency & Coherence
                                    </h3>
                                    <div className="text-xl font-bold text-blue-600">{currentQuestion.fluencyCohAnswer?.score ?? "-"}</div>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                                    <div className="bg-white rounded-xl p-3 border border-blue-200">
                                        <h4 className="font-semibold text-blue-800 mb-2 text-sm">Examiner Feedback</h4>
                                        <p className="text-gray-700 leading-relaxed text-base">{currentQuestion.fluencyCohAnswer?.comment ?? ""}</p>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="pronunciation" className="p-4 space-y-3">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <Mic className="h-5 w-5 text-purple-600" />
                                        Pronunciation Assessment
                                    </h3>
                                    <div className="text-xl font-bold text-purple-600">{currentQuestion.pronunciationAnswer?.score ?? "-"}</div>
                                </div>
                                {renderPronunciationDetail(currentQuestion.pronunciationAnswer)}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            )
        } else {
            // part1 or part3: chỉ hiển thị 1 câu hỏi, có thanh chọn câu hỏi
            // Lọc chỉ lấy các câu có audioAnswer
            const allQuestions = (part as SpeakingAnswerPart13).questions ?? [];
            const questions = allQuestions.filter(q => q.audioAnswer && q.audioAnswer.trim() !== "");
            // Nếu không còn câu nào có audio, trả về thông báo
            if (questions.length === 0) {
                return <div className="p-6 text-red-500">No answered questions with audio available.</div>;
            }
            // Đảm bảo currentQuestionIdx không vượt quá số lượng câu hỏi
            const safeIdx = Math.min(currentQuestionIdx, questions.length - 1);
            const question = questions[safeIdx];
            if (safeIdx !== currentQuestionIdx) setCurrentQuestionIdx(safeIdx);
            return (
                <div className="space-y-6">
                    {/* Thanh chọn câu hỏi */}
                    <div className="flex flex-wrap gap-2 justify-center mb-2">
                        {questions.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentQuestionIdx(idx)}
                                className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${safeIdx === idx ? 'bg-green-600 text-white border-green-600 shadow' : 'bg-white text-green-700 border-green-200 hover:bg-green-50'}`}
                            >
                                Question {idx + 1}
                            </button>
                        ))}
                    </div>
                    {/* Question Section + Audio + Transcript */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                Question {currentQuestionIdx + 1}
                                <Button
                                    onClick={() => playAudio(question.audioAnswer)}
                                    className="ml-2 bg-green-600 hover:bg-green-700 w-9 h-9 rounded-full shadow"
                                    size="icon"
                                >
                                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                                </Button>
                            </h3>
                        </div>
                        <div className="bg-green-50 border-l-4 border-l-green-500 rounded-r-xl p-4 mb-2">
                            <p className="text-gray-800 leading-relaxed font-medium text-base">{question.question}</p>
                        </div>
                        {/* Your Response ngay dưới câu hỏi */}
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4">
                            <h4 className="text-base font-semibold text-gray-800 mb-1">Your Response</h4>
                            <p className="text-gray-700 leading-relaxed text-base italic">
                                "{question.transcript}"
                            </p>
                        </div>
                    </div>
                    {/* Analysis Tabs giữ nguyên */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        {/* ... giữ nguyên phần Tabs ... */}
                        <Tabs defaultValue="grammar" className="w-full">
                            <TabsList className="grid w-full grid-cols-4 bg-gray-50 rounded-none border-b">
                                <TabsTrigger
                                    value="grammar"
                                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-red-600"
                                >
                                    <Target className="h-4 w-4" />
                                    <span className="hidden sm:inline">Grammar</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="lexical"
                                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-amber-600"
                                >
                                    <BookOpen className="h-4 w-4" />
                                    <span className="hidden sm:inline">Vocabulary</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="fluency"
                                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                                >
                                    <Zap className="h-4 w-4" />
                                    <span className="hidden sm:inline">Fluency</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="pronunciation"
                                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-purple-600"
                                >
                                    <Mic className="h-4 w-4" />
                                    <span className="hidden sm:inline">Pronunciation</span>
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="grammar" className="p-4 space-y-3">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <Target className="h-5 w-5 text-red-600" />
                                        Grammar & Accuracy
                                    </h3>
                                    <div className="text-xl font-bold text-red-600">{question.grammarAnswer?.score ?? "-"}</div>
                                </div>
                                {renderTranscriptWithCorrections(
                                    question.transcript,
                                    question.grammarAnswer,
                                    { ...question.lexicalAnswer, errorText: "" },
                                )}
                            </TabsContent>
                            <TabsContent value="lexical" className="p-4 space-y-3">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-amber-600" />
                                        Lexical Resource
                                    </h3>
                                    <div className="text-xl font-bold text-amber-600">{question.lexicalAnswer?.score ?? "-"}</div>
                                </div>
                                {renderTranscriptWithCorrections(
                                    question.transcript,
                                    { ...question.grammarAnswer, errorText: "" },
                                    question.lexicalAnswer,
                                )}
                            </TabsContent>
                            <TabsContent value="fluency" className="p-4 space-y-3">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-blue-600" />
                                        Fluency & Coherence
                                    </h3>
                                    <div className="text-xl font-bold text-blue-600">{question.fluencyCohAnswer?.score ?? "-"}</div>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                                    <div className="bg-white rounded-xl p-3 border border-blue-200">
                                        <h4 className="font-semibold text-blue-800 mb-2 text-sm">Examiner Feedback</h4>
                                        <p className="text-gray-700 leading-relaxed text-base">{question.fluencyCohAnswer?.comment ?? ""}</p>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="pronunciation" className="p-4 space-y-3">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <Mic className="h-5 w-5 text-purple-600" />
                                        Pronunciation Assessment
                                    </h3>
                                    <div className="text-xl font-bold text-purple-600">{question.pronunciationAnswer?.score ?? "-"}</div>
                                </div>
                                {renderPronunciationDetail(question.pronunciationAnswer)}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            )
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center space-y-6">
                    <div className="animate-spin rounded-full h-20 w-20 border-4 border-green-200 border-t-green-600 mx-auto"></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Your Results</h2>
                        <p className="text-gray-600">Please wait while we prepare your detailed analysis...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mic className="h-10 w-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No Results Found</h2>
                    <p className="text-gray-600">Please check your result ID and try again</p>
                </div>
            </div>
        )
    }

    const overallScore = data.band ?? "-";

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center">
            <div className="w-full max-w-4xl mx-auto px-2 sm:px-8 py-8">
                <Button
                    onClick={() => navigate(-1)}
                    variant="outline"
                    className="mb-4 border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
                >
                    ← Back to Full Test
                </Button>
                {/* Header Section - Matching the design */}
                <div className="bg-green-600 rounded-2xl p-4 mb-6 text-white">
                    <div className="text-center mb-4">
                        <p className="text-green-100 text-xs font-medium mb-1 uppercase tracking-wide">FINAL SCORE</p>
                        <h1 className="text-2xl font-bold mb-4">AI Examiner Evaluation</h1>
                    </div>
                    <div className="flex justify-center">
                        <div className="bg-green-50 rounded-2xl p-3 text-center w-32">
                            <p className="text-green-600 text-xs font-medium mb-1">Overall Score</p>
                            <div className="text-3xl font-bold text-green-800 mb-1">{overallScore}</div>
                        </div>
                    </div>
                </div>

                {/* Part Navigation - Matching the design */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-6">
                    <button
                        onClick={() => setActivePart("part1")}
                        className={`bg-white rounded-2xl p-3 text-left border-2 transition-all text-xs ${
                            activePart === "part1" ? "border-green-500 shadow-lg" : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <FileText className="h-3 w-3 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-green-600 text-xs">Part 1</h3>
                                <p className="text-gray-600 text-[10px]">Introduction & Interview</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-bold text-green-600">{data.part1.averageScore}</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActivePart("part2")}
                        className={`bg-white rounded-2xl p-3 text-left border-2 transition-all text-xs ${
                            activePart === "part2" ? "border-green-500 shadow-lg" : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <FileText className="h-3 w-3 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-green-600 text-xs">Part 2</h3>
                                <p className="text-gray-600 text-[10px]">Long Turn</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-bold text-green-600">{data.part2.score}</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActivePart("part3")}
                        className={`bg-white rounded-2xl p-3 text-left border-2 transition-all text-xs ${
                            activePart === "part3" ? "border-green-500 shadow-lg" : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <FileText className="h-3 w-3 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-green-600 text-xs">Part 3</h3>
                                <p className="text-gray-600 text-[10px]">Two-way Discussion</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-bold text-green-600">{data.part3.averageScore}</span>
                        </div>
                    </button>
                </div>

                {/* Content */}
                <div>
                    {activePart === "part1" && renderPartContent(data.part1, false)}
                    {activePart === "part2" && renderPartContent(data.part2, true)}
                    {activePart === "part3" && renderPartContent(data.part3, false)}
                </div>
            </div>
        </div>
    )
}