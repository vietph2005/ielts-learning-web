import React, { useState } from 'react';
import {
  ExpandMore as ExpandMoreIcon,
  Headphones as ListeningIcon,
  MenuBook as ReadingIcon,
  Edit as WritingIcon,
  RecordVoiceOver as SpeakingIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { TestHistory } from '../../services/historyService';

interface HistoryCardProps {
  item: TestHistory;
}

const skillMap: Record<
    string,
    { icon: React.ReactNode; label: string; color: string }
> = {
  listening: {
    icon: <ListeningIcon className="text-green-600" />,
    label: 'Nghe',
    color: 'bg-green-100 text-green-700',
  },
  reading: {
    icon: <ReadingIcon className="text-green-600" />,
    label: 'Đọc',
    color: 'bg-green-100 text-green-700',
  },
  writing: {
    icon: <WritingIcon className="text-green-600" />,
    label: 'Viết',
    color: 'bg-green-100 text-green-700',
  },
  speaking: {
    icon: <SpeakingIcon className="text-green-600" />,
    label: 'Nói',
    color: 'bg-green-100 text-green-700',
  },
};

const HistoryCard: React.FC<HistoryCardProps> = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const handleRedoTest = () => {
    navigate(`/do-test/${item.skill}/${item.testID}`);
  };

  const handleViewHistory = () => {
    navigate(`/history/${item.testID}`);
  };

  const skill = skillMap[item.skill] || {
    icon: null,
    label: '',
    color: 'bg-green-100 text-green-700',
  };

  const getBandFeedback = () => {
    if (item.band >= 7.0)
      return { text: 'Tốt', color: 'text-green-600', bar: 'from-green-300 to-green-500' };
    if (item.band >= 5.5)
      return { text: 'Ổn', color: 'text-blue-600', bar: 'from-blue-300 to-blue-500' };
    return { text: 'Cần cải thiện', color: 'text-red-600', bar: 'from-red-300 to-red-500' };
  };

  const feedback = getBandFeedback();
  const bandProgress = Math.min((item.band / 9) * 100, 100);

  return (
      <motion.div
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="bg-white rounded-2xl shadow-md p-6 mb-6 transition hover:shadow-xl hover:-translate-y-1"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 text-gray-700">
            {skill.icon}
            <span className="text-lg font-semibold">Test ID: {item.testID}</span>
          </div>
          <div className="flex items-center gap-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${skill.color}`}>
            {skill.label}
          </span>
            <span className="text-gray-500 text-sm">
            {format(new Date(item.submittedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
          </span>
            <motion.button
                onClick={() => setExpanded(!expanded)}
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="text-green-600 hover:text-green-700"
            >
              <ExpandMoreIcon />
            </motion.button>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-600 text-sm">Band Score: {item.band.toFixed(1)}</span>
            <span className={`text-sm font-medium ${feedback.color}`}>{feedback.text}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
                className={`h-2 bg-gradient-to-r ${feedback.bar}`}
                initial={{ width: 0 }}
                animate={{ width: `${bandProgress}%` }}
                transition={{ duration: 0.6 }}
            />
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
              <motion.div
                  key="expanded"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="overflow-hidden"
              >
                <div className="mt-4 flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="text-gray-600 text-sm space-y-1">
                    <p>
                      <strong>Test ID:</strong> {item.testID}
                    </p>
                    <p>
                      <strong>Username:</strong> {item.username}
                    </p>
                    <p>
                      <strong>Kỹ năng:</strong> {skill.label}
                    </p>
                    <p>
                      <strong>Band Score:</strong> {item.band.toFixed(1)}
                    </p>
                    <p>
                      <strong>Thời gian nộp:</strong>{' '}
                      {format(new Date(item.submittedAt), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2 mt-20">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRedoTest}
                        className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-md text-xs shadow transition"
                    >
                      Làm lại bài thi
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleViewHistory}
                        className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-md text-xs shadow transition"
                    >
                      Lịch sử làm bài
                    </motion.button>
                  </div>

                </div>
              </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
  );
};

export default HistoryCard;
