import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface Tip {
    id?: string;
    testId?: string;
    skill: string;
    type: string;
    description: string;
}

interface TipsSectionProps {
    tips?: { [key: string]: Tip | undefined } | null;
}

export function TipsSection({ tips }: TipsSectionProps) {
    const navigate = useNavigate();
    if (!tips || typeof tips !== 'object') return null;
    const tipsArray = Object.values(tips).filter((tip): tip is Tip => !!tip && typeof tip === 'object');

    if (tipsArray.length === 0) return null;

    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Expert IELTS Tips</h2>
                    <p className="text-lg text-gray-600">Learn from our experts and improve your IELTS performance</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {tipsArray.map((tip, index) => (
                        <Card 
                            key={tip.id || tip.testId || index} 
                            className="hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => navigate(`/tips/${tip.skill}`)}
                        >
                            <CardHeader>
                                <Badge variant="outline" className="w-fit mb-2">
                                    {tip.skill}
                                </Badge>
                                <CardTitle className="text-lg leading-tight">{tip.type}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 text-sm mb-4">{tip.description}</p>
                                <div className="flex items-center justify-between">
                                    <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                                        Read More
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
