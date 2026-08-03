import { useState } from 'react';
import type { FC } from 'react';

interface MediaServicesProps {
  onAudioUrlReceived?: (url: string) => void;
  onImageUrlReceived?: (url: string) => void;
}

const API_URL = import.meta.env.VITE_API_URL;

export const MediaServices: FC<MediaServicesProps> = ({ onAudioUrlReceived, onImageUrlReceived }) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAudioUpload = async () => {
    if (!audioFile) {
      setError('Please select an audio file first');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);

      const response = await fetch(`${API_URL}/api/media/upload-audio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload audio');
      }

      const data = await response.json();
      if (onAudioUrlReceived) {
        onAudioUrlReceived(data.url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload audio');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      setError('Please select an image file first');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${API_URL}/api/media/upload-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      if (onImageUrlReceived) {
        onImageUrlReceived(data.url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 flex gap-4">
      {/* Audio Service Card */}
      <div className="bg-white rounded-lg shadow-lg p-4 w-64">
        <h3 className="text-lg font-semibold mb-2">Audio Service</h3>
        <div className="space-y-2">
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
          <button
            onClick={handleAudioUpload}
            disabled={isUploading || !audioFile}
            className={`w-full py-2 px-4 rounded ${
              isUploading || !audioFile
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isUploading ? 'Uploading...' : 'Upload Audio'}
          </button>
        </div>
      </div>

      {/* Image Service Card */}
      <div className="bg-white rounded-lg shadow-lg p-4 w-64">
        <h3 className="text-lg font-semibold mb-2">Image Service</h3>
        <div className="space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
          <button
            onClick={handleImageUpload}
            disabled={isUploading || !imageFile}
            className={`w-full py-2 px-4 rounded ${
              isUploading || !imageFile
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
}; 