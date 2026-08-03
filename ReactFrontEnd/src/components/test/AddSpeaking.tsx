import type { FC } from 'react';
import { useState } from 'react';
import { skillColors } from '../../types/test';

interface SpeakingTask {
  prompt: string;
  audioFile?: File;
  imageFile?: File;
  cueCard?: {
    topic: string;
    points: string[];
    preparationTime: number;
    speakingTime: number;
  };
}

type CueCardField = 'topic' | 'points' | 'preparationTime' | 'speakingTime';

export const AddSpeaking: FC = () => {
  const [tasks, setTasks] = useState<SpeakingTask[]>([
    { prompt: '' },
    { 
      prompt: '',
      cueCard: {
        topic: '',
        points: ['', '', ''],
        preparationTime: 60,
        speakingTime: 120
      }
    },
    { prompt: '' }
  ]);

  const handlePromptChange = (taskIndex: number, prompt: string) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], prompt };
    setTasks(updatedTasks);
  };

  const handleAudioChange = (taskIndex: number, file: File | undefined) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], audioFile: file };
    setTasks(updatedTasks);
  };

  const handleImageChange = (taskIndex: number, file: File | undefined) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], imageFile: file };
    setTasks(updatedTasks);
  };

  const handleCueCardChange = (taskIndex: number, field: CueCardField, value: string | number | string[]) => {
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

  return (
    <div className={`mb-8 ${skillColors.speaking.bg} rounded-lg p-4`}>
      <h2 className="text-xl font-semibold mb-4 font-sans">Speaking</h2>
      <div className="space-y-6">
        {tasks.map((task, taskIndex) => (
          <div key={`speaking-task-${taskIndex + 1}`} className="border rounded-lg p-4 bg-white">
            <h3 className="font-semibold mb-4 font-sans">Task {taskIndex + 1}</h3>
            <div className="space-y-4">
              <textarea 
                className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all" 
                rows={4}
                placeholder="Enter speaking prompt"
                value={task.prompt}
                onChange={(e) => handlePromptChange(taskIndex, e.target.value)}
              />
              
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-2 font-sans">Preparation Time (s):</label>
                      <input
                        type="number"
                        className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                        value={task.cueCard.preparationTime}
                        onChange={(e) => handleCueCardChange(taskIndex, 'preparationTime', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-2 font-sans">Speaking Time (s):</label>
                      <input
                        type="number"
                        className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                        value={task.cueCard.speakingTime}
                        onChange={(e) => handleCueCardChange(taskIndex, 'speakingTime', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-medium mb-2 font-sans">Audio Example:</label>
                <input 
                  type="file" 
                  accept="audio/*" 
                  className="w-full"
                  onChange={(e) => handleAudioChange(taskIndex, e.target.files?.[0])}
                />
              </div>
              <div>
                <label className="block font-medium mb-2 font-sans">Supporting Image:</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="w-full"
                  onChange={(e) => handleImageChange(taskIndex, e.target.files?.[0])}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 