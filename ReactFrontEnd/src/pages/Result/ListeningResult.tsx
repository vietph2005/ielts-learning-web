import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Clock, Target, BookOpen, Headphones } from "lucide-react"
import {useNavigate, useParams} from "react-router-dom"

const API_URL = import.meta.env.VITE_API_URL

export default function ListeningResult() {
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { resultId } = useParams<{ resultId: string }>()
    const [currentTaskIdx, setCurrentTaskIdx] = useState(0)
    const navigate = useNavigate()

    useEffect(() => {
        if (!resultId) return
        setLoading(true)
        fetch(`${API_URL}/api/result/listening/by-id?answerId=${resultId}`)
            .then((res) => {
                if (!res.ok) throw new Error("Not found result")
                return res.json()
            })
            .then((data) => {
                setResult(data)
                setLoading(false)
            })
            .catch((e) => {
                setError(e.message)
                setLoading(false)
            })
    }, [resultId])

    // Total question, total correct, total incorrect, percentage
    const calcStats = (result: any) => {
        return {
            percentage: result.totalQuestions ? Math.round((result.totalCorrect / result.totalQuestions) * 100) : 0,
        }
    }

    // Calculate when ensure result is not null
    const stats = result ? calcStats(result) : { totalQuestions: 0, totalCorrect: 0, percentage: 0 }

    const getBandColor = (band: number) => {
        if (band >= 8.0) return "text-green-700"
        if (band >= 6.5) return "text-green-600"
        if (band >= 5.5) return "text-yellow-600"
        return "text-red-600"
    }

    const getBandDescription = (band: number) => {
        if (band >= 8.0) return "Very Good User"
        if (band >= 7.0) return "Good User"
        if (band >= 6.0) return "Competent User"
        if (band >= 5.0) return "Modest User"
        return "Limited User"
    }

    const isAnswerCorrect = (q: any, type: string) => {
        if (!q.studentAnswer || !q.answer) return false
        const isSpecialType = type === "multiple-choice" || type === "dropdown"
        const extractFirstLetters = (ans: string) => {
            return ans
                .split(",")
                .map((s) => s.trim().charAt(0).toUpperCase())
                .sort()
                .join(",")
        }
        if (isSpecialType) {
            const student = extractFirstLetters(q.studentAnswer)
            const correct = extractFirstLetters(q.answer)
            return student === correct
        }
        const studentAns = q.studentAnswer.toString().trim().toLowerCase()
        const correctAns = q.answer.toString().trim().toLowerCase()
        return studentAns.includes(correctAns) || correctAns.includes(studentAns)
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

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Headphones className="h-10 w-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No Results Found</h2>
                    <p className="text-gray-600">Please check your result ID and try again</p>
                </div>
            </div>
        )
    }

    if (!result) return null

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

                {/* Header Section - Matching SpeakingResult design */}
                <div className="bg-green-600 rounded-2xl p-4 mb-6 text-white">
                    <div className="text-center mb-4">
                        <p className="text-green-100 text-xs font-medium mb-1 uppercase tracking-wide">FINAL SCORE</p>
                        <h1 className="text-2xl font-bold mb-4">IELTS Listening Result</h1>
                    </div>
                    <div className="flex justify-center">
                        <div className="bg-green-50 rounded-2xl p-3 text-center w-32">
                            <p className="text-green-600 text-xs font-medium mb-1">Band Score</p>
                            <div className="text-3xl font-bold text-green-800 mb-1">{result.band}</div>
                            <p className="text-green-600 text-xs">/9.0</p>
                        </div>
                    </div>
                </div>

                {/* Stats Navigation - Matching SpeakingResult design */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-6">
                    <div className="bg-white rounded-2xl p-3 text-left border-2 border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <Target className="h-3 w-3 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-green-600 text-xs">Accuracy</h3>
                                <p className="text-gray-600 text-[10px]">{getBandDescription(result.band)}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-bold text-green-600">{stats.percentage}%</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-3 text-left border-2 border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-green-600 text-xs">Correct</h3>
                                <p className="text-gray-600 text-[10px]">Questions answered correctly</p>
                            </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-green-600">
                            {result.totalCorrect}/{result.totalQuestions}
                          </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-3 text-left border-2 border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <Clock className="h-3 w-3 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-green-600 text-xs">Duration</h3>
                                <p className="text-gray-600 text-[10px]">Test completion time</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-bold text-green-600">60 min</span>
                        </div>
                    </div>
                </div>

                {/* Task Navigation Buttons */}
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {result.tasks?.map((task: any, idx: number) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentTaskIdx(idx)}
                            className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${
                                currentTaskIdx === idx
                                    ? "bg-green-600 text-white border-green-600 shadow"
                                    : "bg-white text-green-700 border-green-200 hover:bg-green-50"}`}>
                            Part {task.taskNumber}
                        </button>
                    ))}
                </div>

                {/* Combined Content - Performance Overview + Detailed Questions */}
                <div className="space-y-6">
                    {/* Performance Overview */}
                    {result.tasks && result.tasks[currentTaskIdx] && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Target className="h-5 w-5 text-green-600" />
                                Part {result.tasks[currentTaskIdx].taskNumber} - Performance Overview
                            </h3>

                            <div className="space-y-4">
                                {result.tasks[currentTaskIdx].sections?.map((section: any, sIdx: number) => {
                                    const total = section.questions?.length || 0
                                    const correct = section.questions?.filter((q: any) => isAnswerCorrect(q, section.type)).length || 0
                                    const percent = total ? Math.round((correct / total) * 100) : 0

                                    return (
                                        <div key={sIdx} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                            <div className="flex justify-between items-center mb-3">
                                                <div>
                                                    <h5 className="font-medium text-gray-800">Section {section.sectionNumber}</h5>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-green-600">
                                                        {correct}/{total}
                                                    </p>
                                                    <p className="text-sm text-gray-600">{percent}%</p>
                                                </div>
                                            </div>
                                            <Progress value={percent} className="[&>div]:bg-green-600" />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Detailed Questions */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-green-600" />
                            Part {result.tasks?.[currentTaskIdx]?.taskNumber} - Question Details
                        </h3>

                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {result.tasks?.[currentTaskIdx]?.sections?.flatMap((section: any) =>
                                    section.questions?.map((q: any, idx: number) => {
                                        const correct = isAnswerCorrect(q, section.type)
                                        return (
                                            <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-6">
                                                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                                                    <div
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                            correct ? "bg-green-100" : "bg-red-100"
                                                        }`}
                                                    >
                                                        {correct ? (
                                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                                        ) : (
                                                            <XCircle className="h-5 w-5 text-red-600" />
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-lg text-gray-800">Question {idx + 1}</span>
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-medium ml-auto
                                                     ${correct ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                                                                                >
                                                      {correct ? "Correct" : "Incorrect"}
                                                    </span>
                                                </div>

                                                <div className="space-y-4 mt-4">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 mb-2">Question:</h4>
                                                        <p className="text-gray-700 bg-gray-50 rounded-xl p-4">{q.question}</p>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="bg-gray-50 rounded-xl p-4">
                                                            <p className="text-sm font-medium text-gray-600 mb-2">Your answer:</p>
                                                            <p className={`font-medium ${correct ? "text-green-600" : "text-red-600"}`}>
                                                                {q.studentAnswer || <span className="italic text-gray-400">(Not answered)</span>}
                                                            </p>
                                                        </div>
                                                        <div className="bg-green-50 rounded-xl p-4">
                                                            <p className="text-sm font-medium text-gray-600 mb-2">Correct answer:</p>
                                                            <p className="font-medium text-green-600">{q.answer}</p>
                                                        </div>
                                                    </div>

                                                    {q.explanation && (
                                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                                            <p className="text-sm font-medium text-blue-800 mb-2">Explanation:</p>
                                                            <div
                                                                className="text-sm text-gray-800"
                                                                dangerouslySetInnerHTML={{ __html: q.explanation }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    }),
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => navigate(`/tips/Listening`)}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Do practice
                    </Button>
                    <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50" onClick={() => navigate("/test-history")}>
                        <Clock className="h-4 w-4 mr-2" />
                        View test history
                    </Button>
                </div>
            </div>
        </div>
    )
}
