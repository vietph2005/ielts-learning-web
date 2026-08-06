import type { FC } from 'react';
import { useState, useEffect, useCallback } from 'react';
import type { Test, WritingTask } from '@/types/apiTypes';
import { MAX_QUESTIONS_PER_SKILL, MIN_OPTIONS } from '@/types/apiTypes';

import { AddListening } from '@/components/sections/addTest/AddListening';
import { AddWriting } from '@/components/sections/addTest/AddWriting';
import { AddSpeaking } from '@/components/sections/addTest/AddSpeaking';
import { AddReading } from '@/components/sections/addTest/AddReading';
import General from '@/components/sections/addTest/General';
import { generateFullIELTSExcelTemplate, parseFullIELTSExcel } from '@/services/excelService';
import type { FullIELTSParseResult } from '@/services/excelService';
import { ExcelImportModal } from '@/components/sections/addTest/ExcelImportModal';

import { useParams, useNavigate } from 'react-router-dom';

interface TestDataState extends Test {
  newTag: string;
}

const AUTOSAVE_KEY = 'test_autosave_data';
const AUTOSAVE_INTERVAL = 30000; // 30 giây

const skillTabs = [
  { id: 'general', label: 'General Info' } as const,
  { id: 'listening', label: 'Listening' } as const,
  { id: 'reading', label: 'Reading' } as const,
  { id: 'writing', label: 'Writing' } as const,
  { id: 'speaking', label: 'Speaking' } as const,
];

type Skill = typeof skillTabs[number]['id'];

const API_URL = import.meta.env.VITE_API_URL;

const AddTest: FC = () => {
  const { testId: routeTestId } = useParams<{ testId?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(routeTestId);

  const [parseResult, setParseResult] = useState<FullIELTSParseResult | null>(null);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [editDataKey, setEditDataKey] = useState(0);

  const [testData, setTestData] = useState<TestDataState>(() => {
    const savedData = localStorage.getItem(AUTOSAVE_KEY);
    if (savedData && !isEditMode) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error('Error loading autosaved data:', e);
      }
    }
    return {
      testId: routeTestId || '',
      title: '',
      tags: [],
      createdAt: '',
      listening: [],
      reading: [],
      writing: [],
      speaking: [],
      newTag: '',
    };
  });

  const [activeTab, setActiveTab] = useState<Skill>('general');

  // Load test data when in Edit mode
  useEffect(() => {
    if (!routeTestId) return;

    const fetchTestDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/api/teacher/test/${routeTestId}`, {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch test for editing');
        const data = await response.json();

        // 1. General Test Data
        if (data.test) {
          setTestData({
            testId: data.test.testId,
            title: data.test.testTitle || '',
            tags: data.test.tags || [],
            createdAt: data.test.createAt || data.test.createdAt || new Date().toISOString(),
            listening: [],
            reading: [],
            writing: [],
            speaking: [],
            newTag: '',
          });
        }

        // 2. Listening Data
        if (data.listening) {
          const lData = data.listening;
          const sectionsMap: Record<number, any[]> = {};
          const taskAudiosMap: Record<number, string> = {};

          if (Array.isArray(lData.tasks)) {
            lData.tasks.forEach((t: any) => {
              if (t.taskNumber) {
                sectionsMap[t.taskNumber] = t.sections || [];
                if (t.audioUrl) taskAudiosMap[t.taskNumber] = t.audioUrl;
              }
            });
          }

          localStorage.setItem(
            'test_autosave_listening',
            JSON.stringify({
              audioUrl: lData.audioUrl || '',
              sections: sectionsMap,
              taskAudios: taskAudiosMap,
            })
          );
        }

        // 3. Reading Data
        if (data.reading) {
          const rData = data.reading;
          const sectionsMap: Record<number, any[]> = {};
          const paragraphsMap: Record<number, string> = {};

          if (Array.isArray(rData.tasks)) {
            rData.tasks.forEach((t: any) => {
              if (t.taskNumber) {
                sectionsMap[t.taskNumber] = t.sections || [];
                paragraphsMap[t.taskNumber] = t.paragraph || '';
              }
            });
          }

          localStorage.setItem('test_autosave_reading', JSON.stringify(sectionsMap));
          localStorage.setItem('test_autosave_reading_paragraphs', JSON.stringify(paragraphsMap));
        }

        // 4. Writing Data
        if (data.writing) {
          const wData = data.writing;
          const tasksList: any[] = [];
          if (Array.isArray(wData.tasks)) {
            wData.tasks.forEach((t: any) => {
              tasksList.push({
                prompt: t.question || t.prompt || '',
                imageUrl: t.imageUrl || '',
              });
            });
          }
          localStorage.setItem('test_autosave_writing', JSON.stringify(tasksList));
        }

        // 5. Speaking Data
        if (data.speaking) {
          const sData = data.speaking;
          const speakingList = [
            { questions: (sData.part1?.questions || []).map((q: any) => q.question) },
            {
              cueCard: {
                topic: sData.part2?.question || '',
                points: sData.part2?.cueCards || ['', '', ''],
              },
            },
            { questions: (sData.part3?.questions || []).map((q: any) => q.question) },
          ];
          localStorage.setItem('test_autosave_speaking', JSON.stringify(speakingList));
        }

        setEditDataKey((prev) => prev + 1);
      } catch (err) {
        console.error('Error fetching test details:', err);
        alert('Lỗi khi tải thông tin bài test để chỉnh sửa.');
      }
    };

    fetchTestDetails();
  }, [routeTestId]);

  // Auto-save with quota fallback
  useEffect(() => {
    const saveToLocalStorage = () => {
      try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(testData));
      } catch (e) {
        console.warn('QuotaExceededError saving testData to localStorage:', e);
      }
    };
    saveToLocalStorage();
    const intervalId = setInterval(saveToLocalStorage, AUTOSAVE_INTERVAL);
    return () => clearInterval(intervalId);
  }, [testData]);

  // Fetch test count để tạo testId khi tạo mới
  useEffect(() => {
    if (isEditMode) return;
    const generateTestId = async () => {
      try {
        const response = await fetch(`${API_URL}/api/test/count`);
        if (!response.ok) throw new Error('Failed to fetch test count');
        const countValue = await response.json();
        setTestData((prev) => ({
          ...prev,
          testId: `T${String(countValue + 1).padStart(3, '0')}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
      } catch (error) {
        console.error('Error fetching test count:', error);
      }
    };
    if (!testData.testId) generateTestId();
  }, [isEditMode]);

  const clearAutosavedData = () => {
    if (window.confirm('Are you sure you want to clear all saved data and start over?')) {
      localStorage.removeItem(AUTOSAVE_KEY);
      localStorage.removeItem('test_autosave_listening');
      localStorage.removeItem('test_autosave_reading');
      localStorage.removeItem('test_autosave_reading_paragraphs');
      localStorage.removeItem('test_autosave_writing');
      localStorage.removeItem('test_autosave_speaking');
      window.location.reload();
    }
  };

  const validateTest = () => {
    const skillCounts = { listening: 0, reading: 0 };

    // Count Listening questions
    try {
      const listeningData = JSON.parse(localStorage.getItem('test_autosave_listening') || '{}');
      const sectionsMap = listeningData.sections || listeningData;
      if (sectionsMap && typeof sectionsMap === 'object') {
        Object.values(sectionsMap).forEach((sections: any) => {
          if (Array.isArray(sections)) {
            sections.forEach((sec: any) => {
              if (sec?.questions && Array.isArray(sec.questions)) {
                skillCounts.listening += sec.questions.length;
              }
            });
          }
        });
      }
    } catch (e) {
      console.error('Error counting listening questions:', e);
    }

    // Count Reading questions
    try {
      const readingData = JSON.parse(localStorage.getItem('test_autosave_reading') || '{}');
      if (readingData && typeof readingData === 'object') {
        Object.values(readingData).forEach((passage: any) => {
          if (Array.isArray(passage)) {
            passage.forEach((sec: any) => {
              if (sec?.questions && Array.isArray(sec.questions)) {
                skillCounts.reading += sec.questions.length;
              }
            });
          }
        });
      }
    } catch (e) {
      console.error('Error counting reading questions:', e);
    }

    const invalidSkills = Object.entries(skillCounts)
      .filter(([skill, count]) => skill !== 'writing' && skill !== 'speaking' && count !== MAX_QUESTIONS_PER_SKILL)
      .map(([skill, count]) => `${skill} (${count}/${MAX_QUESTIONS_PER_SKILL})`);

    if (invalidSkills.length > 0) {
      alert(`Listening and Reading must have exactly ${MAX_QUESTIONS_PER_SKILL} questions. Current count: ${invalidSkills.join(', ')}`);
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateTest()) return;

    try {
      const listeningData = JSON.parse(localStorage.getItem('test_autosave_listening') || '[]');
      const readingData = JSON.parse(localStorage.getItem('test_autosave_reading') || '[]');
      const readingParagraphs = JSON.parse(localStorage.getItem('test_autosave_reading_paragraphs') || '{}');
      const writingData = JSON.parse(localStorage.getItem('test_autosave_writing') || '[]');
      const speakingData = JSON.parse(localStorage.getItem('test_autosave_speaking') || '[]');

      const listeningSectionsMap = listeningData.sections || (listeningData[1] ? listeningData : {});
      const listeningCollection = {
        testId: testData.testId,
        audioUrl: listeningData.audioUrl || '',
        tasks: Object.entries(listeningSectionsMap)
          .filter(([key]) => !isNaN(Number(key)))
          .map(([taskNumber, sections]) => ({
            taskNumber: Number(taskNumber),
            audioUrl: listeningData.taskAudios?.[Number(taskNumber)] || listeningData.audioUrl || '',
            sections: Array.isArray(sections) ? (sections as any[]).map((section) => ({
              sectionNumber: section.sectionNumber,
              type: section.type,
              imageUrl: section.imageUrl || '',
              introduction: section.introduction,
              questions: Array.isArray(section.questions) ? section.questions.map((q: any) => ({
                questionNumber: q.questionNumber,
                question: q.question,
                answer: q.answer,
                explanation: q.explanation || '',
                options: section.type === 'multiple-choice' || section.type === 'dropdown' ? q.options || [] : [],
              })) : [],
            })) : [],
          })),
      };

      const readingCollection = {
        testId: testData.testId,
        tasks: Object.entries(readingData)
          .filter(([key]) => !isNaN(Number(key)))
          .map(([taskNumber, passage]: [string, any]) => ({
            taskNumber: Number(taskNumber),
            paragraph: readingParagraphs[taskNumber] || '',
            sections: Array.isArray(passage)
              ? passage.map((section: any) => ({
                  sectionNumber: section.sectionNumber || 0,
                  type: section.type || '',
                  imageUrl: section.imageUrl || '',
                  introduction: section.introduction || '',
                  questions: Array.isArray(section.questions)
                    ? section.questions.map((q: any) => ({
                        questionNumber: q.questionNumber || 0,
                        question: q.question || '',
                        answer: q.answer || '',
                        explanation: q.explanation || '',
                        options: section.type === 'multiple-choice' || section.type === 'dropdown' ? q.options || [] : [],
                      }))
                    : [],
                }))
              : [],
          })),
      };

      const writingTasksList = Array.isArray(writingData) ? writingData : Object.values(writingData);
      const writingCollection = {
        testId: testData.testId,
        tasks: writingTasksList.map((t: any, idx: number) => ({
          taskNumber: idx + 1,
          imageUrl: t.imageUrl || '',
          question: t.prompt || t.question || '',
        })),
      };

      const speakingCollection = {
        testId: testData.testId,
        part1: {
          partNumber: 1,
          title: 'Introduction and Interview',
          questions: (speakingData?.[0]?.questions || []).map((question: string, index: number) => ({
            questionNumber: index + 1,
            question: question,
          })),
        },
        part2: {
          partNumber: 2,
          title: 'Long Turn',
          question: speakingData?.[1]?.cueCard?.topic || '',
          cueCards: speakingData?.[1]?.cueCard?.points || [],
        },
        part3: {
          partNumber: 3,
          title: 'Discussion',
          questions: (speakingData?.[2]?.questions || []).map((question: string, index: number) => ({
            questionNumber: index + 1,
            question: question,
          })),
        },
      };

      const requestBody = {
        test: {
          testId: testData.testId,
          testTitle: testData.title,
          createAt: testData.createdAt,
          tags: testData.tags,
        },
        listening: listeningCollection,
        reading: readingCollection,
        writing: writingCollection,
        speaking: speakingCollection,
      };

      const endpoint = isEditMode
        ? `${API_URL}/api/teacher/test/${testData.testId}`
        : `${API_URL}/api/teacher/request-test`;

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error(isEditMode ? 'Failed to update test' : 'Failed to save test');

      const result = await response.text();
      alert(isEditMode ? `Update test successfully: ${result}` : `Send request test successfully: ${result}`);
      // Xóa dữ liệu autosave sau khi lưu thành công
      localStorage.removeItem(AUTOSAVE_KEY);
      localStorage.removeItem('test_autosave_listening');
      localStorage.removeItem('test_autosave_reading');
      localStorage.removeItem('test_autosave_reading_paragraphs');
      localStorage.removeItem('test_autosave_writing');
      localStorage.removeItem('test_autosave_speaking');

      if (isEditMode) {
        navigate('/manage-tests');
      }
    } catch (error) {
      console.error('Error saving test:', error);
      alert('Error saving test.');
    }
  };

  // Excel handlers
  const handleExcelFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await parseFullIELTSExcel(file);
      setParseResult(res);
      setIsExcelModalOpen(true);
    } catch (err) {
      alert('Lỗi đọc file Excel. Vui lòng kiểm tra lại định dạng file!');
    } finally {
      e.target.value = '';
    }
  };

  const handleConfirmExcelImport = (mode: 'overwrite' | 'merge') => {
    if (!parseResult || !parseResult.data) return;

    const { data } = parseResult;

    // Apply Title & Tags if present
    if (data.title || data.tags) {
      setTestData((prev) => ({
        ...prev,
        title: data.title || prev.title,
        tags: data.tags && data.tags.length > 0 ? (mode === 'overwrite' ? data.tags : [...prev.tags, ...data.tags]) : prev.tags,
      }));
    }

    // Apply Listening
    if (data.listening) {
      try {
        const currentSaved = localStorage.getItem('test_autosave_listening');
        const parsedCurrent = currentSaved ? JSON.parse(currentSaved) : {};
        const newSections = mode === 'overwrite' || !parsedCurrent.sections ? data.listening : { ...parsedCurrent.sections, ...data.listening };
        localStorage.setItem(
          'test_autosave_listening',
          JSON.stringify({ ...parsedCurrent, sections: newSections })
        );
      } catch (e) {
        console.warn('LocalStorage error setting listening:', e);
      }
    }

    // Apply Reading
    if (data.reading) {
      try {
        if (data.reading.sections) {
          const currentSaved = localStorage.getItem('test_autosave_reading');
          const parsedCurrent = currentSaved ? JSON.parse(currentSaved) : {};
          const newSections = mode === 'overwrite' || !parsedCurrent ? data.reading.sections : { ...parsedCurrent, ...data.reading.sections };
          localStorage.setItem('test_autosave_reading', JSON.stringify(newSections));
        }

        if (data.reading.paragraphs) {
          const currentSavedP = localStorage.getItem('test_autosave_reading_paragraphs');
          const parsedCurrentP = currentSavedP ? JSON.parse(currentSavedP) : {};
          const newP = mode === 'overwrite' || !parsedCurrentP ? data.reading.paragraphs : { ...parsedCurrentP, ...data.reading.paragraphs };
          localStorage.setItem('test_autosave_reading_paragraphs', JSON.stringify(newP));
        }
      } catch (e) {
        console.warn('LocalStorage error setting reading:', e);
      }
    }

    // Apply Writing
    if (data.writing && data.writing.length > 0) {
      try {
        const currentW = JSON.parse(localStorage.getItem('test_autosave_writing') || '[]');
        const newW = mode === 'overwrite' ? data.writing : [...currentW, ...data.writing];
        localStorage.setItem('test_autosave_writing', JSON.stringify(newW));
      } catch (e) {
        console.warn('LocalStorage error setting writing:', e);
      }
    }

    // Apply Speaking
    if (data.speaking && data.speaking.length > 0) {
      try {
        localStorage.setItem('test_autosave_speaking', JSON.stringify(data.speaking));
      } catch (e) {
        console.warn('LocalStorage error setting speaking:', e);
      }
    }

    setIsExcelModalOpen(false);
    alert('Import dữ liệu từ file Excel thành công! Đang tải lại tiến trình...');
    window.location.reload();
  };

  // Memoized skill handlers
  const handleSkillDataChange = (skill: keyof Test, data: any) => {
    setTestData((prev) => ({ ...prev, [skill]: data }));
  };

  const handleListeningChange = useCallback((data: any) => {
    handleSkillDataChange('listening', data);
  }, []);

  const handleReadingChange = useCallback((data: any) => {
    handleSkillDataChange('reading', data);
  }, []);

  const handleWritingChange = useCallback((data: any) => {
    handleSkillDataChange('writing', data);
  }, []);

  const handleSpeakingChange = useCallback((data: any) => {
    handleSkillDataChange('speaking', data);
  }, []);

  const addTag = () => {
    if (testData.newTag.trim()) {
      setTestData((prev) => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: '',
      }));
    }
  };

  const removeTag = (index: number) => {
    setTestData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleInputChange = (field: keyof TestDataState, value: string) => {
    setTestData((prev) => ({ ...prev, [field]: value }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <General testData={testData} handleInputChange={handleInputChange} addTag={addTag} removeTag={removeTag} />;
      case 'listening':
        return <AddListening key={`listening-${editDataKey}`} onDataChange={handleListeningChange} />;
      case 'reading':
        return <AddReading key={`reading-${editDataKey}`} onDataChange={handleReadingChange} />;
      case 'writing':
        return <AddWriting key={`writing-${editDataKey}`} onDataChange={handleWritingChange} />;
      case 'speaking':
        return <AddSpeaking key={`speaking-${editDataKey}`} onDataChange={handleSpeakingChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen p-8 font-sans">
      <div className="max-w-[90%] mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <div className="border-b bg-gradient-to-r from-blue-600 to-blue-800 p-8">
          <h1 className="text-center text-4xl font-bold text-white mb-2">
            {isEditMode ? `Edit Test (${testData.testId})` : 'Create New Test'}
          </h1>
          <p className="text-center text-blue-100">Design your IELTS test with our intuitive interface</p>
          <p className="text-center text-blue-200 text-sm mt-2">Auto-saving enabled - Your progress is automatically saved</p>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <button
              onClick={generateFullIELTSExcelTemplate}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition-all shadow-xs flex items-center gap-1.5"
            >
              📥 Tải Mẫu Excel (Full 4 Kỹ Năng)
            </button>
            <label className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-all shadow-xs cursor-pointer flex items-center gap-1.5">
              📤 Import Đề Thi Từ Excel
              <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={handleExcelFileUpload}
              />
            </label>
            <button
              onClick={clearAutosavedData}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition-all shadow-xs"
            >
              Clear Test
            </button>
          </div>
        </div>

        <ExcelImportModal
          isOpen={isExcelModalOpen}
          parseResult={parseResult}
          onClose={() => setIsExcelModalOpen(false)}
          onConfirmImport={handleConfirmExcelImport}
        />

        <div className="p-8 bg-gray-50">
          <div className="flex gap-1 bg-white rounded-xl shadow-sm p-2 mb-8">
            {skillTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 font-medium rounded-lg transition-all ${
                  activeTab === tab.id ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">{renderTabContent()}</div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => {
                const currentIndex = skillTabs.findIndex((tab) => tab.id === activeTab);
                if (currentIndex > 0) setActiveTab(skillTabs[currentIndex - 1].id);
              }}
              className={`px-8 py-3 rounded-lg transition-all font-medium ${
                activeTab === 'general'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
              }`}
              disabled={activeTab === 'general'}
            >
              ← Previous
            </button>

            {activeTab === 'speaking' ? (
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-10 py-3 rounded-lg hover:bg-green-700 shadow-sm transition-all font-medium"
              >
                Save Test
              </button>
            ) : (
              <button
                onClick={() => {
                  const currentIndex = skillTabs.findIndex((tab) => tab.id === activeTab);
                  if (currentIndex < skillTabs.length - 1) setActiveTab(skillTabs[currentIndex + 1].id);
                }}
                className="bg-blue-600 text-white px-10 py-3 rounded-lg hover:bg-blue-700 shadow-sm transition-all font-medium"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTest;