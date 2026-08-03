import {Badge} from "@/components/ui/badge.tsx";
import {BookOpen, BrainCircuit, CheckCircle, Lightbulb} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import type {Exercises} from "@/types/apiTypes.ts"

interface StrategyAndTipProps {
    id: string | number;
    type: string;
    skill: string;
    description: string;
    strategy?: string[];
    tips?: string[];
    exercises: Exercises[];
}

export function StrategyAndTip({type, skill, description, strategy, tips }: StrategyAndTipProps){
    return(
        <div className="max-w-4xl mx-auto">
            <div className="mb-12">
                <Badge className="bg-gray-100 text-emerald-800 font-normal mb-3 mr-300">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {skill}
                </Badge>
                <h2 className="text-3xl font-bold mb-3 text-left">{type}</h2>
            </div>
            {/* Skill Definition */}
            <Card className="border shadow-sm mb-10">
                <CardHeader className="bg-gray-50 border-b">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-emerald-600" />
                        <CardTitle>Understanding IELTS {skill}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="prose max-w-none text-left">
                        {description}
                    </div>
                </CardContent>
            </Card>
            {/* Example Illustration*/}
            {/*<div className="mb-10">*/}
            {/*    <div className="flex items-center gap-2 mb-4">*/}
            {/*        <PenLine className="h-5 w-5 text-emerald-600" />*/}
            {/*        <h3 className="text-xl font-bold">Example Illustration</h3>*/}
            {/*    </div>*/}
            {/*    <p className="text-gray-600 mb-4">Sample reading passage with question types</p>*/}

            {/*    <div className="relative w-full h-[400px] mb-4 border rounded-lg overflow-hidden">*/}
            {/*        <img*/}
            {/*            src="/images/12345.png" height={1000} width={800}*/}
            {/*            alt="IELTS Reading Example"*/}
            {/*            className="object-contain"*/}
            {/*        />*/}
            {/*    </div>*/}
            {/*</div>*/}
            {/* Strategy Section */}
            <Card className="border shadow-sm mb-10">
                <CardHeader className="bg-gray-50 border-b">
                    <div className="flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5 text-emerald-600" />
                        <CardTitle>{skill} Strategies</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid gap-6">
                        {strategy?.map((s, idx) => (
                            <div key={idx} className="flex items-start gap-4">
                                <div className="bg-emerald-100 p-2 rounded-full">
                                    <span className="font-bold text-emerald-700">{idx + 1}</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-left">{s}</h3>
                                    {/*<p className="text-gray-600 text-left">{s}</p>*/}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            {/* Tips Section */}
            <Card className="border shadow-sm mb-10">
                <CardHeader className="bg-gray-50 border-b">
                    <div className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-emerald-600" />
                        <CardTitle>Essential Tips</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid gap-4">
                        {tips?.map((t, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-emerald-500 mt-1" />
                                <div>
                                    <h3 className="font-medium text-left">{t}</h3>
                                    {/*<p className="text-sm text-gray-600 text-left">*/}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
