import type { FC } from 'react';
import type { Question } from '@/types/apiTypes';
import { skillColors } from '@/types/apiTypes';

export interface QuestionFormProps {
  question: Question;
  onUpdate: (field: keyof Question, value: string | string[]) => void;
  onDelete: () => void; // 🆕 Thêm prop này
  skillType: keyof typeof skillColors;
  type: string;
}

export const QuestionForm: FC<QuestionFormProps> = ({
  question,
  onUpdate,
  onDelete, // 🆕 Thêm destructure
  skillType,
  type,
}) => {
  const isSentenceCompletion = type === 'sentence-completion';
  const MIN_OPTIONS = 3;

  const handleAddOption = () => {
    const newOptions = [...question.options, ''];
    onUpdate('options', newOptions);
  };

  const handleDeleteOption = (optIndex: number) => {
    if (question.options.length <= MIN_OPTIONS) {
      alert(`At least ${MIN_OPTIONS} options are required.`);
      return;
    }
    const newOptions = question.options.filter((_, index) => index !== optIndex);
    onUpdate('options', newOptions);
  };

  return (
    <div className="bg-white p-4 rounded-lg mb-4 shadow-sm relative">
      {/* Nút xoá câu hỏi */}
      <button
        type="button"
        onClick={() => {
            onDelete();
        }}
        className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl font-bold"
        title="Delete Question"
      >
        ×
      </button>

      <h5 className="font-medium mb-3 font-sans">Question {question.questionNumber}</h5>

      <div className="space-y-4">
        {/* Question */}
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

        {/* Answer */}
        <div>
          <label className="block font-medium mb-2 font-sans">Answer:</label>
          <input
            type="text"
            className="w-full rounded border px-3 py-2 font-sans"
            placeholder="Enter answer"
            value={question.answer}
            onChange={(e) => onUpdate('answer', e.target.value)}
          />
        </div>

        {/* Explanation */}
        <div>
          <label className="block font-medium mb-2 font-sans">Explanation:</label>
          <input
            type="text"
            className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all font-sans"
            placeholder="Enter explanation"
            value={question.explanation}
            onChange={(e) => onUpdate('explanation', e.target.value)}
          />
        </div>

        {/* Options (if not sentence-completion) */}
        {!isSentenceCompletion && (
          <div>
            <label className="block font-medium mb-2 font-sans">Options:</label>
            <div className="space-y-2">
              {question.options.map((option, optIndex) => (
                <div key={`option-${optIndex}`} className="flex items-center gap-2">
                  <input
                    type="text"
                    className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all font-sans"
                    placeholder={`Option ${optIndex + 1}`}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...question.options];
                      newOptions[optIndex] = e.target.value;
                      onUpdate('options', newOptions);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteOption(optIndex)}
                    className="text-red-500 hover:text-red-700 font-sans"
                    disabled={question.options.length <= MIN_OPTIONS}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddOption}
              className={`w-full mt-2 ${skillColors[skillType].button} rounded-lg p-2 text-gray-700 ${skillColors[skillType].buttonHover} transition-all font-sans`}
            >
              + Add Option
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
