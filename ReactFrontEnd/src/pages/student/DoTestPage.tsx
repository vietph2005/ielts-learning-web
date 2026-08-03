import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReadingTest from '@/pages/DoTest/ReadingTest.tsx';
import ListeningTest from '@/pages/DoTest/ListeningTest';
import WritingTest from '@/pages/DoTest/WritingTest';
import SpeakingTest from '@/pages/DoTest/SpeakingTest';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface DoTestPageProps {}

const DoTestPage: React.FC<DoTestPageProps> = () => {
    const { testId } = useParams<{ testId: string }>();
    const [loading, setLoading] = useState(true);
    const [testData, setTestData] = useState<any>(null);

    useEffect(() => {
        const fetchFullTest = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/verify/fulltest/${testId}`, {
                    withCredentials: true,
                });
                setTestData(res.data);
            } catch (error) {
                console.error('❌ Error fetching test:', error);
            } finally {
                setLoading(false);
            }
        };

        if (testId) fetchFullTest();
    }, [testId]);

    if (loading) return <div className="text-center mt-10">🔄 Đang tải đề thi...</div>;
    if (!testData) return <div className="text-center mt-10 text-red-500">❌ Không tìm thấy đề thi.</div>;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold text-center mb-6">📝 Bài thi: {testData.title || 'Không rõ tiêu đề'}</h1>

            <Tabs defaultValue="reading" className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="reading">Reading</TabsTrigger>
                    <TabsTrigger value="listening">Listening</TabsTrigger>
                    <TabsTrigger value="writing">Writing</TabsTrigger>
                    <TabsTrigger value="speaking">Speaking</TabsTrigger>
                </TabsList>

                <TabsContent value="reading">
                    <ReadingTest />
                </TabsContent>

                <TabsContent value="listening">
                    <ListeningTest />
                </TabsContent>

                <TabsContent value="writing">
                    <WritingTest />
                </TabsContent>

                <TabsContent value="speaking">
                    <SpeakingTest />
                </TabsContent>

            </Tabs>
        </div>
    );
};

export default DoTestPage;
