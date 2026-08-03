import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DoTestHeader } from "@/components/layout/doTest/DoTestHeader";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {customFetch} from "@/components/sections/customFetch";
export type Question = {
    question: string;
    answer: string;
    options?: string[];
    explanation?: string;
};

export type Section = {
    sectionNumber: number;
    type: string;
    imageUrl?: string;
    introduction?: string;
    questions: Question[];
};

export type TaskListening = {
    taskNumber: number;
    title?: string;
    audioIntroduction?: string;
    sections: Section[];
};

export type ListeningTest = {
    testId: string;
    audioUrl?: string;
    tasks: TaskListening[];
    username: string;
    skill: string;
};

interface QuestionWithStudentAnswer extends Question {
    studentAnswer?: string | null;
    questionId?: number;
}

export default function ListeningTest() {
    const { testId } = useParams<{ testId: string }>();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [currentPart, setCurrentPart] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [volume, setVolume] = useState(75);
    const [listeningTest, setListeningTest] = useState<ListeningTest | null>(null);
    const [duration, setDuration] = useState(0);
    const [progress, setProgress] = useState(0);
    const [searchParams] = useSearchParams();
    const testAnswerId = searchParams.get("testAnswerId");
    const mode = searchParams.get("mode");
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isHighlightMode, setIsHighlightMode] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Khởi tạo dark mode từ localStorage
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem("darkMode") === "true";
    });
    const toggleHighlightMode = () => {
        setIsHighlightMode((prev) => !prev);
    };
    useEffect(() => {
        localStorage.setItem("darkMode", isDarkMode ? "true" : "false");
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode((prev) => !prev);
    };

    const API_URL = import.meta.env.VITE_API_URL;

    // Fetch dữ liệu test listening
    useEffect(() => {
        if (!testId) return;
        customFetch(`${API_URL}/verify/listening/${testId}`, )
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!data) return;
                let questionId = 1;
                const updated = structuredClone(data);
                updated.tasks.forEach((task: TaskListening) => {
                    task.sections.forEach((section: Section) => {
                        section.questions.forEach((q: QuestionWithStudentAnswer) => {
                            (q as QuestionWithStudentAnswer).questionId = questionId++;
                        });
                    });
                });
                setListeningTest(updated);
            })
            .catch(console.error);
    }, [testId]);

    // Xử lý sự kiện audio
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const update = () => {
            setCurrentTime(audio.currentTime);
            setProgress((audio.currentTime / audio.duration) * 100);
        };
        const loaded = () => setDuration(audio.duration);

        audio.addEventListener("timeupdate", update);
        audio.addEventListener("loadedmetadata", loaded);

        return () => {
            audio.removeEventListener("timeupdate", update);
            audio.removeEventListener("loadedmetadata", loaded);
        };
    }, [listeningTest]);

    const handleFullscreen = () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current!.requestFullscreen()
                .catch((err) => {
                    console.error(`Error attempting to enable fullscreen: ${err.message}`);
                });
        } else {
            document.exitFullscreen()
                .catch((err) => {
                    console.error(`Error attempting to exit fullscreen: ${err.message}`);
                });
        }
    };

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play()
                .then(() => setIsPlaying(true))
                .catch((err) => {
                    console.error("Cannot play audio:", err);
                    setIsPlaying(false); // keep correct state if error
                });
        }
    };
    const resetAudio = () => {
        const audio = audioRef.current;
        if (audio) {
            audio.currentTime = 0;
            setProgress(0);
            setCurrentTime(0);
            setIsPlaying(false);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        const value = +e.target.value;
        if (audio && duration) {
            audio.currentTime = (value / 100) * duration;
            setProgress(value);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        const value = +e.target.value;
        setVolume(value);
        if (audio) audio.volume = value / 100;
    };

    const formatTime = (time: number) => {
        const min = Math.floor(time / 60)
            .toString()
            .padStart(2, "0");
        const sec = Math.floor(time % 60)
            .toString()
            .padStart(2, "0");
        return `${min}:${sec}`;
    };

    const handleAnswerChange = (qid: number, ans: string) => {
        setAnswers((prev) => ({ ...prev, [qid]: ans }));
    };

    const handleSubmit = async () => {
        if (!listeningTest) return;
        const dataToSend = structuredClone(listeningTest);
        if (user?.username) dataToSend.username = user.username;
        dataToSend.skill = "listening";
        delete dataToSend.audioUrl;
        dataToSend.tasks.forEach((task: TaskListening) => {
            delete task.title;
            delete task.audioIntroduction;
            task.sections.forEach((section: Section) => {
                delete section.introduction;
                delete section.imageUrl;
                section.questions.forEach((q: QuestionWithStudentAnswer) => {
                    const question = q as QuestionWithStudentAnswer;
                    const qid = question.questionId!;
                    question.studentAnswer = answers[qid] || null;
                    delete question.explanation;
                    delete question.options;
                });
            });
        });
        try {
            let res;
            if (testAnswerId) {
                res = await customFetch(`${API_URL}/verify/listening/submit?testAnswerId=${testAnswerId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dataToSend),
                });
            } else {
                res = await customFetch(`${API_URL}/verify/listening/submit`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dataToSend),
                });
            }
            const result = await res.json();
            alert("Submit successful!");
            if (mode === "fulltest") {
                navigate(`/test/reading/${testId}?testAnswerId=${testAnswerId}&mode=${mode}`);
            } else {
                navigate(`/listening-result/${result.id}`);
            }
        } catch (error) {
            console.error(error);
            alert("Error when submitting.");
        }
    };

    const currentTask = listeningTest?.tasks[currentPart - 1];
    if (!listeningTest || !currentTask) return null;

    return (
        <div ref={containerRef} className={isDarkMode ? "dark" : ""}>
            <div
                className="listening-test-container flex flex-col min-h-screen
          bg-white text-gray-900 text-sm
          dark:bg-[#202124] dark:text-gray-100
          transition-colors duration-300"
            >
                <audio ref={audioRef} src={listeningTest.audioUrl} />
                <div className="sticky top-0 z-50 shadow-sm bg-white dark:bg-[#303134] border-b border-gray-200 dark:border-gray-600">
                    <DoTestHeader
                        initialTime={3600}
                        onSubmit={handleSubmit}
                        isDarkMode={isDarkMode}
                        toggleDarkMode={toggleDarkMode}
                        onFullscreenToggle={handleFullscreen} // pass fullscreen handler
                        isHighlightMode={isHighlightMode}
                        toggleHighlightMode={toggleHighlightMode}
                    />
                    <div className="flex items-center gap-3 px-4 py-3">
                        <Button variant="outline" size="icon" onClick={resetAudio}>
                            <RotateCcw className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={togglePlayPause}
                            className="bg-teal-500 text-white hover:bg-teal-600"
                        >
                            <>
                                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            </>
                        </Button>
                        <div className="flex-1">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={progress}
                                onChange={handleSeek}
                                className="w-full"
                            />
                            <div className="text-[10px] mt-1">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </div>
                        </div>
                        <Volume2 className="w-5 h-5" />
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-24"
                        />
                    </div>
                </div>

                <main className="flex-1 p-6 w-full">
                    <h1 className="text-lg font-bold text-blue-900 mb-6 dark:text-blue-300">
                        Part {currentTask.taskNumber}: {currentTask.title}
                    </h1>
                    {currentTask.sections.map((section, sectionIdx) => {
                        // Lấy questionId đầu và cuối
                        const firstQ = section.questions[0] as QuestionWithStudentAnswer;
                        const lastQ = section.questions[section.questions.length - 1] as QuestionWithStudentAnswer;
                        const startId = firstQ.questionId!;
                        const endId = lastQ.questionId!;
                        // Chia câu hỏi thành 2 cột
                        const mid = Math.ceil(section.questions.length / 2);
                        const col1 = section.questions.slice(0, mid);
                        const col2 = section.questions.slice(mid);

                        return (
                            <div key={sectionIdx} className="mb-10">
                                <h2 className="text-base font-semibold text-teal-600 mb-4 dark:text-teal-300">
                                  Questions {startId}{startId !== endId ? `-${endId}` : ""}: {section.introduction}
                                </h2>
                                {section.imageUrl && (
                                    <div className="mb-4 flex justify-center">
                                        <img src={section.imageUrl} alt="Section related" className="max-h-60 rounded shadow" />
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[col1, col2].map((col, colIdx) => (
                                        <div key={colIdx}>
                                            {col.map((q, _idx) => {
                                                const question = q as QuestionWithStudentAnswer;
                                                const qId = question.questionId!;
                                                // Kiểm tra loại section
                                                const isSelectType = section.type === "map-labeling" || section.type === "dropdown";
                                                return (
                                                    <React.Fragment key={qId}>
                                                        <div className="mb-6">
                                                            <p className="mb-2 text-sm">
                                                                {qId}. {question.question}
                                                            </p>
                                                            {isSelectType ? (
                                                                <select
                                                                    className="w-full border p-2 rounded text-sm"
                                                                    value={answers[qId] || ""}
                                                                    onChange={e => handleAnswerChange(qId, e.target.value)}
                                                                >
                                                                    <option value="" disabled>Chọn đáp án</option>
                                                                    {question.options?.map((opt, i) => {
                                                                        // Nếu option có dạng "A. Education", lấy ký tự đầu tiên trước dấu chấm
                                                                        const value = /^[A-Z]\./.test(opt) ? opt.split(".")[0] : opt;
                                                                        return (
                                                                            <option key={i} value={value}>{opt}</option>
                                                                        );
                                                                    })}
                                                                </select>
                                                            ) : question.options?.length ? (
                                                                <div className="space-y-2 text-sm">
                                                                    {question.options.map((opt, i) => {
                                                                        // Nếu option có dạng "A. Education", lấy ký tự đầu tiên trước dấu chấm
                                                                        const value = /^[A-Z]\./.test(opt) ? opt.split(".")[0] : opt;
                                                                        return (
                                                                            <label key={i} className="flex items-center gap-2">
                                                                                <input
                                                                                    type="radio"
                                                                                    name={`q-${qId}`}
                                                                                    value={value}
                                                                                    checked={answers[qId] === value}
                                                                                    onChange={() => handleAnswerChange(qId, value)}
                                                                                />
                                                                                {opt}
                                                                            </label>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    value={answers[qId] || ""}
                                                                    onChange={(e) => handleAnswerChange(qId, e.target.value)}
                                                                    placeholder="Your answer"
                                                                    className="w-full border p-2 rounded text-sm"
                                                                />
                                                            )}
                                                        </div>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </main>

                <div className="sticky bottom-0 bg-white dark:bg-[#303134] border-t border-gray-200 dark:border-gray-600 p-4">
                    <div className="grid grid-cols-4 gap-4">
                        {listeningTest.tasks.map((task) => {
                            const isActive = currentPart === task.taskNumber;
                            return (
                                <div
                                    key={task.taskNumber}
                                    onClick={() => setCurrentPart(task.taskNumber)}
                                    className={`border rounded p-4 text-center cursor-pointer transition text-sm ${
                                        isActive
                                            ? "border-teal-500 bg-teal-50 dark:bg-teal-900 text-teal-300"
                                            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-[#303134] hover:bg-gray-100 dark:hover:bg-[#3c4043]"
                                    }`}
                                >
                                    Part {task.taskNumber}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
