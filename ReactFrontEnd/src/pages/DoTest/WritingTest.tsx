import {useState, useEffect, useRef} from "react";
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
import { customFetch } from "@/components/sections/customFetch";
import { DetailExplanationModal } from "@/components/modals/DetailExplanationModal";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { validateWordLimit } from "@/lib/utils";

const API_URL = import.meta.env.VITE_API_URL;

interface WritingTask {
    type: string;
    question: string;
    imageUrl?: string;
}

interface WritingData {
    testId: string;
    tasks: WritingTask[];
}

export default function WritingTest() {
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showGradingDialog, setShowGradingDialog] = useState(false);
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
    const [isHighlightMode, setIsHighlightMode] = useState(false);
    const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
    const toggleHighlightMode = () => setIsHighlightMode((prev) => !prev);
    const [isGrading, setIsGrading] = useState(false); // Add loading overlay state
    const [submittedResult, setSubmittedResult] = useState<any>(null);
    const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);


    useEffect(() => {
        fetch(`${API_URL}/verify/writing/${testId}`, {
            credentials: "include",
        })
            .then((res) => res.json())
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
        if (!valid1) {
          alert(error1);
          return;
        }
        if (!valid2) {
          alert(error2);
          return;
        }
        const payload = {
            testId: writingData.testId,
            username: user?.username,
            skill: "writing",
            task1: task1Submission,
            task2: task2Submission,
            gradingMethod,
        };
        setIsSubmitting(true);
        setShowGradingDialog(false);
        setIsGrading(true); // Bắt đầu overlay loading
        try {
            let response;
            if (testAnswerId) {
                response = await fetch(`${API_URL}/verify/writing/submit?testAnswerId=${testAnswerId}`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            } else {
                response = await fetch(`${API_URL}/verify/writing/submit`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }
            if (!response.ok) throw new Error("Failed to submit writing");
            const result = await response.json();
            if (gradingMethod === "ai") {
                setIsGrading(false);
                if (mode === "fulltest") {
                    navigate(`/test/speaking/${testId}?testAnswerId=${testAnswerId}&mode=fulltest`);
                } else {
                    navigate(`/writing-result/${result.id}`);
                    alert("The test has been graded by AI! Your essay has been submitted successfully!");
                }
            } else {
                alert("Your essay has been sent to the teacher. You will receive the result within 3-5 days.");
                if (mode === "fulltest") {
                    navigate(`/test/speaking/${testId}?testAnswerId=${testAnswerId}&mode=fulltest`);
                } else {
                    navigate(`/`);
                }
            }
        } catch (error) {
            console.error("Error submitting writing:", error);
            setIsGrading(false);
            alert("Submit failed. Please try again.");
        } finally {
            setIsSubmitting(false);
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

    const MAX_WORDS_TASK1 = 500;

    const handleEssayTask1Change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      const { valid, wordCount, error } = validateWordLimit(value, MAX_WORDS_TASK1);

      if (!valid) {
        // Có thể alert, hoặc setError để hiển thị ra UI
        alert(error);
        // Không cập nhật state nếu vượt quá giới hạn
        return;
      }
      setEssayTask1(value);
    };

    const MAX_WORDS_TASK2 = 500;

    const handleEssayTask2Change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      const { valid, wordCount, error } = validateWordLimit(value, MAX_WORDS_TASK2);

      if (!valid) {
        alert(error);
        return;
      }
      setEssayTask2(value);
    };

    return (
        <div className="min-h-screen bg-gray-50">
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
            <DoTestHeader initialTime={60 * 60}
                          onSubmit={handleSubmitClick}
                          isDarkMode={isDarkMode}
                          toggleDarkMode={toggleDarkMode}
                          onFullscreenToggle={handleFullscreen}
                          isHighlightMode={isHighlightMode}
                          toggleHighlightMode={toggleHighlightMode} />

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
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="ai" id="ai" />
                                <Label htmlFor="ai">Grade by AI (Fast)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="human" id="human" />
                                <Label htmlFor="human">Grade by teacher (More accurate)</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowGradingDialog(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Confirm"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex h-[calc(100vh-100px)]">
                {/* Left Panel */}
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

                {/* Right Panel */}
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
                                    Words Count: <span className="font-medium">{wordCountTask1}</span>
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
                                    Words Count: <span className="font-medium">{wordCountTask2}</span>
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
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}