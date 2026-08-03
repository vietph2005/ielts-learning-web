import type { FC } from 'react';
import { useState } from 'react';
import type { Question, Section, QuestionValue } from '../../types/test';
import { skillColors } from '../../types/test';
import { SectionComponent } from './SectionComponent';

export const AddListening: FC = () => {
  const [sections, setSections] = useState<{ [key: number]: Section[] }>({
    1: [{ sectionNumber: 1, introduction: '', questions: [], method: '' }],
    2: [{ sectionNumber: 1, introduction: '', questions: [], method: '' }],
    3: [{ sectionNumber: 1, introduction: '', questions: [], method: '' }],
    4: [{ sectionNumber: 1, introduction: '', questions: [], method: '' }]
  });
  const [questionCounter, setQuestionCounter] = useState(1);

  const handleAddSection = (taskNum: number) => {
    const currentSections = sections[taskNum];
    const newSectionNumber = currentSections.length + 1;
    setSections({
      ...sections,
      [taskNum]: [...currentSections, { sectionNumber: newSectionNumber, introduction: '', questions: [], method: '' }]
    });
  };

  const handleAddQuestion = (taskNum: number, sectionNum: number) => {
    const newQuestion: Question = {
      questionNumber: questionCounter,
      question: '',
      answer: '',
      explanation: '',
      options: ['', '', '', ''],
      isRichText: false
    };

    const updatedSections = [...sections[taskNum]];
    const sectionIndex = updatedSections.findIndex(s => s.sectionNumber === sectionNum);
    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      questions: [...updatedSections[sectionIndex].questions, newQuestion]
    };
    setSections({
      ...sections,
      [taskNum]: updatedSections
    });

    setQuestionCounter(prev => prev + 1);
  };

  const handleMethodChange = (taskNum: number, sectionNum: number, method: string) => {
    const updatedSections = [...sections[taskNum]];
    const sectionIndex = updatedSections.findIndex(s => s.sectionNumber === sectionNum);
    updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], method };
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
    const sectionIndex = updatedSections.findIndex(s => s.sectionNumber === sectionNum);
    const updatedQuestions = [...updatedSections[sectionIndex].questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      [field]: value
    };
    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      questions: updatedQuestions
    };
    setSections({
      ...sections,
      [taskNum]: updatedSections
    });
  };

  const handleUpdateIntroduction = (taskNum: number, sectionNum: number, introduction: string) => {
    const updatedSections = [...sections[taskNum]];
    const sectionIndex = updatedSections.findIndex(s => s.sectionNumber === sectionNum);
    updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], introduction };
    setSections({ ...sections, [taskNum]: updatedSections });
  };

  return (
    <div className="mb-8">
      <h2 className={`text-xl font-semibold mb-4 ${skillColors.listening.bg} p-3 rounded font-sans`}>
        Listening (Question {questionCounter - 1})
      </h2>
      <div className="space-y-6">
        {[1, 2, 3, 4].map((taskNum) => (
          <div key={`listening-task-${taskNum}`} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4 font-sans">Task {taskNum}</h3>
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-2">Audio File:</label>
                  <input type="file" accept="audio/*" className="w-full" />
                </div>
                <div>
                  <label className="block font-medium mb-2">Image File:</label>
                  <input type="file" accept="image/*" className="w-full" />
                </div>
              </div>
            </div>
            
            {sections[taskNum]?.map((section) => (
              <SectionComponent
                key={`listening-section-${taskNum}-${section.sectionNumber}`}
                section={section}
                taskNum={taskNum}
                skillType="listening"
                onMethodChange={(method: string) => handleMethodChange(taskNum, section.sectionNumber, method)}
                onAddQuestion={() => handleAddQuestion(taskNum, section.sectionNumber)}
                onUpdateQuestion={(qIndex: number, field: keyof Question, value: QuestionValue) => 
                  handleUpdateQuestion(taskNum, section.sectionNumber, qIndex, field, value)
                }
                onUpdateIntroduction={(introduction: string) => 
                  handleUpdateIntroduction(taskNum, section.sectionNumber, introduction)
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