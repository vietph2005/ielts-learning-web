import apiClient from "@/lib/apiClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Headphones, Book, PenLine, Mic } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { HeroSection } from "@/components/sections/HeroSection";

type Skill = "Listening" | "Reading" | "Writing" | "Speaking";

interface Tip {
    id: string;
    skill: string;
    type: string;
    description: string;
}

interface SkillInfo {
    name: Skill;
    icon: React.ReactNode;
    description: string;
}

function TipPage() {
    const { skill } = useParams();
    const navigate = useNavigate();
    const [currentSkill, setCurrentSkill] = useState<Skill>((skill as Skill) || "Listening");
    const [searchQuery, setSearchQuery] = useState("");
    const [tips, setTips] = useState<Tip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const skills: SkillInfo[] = [
        {
            name: "Listening",
            icon: <Headphones className="h-6 w-6" />,
            description: "Improve your listening comprehension",
        },
        {
            name: "Reading",
            icon: <Book className="h-6 w-6" />,
            description: "Enhance your reading skills",
        },
        {
            name: "Writing",
            icon: <PenLine className="h-6 w-6" />,
            description: "Perfect your writing abilities",
        },
        {
            name: "Speaking",
            icon: <Mic className="h-6 w-6" />,
            description: "Develop your speaking proficiency",
        },
    ];

    useEffect(() => {
        const newSkill = (skill as Skill) || "Listening";
        setCurrentSkill(newSkill);

        const fetchTips = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await apiClient.get<Tip[]>(`/tips?skill=${newSkill.toLowerCase()}`);
                setTips(Array.isArray(data) ? data : []);
            } catch (error: any) {
                console.error("Error fetching tips:", error);
                setError("Failed to load tips. Please try again later.");
                setTips([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTips();
    }, [skill]);

    const filtered = useMemo(() => {
        return tips.filter((tip) =>
            tip.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tip.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [tips, searchQuery]);

    return (
        <div className="min-h-screen bg-gray-50">
            <HeroSection />
            <div className="container mx-auto min-h-screen bg-gray-50">
                <Card className="mb-8 shadow-md">
                    <CardContent className="py-8">
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">IELTS Practice Tests</h2>
                            <p className="text-gray-600">Choose your skill and start practicing</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 px-4">
                            {skills.map((skillInfo) => (
                                <motion.div
                                    key={skillInfo.name}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => navigate(`/tips/${skillInfo.name}`)}
                                    className="cursor-pointer"
                                >
                                    <Card
                                        className={`h-full transition-colors duration-300 ${
                                            currentSkill === skillInfo.name
                                                ? "bg-emerald-600 text-white border-emerald-600"
                                                : "bg-white hover:border-emerald-600 hover:text-emerald-600"
                                        }`}
                                    >
                                        <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
                                            <div
                                                className={`mb-3 transition-colors ${
                                                    currentSkill === skillInfo.name ? "text-white" : "text-emerald-600"
                                                }`}
                                            >
                                                {skillInfo.icon}
                                            </div>
                                            <h3 className="font-semibold mb-1">{skillInfo.name}</h3>
                                            <p
                                                className={`text-xs ${
                                                    currentSkill === skillInfo.name ? "text-white/80" : "text-gray-500"
                                                }`}
                                            >
                                                {skillInfo.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="container mx-auto px-4 py-8">
                    <h2 className="text-2xl font-bold mb-6 text-primary text-center">
                        IELTS {currentSkill}
                    </h2>

                    <div className="flex justify-center mb-8">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search IELTS tips..."
                                className="pl-8 w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                        </div>
                    ) : error ? (
                        <div className="text-red-500 text-center py-12">{error}</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filtered.length === 0 ? (
                                <p className="text-gray-500 col-span-full text-center">No tips found.</p>
                            ) : (
                                filtered.map((tip) => (
                                    <Card
                                        key={tip.id}
                                        className="cursor-pointer hover:shadow-lg transition-shadow min-h-[160px] justify-center text-left"
                                        onClick={() => navigate(`/${currentSkill}/${tip.id}`)}
                                    >
                                        <CardHeader>
                                            <CardTitle>{tip.type}</CardTitle>
                                            <CardDescription className="line-clamp-2">{tip.description}</CardDescription>
                                        </CardHeader>
                                    </Card>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TipPage;
