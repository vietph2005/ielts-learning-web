import apiClient from "@/lib/apiClient";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DoTestHeader } from "@/components/layout/doTest/DoTestHeader";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

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
    audioUrl?: string;
    audioIntroduction?: string;
    sections: Section[];
};

interface QuestionWithStudentAnswer extends Question {
    studentAnswer?: string | null;
    questionId?: number;
}

interface ListeningTest {
    testId: string;
    audioUrl?: string;
    tasks: TaskListening[];
    username?: string;
    skill?: string;
}

export default function ListeningTest() {
    const { testId } = useParams<{ testId: string }>();
    const [searchParams] = useSearchParams();
    const testAnswerId = searchParams.get("testAnswerId");
    const mode = searchParams.get("mode");
    const [currentPart, setCurrentPart] = useState(1);
    const [listeningTest, setListeningTest] = useState<ListeningTest | null>(null);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [_isSubmitted, setIsSubmitted] = useState(false);

    const { user } = useAuth();
    const navigate = useNavigate();

    const audioRef = useRef<HTMLAudioElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
    const [isHighlightMode, setIsHighlightMode] = useState(false);

    // Audio Player State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [_isMuted, _setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);

    const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
    const toggleHighlightMode = () => setIsHighlightMode((prev) => !prev);

    useEffect(() => {
        localStorage.setItem("darkMode", isDarkMode ? "true" : "false");
    }, [isDarkMode]);

    useEffect(() => {
        if (!testId) return;
        apiClient.get<any>(`/tests/${testId}/listening`)
            .then((data) => {
                if (!data) return;
                let questionId = 1;
                const updated = structuredClone(data);
                if (updated.tasks && Array.isArray(updated.tasks)) {
                    updated.tasks.forEach((task: TaskListening) => {
                        if (task.sections && Array.isArray(task.sections)) {
                            task.sections.forEach((section: Section) => {
                                if (section.questions && Array.isArray(section.questions)) {
                                    section.questions.forEach((q: QuestionWithStudentAnswer) => {
                                        (q as QuestionWithStudentAnswer).questionId = questionId++;
                                    });
                                }
                            });
                        }
                    });
                }
                setListeningTest(updated);
            })
            .catch((err) => {
                console.error("Failed to load listening test:", err);
            });
    }, [testId]);

    const currentTask = listeningTest?.tasks[currentPart - 1];

    useEffect(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        setProgress(0);
        setDuration(0);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, [currentPart]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => {
            setCurrentTime(audio.currentTime);
            setProgress((audio.currentTime / audio.duration) * 100 || 0);
        };

        const updateDuration = () => {
            setDuration(audio.duration || 0);
        };

        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", updateDuration);

        return () => {
            audio.removeEventListener("timeupdate", updateTime);
            audio.removeEventListener("loadedmetadata", updateDuration);
        };
    }, [currentTask]);

    const togglePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!audioRef.current) return;
        const seekTime = (parseFloat(e.target.value) / 100) * duration;
        audioRef.current.currentTime = seekTime;
        setProgress(parseFloat(e.target.value));
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value) / 100;
        setVolume(val);
        if (audioRef.current) {
            audioRef.current.volume = val;
        }
    };

    const resetAudio = () => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = 0;
        setProgress(0);
        setCurrentTime(0);
    };

    const handleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch((err) => console.error(err));
        } else {
            document.exitFullscreen();
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "00:00";
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
        setIsSubmitted(true);
        const dataToSend: any = structuredClone(listeningTest);
        dataToSend.username = user?.username || "anonymous";
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
                    delete question.options;
                });
            });
        });
        try {
            const url = testAnswerId ? `/test-answers/listening?testAnswerId=${testAnswerId}` : `/test-answers/listening`;
            const result: any = await apiClient.post(url, dataToSend);
            alert("Submit successful!");
            if (mode === "fulltest") {
                navigate(`/test/reading/${testId}?testAnswerId=${testAnswerId}&mode=${mode}`);
            } else {
                const resId = result?.id || result?._id;
                navigate(`/listening-result/${resId}`);
            }
        } catch (error: any) {
            console.error(error);
            alert("Error when submitting: " + (error?.message || error));
        } finally {
            setIsSubmitted(false);
        }
    };

    if (!listeningTest || !currentTask) return null;

    return (
        <div ref={containerRef} className={isDarkMode ? "dark" : ""}>
            <div
                className="listening-test-container flex flex-col min-h-screen
          bg-white text-gray-900 text-sm
          dark:bg-[#202124] dark:text-gray-100
          transition-colors duration-300"
            >
                <audio ref={audioRef} src={currentTask?.audioUrl || listeningTest.audioUrl} key={currentTask?.audioUrl || listeningTest.audioUrl} />
                <div className="sticky top-0 z-50 shadow-sm bg-white dark:bg-[#303134] border-b border-gray-200 dark:border-gray-600">
                    <DoTestHeader
                        initialTime={3600}
                        onSubmit={handleSubmit}
                        isDarkMode={isDarkMode}
                        toggleDarkMode={toggleDarkMode}
                        onFullscreenToggle={handleFullscreen}
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
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
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
                            value={volume * 100}
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
                        const firstQ = section.questions[0] as QuestionWithStudentAnswer;
                        const lastQ = section.questions[section.questions.length - 1] as QuestionWithStudentAnswer;
                        const startId = firstQ.questionId!;
                        const endId = lastQ.questionId!;
                        const mid = Math.ceil(section.questions.length / 2);
                        const col1 = section.questions.slice(0, mid);
                        const col2 = section.questions.slice(mid);

                        return (
                            <div key={sectionIdx} className="mb-10">
                                <h2 className="text-base font-semibold text-teal-600 mb-2 dark:text-teal-300">
                                  Questions {startId}{startId !== endId ? `-${endId}` : ""}
                                </h2>
                                {section.introduction && (
                                    <div className="text-sm text-gray-700 italic mb-4 whitespace-pre-line dark:text-gray-300">
                                        {section.introduction}
                                    </div>
                                )}
                                {section.imageUrl && (
                                    <div className="mb-4 flex justify-center">
                                        <img src={section.imageUrl} alt="Section related" className="max-h-60 rounded shadow" />
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[col1, col2].map((col, colIdx) => (
                                        <div key={colIdx}>
                                            {col.map((q) => {
                                                const question = q as QuestionWithStudentAnswer;
                                                const qId = question.questionId!;
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
                                                                        const value = /^[A-Z]\./.test(opt) ? opt.split(".")[0] : opt;
                                                                        return (
                                                                            <option key={i} value={value}>{opt}</option>
                                                                        );
                                                                    })}
                                                                </select>
                                                            ) : question.options?.length ? (
                                                                <div className="space-y-2 text-sm">
                                                                    {question.options.map((opt, i) => {
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
