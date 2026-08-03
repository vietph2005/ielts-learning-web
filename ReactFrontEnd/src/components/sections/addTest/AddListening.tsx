import type { FC } from 'react';
import { useState, useEffect } from 'react';
import type { Question, Section, QuestionValue } from '@/types/apiTypes';
import { skillColors } from '@/types/apiTypes';
import { SectionComponent } from './SectionComponent';
import { uploadFile } from '../../../services/fileUploadService';

const LISTENING_AUTOSAVE_KEY = 'test_autosave_listening';

interface AddListeningProps {
  onDataChange: (data: { [key: number]: Section[] }) => void;
}

export const AddListening: FC<AddListeningProps> = ({ onDataChange }) => {
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
        audioUrl
      };
      localStorage.setItem(LISTENING_AUTOSAVE_KEY, JSON.stringify(dataToSave));
      onDataChange(sections);
    } catch (e) {
      console.error('Error auto-saving listening data:', e);
    }
  }, [sections, audioUrl, onDataChange]);

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
      const url = await uploadFile(audioFile, 'audio');
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

  // const handleCancelUpload = () => {
  //   setShowConfirmation(false);
  //   setAudioFile(null);
  // };

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
      const url = await uploadFile(imageFile, 'image');
      const { taskNum, sectionNum } = currentSection;
      
      const updatedSections = [...(sections[taskNum] || [])];
      const sectionIndex = updatedSections.findIndex(s => s.sectionNumber === sectionNum);
      
      if (sectionIndex >= 0) {
        updatedSections[sectionIndex] = {
          ...updatedSections[sectionIndex],
          imageUrl: url
        };
        setSections({ ...sections, [taskNum]: updatedSections });
        localStorage.setItem(LISTENING_AUTOSAVE_KEY, JSON.stringify({ ...sections, [taskNum]: updatedSections }));
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
    <div className="mb-8">
      <h2 className={`text-xl font-semibold mb-4 ${skillColors.listening.bg} p-3 rounded font-sans`}>
        Listening (Question {questionCounter - 1})
      </h2>

      <div className="mb-6">
        <label className="block font-medium mb-2">Shared Audio File:</label>
        <input
          type="file"
          accept="audio/*"
          className="w-full"
          onChange={(e) => handleAudioChange(e.target.files?.[0] || null)}
        />
        {audioUrl && (
          <div className="mt-2 text-sm text-green-600">
            Audio file uploaded successfully!
          </div>
        )}
        {uploadError && (
          <div className="mt-2 text-sm text-red-600">
            Error: {uploadError}
          </div>
        )}
      </div>

      {/* Audio Upload Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Audio Upload</h3>
            <p className="mb-4">Are you sure you want to upload this audio file?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setAudioFile(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpload}
                disabled={isUploading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            {uploadError && (
              <p className="text-red-500 mt-2">{uploadError}</p>
            )}
          </div>
        </div>
      )}

      {/* Image Upload Confirmation Modal */}
      {showImageConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Image Upload</h3>
            <p className="mb-4">Are you sure you want to upload this image?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancelImageUpload}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImageUpload}
                disabled={isUploadingImage}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isUploadingImage ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            {uploadImageError && (
              <p className="text-red-500 mt-2">{uploadImageError}</p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {[1, 2, 3, 4].map((taskNum) => (
          <div key={`listening-task-${taskNum}`} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4 font-sans">Task {taskNum}</h3>

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
              className={`w-full ${skillColors.listening.button} rounded-lg p-2 text-gray-700 ${skillColors.listening.buttonHover} transition-all font-sans`}
            >
              + Add Section
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};