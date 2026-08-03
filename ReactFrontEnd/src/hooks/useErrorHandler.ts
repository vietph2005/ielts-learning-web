import { useNavigate } from 'react-router-dom';

export const useErrorHandler = () => {
  const navigate = useNavigate();

  const handleError = (error: Error, context?: string) => {
    console.error(`Error in ${context || 'application'}:`, error);
    
    // Log error to console for debugging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });

    // Navigate to error page
    navigate('/error');
  };

  const handleAsyncError = async <T>(
    asyncFunction: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await asyncFunction();
    } catch (error) {
      handleError(error as Error, context);
      return null;
    }
  };

  return {
    handleError,
    handleAsyncError
  };
}; 