import type { FC } from 'react';
import type { Question, Section, QuestionValue } from '../../types/test';
import { skillColors } from '../../types/test';
import { QuestionForm } from './QuestionForm';

export interface SectionComponentProps {
  section: Section;
  taskNum: number;
  skillType: keyof typeof skillColors;
  onMethodChange: (method: string) => void;
  onAddQuestion: () => void;
  onUpdateQuestion: (
    questionIndex: number,
    field: keyof Question,
    value: QuestionValue
  ) => void;
  onUpdateIntroduction: (introduction: string) => void;
  onUpdateParagraph?: (content: string) => void;
}

export const SectionComponent: FC<SectionComponentProps> = ({
  section,
  skillType,
  onMethodChange,
  onAddQuestion,
  onUpdateQuestion,
  onUpdateIntroduction,
  onUpdateParagraph,
}) => {
  const isMaxQuestions = section.questions.length >= 40;

  return (
    <div className={`${skillColors[skillType].section} p-4 rounded-lg mb-4`}>
      <h4 className="font-medium mb-3 font-sans">
        Section {section.sectionNumber}
      </h4>

      <div className="space-y-4">
        {/* Introduction */}
        <div>
          <label className="block font-medium mb-2 font-sans">Introduction:</label>
          <textarea
            className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
            value={section.introduction}
            onChange={(e) => onUpdateIntroduction(e.target.value)}
            rows={4}
            placeholder="Enter introduction text..."
          />
        </div>

        {/* Method */}
        <div>
          <label className="block font-medium mb-2 font-sans">Method:</label>
          <select
            className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
            value={section.method}
            onChange={(e) => onMethodChange(e.target.value)}
          >
            <option value="">Select method</option>
            <option value="multiple-choice">Multiple Choice</option>
            <option value="fill-blank">Fill in the Blank</option>
            <option value="true-false">True/False</option>
          </select>
        </div>

        {/* Paragraph (only for Reading skill) */}
        {skillType === 'reading' && (
          <div>
            <label className="block font-medium mb-2 font-sans">Paragraph:</label>
            <textarea
              className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
              value={section.paragraphs?.[0] || ''}
              onChange={(e) => onUpdateParagraph?.(e.target.value)}
              rows={4}
              placeholder="Enter paragraph text..."
            />
          </div>
        )}

        {/* Questions */}
        {section.questions.map((question, qIndex) => (
          <QuestionForm
            key={`question-${qIndex}`}
            question={question}
            skillType={skillType}
            onUpdate={(field, value) =>
              onUpdateQuestion(qIndex, field, value)
            }
          />
        ))}

        <button
          type="button"
          onClick={onAddQuestion}
          className={`w-full ${skillColors[skillType].button} rounded-lg p-2 text-gray-700 ${skillColors[skillType].buttonHover} transition-all font-sans`}
          disabled={isMaxQuestions}
        >
          + Add Question {isMaxQuestions ? '(Max Reached)' : ''}
        </button>
      </div>
    </div>
  );
};
