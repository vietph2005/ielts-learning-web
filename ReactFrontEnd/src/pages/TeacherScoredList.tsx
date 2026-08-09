"use client"
import { API_URL } from "@/config/api";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {Search, Download, Eye, MoreHorizontal, FileText, Users, TrendingUp, Calendar, RefreshCw} from "lucide-react"
import {Label} from "@/components/ui/label.tsx";
import {format} from "date-fns";

interface WritingResult {
    _id: string
    username: string
    testId: string
    task1: { score?: string }
    task2: { score?: string }
    band: number
    submittedAt: string
    gradingMethod: string
}

export default function TeacherScoredList() {
    
    const [data, setData] = useState<WritingResult[]>([])
    const [filteredData, setFilteredData] = useState<WritingResult[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [bandRange, setBandRange] = useState<[number, number] | null>(null)
    const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null)
    const [dateFrom, setDateFrom] = useState<Date | null>(null)
    const [dateTo, setDateTo] = useState<Date | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5


    const handleFilter = () => {
        const filtered = data.filter((result) => {
            const matchesSearch =
                    result.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    result.testId.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesBand = bandRange ? result.band >= bandRange[0] && result.band <= bandRange[1] : true
            let matchesDate = true
            if (dateFrom && dateTo) {
                const scoredDate = new Date(result.submittedAt)
                matchesDate = scoredDate >= dateFrom && scoredDate <= dateTo
            }

            return matchesSearch && matchesBand && matchesDate
        })
        setFilteredData(filtered)
        setCurrentPage(1)
    }

    useEffect(() => {
        if (dateRange?.from) {
            setDateFrom(new Date(dateRange.from))
        }
        if (dateRange?.to) {
            setDateTo(new Date(dateRange.to))
        }
    }, [dateRange])


    useEffect(() => {
        handleFilter()
    }, [searchTerm])

    const handleViewDetails = (id: string) => {
        // Route or show modal
        console.log("Viewing details for:", id)
        // router.push(`/teacher/writing/${id}`)
    }
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const getBandColor = (band: number) => {
        if (band >= 8) return "text-green-600 font-bold"
        if (band >= 7) return "text-blue-600 font-semibold"
        if (band >= 6) return "text-orange-600 font-medium"
        return "text-red-600 font-medium"
    }

    const calculateStats = () => {
        const total = filteredData.length
        const avgBand =
            filteredData.length > 0
                ? (filteredData.reduce((sum, item) => sum + item.band, 0) / filteredData.length).toFixed(2)
                : "0"

        return { total, avgBand }
    }

    const stats = calculateStats()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_URL}/verify/allwriting`, {
                    credentials: "include", // nếu backend yêu cầu
                });
                if (!res.ok) throw new Error("Failed to fetch");
                const result: WritingResult[] = await res.json();
                const filteredByGrading = result.filter(
                    (item: any) =>
                        item.gradingMethod === "teacher" ||
                        item.gradingMethod === "human"
                )

                setData(filteredByGrading)
                setFilteredData(filteredByGrading)
            } catch (error) {
                console.error("Fetch failed:", error);
            }
        };

        fetchData();
    }, []);


    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Writing Assessment Dashboard</h1>
                    <p className="text-gray-600 mt-2">Manage and review all student writing assessments</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="border-l-4 border-l-green-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Average Band</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.avgBand}</p>
                                </div>
                                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">This Month</p>
                                    <p className="text-2xl font-bold text-gray-900">{filteredData.length}</p>
                                </div>
                                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card className="border-0 shadow-sm mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Filter & Search</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-8 mb-6">

                            {/* Ô tìm kiếm */}
                            <div className="space-y-2">
                                <Label>Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search by email, test ID ..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Bộ lọc Band Score */}
                            <div className="space-y-2">
                                <Label>Band Score</Label>
                                <div className="relative">
                                    <Select
                                        value={bandRange ? `${bandRange[0]}-${bandRange[1]}` : ""}
                                        onValueChange={(val) => {
                                            const [min, max] = val.split("-").map(Number)
                                            setBandRange([min, max])
                                        }}
                                    >
                                    <SelectTrigger className="w-full md:w-48">
                                            <SelectValue placeholder="Band Range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0-3">0.0 - 3.0</SelectItem>
                                            <SelectItem value="3.1-4">3.1 - 4.0</SelectItem>
                                            <SelectItem value="4.1-5">4.1 - 5.0</SelectItem>
                                            <SelectItem value="5.1-6">5.1 - 6.0</SelectItem>
                                            <SelectItem value="6.1-7">6.1 - 7.0</SelectItem>
                                            <SelectItem value="7.1-8">7.1 - 8.0</SelectItem>
                                            <SelectItem value="8.1-9">8.1 - 9.0</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Bộ lọc ngày - có thể nâng cấp với thư viện DatePicker */}
                            <div className="space-y-2">
                                <Label>Date From</Label>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        value={dateRange?.from || ""}
                                        onChange={(e) =>
                                            setDateRange((prev) => ({
                                                from: e.target.value,
                                                to: prev?.to ?? "",
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>To</Label>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        value={dateRange?.to || ""}
                                        onChange={(e) =>
                                            setDateRange((prev) => ({
                                                from: prev?.from ?? "",
                                                to: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                        </div>
                        {/* Nút lọc */}
                        <div className="flex gap-2">
                            <Button onClick={handleFilter} className="w-full md:w-auto bg-green-800 hover:bg-green-900">
                                Apply Filters
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm("")
                                    setBandRange(null)
                                    setDateFrom(null)
                                    setDateTo(null)
                                    setDateRange(null)
                                    setFilteredData(data)
                                }}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>


                {/* Results Table */}
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Assessment Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-semibold">Student Email</TableHead>
                                        <TableHead className="font-semibold">Test ID</TableHead>
                                        <TableHead className="font-semibold text-center">Task 1</TableHead>
                                        <TableHead className="font-semibold text-center">Task 2</TableHead>
                                        <TableHead className="font-semibold text-center">Band Score</TableHead>
                                        <TableHead className="font-semibold">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedData.map((item) => (
                                        <TableRow key={item._id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">{item.username}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono">
                                                    {item.testId}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="font-semibold text-blue-600">
                                                    {item.task1?.score ?? "-"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="font-semibold text-blue-600">
                                                    {item.task2?.score ?? "-"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className={getBandColor(item.band)}>{item.band.toFixed(1)}</span>
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                {item.submittedAt ? format(new Date(item.submittedAt), "dd/MM/yyyy") : ""}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {filteredData.length === 0 && (
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                            </div>
                        )}
                    </CardContent>
                    {filteredData.length > itemsPerPage && (
                        <div className="flex justify-center items-center gap-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-700">
                              Page {currentPage} of {Math.ceil(filteredData.length / itemsPerPage)}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredData.length / itemsPerPage)))}
                                disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
