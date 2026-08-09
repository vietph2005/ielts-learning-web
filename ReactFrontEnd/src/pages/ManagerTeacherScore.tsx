import { API_URL } from "@/config/api";
import { useEffect, useState } from "react"
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
interface WritingAnswer {
    id: string;
    username: string;
    testId: string;
    band: number;
    gradingMethod: string;
    submittedAt?: string; // Thêm trường thời gian nộp bài
}

function ManagerTeacherScoreList() {
    const [writingAnswers, setWritingAnswers] = useState<WritingAnswer[]>([]);
    
    useEffect(() => {
        fetch(`${API_URL}/verify/listwriting`, {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => setWritingAnswers(data))
            .catch((err) => console.error("Lỗi khi lấy dữ liệu:", err));
    }, []);

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-2xl p-8 mb-8 shadow-lg">
                <h2 className="text-3xl font-bold text-white mb-2">Danh sách bài viết để giáo viên chấm</h2>
                <p className="text-emerald-50">Quản lý và chấm điểm các bài viết của học viên</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 hover:border-emerald-300 transition-colors duration-300 overflow-x-auto">
                <table className="min-w-full divide-y divide-emerald-100">
                    <thead className="bg-emerald-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Test ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">Thời gian nộp bài</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-emerald-700 uppercase tracking-wider">Chấm bài</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-emerald-50">
                        {writingAnswers.map((answer) => (
                            <tr key={answer.id} className="hover:bg-emerald-50/60 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{answer.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{answer.testId}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                    {answer.submittedAt ? new Date(answer.submittedAt).toLocaleString("vi-VN", { hour12: false }) : "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <Link to={`/teacher-scoring/${answer.id}`}>
                                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition-all">Chấm bài</Button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ManagerTeacherScoreList;
