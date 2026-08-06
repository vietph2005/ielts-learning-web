import React, { useState, useRef, useEffect } from 'react';
import type { Section, Question } from '@/types/apiTypes';
import { Play, Pause, RotateCcw, Volume2, X } from 'lucide-react';

interface SectionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskNumber: number;
  audioUrl?: string | null;
  sections: Section[];
}

export const SectionPreviewModal: React.FC<SectionPreviewModalProps> = ({
  isOpen,
  onClose,
  taskNumber,
  audioUrl,
  sections,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [localAnswers, setLocalAnswers] = useState<Record<number, string>>({});
  const [showAnswerKey, setShowAnswerKey] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const loadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(100);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', loadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', loadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  // Reset audio when modal closes or audioUrl changes
  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setLocalAnswers({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error('Audio play error:', err));
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
    const newProgress = parseFloat(e.target.value);
    const audio = audioRef.current;
    if (audio && audio.duration) {
      const newTime = (newProgress / 100) * audio.duration;
      audio.currentTime = newTime;
      setProgress(newProgress);
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionNum: number, val: string) => {
    setLocalAnswers((prev) => ({ ...prev, [questionNum]: val }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <span className="bg-white/20 text-white font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
              Preview Mode
            </span>
            <h3 className="text-xl font-bold font-sans">Listening - Task {taskNumber}</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAnswerKey(!showAnswerKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                showAnswerKey
                  ? 'bg-amber-400 text-gray-900 shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {showAnswerKey ? '🔒 Hide Answer Keys' : '🔑 Show Answer Keys'}
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
              title="Close Preview"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Audio Player Bar */}
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center gap-4 shadow-inner border-b border-slate-800">
          {audioUrl ? (
            <>
              <audio ref={audioRef} src={audioUrl} key={audioUrl} />
              <button
                onClick={resetAudio}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                title="Reset Audio"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={togglePlayPause}
                className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-transform active:scale-95 shadow-md"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>
              <div className="flex-1 flex flex-col gap-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleSeek}
                  className="w-full accent-blue-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-slate-400" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 accent-blue-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </>
          ) : (
            <div className="w-full py-1 text-center text-slate-400 text-sm italic">
              ⚠️ Chưa có file âm thanh cho Task này. Tải lên audio để nghe thử.
            </div>
          )}
        </div>

        {/* Modal Body / Sections Preview */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1 bg-gray-50/50">
          {sections.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-sans">
              Chưa có section nào trong Task này. Hãy nhấn nút "+ Add Section" để tạo.
            </div>
          ) : (
            sections.map((sec, secIdx) => {
              const isSelectType = sec.type === 'map-labeling' || sec.type === 'dropdown';
              return (
                <div key={secIdx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200/80">
                  <div className="border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
                    <h4 className="font-bold text-gray-800 text-base font-sans">
                      Section {sec.sectionNumber}{' '}
                      <span className="text-xs font-normal text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full ml-2 uppercase tracking-wide">
                        {sec.type || 'N/A'}
                      </span>
                    </h4>
                  </div>

                  {/* Introduction */}
                  {sec.introduction ? (
                    <div className="bg-blue-50/60 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6 text-sm text-gray-700 font-sans whitespace-pre-wrap leading-relaxed">
                      {sec.introduction}
                    </div>
                  ) : (
                    <div className="text-xs italic text-gray-400 mb-4">Chưa nhập Introduction</div>
                  )}

                  {/* Image (for diagram/map) */}
                  {sec.imageUrl && (
                    <div className="mb-6 flex justify-center bg-gray-100 p-3 rounded-lg border border-gray-200">
                      <img
                        src={sec.imageUrl}
                        alt={`Section ${sec.sectionNumber} Diagram`}
                        className="max-h-72 object-contain rounded-md shadow-sm"
                      />
                    </div>
                  )}

                  {/* Questions */}
                  {sec.questions.length === 0 ? (
                    <div className="text-sm italic text-gray-400 py-4 text-center">
                      Chưa tạo câu hỏi nào cho Section này.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sec.questions.map((q: Question, qIndex: number) => {
                        const qNum = q.questionNumber || qIndex + 1;
                        const userAns = localAnswers[qNum] || '';
                        return (
                          <div
                            key={qIndex}
                            className="bg-gray-50 border border-gray-200/60 p-4 rounded-lg flex flex-col justify-between space-y-3 hover:border-blue-200 transition-colors"
                          >
                            <div>
                              <p className="font-medium text-gray-900 text-sm mb-2 font-sans">
                                <span className="font-bold text-blue-600 mr-1.5">{qNum}.</span>
                                {q.question || <span className="italic text-gray-400">(Chưa nhập câu hỏi)</span>}
                              </p>

                              {/* Input options based on type */}
                              {isSelectType ? (
                                <select
                                  value={userAns}
                                  onChange={(e) => handleAnswerChange(qNum, e.target.value)}
                                  className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all font-sans"
                                >
                                  <option value="">-- Select Answer --</option>
                                  {q.options?.map((opt, optIdx) => (
                                    <option key={optIdx} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : sec.type === 'multiple-choice' ? (
                                <div className="space-y-2 text-sm font-sans mt-2">
                                  {q.options?.map((opt, optIdx) => (
                                    <label
                                      key={optIdx}
                                      className="flex items-center gap-2.5 p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                                    >
                                      <input
                                        type="radio"
                                        name={`preview-q-${qNum}`}
                                        value={opt}
                                        checked={userAns === opt}
                                        onChange={() => handleAnswerChange(qNum, opt)}
                                        className="text-blue-600 focus:ring-blue-400"
                                      />
                                      <span>{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  placeholder="Type answer here..."
                                  value={userAns}
                                  onChange={(e) => handleAnswerChange(qNum, e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all font-sans"
                                />
                              )}
                            </div>

                            {/* Answer key & Explanation when toggled */}
                            {showAnswerKey && (
                              <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-slate-700 bg-amber-50/80 p-2.5 rounded-md border-l-2 border-amber-400">
                                <div>
                                  <span className="font-bold text-amber-800">Correct Answer:</span>{' '}
                                  <span className="font-semibold text-emerald-700">
                                    {q.answer || '(Chưa điền đáp án)'}
                                  </span>
                                </div>
                                {q.explanation && (
                                  <div className="mt-1 text-slate-600 italic">
                                    <span className="font-semibold not-italic">Explanation:</span>{' '}
                                    {q.explanation}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-white px-6 py-3 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500 font-sans">
          <span>💡 Đây là chế độ xem trước dành cho giáo viên. Thao tác thử không ảnh hưởng đến dữ liệu form.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg text-sm transition-colors shadow-sm"
          >
            Đóng Preview
          </button>
        </div>
      </div>
    </div>
  );
};
