import {useEffect, useState} from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Search,
  Filter,
  Download,
  Printer,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CalendarIcon,
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  Eye,
  RefreshCw,
} from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Success":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Success</Badge>
    case "Failed":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>
    case "Pending":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return format(new Date(dateString), "dd/MM/yyyy", { locale: vi })
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [filterTransactionId] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Statistics calculations
  const totalTransactions = transactions.length
  const totalAmount = transactions.filter((t) => t.status === "Success").reduce((sum, t) => sum + t.amount, 0)
  const successRate = Math.round((transactions.filter((t) => t.status === "Success").length / totalTransactions) * 100)
  const paymentMethods = transactions.reduce(
    (acc, t) => {
      acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )
    const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    fetch(`${API_URL}/api/payment/transactions`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          setTransactions(data)
          setFilteredTransactions(data)
        })
        .catch((err) => console.error("Error to load transaction:", err))
  }, [])

  // Filter and search logic
  const applyFilters = () => {
    let filtered = [...transactions]

    if (filterTransactionId.trim() !== "") {
      filtered = filtered.filter((transaction) =>
          (transaction.transactionId || "")
              .toLowerCase()
              .includes(filterTransactionId.toLowerCase())
      );
    }
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((t) =>
          t.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.amount.toString().includes(searchTerm),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter)
    }

    // User email filter
    if (userFilter) {
      filtered = filtered.filter((t) => t.email.toLowerCase().includes(userFilter.toLowerCase()))
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter((t) => new Date(t.createdAt) >= dateFrom)
    }
    if (dateTo) {
      filtered = filtered.filter((t) => new Date(t.createdAt) <= dateTo)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case "date":
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case "amount":
          aValue = a.amount
          bValue = b.amount
          break
        default:
          aValue = a.createdAt
          bValue = b.createdAt
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredTransactions(filtered)
    setCurrentPage(1)
  }

  // Apply filters whenever dependencies change
  useEffect(() => {
    applyFilters()
  }, [transactions, searchTerm, userFilter])

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
    applyFilters()
  }

  const paginatedData = filteredTransactions.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  )
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transaction History </h1>
          <p className="text-muted-foreground">Manage and track all transactions</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">transactions</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">from success transactions</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">transaction successfully</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used Method</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.entries(paymentMethods)
                .sort(([, a], [, b]) => Number(b) - Number(a))[0]?.[0] || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {(
                Object.entries(paymentMethods)
                  .sort(([, a], [, b]) => Number(b) - Number(a))[0]?.[1] ?? 0
              ).toString()} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter and Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Transaction ID, username, amount..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Success">Success</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User Email Filter */}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input placeholder="Enter email..." value={userFilter} onChange={(e) => setUserFilter(e.target.value)} />
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <Label>Sort by</Label>
              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={(value) => {
                  const [field, order] = value.split("-")
                  setSortBy(field)
                  setSortOrder(order as "asc" | "desc")
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest</SelectItem>
                  <SelectItem value="date-asc">Oldest</SelectItem>
                  <SelectItem value="amount-desc">Highest Amount</SelectItem>
                  <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: vi }) : "Choose date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>To date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: vi }) : "Choose date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={applyFilters} className="bg-green-800">
              <Search className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setUserFilter("")
                setDateFrom(undefined)
                setDateTo(undefined)
                setSortBy("date")
                setSortOrder("desc")
                setFilteredTransactions(transactions)
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>List Transactions ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("id")}>
                    <div className="flex items-center gap-2">
                      Transaction ID
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Transaction Type</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("amount")}>
                    <div className="flex items-center gap-2">
                      Amount
                      {sortBy === "amount" &&
                        (sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />)}
                    </div>
                  </TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("date")}>
                    <div className="flex items-center gap-2">
                      Time
                      {sortBy === "date" &&
                        (sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />)}
                    </div>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <>
                  {paginatedData.map((transaction,index) => (
                      <TableRow key={index} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{transaction.transactionId}</TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm text-muted-foreground">{transaction.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{transaction.type}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(transaction.amount)}</TableCell>
                        <TableCell>{transaction.paymentMethod}</TableCell>
                        <TableCell>{getStatusBadge(transaction.status)as React.ReactNode}</TableCell>
                        <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedTransaction(transaction)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Detailed Transaction {transaction.transactionId}</DialogTitle>
                                  <DialogDescription>Detailed transaction information</DialogDescription>

                                </DialogHeader>
                                {selectedTransaction && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-sm font-medium">Transaction ID</Label>
                                          <p className="text-sm">{selectedTransaction.transactionId}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Status</Label>
                                          <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">User</Label>
                                          <p className="text-xs text-muted-foreground">{selectedTransaction.email}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Amount</Label>
                                          <p className="text-sm font-medium">{formatCurrency(selectedTransaction.amount)}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Transaction Method</Label>
                                          <p className="text-sm">{selectedTransaction.paymentMethod}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Transaction Type</Label>
                                          <p className="text-sm">{selectedTransaction.type}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Time</Label>
                                          <p className="text-sm">{formatDate(selectedTransaction.createdAt)}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Response Message</Label>
                                        <p className="text-sm bg-muted p-3 rounded-md mt-1">{selectedTransaction.message}</p>
                                      </div>
                                    </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                  ))}
                </>
              </TableBody>
            </Table>
          </div>
          <>
            {filteredTransactions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found matching the filters.
                </div>
            )}
          </>
        </CardContent>
        {filteredTransactions.length > itemsPerPage && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                              Page {currentPage} of {Math.ceil(filteredTransactions.length / itemsPerPage)}
                            </span>
              <Button
                  variant="outline"
                  onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredTransactions.length / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(filteredTransactions.length / itemsPerPage)}
              >
                Next
              </Button>
            </div>
        )}
      </Card>
    </div>
  )
}
