import { API_URL } from "@/config/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AddTest {
  testId: string;
  testTitle: string;
  tags: string[];
  createAt: string;
}

export default function AcceptTestPage() {
  const [tests, setTests] = useState<AddTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/manager/request-tests`, {
      credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched tests:', data);
        setTests(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching tests:', err);
        setError(err.message || "Không thể tải danh sách đề thi.");
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const acceptTest = async (testId: string) => {
    const confirm = window.confirm("Bạn có chắc muốn duyệt đề này không?");
    if (!confirm) return;

    try {
      const response = await fetch(`${API_URL}/api/manager/accept-test/${testId}`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Duyệt đề thất bại");
      }

      const result = await response.text();
      console.log('Accept test result:', result);
      alert("Approved successfully!");
      setTests(tests.filter((test) => test.testId !== testId));
    } catch (err: any) {
      console.error('Error accepting test:', err);
      alert(`Approval failed: ${err.message}`);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Đang tải danh sách đề thi...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="text-center p-10">
      <div className="text-red-500 mb-4">
        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p className="text-lg font-semibold">Lỗi</p>
      </div>
      <p className="text-gray-600 mb-4">{error}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        Thử lại
      </button>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Danh sách đề thi chờ duyệt</h1>
      <div className="grid gap-4">
        {tests.length === 0 ? (
          <p className="text-gray-500">Không có đề nào đang chờ duyệt.</p>
        ) : (
          tests.map((test) => (
            <div
              key={test.testId}
              className="bg-white shadow-md rounded-xl p-4 border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center"
            >
              <div>
                <h2 className="text-lg font-semibold">{test.testTitle}</h2>
                <p className="text-sm text-gray-500">Mã đề: {test.testId}</p>
                <p className="text-sm text-gray-500">Ngày tạo: {new Date(test.createAt).toLocaleString()}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {test.tags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex gap-3">
                <button
                  onClick={() => navigate(`/request-test-detail?id=${test.testId}`)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm"
                >
                  Xem chi tiết
                </button>
                <button
                  onClick={() => acceptTest(test.testId)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Duyệt đề
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
