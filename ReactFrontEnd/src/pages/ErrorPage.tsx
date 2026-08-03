import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Error as ErrorIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Main Error Container */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 via-red-500 to-red-600"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-100 rounded-full opacity-50"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-red-100 rounded-full opacity-50"></div>
          
          {/* Error Icon */}
          <div className="relative z-10 mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-lg mb-6">
              <ErrorIcon className="text-white text-4xl" />
            </div>
          </div>

          {/* Error Message */}
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
              Oops!
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-red-600 mb-4">
              Đã xảy ra lỗi
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Có vẻ như đã có điều gì đó không ổn. Đừng lo lắng, hãy thử một trong những cách sau để khắc phục.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="relative z-10 space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <button
              onClick={handleGoBack}
              className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
            >
              <ArrowBackIcon className="mr-2" />
              Quay lại trang trước
            </button>
            
            <button
              onClick={handleRefresh}
              className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200"
            >
              <RefreshIcon className="mr-2" />
              Tải lại trang
            </button>
            
            <button
              onClick={handleGoHome}
              className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
            >
              <HomeIcon className="mr-2" />
              Về trang chủ
            </button>
          </div>

          {/* Additional Help */}
          <div className="relative z-10 mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              Nếu vấn đề vẫn tiếp tục, vui lòng liên hệ với chúng tôi
            </p>
            <div className="flex justify-center space-x-6">
              <a 
                href="/contact" 
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
              >
                Liên hệ hỗ trợ
              </a>
              <a 
                href="/help" 
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
              >
                Trung tâm trợ giúp
              </a>
            </div>
          </div>
        </div>

        {/* Error Code (Optional) */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-400 font-mono">
            Error Code: 404 - Page Not Found
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage; 