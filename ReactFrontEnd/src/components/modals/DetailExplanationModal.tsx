import React, { useEffect, useState } from "react";
import { X, CheckCircle, XCircle, BookOpen, Headphones, Volume2, FileText, Mic, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface DetailExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultId?: string;
  skill?: "listening" | "reading" | "writing" | "speaking" | "fulltest" | string;
  initialData?: any;
}

export const DetailExplanationModal: React.FC<DetailExplanationModalProps> = ({
  isOpen,
  onClose,
  resultId,
  skill = "listening",
  initialData,
}) => {
  const [data, setData] = useState<any>(initialData || null);
  const [loading, setLoading] = useState<boolean>(!initialData && !!resultId);
  const [error, setError] = useState<string | null>(null);
  const [currentTaskIdx, setCurrentTaskIdx] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"listening" | "reading" | "writing" | "speaking">("listening");

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setLoading(false);
      return;
    }
    if (!isOpen || !resultId) return;

    setLoading(true);
    setError(null);

    let url = "";
    const lowerSkill = skill.toLowerCase();
    if (lowerSkill === "listening") {
      url = `${API_URL}/api/result/listening/by-id?answerId=${resultId}`;
    } else if (lowerSkill === "reading") {
      url = `${API_URL}/api/result/reading/by-id?answerId=${resultId}`;
    } else if (lowerSkill === "writing") {
      url = `${API_URL}/api/result/${resultId}`;
    } else if (lowerSkill === "speaking") {
      url = `${API_URL}/api/result/speaking/${resultId}`;
    } else if (lowerSkill === "fulltest") {
      url = `${API_URL}/api/result/fulltest/${resultId}`;
    } else {
      url = `${API_URL}/api/result/${resultId}`;
    }

    fetch(url, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải chi tiết kết quả.");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Lỗi khi nạp dữ liệu.");
        setLoading(false);
      });
  }, [isOpen, resultId, skill, initialData]);

  if (!isOpen) return null;

  const isSpecialType = (type: string) => type === "multiple-choice" || type === "dropdown";
  const extractFirstLetters = (ans: string) => {
    if (!ans) return "";
    return ans
      .split(",")
      .map((s) => s.trim().charAt(0).toUpperCase())
      .sort()
      .join(",");
  };

  const isAnswerCorrect = (q: any, type?: string) => {
    if (!q.studentAnswer || !q.answer) return false;
    if (type && isSpecialType(type)) {
      const student = extractFirstLetters(q.studentAnswer);
      const correct = extractFirstLetters(q.answer);
      return student === correct;
    }
    const studentAns = q.studentAnswer.toString().trim().toLowerCase();
    const correctAns = q.answer.toString().trim().toLowerCase();
    return studentAns.includes(correctAns) || correctAns.includes(studentAns);
  };

  const renderListeningOrReadingDetails = (resultObj: any, currentSkillName: string) => {
    const tasks = resultObj.tasks || resultObj.taskReadingAnswer || [];
    const currentTask = tasks[currentTaskIdx];

    return (
      <div className="space-y-6">
        {/* Header Band Score */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">IELTS {currentSkillName.toUpperCase()} RESULT</p>
            <h2 className="text-2xl font-bold mt-1">Chi Tiết Điểm & Giải Thích</h2>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">Đúng: <strong>{resultObj.totalCorrect}/{resultObj.totalQuestions}</strong> câu</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">Tỷ lệ: <strong>{resultObj.totalQuestions ? Math.round((resultObj.totalCorrect / resultObj.totalQuestions) * 100) : 0}%</strong></span>
            </div>
          </div>
          <div className="bg-white text-emerald-800 rounded-2xl px-6 py-4 text-center shadow-lg">
            <span className="text-xs uppercase text-gray-500 font-semibold block">Band Score</span>
            <span className="text-4xl font-extrabold">{resultObj.band}</span>
            <span className="text-xs text-gray-400 block mt-0.5">/ 9.0</span>
          </div>
        </div>

        {/* Task Selection Buttons */}
        {tasks.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {tasks.map((task: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setCurrentTaskIdx(idx)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  currentTaskIdx === idx
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Part {task.taskNumber || idx + 1}
              </button>
            ))}
          </div>
        )}

        {/* Question Details List */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            Part {currentTask?.taskNumber || currentTaskIdx + 1} - Chi Tiết Lời Giải & Đáp Án
          </h3>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {currentTask?.sections?.flatMap((section: any, sIdx: number) =>
              section.questions?.map((q: any, qIdx: number) => {
                const correct = isAnswerCorrect(q, section.type);
                const uniqueKey = q.questionId ? `modal-q-${q.questionId}` : `modal-q-${sIdx}-${qIdx}`;
                return (
                  <div key={uniqueKey} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-emerald-300 transition-colors">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${correct ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                          {correct ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                        </div>
                        <span className="font-bold text-gray-800 text-base">Câu {q.questionId || qIdx + 1}</span>
                      </div>
                      <Badge className={correct ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>
                        {correct ? "Chính xác" : "Chưa chính xác"}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-1">Câu hỏi:</h4>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-xl font-medium text-sm leading-relaxed">{q.question}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                        <span className="text-xs text-gray-500 font-medium block mb-1">Đáp án của bạn:</span>
                        <span className={`font-semibold ${correct ? "text-emerald-600" : "text-red-600"}`}>
                          {q.studentAnswer || <span className="italic text-gray-400">(Chưa trả lời)</span>}
                        </span>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                        <span className="text-xs text-emerald-700 font-medium block mb-1">Đáp án đúng:</span>
                        <span className="font-semibold text-emerald-700">{q.answer}</span>
                      </div>
                    </div>

                    {/* LỜI GIẢI THÍCH CHI TIẾT */}
                    {q.explanation ? (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 space-y-1.5">
                        <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                          <Sparkles className="h-4 w-4 text-blue-600" />
                          <span>Giải thích chi tiết:</span>
                        </div>
                        <div
                          className="text-sm text-gray-800 leading-relaxed font-normal"
                          dangerouslySetInnerHTML={{ __html: q.explanation }}
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-500 italic">
                        Chưa có lời giải thích chi tiết cho câu hỏi này.
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderWritingDetails = (writingData: any) => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-orange-600 to-amber-700 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-xs font-semibold uppercase tracking-wider">IELTS WRITING EVALUATION</p>
            <h2 className="text-2xl font-bold mt-1">Kết Quả Đánh Giá Chi Tiết AI</h2>
            <p className="text-orange-100 text-xs mt-2">Phân tích Task 1 & Task 2 từ AI Examiner</p>
          </div>
          <div className="bg-white text-orange-800 rounded-2xl px-6 py-4 text-center shadow-lg">
            <span className="text-xs uppercase text-gray-500 font-semibold block">Overall Band</span>
            <span className="text-4xl font-extrabold">{writingData.band || writingData.score || "_"}</span>
            <span className="text-xs text-gray-400 block mt-0.5">/ 9.0</span>
          </div>
        </div>

        {/* Task 1 / Task 2 Tabs */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentTaskIdx(0)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              currentTaskIdx === 0 ? "bg-orange-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Task 1 {writingData.task1?.score ? `(Band ${writingData.task1.score})` : ""}
          </button>
          <button
            onClick={() => setCurrentTaskIdx(1)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              currentTaskIdx === 1 ? "bg-orange-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Task 2 {writingData.task2?.score ? `(Band ${writingData.task2.score})` : ""}
          </button>
        </div>

        {/* Task Content */}
        {(() => {
          const task = currentTaskIdx === 0 ? writingData.task1 : writingData.task2;
          if (!task) return <div className="text-center text-gray-500 py-8">Chưa có dữ liệu cho Task này.</div>;

          return (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
                <h4 className="font-bold text-gray-800 text-base">Đề bài:</h4>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-xl text-sm leading-relaxed">{task.question}</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-3">
                <h4 className="font-bold text-amber-900 text-base">Bài làm của học sinh (Số từ: {task.wordCount}):</h4>
                <p className="text-gray-800 bg-white p-4 rounded-xl text-sm leading-relaxed whitespace-pre-line border border-amber-100">{task.answer}</p>
              </div>

              {task.feedback && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <h4 className="font-bold text-blue-900 text-base flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    Nhận xét & Lời khuyên tổng quan:
                  </h4>
                  <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-blue-100">
                    {task.feedback.overallComment}
                  </p>
                </div>
              )}

              {task.sampleAnswer && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <h4 className="font-bold text-emerald-900 text-base">Bài mẫu tham khảo:</h4>
                  <p className="text-gray-800 bg-white p-4 rounded-xl text-sm leading-relaxed whitespace-pre-line border border-emerald-100">{task.sampleAnswer}</p>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    );
  };

  const renderSpeakingDetails = (speakingData: any) => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-xs font-semibold uppercase tracking-wider">IELTS SPEAKING EVALUATION</p>
            <h2 className="text-2xl font-bold mt-1">Kết Quả Đánh Giá Phát Âm & Ngữ Pháp AI</h2>
          </div>
          <div className="bg-white text-purple-800 rounded-2xl px-6 py-4 text-center shadow-lg">
            <span className="text-xs uppercase text-gray-500 font-semibold block">Overall Band</span>
            <span className="text-4xl font-extrabold">{speakingData.band ?? "-"}</span>
            <span className="text-xs text-gray-400 block mt-0.5">/ 9.0</span>
          </div>
        </div>

        {/* Parts buttons */}
        <div className="flex justify-center gap-2">
          {["Part 1", "Part 2", "Part 3"].map((pName, pIdx) => (
            <button
              key={pIdx}
              onClick={() => setCurrentTaskIdx(pIdx)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                currentTaskIdx === pIdx ? "bg-purple-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {pName}
            </button>
          ))}
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {(() => {
            const partKey = currentTaskIdx === 0 ? "part1" : currentTaskIdx === 1 ? "part2" : "part3";
            const partData = speakingData[partKey];
            if (!partData) return <div className="text-center text-gray-500 py-8">Chưa có dữ liệu cho phần này.</div>;

            if (currentTaskIdx === 1) {
              return (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <h4 className="font-bold text-gray-800 text-base">Part 2 Cue Card Question:</h4>
                  <p className="text-gray-800 bg-purple-50 p-4 rounded-xl font-medium text-sm">{partData.question}</p>
                  <div>
                    <h5 className="font-semibold text-gray-700 text-sm mb-1">Transcript (Bài nói):</h5>
                    <p className="text-gray-800 bg-gray-50 p-4 rounded-xl italic text-sm">{partData.transcript}</p>
                  </div>
                </div>
              );
            }

            const questions = partData.questions || [];
            return questions.map((q: any, qIdx: number) => (
              <div key={qIdx} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
                <h4 className="font-bold text-gray-800 text-base">Câu hỏi {qIdx + 1}: {q.question}</h4>
                <div>
                  <h5 className="font-semibold text-gray-700 text-xs mb-1">Transcript:</h5>
                  <p className="text-gray-800 bg-purple-50 p-3 rounded-xl italic text-sm">"{q.transcript}"</p>
                </div>
              </div>
            ));
          })()}
        </div>
      </div>
    );
  };

  const renderFullTestDetails = () => {
    return (
      <div className="space-y-6">
        {/* Skill Selector Tabs */}
        <div className="flex justify-center gap-2 bg-gray-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab("listening")}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === "listening" ? "bg-white text-emerald-600 shadow-md" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Headphones className="h-4 w-4" /> Listening
          </button>
          <button
            onClick={() => setActiveTab("reading")}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === "reading" ? "bg-white text-blue-600 shadow-md" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <BookOpen className="h-4 w-4" /> Reading
          </button>
          <button
            onClick={() => setActiveTab("writing")}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === "writing" ? "bg-white text-orange-600 shadow-md" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileText className="h-4 w-4" /> Writing
          </button>
          <button
            onClick={() => setActiveTab("speaking")}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === "speaking" ? "bg-white text-purple-600 shadow-md" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Mic className="h-4 w-4" /> Speaking
          </button>
        </div>

        {/* Render selected skill in fulltest */}
        {(() => {
          const subData = data[activeTab];
          if (!subData) {
            return (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 font-medium">Chưa hoàn thành hoặc chưa có kết quả cho kỹ năng {activeTab.toUpperCase()}</p>
              </div>
            );
          }
          if (activeTab === "listening" || activeTab === "reading") {
            return renderListeningOrReadingDetails(subData, activeTab);
          } else if (activeTab === "writing") {
            return renderWritingDetails(subData);
          } else {
            return renderSpeakingDetails(subData);
          }
        })()}
      </div>
    );
  };

  const currentSkillLower = skill.toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#202124] w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
        {/* Top Dialog Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#303134]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              Chi Tiết Kết Quả & Lời Giải Thích Bài Thi
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-20 text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
              <p className="text-gray-600 font-medium">Đang tải giải thích chi tiết...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-600 font-medium">
              {error}
            </div>
          ) : !data ? (
            <div className="py-12 text-center text-gray-500 font-medium">
              Không có dữ liệu bài thi.
            </div>
          ) : currentSkillLower === "fulltest" ? (
            renderFullTestDetails()
          ) : currentSkillLower === "writing" ? (
            renderWritingDetails(data)
          ) : currentSkillLower === "speaking" ? (
            renderSpeakingDetails(data)
          ) : (
            renderListeningOrReadingDetails(data, currentSkillLower)
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#303134] flex justify-end">
          <Button onClick={onClose} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl">
            Đóng Pop-up
          </Button>
        </div>
      </div>
    </div>
  );
};
