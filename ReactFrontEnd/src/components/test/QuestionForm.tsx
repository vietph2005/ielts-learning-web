import type { FC } from 'react';
import type { Question } from '../../types/test';
import { skillColors } from '../../types/test';

export interface QuestionFormProps {
  question: Question;
  onUpdate: (field: keyof Question, value: string | string[]) => void;
  skillType: keyof typeof skillColors;
}

export const QuestionForm: FC<QuestionFormProps> = ({ 
  question, 
  onUpdate 
}) => (
  <div className="bg-white p-4 rounded-lg mb-4 shadow-sm">
    <h5 className="font-medium mb-3 font-sans">Question {question.questionNumber}</h5>
    <div className="space-y-4">
      <div>
        <label className="block font-medium mb-2 font-sans">Question:</label>
        <input 
          type="text" 
          className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
          placeholder="Enter question"
          value={question.question}
          onChange={(e) => onUpdate('question', e.target.value)}
        />
      </div>
      
      <div>
        <label className="block font-medium mb-2 font-sans">Answer:</label>
        <input 
          type="text" 
          className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
          placeholder="Enter answer"
          value={question.answer}
          onChange={(e) => onUpdate('answer', e.target.value)}
        />
      </div>
      
      <div>
        <label className="block font-medium mb-2 font-sans">Explanation:</label>
        <textarea 
          className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
          rows={3}
          placeholder="Enter explanation"
          value={question.explanation}
          onChange={(e) => onUpdate('explanation', e.target.value)}
        />
      </div>
      
      <div>
        <label className="block font-medium mb-2 font-sans">Options:</label>
        <div className="space-y-2">
          {question.options.map((option, optIndex) => (
            <input
              key={`option-${optIndex}`}
              type="text"
              className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
              placeholder={`Option ${optIndex + 1}`}
              value={option}
              onChange={(e) => {
                const newOptions = [...question.options];
                newOptions[optIndex] = e.target.value;
                onUpdate('options', newOptions);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
); 