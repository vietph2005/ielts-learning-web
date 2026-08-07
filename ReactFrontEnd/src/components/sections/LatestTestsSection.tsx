import { Play} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom";

export interface IELTSTest {
    testId: string
    testTitle: string
    tags: string[]
    createdAt: string
}

interface LatestTestsSectionProps {
    tests: IELTSTest[]
}

export function LatestTestsSection({ tests }: LatestTestsSectionProps) {
    const navigate = useNavigate();
    return (
        <section className="py-16 bg-white ">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Latest IELTS Online Tests</h2>
                    <p className="text-lg text-gray-600">Practice with our newest and most comprehensive IELTS tests</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tests.map((test, index) => (
                        <Card key={test.testId || index} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                {/* Hiển thị tags dưới dạng Badge */}
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {test.tags.map((tag, tagIdx) => (
                                        <Badge key={`${tag}-${tagIdx}`} variant="outline" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>

                                <CardTitle className="text-lg">{test.testTitle}</CardTitle>
                                <p className="text-sm text-gray-500 mb-1">
                                    Created at: {test.createdAt ? new Date(test.createdAt).toLocaleString() : "Unknown"}
                                </p>
                            </CardHeader>

                            <CardContent>
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700"
                                    onClick={() => navigate(`/test/full/${test.testId}`)}
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Start Test
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}