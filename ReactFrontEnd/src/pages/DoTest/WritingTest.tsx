import {useState, useEffect, useRef, useCallback} from "react";
import { Textarea } from "@/components/ui/textarea";
import { DoTestHeader } from "@/components/layout/doTest/DoTestHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { validateWordLimit } from "@/lib/utils";
import apiClient from "@/lib/apiClient";

interface WritingTask {
    type: string;
    question: string;
    imageUrl?: string;
}

interface WritingData {
    testId: string;
    tasks: WritingTask[];
}

type GradingStatus = "idle" | "submitting" | "grading" | "graded" | "grading_failed" | "timeout";

// Thời gian polling tối đa: 3 phút
const MAX_POLL_DURATION_MS = 3 * 60 * 1000;
const POLL_INTERVAL_MS = 3000;

export default function WritingTest() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pollStartTimeRef = useRef<number>(0);

    const { user } = useAuth();
    const { testId } = useParams<{ testId: string }>();
    const [searchParams] = useSearchParams();
    const testAnswerId = searchParams.get("testAnswerId");
    const mode = searchParams.get("mode");

    const [currentTask, setCurrentTask] = useState(1);
    const [essayTask1, setEssayTask1] = useState("");
    const [essayTask2, setEssayTask2] = useState("");
    const [wordCountTask1, setWordCountTask1] = useState(0);
    const [wordCountTask2, setWordCountTask2] = useState(0);
    const [writingData, setWritingData] = useState<WritingData | null>(null);
    const [gradingMethod, setGradingMethod] = useState<"ai" | "human">("ai");
    const [showGradingDialog, setShowGradingDialog] = useState(false);
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
    const [isHighlightMode, setIsHighlightMode] = useState(false);
    const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
    const toggleHighlightMode = () => setIsHighlightMode((prev) => !prev);

    // Trạng thái chấm điểm
    const [gradingStatus, setGradingStatus] = useState<GradingStatus>("idle");
    const [submittedAnswerId, setSubmittedAnswerId] = useState<string | null>(null);
    const [pollAttempts, setPollAttempts] = useState(0);
    const [gradingProgress, setGradingProgress] = useState(0); // 0-100 cho progress bar

    useEffect(() => {
        if (!testId) return;
        apiClient.get<WritingData>(`/tests/${testId}/writing`)
            .then((data) => {
                console.log("Fetched Writing Data:", data);
                setWritingData(data);
            })
            .catch((err) => console.error("Error fetching writing data:", err));
    }, [testId]);

    useEffect(() => {
        const words = essayTask1.trim().split(/\s+/).filter((w) => w.length > 0);
        setWordCountTask1(words.length);
    }, [essayTask1]);

    useEffect(() => {
        const words = essayTask2.trim().split(/\s+/).filter((w) => w.length > 0);
        setWordCountTask2(words.length);
    }, [essayTask2]);

    // ---- Cleanup polling khi unmount ----
    useEffect(() => {
        return () => {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        };
    }, []);

    // ---- Hàm polling kiểm tra trạng thái chấm điểm ----
    const startPolling = useCallback((answerId: string, mode: string | null, testAnswerId: string | null) => {
        pollStartTimeRef.current = Date.now();
        setPollAttempts(0);
        setGradingProgress(5); // Bắt đầu ở 5%

        pollTimerRef.current = setInterval(async () => {
            const elapsed = Date.now() - pollStartTimeRef.current;
            const progress = Math.min(90, Math.floor((elapsed / MAX_POLL_DURATION_MS) * 90) + 5);
            setGradingProgress(progress);
            setPollAttempts(prev => prev + 1);

            // Timeout sau MAX_POLL_DURATION_MS
            if (elapsed >= MAX_POLL_DURATION_MS) {
                clearInterval(pollTimerRef.current!);
                setGradingStatus("timeout");
                setGradingProgress(0);
                return;
            }

            try {
                const statusData: any = await apiClient.get(`/test-answers/writing/${answerId}/status`);
                const status = statusData?.gradingStatus;

                if (status === "graded") {
                    clearInterval(pollTimerRef.current!);
                    setGradingProgress(100);
                    setGradingStatus("graded");

                    // Điều hướng sau 500ms
                    setTimeout(() => {
                        if (mode === "fulltest") {
                            navigate(`/test/speaking/${testId}?testAnswerId=${testAnswerId}&mode=fulltest`);
                        } else {
                            navigate(`/writing-result/${answerId}`);
                        }
                    }, 500);

                } else if (status === "grading_failed") {
                    clearInterval(pollTimerRef.current!);
                    setGradingStatus("grading_failed");
                    setGradingProgress(0);
                }
                // Nếu status = "grading" → tiếp tục poll
            } catch (error) {
                console.error("Poll error:", error);
                // Không dừng polling vì lỗi mạng tạm thời
            }
        }, POLL_INTERVAL_MS);
    }, [navigate, testId]);

    const handleSubmitClick = () => {
        setShowGradingDialog(true);
    };

    const handleSubmit = async () => {
        if (!writingData || writingData.tasks.length < 2) return;
        const task1Data = writingData.tasks[0];
        const task2Data = writingData.tasks[1];

        const task1Submission = essayTask1.trim()
            ? {
                  type: task1Data.type,
                  question: task1Data.question,
                  imageUrl: task1Data.imageUrl,
                  answer: essayTask1.trim(),
                  wordCount: wordCountTask1.toString(),
              }
            : null;

        const task2Submission = essayTask2.trim()
            ? {
                  type: task2Data.type,
                  question: task2Data.question,
                  answer: essayTask2.trim(),
                  wordCount: wordCountTask2.toString(),
              }
            : null;

        if (!task1Submission && !task2Submission) {
            alert("You haven't written anything.");
            return;
        }

        const MAX_WORDS_TASK1 = 500;
        const MAX_WORDS_TASK2 = 500;
        const { valid: valid1, error: error1 } = validateWordLimit(essayTask1, MAX_WORDS_TASK1);
        const { valid: valid2, error: error2 } = validateWordLimit(essayTask2, MAX_WORDS_TASK2);
        if (!valid1) { alert(error1); return; }
        if (!valid2) { alert(error2); return; }

        const payload = {
            testId: writingData.testId,
            username: user?.username,
            skill: "writing",
            task1: task1Submission,
            task2: task2Submission,
            gradingMethod,
        };

        setShowGradingDialog(false);
        setGradingStatus("submitting");

        try {
            const url = testAnswerId
                ? `/test-answers/writing?testAnswerId=${testAnswerId}`
                : `/test-answers/writing`;
            const result: any = await apiClient.post(url, payload);
            const answerId = result?.id || result?._id;

            if (gradingMethod === "ai") {
                if (answerId) {
                    setSubmittedAnswerId(answerId);
                    setGradingStatus("grading");
                    // Bắt đầu polling
                    startPolling(answerId, mode, testAnswerId);
                } else {
                    // Fallback nếu không có ID
                    setGradingStatus("idle");
                    alert("Submitted! Please check your history for results.");
                }
            } else {
                // Human grading
                setGradingStatus("idle");
                alert("Your essay has been sent to the teacher. You will receive the result within 3-5 days.");
                if (mode === "fulltest") {
                    navigate(`/test/speaking/${testId}?testAnswerId=${testAnswerId}&mode=fulltest`);
                } else {
                    navigate(`/`);
                }
            }
        } catch (error) {
            console.error("Error submitting writing:", error);
            setGradingStatus("idle");
            alert("Submit failed. Please try again.");
        }
    };

    const handleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch((err) => console.error(err));
        } else {
            document.exitFullscreen();
        }
    };

    const handleCancelPolling = () => {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        setGradingStatus("idle");
        alert("Grading is still in progress. You can check your results later in History.");
        navigate("/");
    };

    const handleViewResultLater = () => {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        navigate("/");
    };

    const MAX_WORDS_TASK1 = 500;

    const handleEssayTask1Change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        const { valid, error } = validateWordLimit(value, MAX_WORDS_TASK1);
        if (!valid) { alert(error); return; }
        setEssayTask1(value);
    };

    const MAX_WORDS_TASK2 = 500;

    const handleEssayTask2Change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        const { valid, error } = validateWordLimit(value, MAX_WORDS_TASK2);
        if (!valid) { alert(error); return; }
        setEssayTask2(value);
    };

    // ---- Overlay hiển thị trạng thái ----
    const isShowingOverlay = gradingStatus === "submitting" || gradingStatus === "grading" || gradingStatus === "graded";

    return (
        <div ref={containerRef} className="min-h-screen bg-gray-50">

            {/* ===== Overlay Chấm Điểm AI ===== */}
            {isShowingOverlay && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 9999,
                        background: "rgba(0,0,0,0.55)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full mx-4">
                        {/* Spinner */}
                        <div className="relative mb-6">
                            <div className="animate-spin rounded-full h-20 w-20 border-4 border-emerald-100 border-t-emerald-600"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-emerald-700 text-lg font-bold">
                                    {gradingStatus === "graded" ? "✓" : "AI"}
                                </span>
                            </div>
                        </div>

                        {/* Tiêu đề */}
                        <div className="text-xl font-bold text-gray-800 mb-1">
                            {gradingStatus === "submitting" && "Submitting..."}
                            {gradingStatus === "grading" && "AI Grading in Progress"}
                            {gradingStatus === "graded" && "Grading Complete!"}
                        </div>

                        {/* Mô tả */}
                        <div className="text-sm text-gray-500 text-center mb-5">
                            {gradingStatus === "submitting" && "Uploading your essay..."}
                            {gradingStatus === "grading" && (
                                <>
                                    AI is evaluating your writing based on official IELTS criteria.
                                    <br />
                                    <span className="text-xs text-gray-400 mt-1 block">
                                        This may take 30–90 seconds.
                                    </span>
                                </>
                            )}
                            {gradingStatus === "graded" && "Redirecting to your results..."}
                        </div>

                        {/* Progress Bar */}
                        {gradingStatus === "grading" && (
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-5 overflow-hidden">
                                <div
                                    className="bg-emerald-500 h-2 rounded-full transition-all duration-1000"
                                    style={{ width: `${gradingProgress}%` }}
                                />
                            </div>
                        )}

                        {/* Poll attempts counter */}
                        {gradingStatus === "grading" && pollAttempts > 0 && (
                            <div className="text-xs text-gray-400 mb-4">
                                Checking... ({pollAttempts * 3}s elapsed)
                            </div>
                        )}

                        {/* Nút huỷ */}
                        {gradingStatus === "grading" && (
                            <button
                                onClick={handleCancelPolling}
                                className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
                            >
                                View result later (go to History)
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ===== Overlay Timeout ===== */}
            {gradingStatus === "timeout" && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 9999,
                        background: "rgba(0,0,0,0.55)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full mx-4">
                        <div className="text-4xl mb-4">⏳</div>
                        <div className="text-xl font-bold text-amber-600 mb-2">AI is taking longer than usual</div>
                        <div className="text-sm text-gray-500 text-center mb-6">
                            The AI model may be busy. Your essay has been saved and will be graded shortly.
                            You can view your result in <strong>History</strong> once complete.
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => submittedAnswerId && navigate(`/writing-result/${submittedAnswerId}`)}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                            >
                                Check Result Now
                            </button>
                            <button
                                onClick={handleViewResultLater}
                                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                Go to Homepage
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Overlay Grading Failed ===== */}
            {gradingStatus === "grading_failed" && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 9999,
                        background: "rgba(0,0,0,0.55)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full mx-4">
                        <div className="text-4xl mb-4">⚠️</div>
                        <div className="text-xl font-bold text-red-600 mb-2">AI Grading Failed</div>
                        <div className="text-sm text-gray-500 text-center mb-6">
                            The AI service is temporarily overloaded. Your essay has been saved.
                            Please try again later or contact your teacher for manual grading.
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleViewResultLater}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                            >
                                Go to Homepage
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <DoTestHeader initialTime={60 * 60}
                          onSubmit={handleSubmitClick}
                          isDarkMode={isDarkMode}
                          toggleDarkMode={toggleDarkMode}
                          onFullscreenToggle={handleFullscreen}
                          isHighlightMode={isHighlightMode}
                          toggleHighlightMode={toggleHighlightMode} />

            {/* ===== Dialog Chọn Phương Thức Chấm ===== */}
            <Dialog open={showGradingDialog} onOpenChange={setShowGradingDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Select grading method</DialogTitle>
                        <DialogDescription>
                            Please choose how you want your essay to be graded
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <RadioGroup
                            defaultValue="ai"
                            onValueChange={(value) => setGradingMethod(value as "ai" | "human")}
                        >
                            <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                                <RadioGroupItem value="ai" id="ai" className="mt-0.5" />
                                <div>
                                    <Label htmlFor="ai" className="font-semibold cursor-pointer">Grade by AI (Fast)</Label>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Results in 30–90 seconds. Uses IELTS official band descriptors.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                                <RadioGroupItem value="human" id="human" className="mt-0.5" />
                                <div>
                                    <Label htmlFor="human" className="font-semibold cursor-pointer">Grade by Teacher</Label>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        More accurate. Results within 3–5 days.
                                    </p>
                                </div>
                            </div>
                        </RadioGroup>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowGradingDialog(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" onClick={handleSubmit}>
                            Confirm & Submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ===== Main Content ===== */}
            <div className="flex h-[calc(100vh-100px)]">
                {/* Left Panel - Đề bài */}
                <div className="w-1/2 bg-white p-6 overflow-y-auto border-r border-gray-200">
                    {currentTask === 1 ? (
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 mb-2">WRITING TASK 1</h1>
                            <p className="text-sm text-gray-600 mb-4">
                                You should spend about <strong>20 minutes</strong> on this task.
                            </p>
                            <p className="text-sm text-gray-700 mb-4">
                                {writingData?.tasks[0]?.question || "Loading..."}
                            </p>
                            {writingData?.tasks[0]?.imageUrl && (
                                <div className="mb-4">
                                    <img
                                        src={writingData.tasks[0].imageUrl}
                                        alt="Task 1 visual"
                                        className="max-w-full h-auto border border-gray-200 rounded-lg"
                                    />
                                </div>
                            )}
                            <p className="text-sm text-gray-700 mb-6">
                                You should write <strong>at least 150 words</strong>.
                            </p>
                        </div>
                    ) : (
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 mb-2">WRITING TASK 2</h1>
                            <p className="text-sm text-gray-600 mb-4">
                                You should spend about <strong>40 minutes</strong> on this task.
                            </p>
                            <p className="text-sm text-gray-700 mb-4">
                                {writingData?.tasks[1]?.question || "Loading..."}
                            </p>
                            <p className="text-sm text-gray-700 mb-6">
                                Write <strong>at least 250 words</strong>.
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Panel - Bài làm */}
                <div className="w-1/2 bg-gray-50 p-6 flex flex-col">
                    {currentTask === 1 ? (
                        <>
                            <Textarea
                                placeholder="Type your essay for Task 1 here..."
                                value={essayTask1}
                                onChange={handleEssayTask1Change}
                                className="flex-1 resize-none border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                            />
                            <div className="mt-4 flex justify-between items-center">
                                <div className="text-sm text-gray-600">
                                    Words Count: <span className={`font-medium ${wordCountTask1 < 150 ? "text-amber-500" : "text-emerald-600"}`}>
                                        {wordCountTask1}
                                    </span>
                                    {wordCountTask1 < 150 && (
                                        <span className="ml-2 text-xs text-amber-500">(minimum 150 words)</span>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <Textarea
                                placeholder="Type your essay for Task 2 here..."
                                value={essayTask2}
                                onChange={handleEssayTask2Change}
                                className="flex-1 resize-none border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                            />
                            <div className="mt-4 flex justify-between items-center">
                                <div className="text-sm text-gray-600">
                                    Words Count: <span className={`font-medium ${wordCountTask2 < 250 ? "text-amber-500" : "text-emerald-600"}`}>
                                        {wordCountTask2}
                                    </span>
                                    {wordCountTask2 < 250 && (
                                        <span className="ml-2 text-xs text-amber-500">(minimum 250 words)</span>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Bottom Navigation */}
            {writingData && writingData.tasks.length === 2 && (
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                    <div className="max-w-8xl mx-auto grid grid-cols-2 gap-4">
                        {[1, 2].map((taskNumber) => {
                            const isActive = currentTask === taskNumber;
                            const wordCount = taskNumber === 1 ? wordCountTask1 : wordCountTask2;
                            const minWords = taskNumber === 1 ? 150 : 250;
                            const hasEnough = wordCount >= minWords;
                            return (
                                <div
                                    key={taskNumber}
                                    onClick={() => setCurrentTask(taskNumber)}
                                    className={`border rounded-lg p-4 cursor-pointer transition duration-200 text-center ${
                                        isActive
                                            ? "border-teal-500 bg-teal-50 text-teal-700"
                                            : "border-gray-200 bg-white hover:bg-gray-50 text-gray-800"
                                    }`}
                                >
                                    <h3 className="font-semibold text-sm">Task {taskNumber}</h3>
                                    <p className="text-xs mt-1">
                                        <span className={hasEnough ? "text-emerald-600" : "text-amber-500"}>
                                            {wordCount} words
                                        </span>
                                        {" "}<span className="text-gray-400">/ min {minWords}</span>
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}