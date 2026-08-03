import type { FC } from 'react';
import type { TestDataState } from '@/types/apiTypes';

interface GeneralProps {
  testData: TestDataState;
  handleInputChange: (field: keyof TestDataState, value: string) => void;
  addTag: () => void;
  removeTag: (index: number) => void;
}

const General: FC<GeneralProps> = ({ testData, handleInputChange, addTag, removeTag }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="w-24 font-semibold">Test ID:</label>
        <input
          type="text"
          value={testData.testId}
          disabled
          className="flex-1 rounded border px-3 py-2 bg-gray-100"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="w-24 font-semibold">Test Title:</label>
        <input
          type="text"
          value={testData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="flex-1 rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="w-24 font-semibold">Created At:</label>
        <input
          type="date"
          value={testData.createdAt.split('T')[0]}
          readOnly
          className="flex-1 rounded border px-3 py-2 bg-gray-100"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="w-24 font-semibold">Tags:</label>
        <div className="flex-1">
          <div className="flex flex-wrap gap-2 mb-2">
            {testData.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
              >
                {tag}
                <button onClick={() => removeTag(index)} className="ml-2 text-blue-600 hover:text-blue-800">
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={testData.newTag}
              onChange={(e) => handleInputChange('newTag', e.target.value)}
              className="flex-1 rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              placeholder="Add a tag"
            />
            <button
              onClick={addTag}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default General;