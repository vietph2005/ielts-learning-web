import { API_URL } from "@/config/api";
import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, AreaChart, Area } from "recharts";

interface MonthlyStat {
  month: string;
  totalAmount: number;
}

interface PaymentTransaction {
  orderId: string;
  partnerCode: string;
  requestId: string;
  amount: number;
  orderInfo: string;
  orderType: string;
  transId: string;
  resultCode: number;
  message: string;
  payType: string;
  signature: string;
  verified: boolean;
  status: string; // Added status field
}

type ChartType = "bar" | "line" | "area";
type StatType = "month" | "year" | "week" | "day";

export default function TransactionPage() {
  const [stats, setStats] = useState<MonthlyStat[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [_loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [statType, setStatType] = useState<StatType>("month");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate paginated transactions
  const paginatedTransactions = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return transactions.slice(startIdx, startIdx + itemsPerPage);
  }, [transactions, currentPage]);

  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let statUrl = `/api/payment/transactions/statistics?type=${statType}`;
      if (startDate) statUrl += `&startDate=${startDate}`;
      if (endDate) statUrl += `&endDate=${endDate}`;
      const res1 = await fetch(`${API_URL}${statUrl}`);
      const res2 = await fetch(`${API_URL}/api/payment/transactions`);
      const statsData = await res1.json();
      const txData = await res2.json();
      setStats(statsData);
      setTransactions(txData);
      setLoading(false);
    };
    fetchData();
  }, [API_URL, statType, startDate, endDate]);

  const renderChart = () => {
    if (chartType === "bar") {
      return (
        <BarChart data={stats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="key" />
          <YAxis />
          <Tooltip formatter={(value: number) => [Number(value), '₫']} />
          <Bar dataKey="totalAmount" fill="#10b981" radius={[6, 6, 0, 0]} />
        </BarChart>
      );
    }
    if (chartType === "line") {
      return (
        <LineChart data={stats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="key" />
          <YAxis />
          <Tooltip formatter={(value: number) => [Number(value), '₫']} />
          <Line type="monotone" dataKey="totalAmount" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
        </LineChart>
      );
    }
    if (chartType === "area") {
      return (
        <AreaChart data={stats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="key" />
          <YAxis />
          <Tooltip formatter={(value: number) => [Number(value), '₫']} />
          <Area type="monotone" dataKey="totalAmount" stroke="#10b981" fill="#6ee7b7" strokeWidth={3} />
        </AreaChart>
      );
    }
    return <BarChart data={[]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="key" />
      <YAxis />
      <Tooltip formatter={(value: number) => [Number(value), '₫']} />
      <Bar dataKey="totalAmount" fill="#10b981" radius={[6, 6, 0, 0]} />
    </BarChart>;
  };

  return (

      <div className="max-w-5xl mx-auto py-10 px-4 min-h-[80vh]">
        <h1 className="text-3xl font-bold text-emerald-700 mb-2 text-center">Transaction Statistics</h1>
        <p className="text-gray-500 text-center mb-8">Monthly revenue and transaction history</p>
        <Card className="mb-8 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex gap-2 items-center">
              <span className="font-semibold text-emerald-700">Chart type:</span>
              <select value={chartType} onChange={e => setChartType(e.target.value as ChartType)} className="border border-emerald-200 rounded px-2 py-1">
                <option value="bar">Bar</option>
                <option value="line">Line</option>
                <option value="area">Area</option>
              </select>
            </div>
            <div className="flex gap-2 items-center">
              <span className="font-semibold text-emerald-700">Statistics by:</span>
              <select value={statType} onChange={e => setStatType(e.target.value as StatType)} className="border border-emerald-200 rounded px-2 py-1">
                <option value="month">Month</option>
                <option value="year">Year</option>
                <option value="week">Week</option>
                <option value="day">Day</option>
              </select>
            </div>
            <div className="flex gap-2 items-center">
              <span className="font-semibold text-emerald-700">From:</span>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border border-emerald-200 rounded px-2 py-1" />
              <span className="font-semibold text-emerald-700">To:</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border border-emerald-200 rounded px-2 py-1" />
            </div>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-emerald-700 mb-4">Transaction Details</h2>
          <div className="overflow-x-auto rounded-lg border border-emerald-100 bg-emerald-50 transition-all duration-500">
            <table className="min-w-full divide-y divide-emerald-200">
              <thead className="bg-emerald-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-emerald-700 uppercase">Order ID</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-emerald-700 uppercase">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-emerald-700 uppercase">Order Info</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-emerald-700 uppercase">Result</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-emerald-700 uppercase">Verified</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map(tx => (
                  <tr key={tx.orderId} className="border-b border-emerald-100 hover:bg-emerald-200/30 transition-colors">
                    <td className="px-4 py-2 text-sm text-gray-800">{tx.orderId}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{tx.amount.toLocaleString()} ₫</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{tx.orderInfo}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{String(tx.status).toLowerCase() === 'success' ? <span className="text-emerald-600 font-semibold">Success</span> : <span className="text-red-500 font-semibold">Fail</span>}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{String(tx.status).toLowerCase() === 'success' ? <span className="text-emerald-600">✔</span> : <span className="text-red-500">✘</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination controls */}
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              className="px-3 py-1 rounded border border-emerald-300 bg-white text-emerald-700 disabled:opacity-50"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-700 border-emerald-300'}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 rounded border border-emerald-300 bg-white text-emerald-700 disabled:opacity-50"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </Card>
      </div>
  );
} 