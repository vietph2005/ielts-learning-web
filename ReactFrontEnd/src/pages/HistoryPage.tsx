import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { TestHistory } from '../services/historyService';
import { getStudentTestHistory } from '../services/historyService';
import HistoryCard from '../components/history/HistoryCard';
import HistoryFilter from '../components/history/HistoryFilter';
import HistoryStats from '../components/history/HistoryStats';

const HistoryPage: React.FC = () => {
  const [testHistory, setTestHistory] = useState<TestHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<TestHistory[]>([]);
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchHistory = async () => {
      try {
        setLoading(true);
        if (!user?.username) {
          setError('You are not logged in.');
          return;
        }

        const data = await getStudentTestHistory(user.username);
        const sorted = data.sort(
            (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
        setTestHistory(sorted);
        setFilteredHistory(sorted);
      } catch (err) {
        console.error('Lỗi khi tải lịch sử:', err);
        setError('Unable to load history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  useEffect(() => {
    // Only show FullTest attempts when 'all' is selected
    const filtered = selectedSkill === 'all'
        ? testHistory.filter(item => item.skill === 'fulltest')
        : testHistory.filter(item => item.skill === selectedSkill);

    setFilteredHistory(
        filtered.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    );
  }, [selectedSkill, testHistory]);

  if (loading) {
    return (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500" />
        </div>
    );
  }

  if (error) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold text-green-700 mb-6">Test History</h1>
          <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-6">
            <p>{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="mt-4 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-green-700 mb-6">Test History</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/4">
            <HistoryFilter selectedSkill={selectedSkill} onSkillChange={setSelectedSkill} />
          </div>

          <div className="lg:w-3/4">
            <div className="mb-6">
              <HistoryStats items={filteredHistory} />
            </div>

            <div>
              {filteredHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    <p className="mb-4">
                      {testHistory.length === 0
                          ? 'You have not taken any tests yet.'
                          : 'No tests found for this skill.'}
                    </p>
                    {testHistory.length === 0 && (
                        <button
                            onClick={() => (window.location.href = '/list-test')}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          Start now
                        </button>
                    )}
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredHistory.map((item, index) => (
                        <div key={`${item.testID}-${item.skill}-${index}`} className="transition duration-300 hover:scale-[1.02]">
                          <HistoryCard item={item} />
                        </div>
                    ))}
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default HistoryPage;
