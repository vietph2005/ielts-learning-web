import { API_URL } from "@/config/api";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ListTest {
    id: string;
    title: string;
    year: number;
}

interface TestsByYear {
    [year: string]: ListTest[];
}

interface MockTestProps {
    selectedSkill: 'Listening' | 'Reading' | 'Writing' | 'Speaking' | 'All Skills';
}



// Sử dụng function component bình thường
function MockTest({ selectedSkill = 'All Skills' }: MockTestProps) {
    const [testsByYear, setTestsByYear] = useState<TestsByYear>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTests = async () => {
            try {
                setLoading(true);
                setError(null);
                const endpoint =
                    selectedSkill === 'All Skills'
                        ? '/api/test/all-skill'
                        : `/api/test/${selectedSkill.toLowerCase()}`;

                const response = await fetch(`${API_URL}${endpoint}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                const transformedData: TestsByYear = {};
                if (Array.isArray(data)) {
                    data.forEach((test: ListTest) => {
                        const year = test.year.toString();
                        if (!transformedData[year]) {
                            transformedData[year] = [];
                        }
                        transformedData[year].push(test);
                    });
                } else if (typeof data === 'object') {
                    Object.entries(data).forEach(([year, tests]) => {
                        if (Array.isArray(tests)) {
                            transformedData[year] = tests;
                        }
                    });
                }

                setTestsByYear(transformedData);
            } catch (err) {
                console.error('Failed to fetch tests:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch tests');
                setTestsByYear({});
            } finally {
                setLoading(false);
            }
        };

        fetchTests();
    }, [selectedSkill]);

    const getTestTitle = (year: string): string => {
        return selectedSkill === 'All Skills'
            ? `IELTS Mock Tests ${year}`
            : `IELTS ${selectedSkill} Practice Tests ${year}`;
    };

    const handleStartTest = (testId: string): void => {

        const skill = selectedSkill === 'All Skills' ? 'full' : selectedSkill.toLowerCase();
        navigate(`/test/${skill}/${testId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-500">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {Object.entries(testsByYear)
                .map(([year, tests]) => (
                    <motion.div
                        key={year}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="mb-6">
                            <Badge className="bg-gray-100 text-emerald-800 font-normal mb-3">
                                <BookOpen className="h-3 w-3 mr-1" />
                                {year}
                            </Badge>
                            <h2 className="text-3xl font-bold text-[#374151]">{getTestTitle(year)}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {tests.map((test) => (
                                <Card key={test.id} className="border shadow-sm">
                                    <CardHeader className="bg-gray-50 border-b">
                                        <CardTitle className="text-lg font-semibold text-[#374151]">
                                            {test.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <Badge variant="secondary">
                                                    {selectedSkill === 'All Skills' ? 'Full Test' : selectedSkill}
                                                </Badge>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleStartTest(test.id)}
                                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all duration-300"
                                            >
                                                <span>Start Test</span>
                                                <ArrowRight size={16} />
                                            </motion.button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                ))}
        </div>
    );
}

export default MockTest;