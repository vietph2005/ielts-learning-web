import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Help as HelpIcon
} from '@mui/icons-material';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/');
  }, [navigate]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoHelp = () => {
    navigate('/help');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Main Container */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-100 rounded-full opacity-50"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-100 rounded-full opacity-50"></div>
          
          {/* 404 Icon */}
          <div className="relative z-10 mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full shadow-lg mb-6">
              <SearchIcon className="text-white text-4xl" />
            </div>
          </div>

          {/* 404 Message */}
          <div className="relative z-10">
            <h1 className="text-6xl md:text-8xl font-bold text-gray-800 mb-4">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
              Trang không tồn tại
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển. 
              Hãy kiểm tra lại đường dẫn hoặc thử một trong những tùy chọn bên dưới.
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
              onClick={handleGoHome}
              className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
            >
              <HomeIcon className="mr-2" />
              Về trang chủ
            </button>
            
            <button
              onClick={handleGoHelp}
              className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:from-pink-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200"
            >
              <HelpIcon className="mr-2" />
              Trung tâm trợ giúp
            </button>
          </div>

          {/* Additional Help */}
          <div className="relative z-10 mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              Bạn có thể tìm kiếm nội dung khác hoặc liên hệ với chúng tôi
            </p>
            <div className="flex justify-center space-x-6">
              <a 
                href="/contact" 
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
              >
                Liên hệ hỗ trợ
              </a>
              <a 
                href="/test" 
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
              >
                Làm bài test
              </a>
              <a 
                href="/student/listAllTips" 
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
              >
                Xem tips
              </a>
            </div>
          </div>
        </div>

        {/* URL Info */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-400 font-mono">
            URL: {window.location.pathname}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 