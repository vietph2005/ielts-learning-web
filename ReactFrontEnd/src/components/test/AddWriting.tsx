import type { FC } from 'react';
import { useState } from 'react';
import { skillColors } from '../../types/test';

interface WritingTask {
  prompt: string;
  imageFile?: File;
}

export const AddWriting: FC = () => {
  const [tasks, setTasks] = useState<WritingTask[]>([
    { prompt: '' },
    { prompt: '' }
  ]);

  const handlePromptChange = (taskIndex: number, prompt: string) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], prompt };
    setTasks(updatedTasks);
  };

  const handleImageChange = (taskIndex: number, file: File | undefined) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], imageFile: file };
    setTasks(updatedTasks);
  };

  return (
    <div className={`mb-8 ${skillColors.writing.bg} rounded-lg p-4`}>
      <h2 className="text-xl font-semibold mb-4 font-sans">Writing</h2>
      <div className="space-y-6">
        {tasks.map((task, taskIndex) => (
          <div key={`writing-task-${taskIndex + 1}`} className="border rounded-lg p-4 bg-white">
            <h3 className="font-semibold mb-4 font-sans">Task {taskIndex + 1}</h3>
            <div className="space-y-4">
              <textarea 
                className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all" 
                rows={4}
                placeholder="Enter task prompt"
                value={task.prompt}
                onChange={(e) => handlePromptChange(taskIndex, e.target.value)}
              />
              {taskIndex === 0 && (
                <div>
                  <label className="block font-medium mb-2 font-sans">Supporting Image:</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="w-full"
                    onChange={(e) => handleImageChange(taskIndex, e.target.files?.[0])}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 