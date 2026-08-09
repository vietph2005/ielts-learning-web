import { API_URL } from "@/config/api";
import {useEffect, useState} from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {Search, Filter, Eye, MessageSquare, Download, CalendarIcon, FileText, BarChart3, PieChart} from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface Report {
    id: string
    username: string
    category: string
    subject: string
    message: string
    createdAt: string
    notes: string[]
    relatedLesson?: string
}

type TypeColors = { [key: string]: string };
const typeColors: TypeColors = {
    suggestion: "bg-yellow-100 text-yellow-800",
    complaint: "bg-red-100 text-red-800",
    compliment: "bg-green-100 text-green-800",
    question: "bg-blue-100 text-blue-800",
    other: "bg-gray-100 text-gray-800",
};

export default function ReviewReport() {
    
    const [reports, setReports] = useState<Report[]>([])
    const [filteredReports, setFilteredReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedReport, setSelectedReport] = useState<Report | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [typeFilter, setTypeFilter] = useState("all")
    const [dateFrom, setDateFrom] = useState<Date | null>(null)
    const [dateTo, setDateTo] = useState<Date | null>(null)
    const [newNote, setNewNote] = useState("")
    const [responseMessage, setResponseMessage] = useState("")
    const [dailyStats, setDailyStats] = useState<{ date: string; count: number }[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 3
    // Filter function
    const applyFilters = () => {
        const filtered = reports.filter((report) => {
            const matchesSearch =
                report.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.subject.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesType = typeFilter === "all" || report.category === typeFilter

            let matchesDate = true
            if (dateFrom && dateTo) {
                const reportDate = new Date(report.createdAt)
                matchesDate = reportDate >= dateFrom && reportDate <= dateTo
            }

            return matchesSearch && matchesType && matchesDate
        })

        setFilteredReports(filtered)
        setCurrentPage(1)
    }
    useEffect(() => {
        applyFilters()
    }, [searchTerm])


    // Add note to report
    const addNoteToReport = (reportId: string, note: string) => {
        setReports((prev) =>
            prev.map((report) => (report.id === reportId ? { ...report, notes: [...report.notes, note] } : report)),
        )
    }

    const groupReportsByDate = (reports: Report[]) => {
        const result: Record<string, number> = {}

        reports.forEach((report) => {
            const date = format(new Date(report.createdAt), "yyyy-MM-dd") // nhóm theo ngày
            result[date] = (result[date] || 0) + 1
        })

        // Chuyển về mảng để dễ xử lý
        return Object.entries(result)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }

    // Statistics data
    const getStatistics = () => {
        const total = reports.length

        const typeStats = {
            suggestion: reports.filter((r) => r.category === "suggestion").length,
            complaint: reports.filter((r) => r.category === "complaint").length,
            compliment: reports.filter((r) => r.category === "compliment").length,
            question: reports.filter((r) => r.category === "question").length,
            other: reports.filter((r) => r.category === "other").length,
        }

        return { total, typeStats }
    }

    const stats = getStatistics()
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await fetch(`${API_URL}/api/report`);
                if (!response.ok) {
                    throw new Error("Failed to fetch reports");
                }
                const data = await response.json()
                setReports(data)
                setFilteredReports(data)
                const grouped = groupReportsByDate(data)
                setDailyStats(grouped)
            } catch (error) {
                console.error("Error to fetch data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchReports()
    }, [])

    if (loading) {
        return <p>Loading report data...</p>
    }

    const paginatedData = filteredReports.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )
    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Student Report Management</h1>
                    <p className="text-muted-foreground">View and manage reports from IELTS students</p>
                </div>
            </div>

            <Tabs defaultValue="reports" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="reports">Report List</TabsTrigger>
                    <TabsTrigger value="statistics">Statistics</TabsTrigger>
                </TabsList>

                <TabsContent value="reports" className="space-y-6">
                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filters & Search
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label>Search</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Name, subject..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">

                                </div>

                                <div className="space-y-2">
                                    <Label>Report Category</Label>
                                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="suggestion">Suggestion</SelectItem>
                                            <SelectItem value="complaint">Complaint</SelectItem>
                                            <SelectItem value="question">Question</SelectItem>
                                            <SelectItem value="compliment">Compliment</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Submission Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {dateFrom && dateTo
                                                    ? `${format(dateFrom, "dd/MM/yyyy")} - ${format(dateTo, "dd/MM/yyyy")}`
                                                    : "Select Date Range"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="range"
                                                selected={{ from: dateFrom ?? undefined, to: dateTo ?? undefined }}
                                                onSelect={(range) => {
                                                    setDateFrom(range?.from ?? null)
                                                    setDateTo(range?.to ?? null)
                                                }}
                                                locale={vi}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <Button onClick={applyFilters} className="w-full md:w-auto bg-green-800 hover:bg-green-900">
                                Apply Filters
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Reports Table */}
                    <div>
                        <Card>
                        <CardHeader>
                            <CardTitle>Report List ({filteredReports.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Date Submitted</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Content</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <>
                                        {paginatedData.map((report) => (
                                            <TableRow key={report.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{report.username}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{format(new Date(report.createdAt), "dd/MM/yyyy")}</TableCell>
                                                <TableCell className="max-w-xs truncate">{report.subject}</TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {report.message.length > 10 ? `${report.message.slice(0, 10)}...` : report.message}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={typeColors[report.category]}>{report.category}</Badge>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                                                <DialogHeader>
                                                                    <DialogTitle>Detail Report</DialogTitle>
                                                                    <DialogDescription>
                                                                        From {report.username}
                                                                    </DialogDescription>
                                                                </DialogHeader>

                                                                <div className="space-y-6">
                                                                    {/* Report Info */}
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <Label className="text-sm font-medium">Submitted On</Label>
                                                                            <p>{format(new Date(report.createdAt), "dd/MM/yyyy HH:mm")}</p>
                                                                        </div>
                                                                        <div>
                                                                            <Label className="text-sm font-medium">Report Category</Label>
                                                                            <p>
                                                                                <Badge className={typeColors[report.category]}>{report.category}</Badge>
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    {/* Subject */}
                                                                    <div>
                                                                        <Label className="text-sm font-medium">Subject</Label>
                                                                        <Input
                                                                            className="border-none"
                                                                            value={selectedReport?.subject || ""}
                                                                            onChange={(e) => {
                                                                                const newSubject = e.target.value
                                                                                setReports((prev) =>
                                                                                    prev.map((r) => (r.id === selectedReport?.id ? { ...r, subject: newSubject } : r))
                                                                                )
                                                                            }}
                                                                        />
                                                                    </div>

                                                                    {/* Content */}
                                                                    <div>
                                                                        <Label className="text-sm font-medium">Message Content</Label>
                                                                        <div className="mt-2 p-4 bg-muted rounded-lg">
                                                                            <p>{selectedReport?.message}</p>
                                                                        </div>
                                                                    </div>

                                                                    {/* Related Lesson */}
                                                                    {report.relatedLesson && (
                                                                        <div>
                                                                            <Label className="text-sm font-medium">Related Lesson</Label>
                                                                            <p className="mt-1 text-blue-600">{report.relatedLesson}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </>
                                </TableBody>
                            </Table>
                        </CardContent>
                            {filteredReports.length > itemsPerPage && (
                                <div className="flex justify-center items-center gap-2 mt-6">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm text-gray-700">
                              Page {currentPage} of {Math.ceil(filteredReports.length / itemsPerPage)}
                            </span>
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredReports.length / itemsPerPage)))}
                                        disabled={currentPage === Math.ceil(filteredReports.length / itemsPerPage)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                    </Card>
                    </div>
                </TabsContent>

                <TabsContent value="statistics" className="space-y-6">
                    {/* Statistics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChart className="h-5 w-5" />
                                    Report Category Breakdown
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {Object.entries(stats.typeStats).map(([type, count]) => (
                                        <div key={type} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`w-3 h-3 rounded-full ${
                                                        type === "Technical issue"
                                                            ? "bg-purple-500"
                                                            : type === "Feedback"
                                                                ? "bg-indigo-500"
                                                                : "bg-teal-500"
                                                    }`}
                                                />
                                                <span className="text-sm">{type}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">{count}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    ({((count / stats.total) * 100).toFixed(1)}%)
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Reporting Trend Over Time
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {dailyStats.map((stat, index) => {
                                        const previousCount = index > 0 ? dailyStats[index - 1].count : null
                                        const percentChange =
                                            previousCount !== null && previousCount !== 0
                                                ? (((stat.count - previousCount) / previousCount) * 100).toFixed(1)
                                                : null

                                        const maxCount = Math.max(...dailyStats.map((d) => d.count))
                                        const widthPercent = (stat.count / maxCount) * 100

                                        return (
                                            <div
                                                key={stat.date}
                                                className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b pb-2">
                                                {/* Date */}
                                                <div className="w-full md:w-1/3 text-sm font-medium text-muted-foreground">
                                                    {format(new Date(stat.date), "dd/MM/yyyy")}
                                                </div>

                                                {/* Bar & Value */}
                                                <div className="w-full md:w-1/2 flex items-center gap-2">
                                                    <div className="flex-1 h-2 bg-green-200 rounded-full relative overflow-hidden">
                                                        <div
                                                            className="h-2 bg-green-700 rounded-full transition-all duration-300"
                                                            style={{ width: `${widthPercent}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-semibold w-8 text-right">{stat.count}</span>
                                                </div>

                                                {/* Percentage change */}
                                                <div className="w-full md:w-1/6 text-sm text-right">
                                                    {percentChange !== null && (
                                                        <span
                                                            className={`font-medium ${
                                                                +percentChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                            ({+percentChange >= 0 ? "+" : ""}
                                                            {percentChange}%)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
