"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BookOpen, FileText, Mic, Volume2, Trophy, ChevronRight, TrendingUp } from "lucide-react"
import { MainLayout } from "@/components/layout/MainLayout"

const API_URL = import.meta.env.VITE_API_URL

export default function FullTestResult() {
  const { testId } = useParams<{ testId: string }>()
  const [searchParams] = useSearchParams()
  const testAnswerId = testId || searchParams.get("testAnswerId")
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"listening" | "reading" | "writing" | "speaking">("listening")
  const [results, setResults] = useState<any>({})

  useEffect(() => {
    if (!testAnswerId) return
    setLoading(true)
    fetch(`${API_URL}/api/result/fulltest/${testAnswerId}`, { credentials: "include" })
        .then((res) => {
          if (!res.ok) throw new Error("Not found full test result")
          return res.json()
        })
        .then((data) => {
          setResults(data)
          setLoading(false)
        })
        .catch((e) => {
          setError(e.message)
          setLoading(false)
        })
  }, [testAnswerId])

  const getBandColor = (band: number) => {
    if (band >= 8.0) return "text-emerald-600"
    if (band >= 7.0) return "text-blue-600"
    if (band >= 6.0) return "text-orange-600"
    if (band >= 5.0) return "text-yellow-600"
    return "text-red-600"
  }

  const getBandBgGradient = (skill: string) => {
    switch (skill) {
      case "listening":
        return "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200"
      case "reading":
        return "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
      case "writing":
        return "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
      case "speaking":
        return "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
      default:
        return "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200"
    }
  }

  const getButtonColor = (skill: string) => {
    switch (skill) {
      case "listening":
        return "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
      case "reading":
        return "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
      case "writing":
        return "bg-orange-600 hover:bg-orange-700 shadow-orange-200"
      case "speaking":
        return "bg-purple-600 hover:bg-purple-700 shadow-purple-200"
      default:
        return "bg-gray-600 hover:bg-gray-700 shadow-gray-200"
    }
  }

  const calculateOverallBand = () => {
    const bands: number[] = []

    const pushBand = (value: any) => {
      if (value !== null && value !== undefined) bands.push(value)
    }

    pushBand(results.listening?.band)
    pushBand(results.reading?.band)
    pushBand(results.writing?.band ?? results.writing?.score)
    pushBand(results.speaking?.band)

    if (bands.length === 0) return null // Không có kỹ năng nào

    const sum = bands.reduce((acc, curr) => acc + curr, 0)
    const average = sum / bands.length
    return Math.round(average * 2) / 2
  }


  if (loading)
    return (
        <MainLayout>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                <div className="absolute inset-0 rounded-full bg-blue-50 opacity-20"></div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-700">Loading Your Results</h3>
                <p className="text-gray-500">Please wait while we prepare your test results...</p>
              </div>
            </div>
          </div>
        </MainLayout>
    )

  if (error)
    return (
        <MainLayout>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
            <Card className="max-w-md mx-auto shadow-2xl border-0">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-500 text-2xl">⚠️</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button onClick={() => navigate(-1)} className="bg-blue-600 hover:bg-blue-700">
                  Go Back
                </Button>
              </CardContent>
            </Card>
          </div>
        </MainLayout>
    )

  return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-indigo-50">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header Section */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg mb-6 border border-white/20">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-medium text-gray-700">IELTS Test Results</span>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-purple-800 bg-clip-text text-transparent mb-4">
                Your Performance Report
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
                Comprehensive analysis of your IELTS test performance across all four skills
              </p>
              {/* Overall Score Card - Đã di chuyển vào đây */}
              {calculateOverallBand() !== null && (
                  <Card className="mx-auto bg-gradient-to-r from-green-200 to-green-100 text-gray-600 border-0 shadow-2xl">
                    <CardContent className="p-8 text-center">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <Trophy className="w-8 h-8 text-yellow-300" />
                        <div>
                          <h2 className="text-2xl font-bold">Overall Band Score</h2>
                        </div>
                      </div>
                      <div className="text-7xl font-extrabold mb-2 leading-none">{calculateOverallBand()} / 9.0</div>
                    </CardContent>
                  </Card>
              )}
            </div>

            {/* Skills Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {[
                { key: "listening", name: "Listening", icon: Volume2, result: results.listening },
                { key: "reading", name: "Reading", icon: BookOpen, result: results.reading },
                { key: "writing", name: "Writing", icon: FileText, result: results.writing },
                { key: "speaking", name: "Speaking", icon: Mic, result: results.speaking },
              ].map((skill) => (
                  <Card
                      key={skill.key}
                      className={`group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-0 ${getBandBgGradient(skill.key)}`}
                      onClick={() => setActiveTab(skill.key as any)}
                  >
                    <CardContent className="p-6 text-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                      <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors">
                          <skill.icon className="w-6 h-6 text-gray-700" />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-3 text-lg">{skill.name}</h3>
                        {skill.result ? (
                            <>
                              <div
                                  className={`text-4xl font-bold mb-3 ${getBandColor(skill.result.band || skill.result.score)}`}
                              >
                                {skill.result.band || skill.result.score || "-"}
                              </div>
                              <Badge className="bg-white/80 text-gray-700 border-0 shadow-sm">
                                Band {skill.result.band || skill.result.score || "-"}/9
                              </Badge>
                            </>
                        ) : (
                            <>
                              <div className="text-4xl font-bold mb-3 text-gray-400">-</div>
                              <Badge variant="outline" className="bg-white/50 border-gray-300">
                                Not completed
                              </Badge>
                            </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </div>

            {/* Detailed Results Section */}
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Detailed Analysis</h2>
                    <p className="text-gray-600">In-depth breakdown of your performance</p>
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
                  <TabsList className="grid grid-cols-4 gap-2 mb-8 bg-gray-100/80 rounded-xl p-2 h-auto">
                    <TabsTrigger
                        value="listening"
                        className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-white data-[state=active]:shadow-md"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span className="hidden sm:inline font-medium">Listening</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="reading"
                        className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-white data-[state=active]:shadow-md"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span className="hidden sm:inline font-medium">Reading</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="writing"
                        className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-white data-[state=active]:shadow-md"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="hidden sm:inline font-medium">Writing</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="speaking"
                        className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-white data-[state=active]:shadow-md"
                    >
                      <Mic className="w-4 h-4" />
                      <span className="hidden sm:inline font-medium">Speaking</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="listening">
                    {results.listening ? (
                        <Card className={`border-0 shadow-lg ${getBandBgGradient("listening")}`}>
                          <CardContent className="p-8">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                                    <Volume2 className="w-6 h-6 text-emerald-700" />
                                  </div>
                                  <div>
                                    <h3 className="text-2xl font-bold text-emerald-800">Listening Results</h3>
                                    <p className="text-emerald-600">Your listening comprehension performance</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-5xl font-bold text-emerald-700">{results.listening.band}/9</div>
                                  <div className="space-y-2">
                                    <Badge className="bg-emerald-600 text-white border-0 shadow-lg">
                                      Band {results.listening.band}
                                    </Badge>
                                    <div className="text-sm text-emerald-700 font-medium">
                                      {results.listening.band >= 7
                                          ? "Excellent Performance"
                                          : results.listening.band >= 6
                                              ? "Good Performance"
                                              : results.listening.band >= 5
                                                  ? "Fair Performance"
                                                  : "Needs Improvement"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <Button
                                  onClick={() => navigate(`/listening-result/${results.listening.id}`)}
                                  className={`${getButtonColor("listening")} shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3`}
                              >
                                View Detailed Analysis
                                <ChevronRight className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                    ) : (
                        <div className="text-center py-16 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
                          <Volume2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-gray-500 mb-2">No Listening Result Available</h3>
                          <p className="text-gray-400">This section was not completed in your test.</p>
                        </div>
                    )}
                  </TabsContent>

                  <TabsContent value="reading">
                    {results.reading ? (
                        <Card className={`border-0 shadow-lg ${getBandBgGradient("reading")}`}>
                          <CardContent className="p-8">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-blue-700" />
                                  </div>
                                  <div>
                                    <h3 className="text-2xl font-bold text-blue-800">Reading Results</h3>
                                    <p className="text-blue-600">Your reading comprehension performance</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-5xl font-bold text-blue-700">{results.reading.band}/9</div>
                                  <div className="space-y-2">
                                    <Badge className="bg-blue-600 text-white border-0 shadow-lg">
                                      Band {results.reading.band}
                                    </Badge>
                                    <div className="text-sm text-blue-700 font-medium">
                                      {results.reading.band >= 7
                                          ? "Excellent Performance"
                                          : results.reading.band >= 6
                                              ? "Good Performance"
                                              : results.reading.band >= 5
                                                  ? "Fair Performance"
                                                  : "Needs Improvement"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <Button
                                  onClick={() => navigate(`/reading-result/${results.reading.id}`)}
                                  className={`${getButtonColor("reading")} shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3`}
                              >
                                View Detailed Analysis
                                <ChevronRight className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                    ) : (
                        <div className="text-center py-16 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
                          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-gray-500 mb-2">No Reading Result Available</h3>
                          <p className="text-gray-400">This section was not completed in your test.</p>
                        </div>
                    )}
                  </TabsContent>

                  <TabsContent value="writing">
                    {results.writing ? (
                        <Card className={`border-0 shadow-lg ${getBandBgGradient("writing")}`}>
                          <CardContent className="p-8">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-orange-700" />
                                  </div>
                                  <div>
                                    <h3 className="text-2xl font-bold text-orange-800">Writing Results</h3>
                                    <p className="text-orange-600">Your writing skills performance</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-5xl font-bold text-orange-700">
                                    {results.writing.band || results.writing.score || "-"}/9
                                  </div>
                                  <div className="space-y-2">
                                    <Badge className="bg-orange-600 text-white border-0 shadow-lg">
                                      Band {results.writing.band || results.writing.score || "-"}
                                    </Badge>
                                    <div className="text-sm text-orange-700 font-medium">
                                      {(results.writing.band || results.writing.score) >= 7
                                          ? "Excellent Performance"
                                          : (results.writing.band || results.writing.score) >= 6
                                              ? "Good Performance"
                                              : (results.writing.band || results.writing.score) >= 5
                                                  ? "Fair Performance"
                                                  : "Needs Improvement"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <Button
                                  onClick={() => navigate(`/writing-result/${results.writing.id}`)}
                                  className={`${getButtonColor("writing")} shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3`}
                              >
                                View Detailed Analysis
                                <ChevronRight className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                    ) : (
                        <div className="text-center py-16 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
                          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-gray-500 mb-2">No Writing Result Available</h3>
                          <p className="text-gray-400">This section was not completed in your test.</p>
                        </div>
                    )}
                  </TabsContent>

                  <TabsContent value="speaking">
                    {results.speaking ? (
                        <Card className={`border-0 shadow-lg ${getBandBgGradient("speaking")}`}>
                          <CardContent className="p-8">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                                    <Mic className="w-6 h-6 text-purple-700" />
                                  </div>
                                  <div>
                                    <h3 className="text-2xl font-bold text-purple-800">Speaking Results</h3>
                                    <p className="text-purple-600">Your speaking skills performance</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-5xl font-bold text-purple-700">{results.speaking.band}/9</div>
                                  <div className="space-y-2">
                                    <Badge className="bg-purple-600 text-white border-0 shadow-lg">
                                      Band {results.speaking.band}
                                    </Badge>
                                    <div className="text-sm text-purple-700 font-medium">
                                      {results.speaking.band >= 7
                                          ? "Excellent Performance"
                                          : results.speaking.band >= 6
                                              ? "Good Performance"
                                              : results.speaking.band >= 5
                                                  ? "Fair Performance"
                                                  : "Needs Improvement"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <Button
                                  onClick={() => navigate(`/speaking-result/${results.speaking.id}`)}
                                  className={`${getButtonColor("speaking")} shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3`}
                              >
                                View Detailed Analysis
                                <ChevronRight className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                    ) : (
                        <div className="text-center py-16 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
                          <Mic className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-gray-500 mb-2">No Speaking Result Available</h3>
                          <p className="text-gray-400">This section was not completed in your test.</p>
                        </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
  )
}
