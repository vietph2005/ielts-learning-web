import type { FC } from 'react';
import { useState, useEffect } from 'react';
import type { Question, Section, QuestionValue } from '@/types/apiTypes';
import { skillColors } from '@/types/apiTypes';
import { SectionComponent } from './SectionComponent';
import { uploadFile } from '../../../services/fileUploadService';

const READING_AUTOSAVE_KEY = 'test_autosave_reading';

interface AddReadingProps {
  onDataChange: (data: { [key: number]: Section[] }) => void;
}

export const AddReading: FC<AddReadingProps> = ({ onDataChange }) => {
  // Init Sections
  const [sections, setSections] = useState<{ [key: number]: Section[] }>(() => {
    try {
      const savedData = localStorage.getItem(READING_AUTOSAVE_KEY);
      const parsed = savedData ? JSON.parse(savedData) : null;

      if (
        parsed &&
        typeof parsed === 'object' &&
        [1, 2, 3].every(taskNum => Array.isArray(parsed[taskNum]))
      ) {
        return parsed;
      }
    } catch (e) {
      console.error('Error loading reading data:', e);
    }

    return {
      1: [{ sectionNumber: 1, introduction: '', questions: [], type: '' }],
      2: [{ sectionNumber: 1, introduction: '', questions: [], type: '' }],
      3: [{ sectionNumber: 1, introduction: '', questions: [], type: '' }]
    };
  });

  // Init Paragraphs
  const [paragraphs, setParagraphs] = useState<{ [key: number]: string }>(() => {
    try {
      const savedData = localStorage.getItem(READING_AUTOSAVE_KEY + '_paragraphs');
      const parsed = savedData ? JSON.parse(savedData) : null;

      if (
        parsed &&
        typeof parsed === 'object' &&
        [1, 2, 3].every(taskNum => typeof parsed[taskNum] === 'string')
      ) {
        return parsed;
      }
    } catch (e) {
      console.error('Error loading paragraph data:', e);
    }

    return { 1: '', 2: '', 3: '' };
  });

  // Init Question Counter
  const [questionCounter, setQuestionCounter] = useState<number>(() => {
    let count = 1;
    Object.values(sections).forEach(taskSections => {
      if (Array.isArray(taskSections)) {
        taskSections.forEach(section => {
          if (Array.isArray(section.questions)) {
            count += section.questions.length;
          }
        });
      }
    });
    return count;
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showImageConfirmation, setShowImageConfirmation] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadImageError, setUploadImageError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<{ taskNum: number; sectionNum: number } | null>(null);
  const [_selectedImage, setSelectedImage] = useState<string | null>(null);

  // Auto save sections
  useEffect(() => {
    try {
      localStorage.setItem(READING_AUTOSAVE_KEY, JSON.stringify(sections));
      onDataChange(sections);
    } catch (e) {
      console.error('Failed to save reading sections:', e);
    }
  }, [sections, onDataChange]);

  // Auto save paragraphs
  useEffect(() => {
    try {
      localStorage.setItem(READING_AUTOSAVE_KEY + '_paragraphs', JSON.stringify(paragraphs));
    } catch (e) {
      console.error('Failed to save reading paragraphs:', e);
    }
  }, [paragraphs]);

  const handleAddSection = (taskNum: number) => {
    const currentSections = sections[taskNum] || [];
    const newSectionNumber = currentSections.length + 1;
    setSections({
      ...sections,
      [taskNum]: [
        ...currentSections,
        { sectionNumber: newSectionNumber, introduction: '', questions: [], type: '' }
      ] as Section[]
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

    const updatedSections = [...(sections[taskNum] || [])];
    const sectionIndex = updatedSections.findIndex(s => s.sectionNumber === sectionNum);
    if (sectionIndex >= 0) {
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        questions: [...updatedSections[sectionIndex].questions, newQuestion]
      };

      setSections({ ...sections, [taskNum]: updatedSections });
      setQuestionCounter(prev => prev + 1);
    }
  };

  const handleDeleteQuestion = (taskNum: number, sectionNum: number, questionIndex: number) => {
    const updatedSections = [...(sections[taskNum] || [])];
    const sectionIndex = updatedSections.findIndex(s => s.sectionNumber === sectionNum);
    if (sectionIndex >= 0) {
      const updatedQuestions = [...updatedSections[sectionIndex].questions];
      updatedQuestions.splice(questionIndex, 1);
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        questions: updatedQuestions
      };
      setSections({ ...sections, [taskNum]: updatedSections });
    }
  };

  const handleDeleteSection = (taskNum: number, sectionNum: number) => {
    const filteredSections = (sections[taskNum] || []).filter(s => s.sectionNumber !== sectionNum);
    const newSections = { ...sections, [taskNum]: filteredSections };

    // Recalculate total questions
    let total = 0;
    Object.values(newSections).forEach(taskSections => {
      if (Array.isArray(taskSections)) {
        taskSections.forEach(section => {
          total += section.questions.length || 0;
        });
      }
    });

    setSections(newSections);
    setQuestionCounter(total + 1);
  };

  const handleMethodChange = (taskNum: number, sectionNum: number, type: string) => {
    const updatedSections = [...(sections[taskNum] || [])];
    const sectionIndex = updatedSections.findIndex(s => s.sectionNumber === sectionNum);
    if (sectionIndex >= 0) {
      updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], type };
      setSections({ ...sections, [taskNum]: updatedSections });
    }
  };

  const handleUpdateIntroduction = (taskNum: number, sectionNum: number, introduction: string) => {
    const updatedSections = [...(sections[taskNum] || [])];
    const sectionIndex = updatedSections.findIndex(s => s.sectionNumber === sectionNum);
    if (sectionIndex >= 0) {
      updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], introduction };
      setSections({ ...sections, [taskNum]: updatedSections });
    }
  };

  const handleUpdateTaskParagraph = (taskNum: number, content: string) => {
    setParagraphs({ ...paragraphs, [taskNum]: content });
  };

  const handleUpdateQuestion = (
    taskNum: number,
    sectionNum: number,
    questionIndex: number,
    field: keyof Question,
    value: QuestionValue
  ) => {
    const updatedSections = [...(sections[taskNum] || [])];
    const sectionIndex = updatedSections.findIndex(s => s.sectionNumber === sectionNum);
    if (sectionIndex >= 0) {
      const updatedQuestions = [...updatedSections[sectionIndex].questions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        [field]: value
      };
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        questions: updatedQuestions
      };
      setSections({ ...sections, [taskNum]: updatedSections });
    }
  };

  const handleImageChange = (taskNum: number, sectionNum: number, file: File | null) => {
    if (file) {
      if (file.size > 35 * 1024 * 1024) {
        setUploadImageError('Image size should be less than 35MB');
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
        localStorage.setItem(READING_AUTOSAVE_KEY, JSON.stringify({ ...sections, [taskNum]: updatedSections }));
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
      <h2 className={`text-xl font-semibold mb-4 ${skillColors.reading.bg} p-3 rounded font-sans`}>
        Reading (Question {questionCounter - 1})
      </h2>

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
        {[1, 2, 3].map((taskNum) => (
          <div key={`reading-task-${taskNum}`} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4 font-sans">Task {taskNum}</h3>

            <div>
              <label className="block font-medium mb-2 font-sans">Paragraph:</label>
              <textarea
                className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all whitespace-pre-line"
                value={paragraphs[taskNum]}
                onChange={(e) => handleUpdateTaskParagraph(taskNum, e.target.value)}
                rows={6}
                placeholder="Enter paragraph text..."
              />
            </div>

            {(sections[taskNum] || []).map((section) => (
              <SectionComponent
                key={`reading-section-${taskNum}-${section.sectionNumber}`}
                section={section}
                taskNum={taskNum}
                skillType="reading"
                onMethodChange={(type: string) => handleMethodChange(taskNum, section.sectionNumber, type)}
                onAddQuestion={() => handleAddQuestion(taskNum, section.sectionNumber)}
                onUpdateQuestion={(qIndex: number, field: keyof Question, value: QuestionValue) =>
                  handleUpdateQuestion(taskNum, section.sectionNumber, qIndex, field, value)
                }
                onUpdateIntroduction={(intro: string) =>
                  handleUpdateIntroduction(taskNum, section.sectionNumber, intro)
                }
                onUpdateImage={(file) => handleImageChange(taskNum, section.sectionNumber, file)}
                onDeleteSection={() => handleDeleteSection(taskNum, section.sectionNumber)}
                onDeleteQuestion={(qIndex) => handleDeleteQuestion(taskNum, section.sectionNumber, qIndex)}
              />
            ))}

            <button
              type="button"
              onClick={() => handleAddSection(taskNum)}
              className={`w-full ${skillColors.reading.button} rounded-lg p-2 text-gray-700 ${skillColors.reading.buttonHover} transition-all font-sans`}
            >
              + Add Section
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
