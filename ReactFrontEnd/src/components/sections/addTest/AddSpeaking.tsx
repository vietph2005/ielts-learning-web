import type { FC } from 'react';
import { useState, useEffect } from 'react';
import type { SpeakingTask } from '@/types/apiTypes';
import { skillColors } from '@/types/apiTypes';

type CueCardField = 'topic' | 'points';
const SPEAKING_AUTOSAVE_KEY = 'test_autosave_speaking';

interface AddSpeakingProps {
  onDataChange: (data: SpeakingTask[]) => void;
}

export const AddSpeaking: FC<AddSpeakingProps> = ({ onDataChange }) => {
  const [tasks, setTasks] = useState<SpeakingTask[]>(() => {
    // Try to load saved speaking data
    const savedData = localStorage.getItem(SPEAKING_AUTOSAVE_KEY);
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error('Error loading autosaved speaking data:', e);
      }
    }
    // Return default state if no saved data
    return [
      { questions: [] },
      {
        cueCard: {
          topic: '',
          points: ['', '', '']
        }
      },
      { questions: [] }
    ];
  });

  // Auto-save effect
  useEffect(() => {
    try {
      localStorage.setItem(SPEAKING_AUTOSAVE_KEY, JSON.stringify(tasks));
      onDataChange(tasks);
    } catch (e) {
      console.error('Error auto-saving speaking data:', e);
    }
  }, [tasks, onDataChange]);

  const handleCueCardChange = (taskIndex: number, field: CueCardField, value: string | string[]) => {
    const updatedTasks = [...tasks];
    const task = updatedTasks[taskIndex];
    if (task.cueCard) {
      task.cueCard = { ...task.cueCard, [field]: value };
      setTasks(updatedTasks);
    }
  };

  const handleCueCardPointChange = (taskIndex: number, pointIndex: number, value: string) => {
    const updatedTasks = [...tasks];
    const task = updatedTasks[taskIndex];
    if (task.cueCard) {
      const points = [...task.cueCard.points];
      points[pointIndex] = value;
      task.cueCard.points = points;
      setTasks(updatedTasks);
    }
  };

  const handleAddQuestion = (taskIndex: number) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = {
      ...updatedTasks[taskIndex],
      questions: [...(updatedTasks[taskIndex].questions || []), '']
    };
    setTasks(updatedTasks);
  };

  const handleDeleteQuestion = (taskIndex: number, questionIndex: number) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = {
      ...updatedTasks[taskIndex],
      questions: updatedTasks[taskIndex].questions?.filter((_, index) => index !== questionIndex) || []
    };
    setTasks(updatedTasks);
  };

  const handleQuestionChange = (taskIndex: number, questionIndex: number, value: string) => {
    const updatedTasks = [...tasks];
    const questions = [...(updatedTasks[taskIndex].questions || [])];
    questions[questionIndex] = value;
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], questions };
    setTasks(updatedTasks);
  };

  return (
    <div className={`mb-8 ${skillColors.speaking.bg} rounded-lg p-4`}>
      <h2 className="text-xl font-semibold mb-4 font-sans">Speaking</h2>
      <div className="space-y-6">
        {tasks.map((task, taskIndex) => (
          <div key={`speaking-task-${taskIndex + 1}`} className="border rounded-lg p-4 bg-white">
            <h3 className="font-semibold mb-4 font-sans">Task {taskIndex + 1}</h3>
            <div className="space-y-4">
              {task.questions && (
                <div className="space-y-2">
                  <label className="block font-medium mb-2 font-sans">Questions:</label>
                  {task.questions.map((question, questionIndex) => (
                    <div key={`question-${questionIndex}`} className="flex items-center gap-2">
                      <input
                        type="text"
                        className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                        placeholder={`Question ${questionIndex + 1}`}
                        value={question}
                        onChange={(e) => handleQuestionChange(taskIndex, questionIndex, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(taskIndex, questionIndex)}
                        className="text-red-500 hover:text-red-700 font-sans"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddQuestion(taskIndex)}
                    className={`w-full ${skillColors.speaking.button} rounded-lg p-2 text-gray-700 ${skillColors.speaking.buttonHover} transition-all font-sans`}
                  >
                    + Add Question
                  </button>
                </div>
              )}

              {task.cueCard && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">Cue Card</h4>
                  <input
                    type="text"
                    className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                    placeholder="Topic"
                    value={task.cueCard.topic}
                    onChange={(e) => handleCueCardChange(taskIndex, 'topic', e.target.value)}
                  />
                  <div className="space-y-2">
                    {task.cueCard.points.map((point, pointIndex) => (
                      <input
                        key={pointIndex}
                        type="text"
                        className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                        placeholder={`Point ${pointIndex + 1}`}
                        value={point}
                        onChange={(e) => handleCueCardPointChange(taskIndex, pointIndex, e.target.value)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};