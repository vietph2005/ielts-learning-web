"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mic, Square, ChevronRight, CheckCircle, AlertCircle, Volume2, Brain } from "lucide-react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { customFetch } from "@/components/sections/customFetch"
import { DoTestSpeakingHeader } from "@/components/layout/doTest/DoTestSpeakingHeader"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";

const API_URL = import.meta.env.VITE_API_URL || 'VITE_API_URL=http://api.languages.io.vn:8080';

type Speaking = {
    _id: string
    username: string
    skill: string
    part1: {
        partNumber: number
        title: string
        instruction: string
        questions: { question: string }[]
    }
    part2: {
        partNumber: number
        title: string
        instruction: string
        question: string
        cueCards: string[]
    }
    part3: {
        partNumber: number
        title: string
        instruction: string
        questions: { question: string }[]
    }
}

type Part = "part1" | "part2" | "part3"

const SpeakingTest = () => {
    const { testId } = useParams<{ testId: string }>()
    const [searchParams] = useSearchParams();
    const testAnswerId = searchParams.get("testAnswerId");
    const mode = searchParams.get("mode");
    const { user } = useAuth()
    const TOTAL_TEST_TIME = 1600
    const [speaking, setSpeaking] = useState<Speaking | null>(null)
    const [loading, setLoading] = useState(true)
    const [currentPart, setCurrentPart] = useState<Part>("part1")
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [audioUrls, setAudioUrls] = useState<{ [key: string]: string }>({})
    const [recordingKey, setRecordingKey] = useState<string | null>(null)
    const [isThinking, setIsThinking] = useState(false)
    const [thinkingTime, setThinkingTime] = useState(0)
    const [partStarted, setPartStarted] = useState(false)
    const [showConfirmNextPart, setShowConfirmNextPart] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [timeUp, setTimeUp] = useState(false)
    const navigate = useNavigate()
    const timerRef = useRef<number | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const [_liveTranscript, setLiveTranscript] = useState<string>("");
    const recognitionRef = useRef<any>(null); // dùng any nếu TS báo lỗi SpeechRecognition
    const [_recordingStartTime, setRecordingStartTime] = useState<number | null>(null)
    const [isGrading, setIsGrading] = useState(false); // Thêm state loading overlay
    const [totalRecordingTime, setTotalRecordingTime] = useState<{ [key in Part]: number }>({
        part1: 0,
        part2: 0,
        part3: 0,
    })
    const [recordingTimes, setRecordingTimes] = useState<{ [key: string]: number }>({})
    const [part2Countdown, setPart2Countdown] = useState(10)
    const [part2Prep, setPart2Prep] = useState(false)
    const [testTimeLeft, setTestTimeLeft] = useState(TOTAL_TEST_TIME)
    const testTimerRef = useRef<number | null>(null)
    const [showMinRecordingWarning, setShowMinRecordingWarning] = useState(false)
    const [minRecordingWarningMsg, setMinRecordingWarningMsg] = useState("")

    const MIN_RECORDING_TIMES = {
        part1: 1,
        part2: 1,
        part3: 1,
    }

    // Thêm hàm đếm số câu part1 đã ghi âm
    const countAnsweredPart1 = () => {
        if (!speaking) return 0;
        return speaking.part1.questions.reduce((count, _q, i) => {
            const key = `part1-${i + 1}`;
            return audioUrls[key] ? count + 1 : count;
        }, 0);
    };
    // Thêm hàm đếm số câu part3 đã ghi âm
    const countAnsweredPart3 = () => {
        if (!speaking) return 0;
        return speaking.part3.questions.reduce((count, _q, i) => {
            const key = `part3-${i + 1}`;
            return audioUrls[key] ? count + 1 : count;
        }, 0);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await customFetch(`${API_URL}/verify/speaking/${testId}`, {
                    method: "GET",
                })
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
                const data = await res.json()
                setSpeaking(data)
            } catch (err) {
                console.error("Failed to fetch speaking test:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [testId])

    useEffect(() => {
        if (currentPart === "part2" && !partStarted && !part2Prep) {
            setPart2Prep(true)
            setPart2Countdown(60)
        }
    }, [currentPart, partStarted])

    useEffect(() => {
        if (part2Prep && part2Countdown > 0) {
            const interval = setInterval(() => {
                setPart2Countdown((prev) => prev - 1)
            }, 1000)
            return () => clearInterval(interval)
        } else if (part2Prep && part2Countdown === 0) {
            setPart2Prep(false)
            setPartStarted(true)
        }
    }, [part2Prep, part2Countdown])

    useEffect(() => {
        // Tự động bắt đầu part1 và part3 khi vào, chỉ part2 mới cần bấm Start
        if (
            !loading &&
            speaking &&
            !partStarted &&
            !showConfirmNextPart &&
            (currentPart === "part1" || currentPart === "part3")
        ) {
            startTimer()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, speaking, currentPart, showConfirmNextPart])

    useEffect(() => {
        // Đảm bảo chỉ có 1 interval duy nhất
        if (partStarted) {
            if (testTimerRef.current) {
                clearInterval(testTimerRef.current);
                testTimerRef.current = null;
            }
            testTimerRef.current = window.setInterval(() => {
                setTestTimeLeft((prev) => {
                    if (prev <= 1) {
                        if (testTimerRef.current) {
                            clearInterval(testTimerRef.current);
                            testTimerRef.current = null;
                        }
                        setIsSubmitting(true)
                        setTimeUp(true)
                        // Kiểm tra điều kiện tối thiểu khi hết giờ
                        const answeredPart1 = countAnsweredPart1();
                        const answeredPart2 = audioUrls["part2"] ? 1 : 0;
                        const answeredPart3 = countAnsweredPart3();
                        if (
                            answeredPart1 < 2 ||
                            answeredPart2 < 1 ||
                            answeredPart3 < 3 ||
                            totalRecordingTime.part1 < MIN_RECORDING_TIMES.part1 ||
                            totalRecordingTime.part2 < MIN_RECORDING_TIMES.part2 ||
                            totalRecordingTime.part3 < MIN_RECORDING_TIMES.part3
                        ) {
                            alert("You have not completed the minimum number of answers in each part. Your test will not be saved. You will be redirected to the homepage.");
                            navigate("/", { replace: true });
                            return 0;
                        } else {
                            // Đủ điều kiện, tự động nộp bài
                            handleSubmitClick();
                            return 0;
                        }
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (testTimerRef.current) {
                clearInterval(testTimerRef.current);
                testTimerRef.current = null;
            }
        };
    }, [partStarted]);

    const startTimer = () => {
        if (testTimerRef.current) return
        setPartStarted(true)
        setTimeUp(false)
    }

    const startThinking = (seconds: number, callback: () => void) => {
        setThinkingTime(seconds)
        setIsThinking(true)
        const interval = setInterval(() => {
            setThinkingTime((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    setIsThinking(false)
                    callback()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const startRecording = async (key: string) => {
        if (!partStarted) startTimer()

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: "audio/webm",
            })

            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []
            setRecordingKey(key)
            setRecordingStartTime(Date.now())

            mediaRecorder.ondataavailable = (e: BlobEvent) => {
                if (e.data && e.data.size > 0) {
                    audioChunksRef.current.push(e.data)
                }
            }

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
                const url = URL.createObjectURL(audioBlob)

                const audioContext = new AudioContext()
                const reader = new FileReader()

                reader.onload = async () => {
                    const arrayBuffer = reader.result as ArrayBuffer
                    try {
                        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
                        const realDuration = Math.floor(audioBuffer.duration)

                        setRecordingTimes((prev) => ({
                            ...prev,
                            [key]: realDuration,
                        }))

                        setTotalRecordingTime((prev) => {
                            const part = key.startsWith("part1") ? "part1" : key.startsWith("part2") ? "part2" : "part3"
                            const prevDuration = recordingTimes[key] || 0
                            const newTotal = prev[part] - prevDuration + realDuration

                            return {
                                ...prev,
                                [part]: newTotal,
                            }
                        })

                        setAudioUrls((prev) => ({ ...prev, [key]: url }))
                        setRecordingKey(null)
                        setRecordingStartTime(null)
                    } catch (error) {
                        console.error("Error decoding audio:", error)
                    }
                }

                reader.readAsArrayBuffer(audioBlob)
            }

            mediaRecorder.start()
        } catch (error) {
            console.error("Error accessing microphone:", error)
            alert("Cannot access microphone. Please check your browser or allow microphone access.")
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }

        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }

        setLiveTranscript(""); // Xoá transcript hiển thị
    };

    const nextQuestion = async () => {
        if (timeUp) return // Kiểm tra hết giờ tổng trước
        if (!speaking || (currentPart === "part3" && timeUp)) return
        if (recordingKey) {
            stopRecording()
            await new Promise((resolve) => {
                const check = () => {
                    if (!recordingKey) resolve(true)
                    else setTimeout(check, 100)
                }
                check()
            })
        }
        const questions = currentPart === "part1" ? speaking.part1.questions : speaking.part3.questions
        if (currentPart === "part2") {
            if (totalRecordingTime.part2 >= MIN_RECORDING_TIMES.part2) {
                setShowConfirmNextPart(true)
            } else {
                setMinRecordingWarningMsg(
                    `Bạn cần ghi âm ít nhất ${MIN_RECORDING_TIMES.part2} giây cho Part 2 trước khi tiếp tục. Hiện tại: ${Math.floor(totalRecordingTime.part2)} giây`,
                )
                setShowMinRecordingWarning(true)
            }
            return
        }
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1)
        } else {
            // BẮT BUỘC PART1 PHẢI TRẢ LỜI ÍT NHẤT 2 CÂU HỎI
            if (currentPart === "part1") {
                const answered = countAnsweredPart1();
                if (answered < 2) {
                    setMinRecordingWarningMsg(
                        `You must answer (record) at least 2 questions in PART1 before continuing. You have answered ${answered} question(s).`
                    );
                    setShowMinRecordingWarning(true);
                    setCurrentQuestionIndex(0);
                    return;
                }
            }
            // BẮT BUỘC PART3 PHẢI TRẢ LỜI ÍT NHẤT 3 CÂU HỎI
            if (currentPart === "part3") {
                const answered = countAnsweredPart3();
                if (answered < 3) {
                    setMinRecordingWarningMsg(
                        `Bạn cần trả lời (ghi âm) ít nhất 3 câu hỏi ở PART3 trước khi nộp bài. Hiện tại bạn mới trả lời ${answered} câu.`
                    );
                    setShowMinRecordingWarning(true);
                    setCurrentQuestionIndex(0);
                    return;
                }
            }
            const currentTotal = totalRecordingTime[currentPart]
            if (currentTotal >= MIN_RECORDING_TIMES[currentPart]) {
                if (currentPart === "part3") {
                    setIsSubmitting(true)
                } else {
                    setShowConfirmNextPart(true)
                }
            } else {
                setMinRecordingWarningMsg(
                    `Bạn cần ghi âm tổng cộng ít nhất ${MIN_RECORDING_TIMES[currentPart]} giây cho ${currentPart.toUpperCase()} trước khi tiếp tục. Hiện tại: ${Math.floor(currentTotal)} giây`,
                )
                setShowMinRecordingWarning(true)
                setCurrentQuestionIndex(0)
            }
        }
    }

    const goToNextPart = async () => {
        setPartStarted(false)
        setShowConfirmNextPart(false)
        setCurrentQuestionIndex(0)
        if (currentPart === "part1") {
            setCurrentPart("part2")
            setPart2Prep(true)
            setPart2Countdown(10)
        } else if (currentPart === "part2") {
            setCurrentPart("part3")
            setPart2Prep(false)
            setPartStarted(true)
        }
    }

    const prepareSubmissionData = () => {
        const cloned = JSON.parse(JSON.stringify(speaking))
        if (user && "username" in user) cloned.username = user.username
        cloned.skill = "speaking"

        cloned.part1.questions = cloned.part1.questions.map((q: any, i: number) => ({
            question: q.question,
            audioAnswer: audioUrls[`part1-${i + 1}`] ? `part1-${i + 1}.webm` : "",
            duration: recordingTimes[`part1-${i + 1}`] || 0,
        }))

        cloned.part2.audioAnswer = audioUrls["part2"] ? "part2.webm" : ""
        if (speaking) {
            cloned.part2.cueCards = speaking.part2.cueCards;
        }
        cloned.part2.duration = recordingTimes["part2"] || 0

        cloned.part3.questions = cloned.part3.questions.map((q: any, i: number) => ({
            question: q.question,
            audioAnswer: audioUrls[`part3-${i + 1}`] ? `part3-${i + 1}.webm` : "",
            duration: recordingTimes[`part3-${i + 1}`] || 0,
        }))
        return cloned
    }

    const handleSubmitClick = async () => {
        // Dừng timer khi bắt đầu submit
        if (recordingKey) {
            stopRecording()
            await new Promise((resolve) => {
                const check = () => {
                    if (!recordingKey) resolve(true)
                    else setTimeout(check, 100)
                }
                check()
            })
        }

        // Kiểm tra điều kiện tối thiểu trước khi submit
        if (!timeUp && totalRecordingTime.part3 < MIN_RECORDING_TIMES.part3) {
            setMinRecordingWarningMsg(
                `You need to record at least ${MIN_RECORDING_TIMES.part3} seconds for PART 3 before submitting. Current duration: ${Math.floor(totalRecordingTime.part3)} seconds.`,
            );
            setShowMinRecordingWarning(true);
            return; // Dừng lại nếu không đủ điều kiện
        }
        // BẮT BUỘC PART3 PHẢI TRẢ LỜI ÍT NHẤT 3 CÂU HỎI
        const answeredPart3 = countAnsweredPart3();
        if (answeredPart3 < 3) {
            setMinRecordingWarningMsg(
                `You need to answer (record) at least 3 questions in PART 3 before submitting. You have currently answered ${answeredPart3} question(s).`
            );
            setShowMinRecordingWarning(true);
            return;
        }

        // Gọi submit trực tiếp (không hiển thị dialog)
        handleSubmit();
    }

    const handleSubmit = async () => {
        // Dừng timer khi thực sự submit (phòng trường hợp gọi trực tiếp)
        setIsGrading(true);
        setIsSubmitting(true); // Bây giờ mới set submitting
        // setIsGrading(true); // Bắt đầu overlay loading
        const submissionData = prepareSubmissionData()
        if (!submissionData) return
        const formData = new FormData()
        formData.append(
            "metadata",
            new Blob([JSON.stringify(submissionData)], { type: "application/json" }),
            "metadata.json",
        )
        await Promise.all(
            Object.entries(audioUrls).map(async ([key, url]) => {
                const blob = await fetch(url).then((res) => res.blob())
                formData.append("files", blob, `${key}.webm`)
            }),
        )
        try {
            let res;
            if (testAnswerId) {
                res = await customFetch(`${API_URL}/verify/speaking/submit?testAnswerId=${testAnswerId}`, {
                    method: "POST",
                    body: formData,
                });
            } else {
                res = await customFetch(`${API_URL}/verify/speaking/submit`, {
                    method: "POST",
                    body: formData,
                });
            }
            const result = await res.json();
            setIsGrading(false); // Tắt overlay trước khi chuyển trang
            if (mode === "fulltest") {
                navigate(`/test/fulltest-result/${testAnswerId}`);
            } else {
                navigate(`/speaking-result/${result.id}`);
                alert("Your essay has been graded by AI! Your essay has been submitted successfully!");
            }
            if (!res.ok) throw new Error("Fail to submit!")
        } catch (err) {
            console.error(err)
            setIsGrading(false); // Tắt overlay nếu lỗi
            alert("Submission failed!")
        }
        setIsSubmitting(false)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const getCurrentQuestionKey = () => {
        if (currentPart === "part1") return `part1-${currentQuestionIndex + 1}`
        if (currentPart === "part2") return "part2"
        return `part3-${currentQuestionIndex + 1}`
    }

    const getCurrentQuestion = () => {
        if (!speaking) return ""
        if (currentPart === "part1") return speaking.part1.questions[currentQuestionIndex].question
        if (currentPart === "part2") return speaking.part2.question
        return speaking.part3.questions[currentQuestionIndex].question
    }

    const getQuestionNumber = () => {
        if (currentPart === "part2") return ""
        return currentQuestionIndex + 1
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600 text-sm">Loading your speaking test...</p>
                </div>
            </div>
        )
    }

    if (!speaking) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Alert className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>No test data found. Please try again.</AlertDescription>
                </Alert>
            </div>
        )
    }

    if (!partStarted && !showConfirmNextPart) {
        if (currentPart === "part2" && part2Prep) {
            return (
                <div className="min-h-screen bg-white">
                    <DoTestSpeakingHeader initialTime={testTimeLeft} />
                    <div className="max-w-4xl mx-auto px-4 py-4">
                        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="text-center space-y-4">
                                    <div className="space-y-2">
                                        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                                            Part {speaking[currentPart].partNumber}
                                        </div>
                                        <h1 className="text-2xl font-bold text-gray-900">{speaking[currentPart].title}</h1>
                                        <p className="text-sm text-gray-600 leading-relaxed max-w-xl mx-auto">
                                            {speaking[currentPart].instruction}
                                        </p>
                                    </div>
                                    {speaking && speaking.part2 && speaking.part2.cueCards && (
                                        <Card className="max-w-lg mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                                            <CardContent className="p-4">
                                                <h4 className="font-semibold mb-3 text-gray-800 text-sm">You should talk about:</h4>
                                                <ul className="space-y-2 text-left">
                                                    {speaking.part2.cueCards.map((card, index) => (
                                                        <li key={index} className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                                                            <span className="text-gray-700 text-sm">{card}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    )}
                                    <div className="flex flex-col items-center gap-2 mt-4">
                                        <div className="text-xl font-bold text-red-500">Preparation: {part2Countdown}s</div>
                                        <div className="text-gray-500 text-sm">
                                            You will automatically start speaking when the timer ends.
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )
        }
        return null
    }

    // Show submission confirmation


    if (showConfirmNextPart) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <Card className="max-w-lg mx-auto shadow-xl border-0 bg-gradient-to-br from-orange-50 to-yellow-50">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Skip to Next Part?</h3>
                                <p className="text-gray-700 mb-4 text-sm">
                                    Are you sure you want to move to the next part? You won't be able to return to this section.
                                </p>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={goToNextPart}
                                        size="sm"
                                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg rounded-full"
                                    >
                                        Yes, Continue
                                    </Button>
                                    <Button
                                        onClick={() => setShowConfirmNextPart(false)}
                                        variant="outline"
                                        size="sm"
                                        className="px-4 py-2 rounded-full"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (showMinRecordingWarning) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <Card className="max-w-lg mx-auto shadow-xl border-0 bg-gradient-to-br from-orange-50 to-yellow-50">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Cảnh báo</h3>
                                <p className="text-gray-700 mb-4 text-sm">{minRecordingWarningMsg}</p>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => setShowMinRecordingWarning(false)}
                                        size="sm"
                                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg rounded-full"
                                    >
                                        Đã hiểu
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col overflow-hidden">
            {/* Overlay loading khi đang chấm điểm AI */}
            {isGrading && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 9999,
                        background: "rgba(0,0,0,0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mb-6"></div>
                        <div className="text-xl font-bold text-emerald-700 mb-2">Scoring...</div>
                        <div className="text-gray-600">Waiting for AI to score your answer</div>
                    </div>
                </div>
            )}
            {/* Compact Header */}
            <div className="flex-shrink-0">
                <DoTestSpeakingHeader initialTime={testTimeLeft} />
            </div>
            {/* Dialog chọn phương thức chấm bài */}
            {/*/!* Part Header - Compact *!/*/}
            <div className="max-w-6xl mx-auto">
                <div className="">
                    <div className="text-lg font-bold text-emerald-700">
                        Part {speaking[currentPart].partNumber}: {speaking[currentPart].title}
                    </div>
                </div>
            </div>

            {/* Main Content - Flexible */}
            <div className="flex-1 overflow-hidden">
                <div className="max-w-6xl mx-auto px-4 py-2 h-100">
                    <div className="grid lg:grid-cols-3 gap-3 h-100">
                        {/* Main Question Area */}
                        <div className="lg:col-span-2">
                            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm h-full">
                                <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 h-full">
                                    {getQuestionNumber() && (
                                        <div className="inline-flex items-center gap-2 bg-black text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                                            QUESTION {getQuestionNumber()}
                                        </div>
                                    )}

                                    <h2 className="text-xl font-bold text-gray-900 leading-tight text-center">{getCurrentQuestion()}</h2>

                                    {/* Compact Microphone Button */}
                                    <div className="py-2 w-full flex justify-center items-center">
                                        <div className="relative">
                                            <button
                                                onClick={() => {
                                                    const key = getCurrentQuestionKey()
                                                    if (recordingKey === key) {
                                                        stopRecording()
                                                    } else {
                                                        startThinking(currentPart === "part2" ? 1 : 1, () => startRecording(key))
                                                    }
                                                }}
                                                disabled={isThinking || (currentPart === "part3" && timeUp)}
                                                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-xl ${
                                                    recordingKey === getCurrentQuestionKey()
                                                        ? "bg-gradient-to-br from-red-500 to-pink-600 animate-pulse shadow-red-500/50"
                                                        : isThinking
                                                            ? "bg-gradient-to-br from-orange-400 to-yellow-500 shadow-orange-500/50"
                                                            : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/50"
                                                }`}
                                            >
                                                {recordingKey === getCurrentQuestionKey() && (
                                                    <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
                                                )}
                                                <div className="relative z-10">
                                                    {recordingKey === getCurrentQuestionKey() ? (
                                                        <Square className="w-6 h-6 text-white fill-white" />
                                                    ) : isThinking ? (
                                                        <Brain className="w-6 h-6 text-white animate-pulse" />
                                                    ) : (
                                                        <Mic className="w-6 h-6 text-white" />
                                                    )}
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Status Text */}
                                    <div className="text-xs">
                                        {isThinking ? (
                                            <p className="text-orange-600 font-semibold animate-pulse">
                                                💭 Preparation time: {thinkingTime} seconds
                                            </p>
                                        ) : recordingKey === getCurrentQuestionKey() ? (
                                            <p className="text-red-600 font-semibold animate-pulse">🎙️ Recording... Click to stop</p>
                                        ) : (
                                            <p className="text-gray-600">⏱️ You have {formatTime(testTimeLeft)} minutes to speak</p>
                                        )}

                                    </div>

                                </CardContent>
                            </Card>
                        </div>

                        {/* Compact Sidebar */}
                        <div className="space-y-2 h-100 overflow-y-auto">
                            {/* Recording Stats */}
                            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                                <CardContent className="p-2">
                                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-1 text-xs">
                                        <Volume2 className="w-3 h-3" />
                                        Recording Stats
                                    </h3>
                                    <div className="space-y-1">
                                        {recordingTimes[getCurrentQuestionKey()] && (
                                            <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg text-xs">
                                                <span className="text-xs text-gray-600">Current Question</span>
                                                <span className="font-semibold text-green-600 text-xs">
                          {Math.floor(recordingTimes[getCurrentQuestionKey()])}s
                        </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                                            <span className="text-xs text-gray-600">Total {currentPart.toUpperCase()}</span>
                                            <span className="font-semibold text-blue-600 text-xs">
                        {Math.floor(totalRecordingTime[currentPart])} / {MIN_RECORDING_TIMES[currentPart]}s
                      </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Audio Playback */}
                            {audioUrls[getCurrentQuestionKey()] && (
                                <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                                    <CardContent className="p-2">
                                        <div className="flex items-center gap-1 text-green-700 mb-1 text-xs">
                                            <CheckCircle className="w-3 h-3" />
                                            <span className="font-semibold text-xs">Recording Complete</span>
                                        </div>
                                        <audio controls src={audioUrls[getCurrentQuestionKey()]} className="w-full h-7" />
                                    </CardContent>
                                </Card>
                            )}

                            {/* Progress Info */}
                            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                                <CardContent className="p-1">
                                    <h3 className="font-bold text-gray-900 mb-3 text-xs">Progress</h3>
                                    <div className="space-y-2">
                                        <div className="text-xs text-gray-600">
                                            {currentPart === "part1" &&
                                                `Q${currentQuestionIndex + 1}/${speaking.part1.questions.length}`} {/* Rút gọn text */}
                                            {currentPart === "part2" && "Long turn (1-2 mins)"}
                                            {currentPart === "part3" &&
                                                `Q${currentQuestionIndex + 1}/${speaking.part3.questions.length}`}
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className="bg-gradient-to-r from-emerald-500 to-emerald-700 h-2 rounded-full transition-all duration-300"
                                                style={{
                                                    width: `${
                                                        currentPart === "part1"
                                                            ? ((currentQuestionIndex + 1) / speaking.part1.questions.length) * 100
                                                            : currentPart === "part2"
                                                                ? 100
                                                                : ((currentQuestionIndex + 1) / speaking.part3.questions.length) * 100
                                                    }%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Buttons - Fixed at bottom */}
            <div className="flex-shrink-0 bg-white border-t p-3">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {(currentPart === "part1" || currentPart === "part3") && (
                            <Button
                                onClick={nextQuestion}
                                size="sm"
                                disabled={timeUp || (currentPart === "part3" && timeUp)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 rounded-full"
                            >
                                {currentQuestionIndex ===
                                (currentPart === "part1" ? speaking.part1.questions.length - 1 : speaking.part3.questions.length - 1)
                                    ? "Complete Part"
                                    : "Next Question"}
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        )}

                        {currentPart === "part2" && (
                            <Button
                                onClick={nextQuestion}
                                size="sm"
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 rounded-full"
                            >
                                Next Part
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        )}

                        {currentPart === "part3" && (
                            <Button
                                onClick={handleSubmitClick}
                                size="sm"
                                disabled={timeUp}
                                className="px-4 py-2 bg-red-600 hover:bg-red-800 shadow-lg hover:shadow-xl transition-all duration-200 rounded-full"
                            >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Submit Test
                            </Button>
                        )}

                        {currentPart !== "part3" && (
                            <Button
                                onClick={() => {
                                    // BẮT BUỘC PART1 PHẢI TRẢ LỜI ÍT NHẤT 2 CÂU HỎI
                                    if (currentPart === "part1") {
                                        const answered = countAnsweredPart1();
                                        if (answered < 2) {
                                            alert(`You must answer (record) at least 2 questions in PART1 before continuing. You have answered ${answered} question(s).`);
                                            return;
                                        }
                                    }
                                    if (totalRecordingTime[currentPart] >= MIN_RECORDING_TIMES[currentPart]) {
                                        setShowConfirmNextPart(true)
                                    } else {
                                        alert(
                                            `Bạn cần ghi âm tổng cộng ít nhất ${MIN_RECORDING_TIMES[currentPart]} giây cho ${currentPart.toUpperCase()} trước khi tiếp tục. Hiện tại: ${Math.floor(totalRecordingTime[currentPart])} giây`,
                                        )
                                    }
                                }}
                                variant="outline"
                                size="sm"
                                disabled={timeUp || totalRecordingTime[currentPart] < MIN_RECORDING_TIMES[currentPart]}
                                className="px-4 py-2 rounded-full border-2 hover:bg-gray-50"
                            >
                                Skip to Next Part
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SpeakingTest