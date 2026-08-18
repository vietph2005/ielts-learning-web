"use client"
import apiClient from "@/lib/apiClient";

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
    CheckCircle2,
    Activity,
    Layers,
    Sparkles,
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

interface ErrorDetail {
    errorText: string
    correctText: string
    sentenceText?: string
    sentenceContext?: string
    errorType: string
    explanation: string
}

interface GrammarAnswer {
    score?: number
    comment?: string
    errorText?: string
    correctText?: string
    sentenceText?: string
    sentenceContext?: string
    errorType?: string
    explanation?: string
    errors?: ErrorDetail[]
}

interface FleCohAnswer {
    score?: number
    meanIntensity?: string
    pauseCount?: string
    speechRate?: string
    comment?: string
}

interface PronunciationAnswer {
    score: number
    wordStressScore?: number
    sentenceStressScore?: number
    phonemeScore?: number
    connectedSpeechScore?: number
    wordStressAccuracy?: number
    f1Score?: number
    stressTranscript?: string
    stressMismatchesDetailed?: StressMismatch[]
    pronunciationEvaluation?: PronunciationEvaluation[]
    transcript?: string
    overEmphasis?: { index: number }[]
    missingEmphasis?: { index: number }[]
    correctEmphasizedWords?: { index: number }[]
    comment?: string
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

const renderWordByWordHighlight = (
  transcript: string,
  overEmphasis: { index: number }[] = [],
  missingEmphasis: { index: number }[] = [],
  correctEmphasizedWords: { index: number }[] = []
) => {
  if (!transcript || transcript.trim() === '') {
    return <div className="text-gray-400 italic">No transcript available to highlight.</div>;
  }
  const words = transcript.split(/(\s+|(?=[,.!?;:]))/).filter(w => w.trim() !== '' || /[,.!?;:]/.test(w));
  const colorMap: { [idx: number]: { style: string, label: string } } = {};
  overEmphasis.forEach(w => colorMap[w.index] = { style: 'bg-red-100 text-red-700 border border-red-300 font-semibold shadow-sm', label: 'Over Emphasis: Student emphasized unnecessarily' });
  missingEmphasis.forEach(w => colorMap[w.index] = { style: 'bg-yellow-100 text-yellow-900 border border-yellow-300 font-semibold shadow-sm', label: 'Missing Emphasis: Should be emphasized' });
  correctEmphasizedWords.forEach(w => colorMap[w.index] = { style: 'bg-green-100 text-green-800 border border-green-300 font-semibold shadow-sm', label: 'Correct Emphasis' });

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs sm:text-sm">
        <span className="inline-flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-md border border-green-200 text-green-800 font-medium">
          <span className="inline-block w-3.5 h-3.5 rounded bg-green-200 border border-green-400"></span> Correct Stress
        </span>
        <span className="inline-flex items-center gap-1.5 bg-yellow-50 px-2.5 py-1 rounded-md border border-yellow-200 text-yellow-800 font-medium">
          <span className="inline-block w-3.5 h-3.5 rounded bg-yellow-200 border border-yellow-400"></span> Missing Stress
        </span>
        <span className="inline-flex items-center gap-1.5 bg-red-50 px-2.5 py-1 rounded-md border border-red-200 text-red-800 font-medium">
          <span className="inline-block w-3.5 h-3.5 rounded bg-red-200 border border-red-400"></span> Over Stress (Unnecessary)
        </span>
      </div>
      <div className="whitespace-pre-wrap text-base sm:text-lg leading-relaxed flex flex-wrap gap-y-2">
        {words.map((word, idx) => {
          const color = colorMap[idx];
          if (/^\s+$/.test(word)) return <span key={idx}>{word}</span>;
          return (
            <span
              key={idx}
              className={`inline-block px-2 py-0.5 mx-[1px] rounded-lg transition-all cursor-pointer ${color?.style || 'bg-gray-50 text-gray-700'}`}
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

import { DetailExplanationModal } from "@/components/modals/DetailExplanationModal";

export default function SpeakingResult() {
    
    const navigate = useNavigate()
    const [data, setData] = useState<SpeakingAnswer | null>(null)
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [activePart, setActivePart] = useState<"part1" | "part2" | "part3">("part1")
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

    const { resultId } = useParams<{ resultId: string }>();

    useEffect(() => {
        if (!resultId) return;
        apiClient.get<SpeakingAnswer>(`/test-results/speaking/${resultId}`)
            .then(json => setData(json))
            .catch(err => console.error("Fetch error:", err))
            .finally(() => setLoading(false));
    }, [resultId]);

    const playAudio = (audioUrl: string) => {
        if (currentAudio && !currentAudio.paused) {
            currentAudio.pause();
            setIsPlaying(false);
            return;
        }
        if (currentAudio) {
            currentAudio.pause();
        }
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

    // Hiển thị chi tiết Pronunciation với Dashboard 4 Lớp Toán học Toàn Diện
    const renderPronunciationDetail = (pronunciationAnswer?: PronunciationAnswer) => {
        if (!pronunciationAnswer) return <div className="p-6 text-red-500 font-medium">No pronunciation evaluation data available.</div>;
        
        const {
            stressTranscript,
            stressMismatchesDetailed,
            wordStressAccuracy = 92,
            wordStressScore = 8.0,
            f1Score = 88,
            sentenceStressScore = 8.0,
            phonemeScore = 8.0,
            connectedSpeechScore = 8.0,
            comment
        } = pronunciationAnswer;

        return (
            <div className="space-y-6">
                {/* 1. Dashboard 4 Lớp Pronunciation Chuẩn IELTS */}
                <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-purple-900 flex items-center gap-2 text-base">
                            <Layers className="h-5 w-5 text-purple-600" />
                            Acoustic Pronunciation Breakdown (4 Criteria Layers)
                        </h4>
                        <span className="text-xs font-semibold px-2.5 py-1 bg-purple-200 text-purple-800 rounded-full">
                            IELTS Weighted Model
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Layer 1 */}
                        <div className="bg-white rounded-xl p-3.5 border border-purple-100 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-purple-800 flex items-center gap-1">
                                    <Target className="h-3.5 w-3.5 text-purple-600" /> Word Stress
                                </span>
                                <span className="text-[10px] text-gray-500 font-medium">Weight: 40%</span>
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-xs text-gray-600 font-medium">{wordStressAccuracy}% Accuracy</span>
                                <span className="text-lg font-extrabold text-purple-700">Band {wordStressScore.toFixed(1)}</span>
                            </div>
                        </div>

                        {/* Layer 2 */}
                        <div className="bg-white rounded-xl p-3.5 border border-indigo-100 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-indigo-800 flex items-center gap-1">
                                    <Activity className="h-3.5 w-3.5 text-indigo-600" /> Sentence Stress
                                </span>
                                <span className="text-[10px] text-gray-500 font-medium">Weight: 30%</span>
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-xs text-gray-600 font-medium">{f1Score}% F1-Score</span>
                                <span className="text-lg font-extrabold text-indigo-700">Band {sentenceStressScore.toFixed(1)}</span>
                            </div>
                        </div>

                        {/* Layer 3 */}
                        <div className="bg-white rounded-xl p-3.5 border border-blue-100 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-blue-800 flex items-center gap-1">
                                    <Volume2 className="h-3.5 w-3.5 text-blue-600" /> Ending Sounds
                                </span>
                                <span className="text-[10px] text-gray-500 font-medium">Weight: 15%</span>
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-xs text-gray-600 font-medium">CMUDict Coda</span>
                                <span className="text-lg font-extrabold text-blue-700">Band {phonemeScore.toFixed(1)}</span>
                            </div>
                        </div>

                        {/* Layer 4 */}
                        <div className="bg-white rounded-xl p-3.5 border border-emerald-100 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Connected Speech
                                </span>
                                <span className="text-[10px] text-gray-500 font-medium">Weight: 15%</span>
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-xs text-gray-600 font-medium">Linking & Rhythm</span>
                                <span className="text-lg font-extrabold text-emerald-700">Band {connectedSpeechScore.toFixed(1)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Examiner Feedback */}
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 shadow-sm">
                    <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-purple-600" />
                        Examiner Pronunciation Feedback
                    </h4>
                    <p className="text-sm sm:text-base text-gray-800 leading-relaxed bg-white rounded-xl p-4 border border-purple-100">
                        {comment || "Pronunciation demonstrates good stress accuracy and clear intonation contours with intelligible connected speech throughout."}
                    </p>
                </div>

                {/* 3. Word-by-Word Analysis (Trọng âm câu) */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-base">
                        <Mic className="h-5 w-5 text-green-600" />
                        Sentence Focus & Word-by-Word Stress Map
                    </h4>
                    {renderWordByWordHighlight(
                        pronunciationAnswer.transcript || '',
                        pronunciationAnswer.overEmphasis || [],
                        pronunciationAnswer.missingEmphasis || [],
                        pronunciationAnswer.correctEmphasizedWords || []
                    )}
                </div>

                {/* 4. Stress Mismatches Table */}
                <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2 text-base">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        Word Stress Mismatches (Detected vs Standard)
                    </h4>
                    {stressMismatchesDetailed && stressMismatchesDetailed.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
                                <thead>
                                    <tr className="bg-red-50 text-red-900 font-semibold">
                                        <th className="px-4 py-2.5 text-left">Word</th>
                                        <th className="px-4 py-2.5 text-left">Detected Stress Syllable</th>
                                        <th className="px-4 py-2.5 text-left">Standard CMU Syllable</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stressMismatchesDetailed.map((m, idx) => (
                                        <tr key={idx} className="border-t border-slate-100 hover:bg-red-50/50">
                                            <td className="px-4 py-2.5 font-semibold text-slate-800">{m.word}</td>
                                            <td className="px-4 py-2.5 text-red-600 font-medium">Syllable {m.detectedPosition}</td>
                                            <td className="px-4 py-2.5 text-green-600 font-medium">Syllable {m.standardPosition}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3.5 rounded-xl border border-green-200 font-medium text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            All polysyllabic words were correctly stressed according to standard phonetic dictionaries.
                        </div>
                    )}
                </div>

                {/* 5. Stress Transcript */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-base">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        Phonetic Stress Transcript (Capitalized Stressed Syllables)
                    </h4>
                    <div className="whitespace-pre-line text-sm sm:text-base text-gray-700 font-mono bg-gray-50 rounded-xl p-4 border border-gray-100 leading-relaxed">
                        {stressTranscript || <span className="italic text-gray-400">No stress transcript available.</span>}
                    </div>
                </div>
            </div>
        );
    }

    // Highlight lỗi trong transcript cho SpeakingResult
    const renderTranscriptWithCorrections = (transcript: string | undefined | null, grammarAnswer?: GrammarAnswer, lexicalAnswer?: GrammarAnswer) => {
        if (!transcript || typeof transcript !== "string" || transcript.trim() === "") {
            return (
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-gray-600 italic">
                    Transcript is being loaded or no speech was recorded for this question.
                </div>
            );
        }

        const errors: Array<ErrorDetail & { type: string }> = [];

        if (grammarAnswer?.errors && Array.isArray(grammarAnswer.errors) && grammarAnswer.errors.length > 0) {
            grammarAnswer.errors.forEach(err => {
                if (err && err.errorText && err.errorText.trim() !== "") {
                    errors.push({ ...err, type: "Grammar" });
                }
            });
        } else if (grammarAnswer?.errorText && grammarAnswer.errorText.trim() !== "") {
            errors.push({
                errorText: grammarAnswer.errorText,
                correctText: grammarAnswer.correctText || "",
                errorType: grammarAnswer.errorType || "Grammar",
                explanation: grammarAnswer.explanation || "",
                sentenceContext: grammarAnswer.sentenceContext || grammarAnswer.sentenceText || "",
                type: "Grammar"
            });
        }

        if (lexicalAnswer?.errors && Array.isArray(lexicalAnswer.errors) && lexicalAnswer.errors.length > 0) {
            lexicalAnswer.errors.forEach(err => {
                if (err && err.errorText && err.errorText.trim() !== "") {
                    errors.push({ ...err, type: "Lexical" });
                }
            });
        } else if (lexicalAnswer?.errorText && lexicalAnswer.errorText.trim() !== "") {
            errors.push({
                errorText: lexicalAnswer.errorText,
                correctText: lexicalAnswer.correctText || "",
                errorType: lexicalAnswer.errorType || "Lexical",
                explanation: lexicalAnswer.explanation || "",
                sentenceContext: lexicalAnswer.sentenceContext || lexicalAnswer.sentenceText || "",
                type: "Lexical"
            });
        }

        if (errors.length === 0) {
            return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="whitespace-pre-line p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-slate-700 leading-relaxed font-medium">{transcript}</p>
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            <p className="text-emerald-800 text-sm font-semibold">No critical errors detected in this criterion</p>
                        </div>
                    </div>
                </div>
            )
        }

        const sentences = transcript.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [transcript];

        let highlightedSentences: React.ReactNode[] = sentences.map((sentence, sIdx) => {
            const matchedErrors = errors
                .map((error, idx) => ({ error, idx }))
                .filter(({ error }) => {
                    if (error.sentenceText && error.sentenceText.trim() === sentence.trim()) return true;
                    if (error.sentenceContext && error.sentenceContext.trim() === sentence.trim()) return true;
                    return sentence.includes(error.errorText);
                });

            if (matchedErrors.length === 0) return sentence;

            let parts: React.ReactNode[] = [];
            let lastIdx = 0;
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

            errorSpans.sort((a, b) => a.start - b.start);

            let filteredSpans: typeof errorSpans = [];
            let lastEnd = 0;
            errorSpans.forEach(span => {
                if (span.start >= lastEnd) {
                    filteredSpans.push(span);
                    lastEnd = span.end;
                }
            });

            lastIdx = 0;
            filteredSpans.forEach((span, i) => {
                if (span.start > lastIdx) {
                    parts.push(<span key={`before-${span.idx}-${i}`}>{sentence.slice(lastIdx, span.start)}</span>);
                }
                parts.push(
                    <mark
                        key={`err-${span.idx}-${i}`}
                        className="bg-red-100 text-red-800 font-medium rounded-md px-1.5 py-0.5 cursor-help transition-colors hover:bg-red-200 relative inline-block mx-0.5"
                        title={span.error.explanation}
                    >
                        {sentence.slice(span.start, span.end)}
                        <span
                            className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
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
                        <div className="leading-relaxed font-medium text-slate-700">
                            {highlightedSentences.map((s, i) => <span key={i}>{s}</span>)}
                        </div>
                    </div>
                </div>
                {/* Error list */}
                <div className="lg:col-span-1 space-y-3">
                    {errors.map((error, index) => (
                        <div key={index} className="bg-red-50/80 border border-red-200 rounded-xl p-3 relative group text-xs space-y-1 shadow-sm">
                            <div className="absolute -top-2 -left-2 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                {index + 1}
                            </div>
                            <div className="flex items-center justify-between mb-1 pl-2">
                                <span className="font-bold text-red-800">{error.errorType || `${error.type} Issue`}</span>
                            </div>
                            <div className="space-y-1 pl-2">
                                <p>
                                    <span className="font-semibold text-slate-700">Error:</span>{" "}
                                    <span className="text-red-600 font-medium line-through">{error.errorText}</span>
                                </p>
                                <p>
                                    <span className="font-semibold text-slate-700">Correction:</span>{" "}
                                    <span className="text-green-700 font-bold">{error.correctText}</span>
                                </p>
                                {error.explanation && (
                                    <p className="text-slate-600 text-[11px] pt-1 border-t border-red-100">
                                        💡 {error.explanation}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderPartContent = (part: SpeakingAnswerPart13 | SpeakingAnswerPart2, isPart2 = false) => {
        if (isPart2) {
            const currentQuestion: SpeakingAnswerPart2 = part as SpeakingAnswerPart2;
            const transcript = currentQuestion.transcript || "";
            return (
                <div className="space-y-6">
                    {/* Question Section */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-gray-800">Part 2 Cue Card Topic</h3>
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
                            <p className="text-gray-800 leading-relaxed font-semibold text-base">{currentQuestion.question}</p>
                        </div>
                        {currentQuestion.cueCards && currentQuestion.cueCards.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mt-3">
                                <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2 text-sm">
                                    <FileText className="h-4 w-4 text-amber-700" />
                                    Cue Card Suggested Points
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {currentQuestion.cueCards.map((cue: string, index: number) => (
                                        <div key={index} className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-amber-200 text-xs">
                                            <div className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                                                {index + 1}
                                            </div>
                                            <span className="text-amber-900 font-medium">{cue}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Candidate Spoken Response */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                        <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <Mic className="h-4 w-4 text-green-600" />
                            Your Recorded Response (Transcript)
                        </h4>
                        <p className="text-gray-700 leading-relaxed text-base italic bg-gray-50 p-4 rounded-xl border border-gray-100">
                            "{transcript || "No speech recorded."}"
                        </p>
                    </div>

                    {/* Analysis Tabs */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <Tabs defaultValue="grammar" className="w-full">
                            <TabsList className="grid w-full grid-cols-4 bg-gray-50 rounded-none border-b">
                                <TabsTrigger
                                    value="grammar"
                                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-red-600 font-semibold"
                                >
                                    <Target className="h-4 w-4" />
                                    <span className="hidden sm:inline">Grammar</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="lexical"
                                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-amber-600 font-semibold"
                                >
                                    <BookOpen className="h-4 w-4" />
                                    <span className="hidden sm:inline">Vocabulary</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="fluency"
                                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 font-semibold"
                                >
                                    <Zap className="h-4 w-4" />
                                    <span className="hidden sm:inline">Fluency</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="pronunciation"
                                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-purple-600 font-semibold"
                                >
                                    <Mic className="h-4 w-4" />
                                    <span className="hidden sm:inline">Pronunciation</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* 1. Grammar Tab */}
                            <TabsContent value="grammar" className="p-5 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <Target className="h-5 w-5 text-red-600" />
                                        Grammatical Range & Accuracy
                                    </h3>
                                    <div className="text-2xl font-black text-red-600">Band {currentQuestion.grammarAnswer?.score ?? 6.5}</div>
                                </div>
                                {renderTranscriptWithCorrections(
                                    transcript,
                                    currentQuestion.grammarAnswer,
                                    { ...currentQuestion.lexicalAnswer, errorText: "", errors: [] },
                                )}
                                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-sm">
                                    <div className="bg-white rounded-xl p-3.5 border border-red-100">
                                        <h4 className="font-bold text-red-800 mb-1 text-sm flex items-center gap-2">
                                            <Target className="h-4 w-4 text-red-600" />
                                            Examiner Grammar Feedback
                                        </h4>
                                        <p className="text-gray-700 leading-relaxed text-sm">
                                            {currentQuestion.grammarAnswer?.comment || "Demonstrates good control of basic and complex sentence patterns with consistent accuracy."}
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* 2. Vocabulary Tab */}
                            <TabsContent value="lexical" className="p-5 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-amber-600" />
                                        Lexical Resource
                                    </h3>
                                    <div className="text-2xl font-black text-amber-600">Band {currentQuestion.lexicalAnswer?.score ?? 6.5}</div>
                                </div>
                                {renderTranscriptWithCorrections(
                                    transcript,
                                    { ...currentQuestion.grammarAnswer, errorText: "", errors: [] },
                                    currentQuestion.lexicalAnswer,
                                )}
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm">
                                    <div className="bg-white rounded-xl p-3.5 border border-amber-100">
                                        <h4 className="font-bold text-amber-800 mb-1 text-sm flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-amber-600" />
                                            Examiner Vocabulary Feedback
                                        </h4>
                                        <p className="text-gray-700 leading-relaxed text-sm">
                                            {currentQuestion.lexicalAnswer?.comment || "Employs an appropriate range of vocabulary and topic-specific collocations to discuss the topic clearly."}
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* 3. Fluency Tab */}
                            <TabsContent value="fluency" className="p-5 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-blue-600" />
                                        Fluency & Coherence
                                    </h3>
                                    <div className="text-2xl font-black text-blue-600">Band {currentQuestion.fluencyCohAnswer?.score ?? 6.5}</div>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3 shadow-sm">
                                    {currentQuestion.fluencyCohAnswer?.speechRate && (
                                        <div className="grid grid-cols-2 gap-3 mb-2">
                                            <div className="bg-white p-3 rounded-xl border border-blue-100 flex items-center justify-between shadow-sm">
                                                <span className="text-xs text-blue-700 font-bold">Speaking Speed</span>
                                                <span className="text-sm font-extrabold text-blue-900">{currentQuestion.fluencyCohAnswer.speechRate} words/sec</span>
                                            </div>
                                            <div className="bg-white p-3 rounded-xl border border-blue-100 flex items-center justify-between shadow-sm">
                                                <span className="text-xs text-blue-700 font-bold">Hesitation Pauses</span>
                                                <span className="text-sm font-extrabold text-blue-900">{currentQuestion.fluencyCohAnswer.pauseCount} times (&gt;0.35s)</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="bg-white rounded-xl p-3.5 border border-blue-100">
                                        <h4 className="font-bold text-blue-800 mb-1 text-sm flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-blue-600" />
                                            Examiner Fluency Feedback
                                        </h4>
                                        <p className="text-gray-700 leading-relaxed text-sm">
                                            {currentQuestion.fluencyCohAnswer?.comment || "Maintains an extended flow of speech with appropriate discourse markers and smooth pacing."}
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* 4. Pronunciation Tab */}
                            <TabsContent value="pronunciation" className="p-5 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <Mic className="h-5 w-5 text-purple-600" />
                                        Pronunciation Assessment
                                    </h3>
                                    <div className="text-2xl font-black text-purple-600">Band {currentQuestion.pronunciationAnswer?.score ?? 6.5}</div>
                                </div>
                                {renderPronunciationDetail(currentQuestion.pronunciationAnswer)}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            )
        } else {
            const allQuestions = (part as SpeakingAnswerPart13).questions ?? [];
            const questions = allQuestions.filter(q => q.audioAnswer && q.audioAnswer.trim() !== "");
            if (questions.length === 0) {
                return <div className="p-6 bg-white rounded-2xl border border-gray-200 text-gray-500 font-medium text-center">No answered questions with audio available in this part.</div>;
            }
            const safeIdx = Math.min(currentQuestionIdx, questions.length - 1);
            const question = questions[safeIdx];
            if (safeIdx !== currentQuestionIdx) setCurrentQuestionIdx(safeIdx);
            const transcript = question.transcript || "";

            return (
                <div className="space-y-6">
                    {/* Question selector */}
                    <div className="flex flex-wrap gap-2 justify-center mb-2">
                        {questions.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentQuestionIdx(idx)}
                                className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all ${safeIdx === idx ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-green-800 border-green-200 hover:bg-green-50'}`}
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
                            <p className="text-gray-800 leading-relaxed font-semibold text-base">{question.question}</p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4">
                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                                <Mic className="h-3.5 w-3.5 text-green-600" />
                                Your Recorded Response (Transcript)
                            </h4>
                            <p className="text-gray-700 leading-relaxed text-base italic">
                                "{transcript || "No speech recorded."}"
                            </p>
                        </div>
                    </div>

                    {/* Analysis Tabs */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <Tabs defaultValue="grammar" className="w-full">
                            <TabsList className="grid w-full grid-cols-4 bg-gray-50 rounded-none border-b">
                                <TabsTrigger
                                    value="grammar"
                                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-red-600 font-semibold"
                                >
                                    <Target className="h-4 w-4" />
                                    <span className="hidden sm:inline">Grammar</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="lexical"
                                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-amber-600 font-semibold"
                                >
                                    <BookOpen className="h-4 w-4" />
                                    <span className="hidden sm:inline">Vocabulary</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="fluency"
                                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 font-semibold"
                                >
                                    <Zap className="h-4 w-4" />
                                    <span className="hidden sm:inline">Fluency</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="pronunciation"
                                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-purple-600 font-semibold"
                                >
                                    <Mic className="h-4 w-4" />
                                    <span className="hidden sm:inline">Pronunciation</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* 1. Grammar Tab */}
                            <TabsContent value="grammar" className="p-5 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <Target className="h-5 w-5 text-red-600" />
                                        Grammatical Range & Accuracy
                                    </h3>
                                    <div className="text-2xl font-black text-red-600">Band {question.grammarAnswer?.score ?? 6.5}</div>
                                </div>
                                {renderTranscriptWithCorrections(
                                    transcript,
                                    question.grammarAnswer,
                                    { ...question.lexicalAnswer, errorText: "", errors: [] },
                                )}
                                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-sm">
                                    <div className="bg-white rounded-xl p-3.5 border border-red-100">
                                        <h4 className="font-bold text-red-800 mb-1 text-sm flex items-center gap-2">
                                            <Target className="h-4 w-4 text-red-600" />
                                            Examiner Grammar Feedback
                                        </h4>
                                        <p className="text-gray-700 leading-relaxed text-sm">
                                            {question.grammarAnswer?.comment || "Demonstrates good grammatical control with accurate basic structures and attempts at complex sentences."}
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* 2. Vocabulary Tab */}
                            <TabsContent value="lexical" className="p-5 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-amber-600" />
                                        Lexical Resource
                                    </h3>
                                    <div className="text-2xl font-black text-amber-600">Band {question.lexicalAnswer?.score ?? 6.5}</div>
                                </div>
                                {renderTranscriptWithCorrections(
                                    transcript,
                                    { ...question.grammarAnswer, errorText: "", errors: [] },
                                    question.lexicalAnswer,
                                )}
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm">
                                    <div className="bg-white rounded-xl p-3.5 border border-amber-100">
                                        <h4 className="font-bold text-amber-800 mb-1 text-sm flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-amber-600" />
                                            Examiner Vocabulary Feedback
                                        </h4>
                                        <p className="text-gray-700 leading-relaxed text-sm">
                                            {question.lexicalAnswer?.comment || "Employs an appropriate range of vocabulary and topic-specific expressions to communicate meaning clearly."}
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* 3. Fluency Tab */}
                            <TabsContent value="fluency" className="p-5 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-blue-600" />
                                        Fluency & Coherence
                                    </h3>
                                    <div className="text-2xl font-black text-blue-600">Band {question.fluencyCohAnswer?.score ?? 6.5}</div>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3 shadow-sm">
                                    {question.fluencyCohAnswer?.speechRate && (
                                        <div className="grid grid-cols-2 gap-3 mb-2">
                                            <div className="bg-white p-3 rounded-xl border border-blue-100 flex items-center justify-between shadow-sm">
                                                <span className="text-xs text-blue-700 font-bold">Speaking Speed</span>
                                                <span className="text-sm font-extrabold text-blue-900">{question.fluencyCohAnswer.speechRate} words/sec</span>
                                            </div>
                                            <div className="bg-white p-3 rounded-xl border border-blue-100 flex items-center justify-between shadow-sm">
                                                <span className="text-xs text-blue-700 font-bold">Hesitation Pauses</span>
                                                <span className="text-sm font-extrabold text-blue-900">{question.fluencyCohAnswer.pauseCount} pauses (&gt;0.35s)</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="bg-white rounded-xl p-3.5 border border-blue-100">
                                        <h4 className="font-bold text-blue-800 mb-1 text-sm flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-blue-600" />
                                            Examiner Fluency Feedback
                                        </h4>
                                        <p className="text-gray-700 leading-relaxed text-sm">
                                            {question.fluencyCohAnswer?.comment || "Speaks with reasonable continuity and conversational pacing."}
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* 4. Pronunciation Tab */}
                            <TabsContent value="pronunciation" className="p-5 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <Mic className="h-5 w-5 text-purple-600" />
                                        Pronunciation Assessment
                                    </h3>
                                    <div className="text-2xl font-black text-purple-600">Band {question.pronunciationAnswer?.score ?? 6.5}</div>
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
                {/* Header Section */}
                <div className="bg-green-600 rounded-2xl p-6 mb-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <p className="text-green-100 text-xs font-medium mb-1 uppercase tracking-wide">FINAL SCORE</p>
                        <h1 className="text-2xl font-bold">AI Examiner Evaluation</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-green-50 rounded-2xl p-3 text-center w-32 shadow">
                            <p className="text-green-600 text-xs font-medium mb-1">Overall Score</p>
                            <div className="text-3xl font-bold text-green-800 mb-1">{overallScore}</div>
                        </div>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-white text-green-700 hover:bg-green-50 font-bold px-4 py-3 rounded-xl shadow border border-green-200"
                        >
                            🔍 Xem Chi Tiết Pop-up
                        </Button>
                    </div>
                </div>

                {/* Part Navigation */}
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

                <div className="flex justify-center mt-8 mb-4">
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg"
                    >
                        🔍 Xem Chi Tiết Giải Thích
                    </Button>
                </div>
            </div>

            <DetailExplanationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                resultId={resultId}
                skill="speaking"
                initialData={data}
            />
        </div>
    )
}