import type { FC } from 'react';
import { useState, useEffect } from 'react';
// import type { Task } from '@/types/apiTypes';
import { skillColors } from '@/types/apiTypes';
import { uploadFile } from '../../../services/fileUploadService';
import { useAuth } from '@/contexts/AuthContext';

interface WritingTask {
  prompt: string;
  imageUrl?: string;
}

interface AddWritingProps {
  onDataChange: (data: WritingTask[]) => void;
}

const WRITING_AUTOSAVE_KEY = 'test_autosave_writing';

export const AddWriting: FC<AddWritingProps> = ({ onDataChange }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<WritingTask[]>(() => {
    // Try to load saved writing data
    const savedData = localStorage.getItem(WRITING_AUTOSAVE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        return parsedData.map((task: WritingTask) => ({
          prompt: task.prompt,
          imageUrl: task.imageUrl
        }));
      } catch (e) {
        console.error('Error loading autosaved writing data:', e);
      }
    }
    // Return default state if no saved data
    return [
      { prompt: '' },
      { prompt: '' }
    ];
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showImageConfirmation, setShowImageConfirmation] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadImageError, setUploadImageError] = useState<string | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Auto-save effect
  useEffect(() => {
    try {
      localStorage.setItem(WRITING_AUTOSAVE_KEY, JSON.stringify(tasks));
      onDataChange(tasks);
    } catch (e) {
      console.error('Error auto-saving writing data:', e);
    }
  }, [tasks, onDataChange]);

  const handlePromptChange = (taskIndex: number, prompt: string) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], prompt };
    setTasks(updatedTasks);
  };

  const handleImageChange = (taskIndex: number, file: File | null) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadImageError('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
      setCurrentTaskIndex(taskIndex);
      setSelectedImage(URL.createObjectURL(file));
      setShowImageConfirmation(true);
    }
  };

  const handleConfirmImageUpload = async () => {
    if (!imageFile || currentTaskIndex === null) return;

    setIsUploadingImage(true);
    setUploadImageError(null);

    try {
      const url = await uploadFile(imageFile, 'image', 'writing', user?.role, user?.username);
      const updatedTasks = [...tasks];
      updatedTasks[currentTaskIndex] = {
        ...updatedTasks[currentTaskIndex],
        imageUrl: url
      };
      setTasks(updatedTasks);
      localStorage.setItem(WRITING_AUTOSAVE_KEY, JSON.stringify(updatedTasks));

      console.log('Image uploaded successfully:', url);
    } catch (error) {
      setUploadImageError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
      setShowImageConfirmation(false);
      setImageFile(null);
      setCurrentTaskIndex(null);
      setSelectedImage(null);
    }
  };

  const handleCancelImageUpload = () => {
    setShowImageConfirmation(false);
    setImageFile(null);
    setCurrentTaskIndex(null);
    setSelectedImage(null);
    setUploadImageError(null);
  };

  return (
    <div className={`mb-8 ${skillColors.writing.bg} rounded-lg p-4`}>
      <h2 className="text-xl font-semibold mb-4 font-sans">Writing</h2>

      {/* Image Upload Confirmation Modal */}
      {showImageConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Image Upload</h3>
            {selectedImage && (
              <div className="mb-4">
                <img src={selectedImage} alt="Preview" className="max-w-full h-auto rounded" />
              </div>
            )}
            {uploadImageError && (
              <div className="text-red-500 mb-4">{uploadImageError}</div>
            )}
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancelImageUpload}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImageUpload}
                disabled={isUploadingImage}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isUploadingImage ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                  {task.imageUrl && (
                    <div className="mb-2">
                      <img 
                        src={task.imageUrl} 
                        alt="Task image" 
                        className="max-w-full h-auto rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                  <input
                    type="file" 
                    accept="image/*" 
                    className="w-full"
                    onChange={(e) => handleImageChange(taskIndex, e.target.files?.[0] || null)}
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