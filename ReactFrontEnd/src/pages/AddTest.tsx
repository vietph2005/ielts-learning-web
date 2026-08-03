import type { FC } from 'react';
import { useState, useEffect, useCallback } from 'react';
import type { Test, WritingTask } from '@/types/apiTypes';
import { MAX_QUESTIONS_PER_SKILL, MIN_OPTIONS } from '@/types/apiTypes';

import { AddListening } from '@/components/sections/addTest/AddListening';
import { AddWriting } from '@/components/sections/addTest/AddWriting';
import { AddSpeaking } from '@/components/sections/addTest/AddSpeaking';
import { AddReading } from '@/components/sections/addTest/AddReading';
import General from '@/components/sections/addTest/General';

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
  const [testData, setTestData] = useState<TestDataState>(() => {
    const savedData = localStorage.getItem(AUTOSAVE_KEY);
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error('Error loading autosaved data:', e);
      }
    }
    return {
      testId: '',
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

  // Auto-save
  useEffect(() => {
    const saveToLocalStorage = () => {
      try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(testData));
        console.log('Auto-saved test data');
      } catch (e) {
        console.error('Error auto-saving data:', e);
      }
    };
    saveToLocalStorage();
    const intervalId = setInterval(saveToLocalStorage, AUTOSAVE_INTERVAL);
    return () => clearInterval(intervalId);
  }, [testData]);

  // Fetch test count để tạo testId
  useEffect(() => {
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
  }, []);

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
    const skillCounts = { listening: 40, reading: 40 }; // Đếm số câu hỏi

    (['listening', 'reading'] as const).forEach((skill) => {
      const tasks = testData[skill] as unknown;
      if (Array.isArray(tasks)) {
        tasks.forEach((task) => {
          if (task?.sections && Array.isArray(task.sections)) {
            task.sections.forEach((section: any) => {
              if (section?.questions && Array.isArray(section.questions)) {
                skillCounts[skill] += section.questions.length;
              }
            });
          }
        });
      }
    });

    const invalidSkills = Object.entries(skillCounts)
      .filter(([skill, count]) => skill !== 'writing' && skill !== 'speaking' && count !== MAX_QUESTIONS_PER_SKILL)
      .map(([skill, count]) => `${skill} (${count}/${MAX_QUESTIONS_PER_SKILL})`);

    if (invalidSkills.length > 0) {
      alert(`Listening and Reading must have exactly ${MAX_QUESTIONS_PER_SKILL} questions. Invalid: ${invalidSkills.join(', ')}`);
      return false;
    }

    let hasInvalidOptions = false;
    const listening = testData.listening;
    if (Array.isArray(listening)) {
      listening.forEach((task) => {
        if (task?.sections && Array.isArray(task.sections)) {
          task.sections.forEach((section: any) => {
            if (section?.questions && Array.isArray(section.questions)) {
              section.questions.forEach((q: any) => {
                // Chỉ kiểm tra options cho multiple-choice và dropdown
                if (section.type === 'multiple-choice' || section.type === 'dropdown') {
                  if (!q.options || q.options.length < MIN_OPTIONS) {
                    hasInvalidOptions = true;
                  }
                }
              });
            }
          });
        }
      });
    }

    if (hasInvalidOptions) {
      alert(`Multiple-choice and dropdown questions must have at least ${MIN_OPTIONS} options.`);
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

      const listeningCollection = {
        testId: testData.testId,
        audioUrl: listeningData.audioUrl || '',
        tasks: Object.entries(listeningData.sections || {})
          .filter(([key]) => !isNaN(Number(key)))
          .map(([taskNumber, sections]) => ({
            taskNumber: Number(taskNumber),
            sections: (sections as any[]).map((section) => ({
              sectionNumber: section.sectionNumber,
              type: section.type,
              imageUrl: section.imageUrl || '',
              introduction: section.introduction,
              questions: section.questions.map((q: any) => ({
                questionNumber: q.questionNumber,
                question: q.question,
                answer: q.answer,
                explanation: q.explanation || '',
                // Chỉ giữ options cho multiple-choice và dropdown
                options: section.type === 'multiple-choice' || section.type === 'dropdown' ? q.options || [] : [],
              })),
            })),
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

      const writingCollection = {
        testId: testData.testId,
        tasks: Object.entries(writingData)
          .filter(([key]) => !isNaN(Number(key)))
          .map(([taskNumber, task]) => {
            const t = task as WritingTask;
            return {
              taskNumber: parseInt(taskNumber) + 1,
              imageUrl: t.imageUrl || '',
              question: t.prompt || '',
            };
          }),
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

      const response = await fetch(`${API_URL}/api/teacher/request-test`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error('Failed to save test');

      const result = await response.text();
      alert(`Send request test successfully: ${result}`);
      // Xóa dữ liệu autosave sau khi lưu thành công
      localStorage.removeItem(AUTOSAVE_KEY);
      localStorage.removeItem('test_autosave_listening');
      localStorage.removeItem('test_autosave_reading');
      localStorage.removeItem('test_autosave_reading_paragraphs');
      localStorage.removeItem('test_autosave_writing');
      localStorage.removeItem('test_autosave_speaking');
    } catch (error) {
      console.error('Error saving test:', error);
      alert('Error saving test.');
    }
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
        return <AddListening onDataChange={handleListeningChange} />;
      case 'reading':
        return <AddReading onDataChange={handleReadingChange} />;
      case 'writing':
        return <AddWriting onDataChange={handleWritingChange} />;
      case 'speaking':
        return <AddSpeaking onDataChange={handleSpeakingChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen p-8 font-sans">
      <div className="max-w-[90%] mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <div className="border-b bg-gradient-to-r from-blue-600 to-blue-800 p-8">
          <h1 className="text-center text-4xl font-bold text-white mb-2">Create New Test</h1>
          <p className="text-center text-blue-100">Design your IELTS test with our intuitive interface</p>
          <p className="text-center text-blue-200 text-sm mt-2">Auto-saving enabled - Your progress is automatically saved</p>
          <button
            onClick={clearAutosavedData}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm mx-auto block"
          >
            Clear Test
          </button>
        </div>

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