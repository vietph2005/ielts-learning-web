import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from 'axios';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, Trash2, CheckCircle } from "lucide-react";

// --- START: Type Definitions ---
// Note: These types are based on the backend models in the 'add' package.
interface AddQuestion {
  questionNumber?: number;
  question: string;
  answer?: string;
  explanation?: string;
  options?: string[];
}

interface AddSection {
  sectionNumber: number;
  type: string;
  imageUrl?: string;
  introduction?: string;
  questions: AddQuestion[];
}

interface AddListeningTask {
  taskNumber: number;
  sections: AddSection[];
}

interface AddListening {
  id?: string;
  testId?: string;
  audioUrl: string;
  tasks: AddListeningTask[];
}

interface AddReadingTask {
    taskNumber: number;
    paragraph: string;
    sections: AddSection[];
}

interface AddReading {
    id?: string;
    testId?: string;
    tasks: AddReadingTask[];
}

interface AddWritingTask {
    taskNumber: number;
    question: string;
    imageUrl?: string;
}

interface AddWriting {
    id?: string;
    testId?: string;
    tasks: AddWritingTask[];
}

interface AddSpeakingQuestion {
    questionNumber: number;
    question: string;
}

interface AddSpeakingPart {
    partNumber: number;
    title: string;
    questions: AddSpeakingQuestion[];
}

interface AddSpeakingPart2 {
    partNumber: number;
    title: string;
    question: string;
    cueCards: string[];
}

interface AddSpeaking {
    id?: string;
    testId?: string;
    part1: AddSpeakingPart;
    part2: AddSpeakingPart2;
    part3: AddSpeakingPart;
}

interface AddTest {
  testId: string; // Changed from 'id' to 'testId' to match backend
  testTitle: string;
  tags: string[];
  createAt: string; // Assuming it's a date string
}

interface TestDetailResponse {
  test: AddTest;
  listening: AddListening | null;
  reading: AddReading | null;
  writing: AddWriting | null;
  speaking: AddSpeaking | null;
}
// --- END: Type Definitions ---


// --- START: Reusable Child Components ---

const SkillContentWrapper = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card className="mt-4">
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
);

const NoData = ({ skill }: { skill: string }) => (
    <p className="text-gray-500 italic">No data provided for {skill}.</p>
);

const ListeningView = ({ data }: { data: AddListening | null }) => {
  if (!data) return <NoData skill="Listening" />;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="font-semibold">Audio File:</span>
        {data.audioUrl ? (
        <audio controls src={data.audioUrl} className="w-full">
          Your browser does not support the audio element.
        </audio>
        ) : (
          <span className="text-red-500">No audio file provided</span>
        )}
      </div>
      {data.tasks && data.tasks.length > 0 ? (
        data.tasks.map((task, index) => (
        <Card key={index}>
          <CardHeader><CardTitle>Task {task.taskNumber}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
              {task.sections && task.sections.length > 0 ? (
                task.sections.map((section, sIndex) => (
              <div key={sIndex} className="p-4 border rounded-lg bg-gray-50/50">
                <h4 className="font-semibold mb-2 text-lg">Section {section.sectionNumber} <Badge variant="secondary">{section.type}</Badge></h4>
                {section.imageUrl && <img src={section.imageUrl} alt={`Section Visual`} className="my-2 rounded-md max-w-full md:max-w-md" />}
                {section.introduction && <p className="mb-2 italic text-gray-600">{section.introduction}</p>}
                <div className="space-y-3">
                        {section.questions && section.questions.length > 0 ? (
                          section.questions.map((q, qIndex) => (
                        <div key={qIndex} className="pt-3 border-t">
                            <p><strong>{q.questionNumber || qIndex + 1}.</strong> {q.question}</p>
                            {q.options && q.options.length > 0 && <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">{q.options.map((opt, oIndex) => <li key={oIndex}>{opt}</li>)}</ul>}
                                  {q.answer && <p className="mt-2 text-green-700 font-semibold">Answer: {q.answer}</p>}
                            {q.explanation && <p className="text-sm text-blue-600 mt-1">Explanation: {q.explanation}</p>}
                        </div>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No questions in this section</p>
                        )}
                </div>
              </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No sections in this task</p>
              )}
          </CardContent>
        </Card>
        ))
      ) : (
        <p className="text-gray-500 italic">No tasks available</p>
      )}
    </div>
  );
};

const ReadingView = ({ data }: { data: AddReading | null }) => {
    if (!data) return <NoData skill="Reading" />;
    
    return (
      <div className="space-y-6">
        {data.tasks && data.tasks.length > 0 ? (
          data.tasks.map((task, index) => (
          <Card key={index}>
            <CardHeader><CardTitle>Task {task.taskNumber}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-semibold mb-2 text-lg">Paragraph</h4>
                    <p>{task.paragraph || 'No paragraph provided'}</p>
              </div>
                {task.sections && task.sections.length > 0 ? (
                  task.sections.map((section, sIndex) => (
                <div key={sIndex} className="p-4 border rounded-lg bg-gray-50/50">
                  <h4 className="font-semibold mb-2 text-lg">Section {section.sectionNumber} <Badge variant="secondary">{section.type}</Badge></h4>
                   <div className="space-y-3">
                        {section.questions && section.questions.length > 0 ? (
                          section.questions.map((q, qIndex) => (
                        <div key={qIndex} className="pt-3 border-t">
                            <p><strong>{q.questionNumber || qIndex + 1}.</strong> {q.question}</p>
                            {q.options && q.options.length > 0 && <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">{q.options.map((opt, oIndex) => <li key={oIndex}>{opt}</li>)}</ul>}
                                  {q.answer && <p className="mt-2 text-green-700 font-semibold">Answer: {q.answer}</p>}
                            {q.explanation && <p className="text-sm text-blue-600 mt-1">Explanation: {q.explanation}</p>}
                        </div>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No questions in this section</p>
                        )}
                </div>
                </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No sections in this task</p>
                )}
            </CardContent>
          </Card>
          ))
        ) : (
          <p className="text-gray-500 italic">No tasks available</p>
        )}
      </div>
    );
};

const WritingView = ({ data }: { data: AddWriting | null }) => {
    if (!data) return <NoData skill="Writing" />;
    
    return (
        <div className="space-y-6">
        {data.tasks && data.tasks.length > 0 ? (
          data.tasks.map((task, index) => (
          <Card key={index}>
            <CardHeader><CardTitle>Task {task.taskNumber}</CardTitle></CardHeader>
            <CardContent>
                {task.imageUrl && <img src={task.imageUrl} alt={`Task visual`} className="my-2 rounded-md max-w-full md:max-w-md" />}
                  <p className="text-lg leading-relaxed">{task.question || 'No question provided'}</p>
            </CardContent>
          </Card>
          ))
        ) : (
          <p className="text-gray-500 italic">No tasks available</p>
        )}
      </div>
    );
};

const SpeakingView = ({ data }: { data: AddSpeaking | null }) => {
    if (!data) return <NoData skill="Speaking" />;
    
    return (
        <div className="space-y-6">
            {data.part1 && (
              <Card>
                <CardHeader><CardTitle>{data.part1.title} (Part {data.part1.partNumber})</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {data.part1.questions && data.part1.questions.length > 0 ? (
                    data.part1.questions.map((q, i) => <p key={i}><strong>{q.questionNumber}.</strong> {q.question}</p>)
                  ) : (
                    <p className="text-gray-500 italic">No questions in Part 1</p>
                  )}
                </CardContent>
              </Card>
            )}
            {data.part2 && (
              <Card>
                <CardHeader><CardTitle>{data.part2.title} (Part {data.part2.partNumber})</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    <p className="font-semibold">{data.part2.question || 'No question provided'}</p>
                    {data.part2.cueCards && data.part2.cueCards.length > 0 ? (
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                        {data.part2.cueCards.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">No cue cards provided</p>
                    )}
                </CardContent>
              </Card>
            )}
             {data.part3 && (
              <Card>
                <CardHeader><CardTitle>{data.part3.title} (Part {data.part3.partNumber})</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {data.part3.questions && data.part3.questions.length > 0 ? (
                    data.part3.questions.map((q, i) => <p key={i}><strong>{q.questionNumber}.</strong> {q.question}</p>)
                  ) : (
                    <p className="text-gray-500 italic">No questions in Part 3</p>
                  )}
                </CardContent>
              </Card>
            )}
        </div>
    );
};
// --- END: Reusable Child Components ---


// --- START: Main Page Component ---
export default function RequestTestDetailPage() {
    const [searchParams] = useSearchParams();
    const testId = searchParams.get('id');
    const navigate = useNavigate();

    const [testDetail, setTestDetail] = useState<TestDetailResponse | null>(null);
    const [status, setStatus] = useState<'loading' | 'error' | 'success' | 'idle'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [actionStatus, setActionStatus] = useState<'loading' | 'error' | 'success' | 'idle'>('idle');
    const [actionError, setActionError] = useState<string | null>(null);
    const [showDebug, setShowDebug] = useState(false);


    const API_URL = import.meta.env.VITE_API_URL;
    useEffect(() => {
      if (!testId) {
        setStatus('error');
        setError("Invalid Test ID.");
        return;
      }
      
      const fetchTestDetail = async () => {
        setStatus('loading');
        try {
          const response = await axios.get(`${API_URL}/api/manager/request-test/${testId}`, { withCredentials: true });
          
          // Validate response data
          if (!response.data || !response.data.test) {
            throw new Error("Invalid response format from server");
          }
          
          setTestDetail(response.data);
          setStatus('success');
        } catch (err: any) {
          console.error('Error fetching test details:', err);
          setStatus('error');
          setError(err.response?.data?.message || err.message || "Failed to fetch test details.");
        }
      };
      
      fetchTestDetail();
    }, [testId]);

    const handleAction = async (action: 'accept' | 'delete') => {
        if (!testId) return;

        const url = action === 'accept' 
            ? `${API_URL}/api/manager/accept-test/${testId}` 
            : `${API_URL}/api/manager/request-test/${testId}`;
        const method = action === 'accept' ? 'post' : 'delete';

        setActionStatus('loading');
        setActionError(null);
        try {
            const response = await axios({ method, url, withCredentials: true });
            console.log(`${action} test response:`, response.data);
            setActionStatus('success');
            // Wait for 2 seconds before navigating to give user feedback
            setTimeout(() => navigate('/accept-tests'), 2000); 
        } catch(err: any) {
            console.error(`Error ${action}ing test:`, err);
            setActionStatus('error');
            setActionError(err.response?.data?.message || `Failed to ${action} test.`);
        }
    };
    
    // --- Render Logic ---
    if (status === 'loading') {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
                <p className="ml-4 text-xl">Loading Test Details...</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
             <div className="container mx-auto p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
            </div>
        );
    }
    
    if (!testDetail) {
        return <p>No test data found.</p>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen relative">
            {actionStatus === 'loading' && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-4">
                        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                        <p>Processing request...</p>
                    </div>
                </div>
            )}
            
            <header className="mb-6">
                <Button onClick={() => navigate(-1)} variant="outline" className="mb-4">
                    &larr; Back to Requests
                </Button>
                <div className="flex justify-between items-start">
                    <div>
                <h1 className="text-3xl font-bold text-gray-800">{testDetail.test.testTitle}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                    {testDetail.test.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
                </div>
                 <p className="text-sm text-gray-500 mt-2">
                    Requested on: {new Date(testDetail.test.createAt).toLocaleString()}
                </p>
                        <p className="text-sm text-gray-500">
                            Test ID: {testDetail.test.testId}
                        </p>
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowDebug(!showDebug)}
                        className="text-xs"
                    >
                        {showDebug ? 'Hide' : 'Show'} Debug
                    </Button>
                </div>
            </header>

            {showDebug && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-sm">Debug Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                            {JSON.stringify(testDetail, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="listening" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="listening">Listening</TabsTrigger>
                    <TabsTrigger value="reading">Reading</TabsTrigger>
                    <TabsTrigger value="writing">Writing</TabsTrigger>
                    <TabsTrigger value="speaking">Speaking</TabsTrigger>
                </TabsList>
                <TabsContent value="listening"><SkillContentWrapper title="Listening Details"><ListeningView data={testDetail.listening} /></SkillContentWrapper></TabsContent>
                <TabsContent value="reading"><SkillContentWrapper title="Reading Details"><ReadingView data={testDetail.reading} /></SkillContentWrapper></TabsContent>
                <TabsContent value="writing"><SkillContentWrapper title="Writing Details"><WritingView data={testDetail.writing} /></SkillContentWrapper></TabsContent>
                <TabsContent value="speaking"><SkillContentWrapper title="Speaking Details"><SpeakingView data={testDetail.speaking} /></SkillContentWrapper></TabsContent>
            </Tabs>
            
            <footer className="mt-8 pt-6 border-t">
                <div className="flex justify-end gap-4">
                     <Button 
                        variant="destructive" 
                        onClick={() => handleAction('delete')}
                        disabled={actionStatus === 'loading'}
                    >
                        {actionStatus === 'loading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Reject Request
                    </Button>
                    <Button 
                        className="bg-green-600 hover:bg-green-700" 
                        onClick={() => handleAction('accept')}
                        disabled={actionStatus === 'loading'}
                    >
                         {actionStatus === 'loading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                        Accept and Publish
                    </Button>
                </div>
                 {actionStatus === 'error' && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Action Failed</AlertTitle>
                        <AlertDescription>{actionError}</AlertDescription>
                    </Alert>
                )}
                 {actionStatus === 'success' && (
                    <Alert variant="default" className="mt-4 bg-green-100 text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Success!</AlertTitle>
                        <AlertDescription>Action completed successfully. You will be redirected shortly.</AlertDescription>
                    </Alert>
                )}
            </footer>
        </div>
    );
}
// --- END: Main Page Component --- 