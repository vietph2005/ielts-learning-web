import { API_URL } from "@/config/api";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Edit, FileText, CheckCircle, Clock } from 'lucide-react';

interface TestItem {
  testId: string;
  testTitle: string;
  tags: string[];
  createdAt: string;
  isPending: boolean;
}

export default function ManageTestsPage() {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'approved'>('all');

  const navigate = useNavigate();
  

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/teacher/tests`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      setTests(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching teacher tests:', err);
      setError(err.message || 'Failed to load test list.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.testTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.testId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (test.tags && test.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));

    if (filterTab === 'pending') return matchesSearch && test.isPending;
    if (filterTab === 'approved') return matchesSearch && !test.isPending;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Tests</h1>
            <p className="text-slate-500 text-sm mt-1">View and edit IELTS tests created by teachers</p>
          </div>
          <button
            onClick={() => navigate('/add-test')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2 self-start md:self-auto"
          >
            + Create New Test
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Title, ID or Tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {(['all', 'pending', 'approved'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`flex-1 md:flex-none px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
                  filterTab === tab
                    ? 'bg-blue-50 text-blue-600 shadow-xs border border-blue-200'
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                }`}
              >
                {tab === 'all' ? 'All Tests' : tab === 'pending' ? 'Pending Approval' : 'Active / Approved'}
              </button>
            ))}
          </div>
        </div>

        {/* Test List Content */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-slate-500 text-sm">Loading test catalog...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center">
            <p className="font-medium">{error}</p>
            <button
              onClick={fetchTests}
              className="mt-3 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-600 font-medium">No tests found matching your criteria</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTests.map((test) => (
              <div
                key={test.testId}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-200 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-800 text-base">{test.testTitle}</span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        test.isPending
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {test.isPending ? (
                        <>
                          <Clock className="w-3 h-3" /> Pending Approval
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3" /> Active
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>
                      Test ID: <strong className="text-slate-700">{test.testId}</strong>
                    </span>
                    {test.createdAt && (
                      <span>Created: {new Date(test.createdAt).toLocaleDateString()}</span>
                    )}
                  </div>

                  {test.tags && test.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {test.tags.map((tag, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-md font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <button
                    onClick={() => navigate(`/edit-test/${test.testId}`)}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 border border-blue-200"
                  >
                    <Edit className="w-4 h-4" /> Edit Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
