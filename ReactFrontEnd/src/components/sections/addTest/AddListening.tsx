import type { FC } from 'react';
import { useState, useEffect } from 'react';
import type { Question, Section, QuestionValue } from '@/types/apiTypes';
import { skillColors } from '@/types/apiTypes';
import { SectionComponent } from './SectionComponent';
import { SectionPreviewModal } from './SectionPreviewModal';
import { uploadFile } from '../../../services/fileUploadService';
import { useAuth } from '@/contexts/AuthContext';

const LISTENING_AUTOSAVE_KEY = 'test_autosave_listening';

interface AddListeningProps {
  onDataChange: (data: { [key: number]: Section[] }) => void;
}

export const AddListening: FC<AddListeningProps> = ({ onDataChange }) => {
  const { user } = useAuth();
  const [sections, setSections] = useState<{ [key: number]: Section[] }>(() => {
    // Try to load saved listening data
    const savedData = localStorage.getItem(LISTENING_AUTOSAVE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        return parsedData.sections || {
          1: [{ sectionNumber: 1, introduction: '', questions: [], type: '', imageUrl: '' }],
          2: [{ sectionNumber: 1, introduction: '', questions: [], type: '', imageUrl: '' }],
          3: [{ sectionNumber: 1, introduction: '', questions: [], type: '', imageUrl: '' }],
          4: [{ sectionNumber: 1, introduction: '', questions: [], type: '', imageUrl: '' }],
        };
      } catch (e) {
        console.error('Error loading autosaved listening data:', e);
      }
    }
    // Return default state if no saved data
    return {
      1: [{ sectionNumber: 1, introduction: '', questions: [], type: '', imageUrl: '' }],
      2: [{ sectionNumber: 1, introduction: '', questions: [], type: '', imageUrl: '' }],
      3: [{ sectionNumber: 1, introduction: '', questions: [], type: '', imageUrl: '' }],
      4: [{ sectionNumber: 1, introduction: '', questions: [], type: '', imageUrl: '' }],
    };
  });

  const [questionCounter, setQuestionCounter] = useState<number>(() => {
    // Calculate initial question counter based on existing questions
    let count = 1;
    Object.values(sections).forEach((taskSections) => {
      taskSections.forEach((section) => {
        count += section.questions.length;
      });
    });
    return count;
  });
  
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(() => {
    // Try to load saved audio URL
    const savedData = localStorage.getItem(LISTENING_AUTOSAVE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        return parsedData.audioUrl;
      } catch (e) {
        console.error('Error loading autosaved audio URL:', e);
        return null;
      }
    }
    return null;
  });

  // State for per-task audio files
  const [taskAudios, setTaskAudios] = useState<{ [key: number]: string }>(() => {
    const savedData = localStorage.getItem(LISTENING_AUTOSAVE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        return parsedData.taskAudios || {};
      } catch (e) {
        console.error('Error loading autosaved task audios:', e);
      }
    }
    return {};
  });

  const [isUploadingTaskAudio, setIsUploadingTaskAudio] = useState<{ [key: number]: boolean }>({});
  const [taskAudioError, setTaskAudioError] = useState<{ [key: number]: string | null }>({});
  const [previewTaskNum, setPreviewTaskNum] = useState<number | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showImageConfirmation, setShowImageConfirmation] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadImageError, setUploadImageError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<{ taskNum: number; sectionNum: number } | null>(null);
  const [_selectedImage, setSelectedImage] = useState<string | null>(null);

  // Auto-save effect
  useEffect(() => {
    try {
      const dataToSave = {
        sections,
        audioUrl,
        taskAudios,
      };
      localStorage.setItem(LISTENING_AUTOSAVE_KEY, JSON.stringify(dataToSave));
      onDataChange(sections);
    } catch (e) {
      console.error('Error auto-saving listening data:', e);
    }
  }, [sections, audioUrl, taskAudios, onDataChange]);

  const handleAddSection = (taskNum: number) => {
    const currentSections = sections[taskNum];
    const newSectionNumber = currentSections.length + 1;
    setSections({
      ...sections,
      [taskNum]: [
        ...currentSections,
        { sectionNumber: newSectionNumber, introduction: '', questions: [], type: '', imageUrl: '' },
      ] as Section[],
    });
  };

  const handleAddQuestion = (taskNum: number, sectionNum: number) => {
    const newQuestion: Question = {
      questionNumber: questionCounter,
      question: '',
      answer: '',
      explanation: '',
      options: ['', '', '', '']
    };

    const updatedSections = [...sections[taskNum]];
    const sectionIndex = updatedSections.findIndex((s) => s.sectionNumber === sectionNum);
    if (sectionIndex === -1) return;

    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      questions: [...updatedSections[sectionIndex].questions, newQuestion],
    };

    setSections({ ...sections, [taskNum]: updatedSections });
    setQuestionCounter((prev) => prev + 1);
  };

  const handleDeleteQuestion = (taskNum: number, sectionNum: number, questionIndex: number) => {
    const updatedSections = [...sections[taskNum]];
    const sectionIndex = updatedSections.findIndex((s) => s.sectionNumber === sectionNum);
    if (sectionIndex === -1) return;

    const updatedQuestions = [...updatedSections[sectionIndex].questions];
    updatedQuestions.splice(questionIndex, 1);
    updatedSections[sectionIndex].questions = updatedQuestions;

    setSections({ ...sections, [taskNum]: updatedSections });

    let totalQuestions = 0;
    Object.values(sections).forEach((taskSections) => {
      taskSections.forEach((section) => {
        totalQuestions += section.questions.length;
      });
    });
    setQuestionCounter(totalQuestions + 1);
  };

  const handleMethodChange = (taskNum: number, sectionNum: number, type: string) => {
    const updatedSections = [...sections[taskNum]];
    const sectionIndex = updatedSections.findIndex((s) => s.sectionNumber === sectionNum);
    if (sectionIndex === -1) return;

    updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], type };
    setSections({ ...sections, [taskNum]: updatedSections });
  };

  const handleUpdateQuestion = (
    taskNum: number,
    sectionNum: number,
    questionIndex: number,
    field: keyof Question,
    value: QuestionValue
  ) => {
    const updatedSections = [...sections[taskNum]];
    const sectionIndex = updatedSections.findIndex((s) => s.sectionNumber === sectionNum);
    if (sectionIndex === -1) return;

    const updatedQuestions = [...updatedSections[sectionIndex].questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      [field]: value,
    };

    updatedSections[sectionIndex].questions = updatedQuestions;
    setSections({ ...sections, [taskNum]: updatedSections });
  };

  const handleUpdateIntroduction = (taskNum: number, sectionNum: number, introduction: string) => {
    const updatedSections = [...sections[taskNum]];
    const sectionIndex = updatedSections.findIndex((s) => s.sectionNumber === sectionNum);
    if (sectionIndex === -1) return;

    updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], introduction };
    setSections({ ...sections, [taskNum]: updatedSections });
  };

  const handleDeleteSection = (taskNum: number, sectionNum: number) => {
    const updatedSections = sections[taskNum].filter((s) => s.sectionNumber !== sectionNum);
    const newSections = { ...sections, [taskNum]: updatedSections };

    let totalQuestions = 0;
    Object.values(newSections).forEach((taskSections) => {
      taskSections.forEach((section) => {
        totalQuestions += section.questions.length;
      });
    });

    setSections(newSections);
    setQuestionCounter(totalQuestions + 1);
  };

  const handleAudioChange = (file: File | null) => {
    if (file) {
      setAudioFile(file);
      setShowConfirmation(true);
    } else {
      setAudioFile(null);
      setAudioUrl(null);
    }
  };

  const handleConfirmUpload = async () => {
    if (!audioFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const url = await uploadFile(audioFile, 'audio', 'listening', user?.role, user?.username);
      setAudioUrl(url);
      // Update the autosave data with the new URL
      const savedData = localStorage.getItem(LISTENING_AUTOSAVE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        parsedData.audioUrl = url;
        localStorage.setItem(LISTENING_AUTOSAVE_KEY, JSON.stringify(parsedData));
      }
      console.log('Audio uploaded successfully:', url);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload audio');
    } finally {
      setIsUploading(false);
      setShowConfirmation(false);
    }
  };

  const handleTaskAudioUpload = async (taskNum: number, file: File | null) => {
    if (!file) return;

    // Validate size (< 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setTaskAudioError((prev) => ({ ...prev, [taskNum]: 'Dung lượng file audio phải nhỏ hơn 50MB!' }));
      return;
    }

    // Validate MIME type
    const validAudioTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/ogg', 'audio/x-m4a', 'audio/mp4'];
    if (!file.type.startsWith('audio/') && !validAudioTypes.includes(file.type)) {
      setTaskAudioError((prev) => ({
        ...prev,
        [taskNum]: 'Định dạng file không hỗ trợ! Vui lòng chọn file .mp3, .wav, .m4a hoặc .ogg',
      }));
      return;
    }

    setTaskAudioError((prev) => ({ ...prev, [taskNum]: null }));
    setIsUploadingTaskAudio((prev) => ({ ...prev, [taskNum]: true }));

    try {
      const url = await uploadFile(file, 'audio', 'listening', user?.role, user?.username);
      setTaskAudios((prev) => ({ ...prev, [taskNum]: url }));
    } catch (err) {
      setTaskAudioError((prev) => ({
        ...prev,
        [taskNum]: err instanceof Error ? err.message : 'Tải audio thất bại',
      }));
    } finally {
      setIsUploadingTaskAudio((prev) => ({ ...prev, [taskNum]: false }));
    }
  };

  const handleRemoveTaskAudio = (taskNum: number) => {
    setTaskAudios((prev) => {
      const next = { ...prev };
      delete next[taskNum];
      return next;
    });
    setTaskAudioError((prev) => ({ ...prev, [taskNum]: null }));
  };

  const handleOpenPreview = (taskNum: number) => {
    // Pause any playing audio on page
    document.querySelectorAll('audio').forEach((a) => {
      try {
        a.pause();
      } catch (e) {}
    });
    setPreviewTaskNum(taskNum);
  };

  const handleImageChange = (taskNum: number, sectionNum: number, file: File | null) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadImageError('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
      setCurrentSection({ taskNum, sectionNum });
      setSelectedImage(URL.createObjectURL(file));
      setShowImageConfirmation(true);
    }
  };

  const handleConfirmImageUpload = async () => {
    if (!imageFile || !currentSection) return;

    setIsUploadingImage(true);
    setUploadImageError(null);

    try {
      const url = await uploadFile(imageFile, 'image', 'listening', user?.role, user?.username);
      const { taskNum, sectionNum } = currentSection;
      
      const updatedSections = [...(sections[taskNum] || [])];
      const sectionIndex = updatedSections.findIndex(s => s.sectionNumber === sectionNum);
      
      if (sectionIndex >= 0) {
        updatedSections[sectionIndex] = {
          ...updatedSections[sectionIndex],
          imageUrl: url
        };
        setSections({ ...sections, [taskNum]: updatedSections });
      }

      console.log('Image uploaded successfully:', url);
    } catch (error) {
      setUploadImageError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
      setShowImageConfirmation(false);
      setImageFile(null);
      setCurrentSection(null);
      setSelectedImage(null);
    }
  };

  const handleCancelImageUpload = () => {
    setShowImageConfirmation(false);
    setImageFile(null);
    setCurrentSection(null);
    setSelectedImage(null);
    setUploadImageError(null);
  };

  return (
    <div className="mb-8 font-sans">
      <h2 className={`text-xl font-semibold mb-4 ${skillColors.listening.bg} p-3 rounded font-sans`}>
        Listening (Question {questionCounter - 1})
      </h2>

      <div className="mb-6 p-4 bg-slate-50 border rounded-lg">
        <label className="block font-semibold mb-2 text-slate-800">Global Shared Audio File (Optional):</label>
        <input
          type="file"
          accept="audio/*"
          className="w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
          onChange={(e) => handleAudioChange(e.target.files?.[0] || null)}
        />
        {audioUrl && (
          <div className="mt-2 text-sm text-green-600 flex items-center gap-1 font-medium">
            ✓ Shared Audio file uploaded successfully!
          </div>
        )}
        {uploadError && (
          <div className="mt-2 text-sm text-red-600 font-medium">
            Error: {uploadError}
          </div>
        )}
      </div>

      {/* Audio Upload Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-4 font-sans">Confirm Audio Upload</h3>
            <p className="mb-4 text-sm text-gray-600 font-sans">Are you sure you want to upload this shared audio file?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setAudioFile(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-sans"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpload}
                disabled={isUploading}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 font-sans"
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            {uploadError && (
              <p className="text-red-500 text-xs mt-2 font-sans">{uploadError}</p>
            )}
          </div>
        </div>
      )}

      {/* Image Upload Confirmation Modal */}
      {showImageConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-4 font-sans">Confirm Image Upload</h3>
            <p className="mb-4 text-sm text-gray-600 font-sans">Are you sure you want to upload this image?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancelImageUpload}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-sans"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImageUpload}
                disabled={isUploadingImage}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 font-sans"
              >
                {isUploadingImage ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            {uploadImageError && (
              <p className="text-red-500 text-xs mt-2 font-sans">{uploadImageError}</p>
            )}
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-6">
        {[1, 2, 3, 4].map((taskNum) => (
          <div key={`listening-task-${taskNum}`} className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
            {/* Task Header with Preview Button */}
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2 border-b pb-3">
              <h3 className="font-bold text-gray-800 font-sans text-lg flex items-center gap-2">
                <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Listening
                </span>
                Task {taskNum}
              </h3>
              <button
                type="button"
                onClick={() => handleOpenPreview(taskNum)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                disabled={isUploadingTaskAudio[taskNum]}
              >
                👁️ Xem trước Giao diện Task {taskNum}
              </button>
            </div>

            {/* Task Audio Uploader */}
            <div className="mb-5 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <label className="block text-sm font-semibold text-slate-800 mb-2 font-sans flex items-center justify-between">
                <span>🎵 Audio File cho Task {taskNum}:</span>
                {taskAudios[taskNum] && (
                  <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    ✓ Đã tải Audio
                  </span>
                )}
              </label>

              {taskAudios[taskNum] ? (
                <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded border border-slate-200">
                  <audio controls src={taskAudios[taskNum]} className="h-9 flex-1 min-w-[200px]" />
                  <button
                    type="button"
                    onClick={() => handleRemoveTaskAudio(taskNum)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded text-xs transition-colors"
                  >
                    🗑️ Xóa / Đổi Audio khác
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="audio/*"
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
                  disabled={isUploadingTaskAudio[taskNum]}
                  onChange={(e) => handleTaskAudioUpload(taskNum, e.target.files?.[0] || null)}
                />
              )}

              {isUploadingTaskAudio[taskNum] && (
                <div className="mt-2 text-xs text-blue-600 font-medium animate-pulse">
                  ⏳ Đang tải file âm thanh cho Task {taskNum}...
                </div>
              )}

              {taskAudioError[taskNum] && (
                <div className="mt-2 text-xs text-red-600 font-medium">
                  ❌ {taskAudioError[taskNum]}
                </div>
              )}
            </div>

            {/* Sections in Task */}
            {sections[taskNum]?.map((section) => (
              <SectionComponent
                key={`listening-section-${taskNum}-${section.sectionNumber}`}
                section={section}
                taskNum={taskNum}
                skillType="listening"
                onMethodChange={(type: string) => handleMethodChange(taskNum, section.sectionNumber, type)}
                onAddQuestion={() => handleAddQuestion(taskNum, section.sectionNumber)}
                onUpdateQuestion={(qIndex, field, value) =>
                  handleUpdateQuestion(taskNum, section.sectionNumber, qIndex, field, value)
                }
                onUpdateIntroduction={(intro) => handleUpdateIntroduction(taskNum, section.sectionNumber, intro)}
                onUpdateImage={(file) => handleImageChange(taskNum, section.sectionNumber, file)}
                onDeleteSection={() => handleDeleteSection(taskNum, section.sectionNumber)}
                onDeleteQuestion={(qIndex) =>
                  handleDeleteQuestion(taskNum, section.sectionNumber, qIndex)
                }
              />
            ))}

            <button
              onClick={() => handleAddSection(taskNum)}
              className={`w-full ${skillColors.listening.button} rounded-lg p-2 text-gray-700 ${skillColors.listening.buttonHover} transition-all font-sans mt-2`}
            >
              + Add Section
            </button>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewTaskNum !== null && (
        <SectionPreviewModal
          isOpen={previewTaskNum !== null}
          onClose={() => setPreviewTaskNum(null)}
          taskNumber={previewTaskNum}
          audioUrl={taskAudios[previewTaskNum] || audioUrl}
          sections={sections[previewTaskNum] || []}
        />
      )}
    </div>
  );
};