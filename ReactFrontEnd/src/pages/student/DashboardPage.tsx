import axios from "axios";
import { useEffect, useState } from "react";
import {
    BarChart2,
    ActivitySquare,
    UserRound,
    Radar as RadarIcon,
    AreaChart as AreaChartIcon,
} from "lucide-react";
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    AreaChart,
    Area,
    Tooltip,
    CartesianGrid,
    XAxis,
    YAxis,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts";

interface StudentResult {
    username: string;
    averageBand?: number;
    skill?: string;
    band?: number;
    totalCorrect?: number;
    submittedAt?: string;
}

const DashboardPage = () => {
    const [top10, setTop10] = useState<StudentResult[]>([]);
    const [top3BySkill, setTop3BySkill] = useState<Record<string, StudentResult[]>>({});

    useEffect(() => {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        axios.get("http://localhost:8080/api/dashboard/top10", { headers })
            .then((res) => {
                setTop10(res.data);
            })
            .catch((err) => console.error("Error fetching top 10:", err));

        axios.get("http://localhost:8080/api/dashboard/top3-skills", { headers })
            .then((res) => setTop3BySkill(res.data))
            .catch((err) => console.error("Error fetching top 3 by skill:", err));
    }, []);

    const overviewData = {
        totalTests: top10.length,
        averageBand: parseFloat((top10.reduce((s, r) => s + (r.averageBand || 0), 0) / (top10.length || 1)).toFixed(2)),
        highestBand: Math.max(...top10.map(s => s.averageBand ?? 0), 0),
    };

    const radarData = [
        { subject: "Listening", band: top3BySkill.listening?.[0]?.band || 0 },
        { subject: "Reading", band: top3BySkill.reading?.[0]?.band || 0 },
        { subject: "Writing", band: top3BySkill.writing?.[0]?.band || 0 },
        { subject: "Speaking", band: top3BySkill.speaking?.[0]?.band || 0 },
    ];

    const areaData = top10.map((s, index) => ({ index, band: s.averageBand || 0 }));

    // const barBySkillData = Object.entries(top3BySkill).flatMap(([skill, students]) =>
    //     students.map((student, index) => ({
    //         skill,
    //         name: `${index + 1}. ${student.username}`,
    //         band: student.band || 0,
    //     }))
    // );

    return (
        <div className="p-10 bg-emerald-50 min-h-screen text-gray-800">
            <h1 className="text-4xl font-bold mb-10 text-green-700"> Thống Kê Tổng Quan</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                {/* Tổng Quan Kết Quả */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-green-200">
                    <h2 className="text-xl font-semibold text-green-700 mb-4 flex items-center gap-2">
                        <UserRound className="text-green-600" /> Tổng Quan Kết Quả
                    </h2>
                    <ul className="space-y-2 text-green-700">
                        <li> Số lượng bài test: <strong>{overviewData.totalTests}</strong></li>
                        <li> Band trung bình: <strong>{overviewData.averageBand}</strong></li>
                        <li> Band cao nhất: <strong>{overviewData.highestBand}</strong></li>
                    </ul>
                </div>

                {/* Radar Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-green-200">
                    <h2 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
                        <RadarIcon className="text-green-600" /> Tổng Quan Theo Kỹ Năng
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData} outerRadius={90}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis angle={30} domain={[0, 9]} />
                            <Radar name="Band" dataKey="band" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                            <Tooltip />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Biểu đồ vùng */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-12 border border-green-200">
                <h2 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
                    <AreaChartIcon className="text-green-600" /> Phân Bố Band Trung Bình
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={areaData}>
                        <defs>
                            <linearGradient id="colorBand" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="index" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="band" stroke="#10b981" fillOpacity={1} fill="url(#colorBand)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Bảng xếp hạng top 10 */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-12 border border-green-200">
                <h2 className="text-xl font-semibold text-green-700 mb-4 flex items-center gap-2">
                    <BarChart2 className="text-green-600" /> Bảng Xếp Hạng Top 10 Trung Bình Band
                </h2>
                <table className="w-full text-sm text-left text-gray-700">
                    <thead className="text-xs uppercase bg-green-100 text-green-700">
                    <tr>
                        <th className="px-4 py-2">#</th>
                        <th className="px-4 py-2">Username</th>
                        <th className="px-4 py-2">Average Band</th>
                        <th className="px-4 py-2">Visual</th>
                    </tr>
                    </thead>
                    <tbody>
                    {top10.map((student, index) => (
                        <tr key={student.username} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-2">{index + 1}</td>
                            <td className="px-4 py-2 font-medium">{student.username}</td>
                            <td className="px-4 py-2">{student.averageBand?.toFixed(2)}</td>
                            <td className="px-4 py-2">
                                <div className="bg-green-100 rounded h-3 w-full relative">
                                    <div
                                        className="bg-green-500 h-3 rounded"
                                        style={{ width: `${(student.averageBand || 0) * 10}%` }}
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Top 3 theo kỹ năng */}
            <h2 className="text-2xl font-bold mb-6 text-green-800 flex items-center gap-2">
                <ActivitySquare className="text-green-600" /> Top 3 Theo Kỹ Năng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {['reading', 'listening', 'speaking', 'writing'].map((skill) => (
                    <div key={skill} className="bg-white border rounded-xl shadow p-5 hover:shadow-lg transition">
                        <h3 className="text-lg font-semibold text-green-700 mb-3 capitalize border-b pb-2">{skill}</h3>
                        <ul className="space-y-2 text-gray-700">
                            {(top3BySkill[skill] || []).map((student, index) => (
                                <li key={student.username}>
                                    <span className="font-semibold">{index + 1}. {student.username}</span> - Band: <strong>{student.band}</strong>
                                    <div className="bg-green-100 rounded h-2 mt-1">
                                        <div
                                            className="bg-green-400 h-2 rounded"
                                            style={{ width: `${(student.band || 0) * 10}%` }}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Biểu đồ cột theo kỹ năng */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-green-200">
                <h2 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
                    <BarChart2 className="text-green-600" /> Biểu Đồ Cột Top 3 Theo Kỹ Năng
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {['reading', 'listening', 'speaking', 'writing'].map((skill) => (
                        <div key={skill} className="bg-green-50 p-4 rounded-xl shadow-sm hover:shadow-md transition">
                            <h3 className="text-md font-semibold text-green-800 mb-2 capitalize">{skill}</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart
                                    data={(top3BySkill[skill] || []).map((s, i) => ({
                                        name: `${i + 1}. ${s.username}`,
                                        band: s.band || 0,
                                    }))}
                                    margin={{ top: 10, right: 20, left: 0, bottom: 30 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                    <YAxis domain={[0, 9]} />
                                    <Tooltip />
                                    <Bar dataKey="band" fill="#34d399" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ))}
                </div>
            </div>


        </div>
    );
};

export default DashboardPage;