import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import type { Exercises } from "@/types/apiTypes.ts"
import {useState} from "react";

interface PracticeExerciseProps {
    skill?: string;
    exercises: Exercises[];
}
export function PracticeExercise({ exercises, skill }: PracticeExerciseProps) {
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [isSubmitted] = useState(false);
    const [isSubmittedPerQuestion, setIsSubmittedPerQuestion] = useState<Record<string, boolean>>({});


    const handleAnswerChange = (key: string, value: string) => {
        setUserAnswers(prev => ({ ...prev, [key]: value.trim() }));
    };
    const handleSubmitQuestion = (questionKey: string) => {
        setIsSubmittedPerQuestion(prev => ({ ...prev, [questionKey]: true }));
    };

    function isCorrect(userAns?: string, correctAns?: string | string[]) {
        if (!userAns || !correctAns) return false;

        if (Array.isArray(correctAns)) {
            return correctAns
                .map(ans => ans.toLowerCase())
                .includes(userAns.toLowerCase());
        }

        return userAns.toLowerCase() === correctAns.toLowerCase();
    }


    return(
        <Card className="border shadow-sm mb-10">
            <CardHeader className="bg-gray-50 border-b text-left">
                <CardTitle>Practice Exercise</CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-left">
                <>
                    {/* Writing & Speaking*/}
                    {(skill === "Writing" || skill === "Speaking") &&
                        exercises.map((exercise, idx) => (
                            <div key={idx} className="mb-12">
                                {exercise.imageUrl && (
                                    <div className="mb-4">
                                        <img
                                            src={exercise.imageUrl}
                                            alt="Diagram"
                                            className="w-full h-auto border rounded-lg"
                                        />
                                    </div>
                                )}
                                <p className="mb-6 font-semibold italic" dangerouslySetInnerHTML={{ __html: exercise.instruction}}/>
                                {exercise.section.map((q, qIdx) => (
                                    <div key={qIdx} className="mb-6 p-4 border rounded-lg bg-gray-50">
                                        <div className="flex items-center gap-2">
                                            <label className="inline-block mb-1 font-semibold" htmlFor={`input-${idx}-${qIdx}`}>
                                                {qIdx + 1}.
                                            </label>
                                            <p className="font-medium inline-block px-2">{q.question}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <details className="border-l-4 border-emerald-600 pl-3 mt-2">
                                                <summary className="cursor-pointer text-emerald-700">
                                                    Sample Answer
                                                </summary>
                                                <p className="mt-1">
                                                    <strong>Answer:</strong> {Array.isArray(q.answer) ? q.answer : q.answer}
                                                </p>
                                            </details>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}

                    {(skill === "Listening" || skill === "Reading") &&
                        exercises.map((exercise, idx) => (
                            <div key={idx} className="mb-12">
                                {/* Hiển thị đoạn paragraph với html */}
                                <div className="mb-4 prose max-w-none" dangerouslySetInnerHTML={{ __html: exercise.paragraph ?? "" }} />

                                {/* Hiển thị instruction */}
                                <p className="mb-6 font-semibold italic" dangerouslySetInnerHTML={{ __html: exercise.instruction}}/>

                                {/* Hiển thị hình ảnh */}
                                {exercise.imageUrl && (
                                    <div className="mb-4">
                                        <img
                                            src={exercise.imageUrl}
                                            alt="Diagram"
                                            className="w-full h-auto border rounded-lg"
                                        />
                                    </div>
                                )}

                                {exercise.audioUrl && (
                                    <div className="mb-6">
                                        <audio controls className="w-full">
                                            <source src={exercise.audioUrl} type="audio/mpeg" />
                                            Your browser does not support the audio element.
                                        </audio>
                                    </div>
                                )}

                                {/* Hiển thị từng câu hỏi */}
                                {exercise.section.map((q, qIdx) => (
                                    <div key={qIdx} className="mb-6 p-4 border rounded-lg bg-gray-50">
                                        <div className="flex items-center gap-2">
                                            {(() => {
                                                // Multiple Choice (True/False/Not Given)
                                                if (q.options && q.options.length > 0) {
                                                    const questionStr = Array.isArray(q.question) ? q.question.join(' ') : q.question;

                                                    const isTFNG = q.options.some(opt =>
                                                        ['True', 'False', 'Not Given'].includes(opt)
                                                    );
                                                    const isTooManyOptions = q.options.length > 4;
                                                    const useSelect = isTFNG || isTooManyOptions;

                                                    // ----- 1. Dạng SELECT (True/False/Not Given hoặc nhiều hơn 4 đáp án) -----
                                                    if (useSelect) {
                                                        return (
                                                            <div className="ml-2 inline-block">
                                                                <label className="inline-block mb-1 font-semibold" htmlFor={`input-${idx}-${qIdx}`}>
                                                                    {qIdx + 1}.
                                                                </label>

                                                                <p className="font-medium inline-block px-2">{questionStr}</p>

                                                                <select
                                                                    id={`input-${idx}-${qIdx}`}
                                                                    className="border rounded px-2 py-1 mt-1 inline-block"
                                                                    defaultValue=""
                                                                    onChange={(e) => handleAnswerChange(`q-${idx}-${qIdx}`, e.target.value)}
                                                                >
                                                                    <option value="" disabled></option>
                                                                    {q.options.map((opt, i) => (
                                                                        <option key={i} value={opt}>{opt}</option>
                                                                    ))}
                                                                </select>
                                                                <button
                                                                    className="mt-4 px-4 py-1 bg-emerald-600 text-white rounded"
                                                                    onClick={() => handleSubmitQuestion(`q-${idx}-${qIdx}`)}
                                                                >
                                                                    Submit
                                                                </button>
                                                                {isSubmittedPerQuestion[`q-${idx}-${qIdx}`] && userAnswers[`q-${idx}-${qIdx}`] && (
                                                                    <p className={`mt-1 font-semibold ${
                                                                        isCorrect(userAnswers[`q-${idx}-${qIdx}`], q.answer) ? 'text-green-600' : 'text-red-600'
                                                                    }`}>
                                                                        {isCorrect(userAnswers[`q-${idx}-${qIdx}`], q.answer) ? '✅ Correct' : '❌ Incorrect'}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        );
                                                    }

                                                    // ----- 2. MULTIPLE CHOICE (radio ≤ 4 đáp án) -----
                                                    return (
                                                        <div className="ml-2 inline-block">
                                                            <label className="inline-block mb-1 font-semibold">
                                                                {qIdx + 1}.
                                                            </label>

                                                            <p className="font-medium inline-block px-2">{questionStr}</p>

                                                            {/* Danh sách lựa chọn dạng radio */}
                                                            <div className="mt-2 space-y-1">
                                                                {q.options.map((opt, i) => (
                                                                    <label key={i} className="flex items-center gap-2">
                                                                        <input
                                                                            type="radio"
                                                                            name={`q-${idx}-${qIdx}`}
                                                                            value={opt}
                                                                            className="accent-emerald-600"
                                                                            onChange={() => handleAnswerChange(`q-${idx}-${qIdx}`, opt)}
                                                                        />
                                                                        <span>{opt}</span>
                                                                    </label>

                                                                ))}
                                                                <button
                                                                    className="mt-4 px-4 py-1 bg-emerald-600 text-white rounded"
                                                                    onClick={() => handleSubmitQuestion(`q-${idx}-${qIdx}`)}
                                                                >
                                                                    Submit
                                                                </button>
                                                                {isSubmittedPerQuestion[`q-${idx}-${qIdx}`] && userAnswers[`q-${idx}-${qIdx}`] && (
                                                                    <p className={`mt-1 font-semibold ${
                                                                        isCorrect(userAnswers[`q-${idx}-${qIdx}`].charAt(0), q.answer) ? 'text-green-600' : 'text-red-600'
                                                                    }`}>
                                                                        {isCorrect(userAnswers[`q-${idx}-${qIdx}`].charAt(0), q.answer) ? '✅ Correct' : '❌ Incorrect'}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                // Sentence Completion (nhiều <h1> trong question)
                                                else if (((Array.isArray(q.question) ? q.question.join('') : q.question).match(/<h1>/g) || []).length > 1) {
                                                    const questions = Array.isArray(q.question) ? q.question : [q.question];
                                                    return (
                                                        <div className="flex flex-col gap-4 w-full">
                                                            {questions.map((item, idx) => {
                                                                const [before, after] = item.split('<h1>');
                                                                return (
                                                                    <div key={idx} className=" mb-2">
                                                                        <span className="flex-1 whitespace-normal text-base">{before}</span>
                                                                        <input
                                                                            type="text"
                                                                            className="border rounded px-3 py-2 mx-2 flex-shrink-0 w-56 text-base"
                                                                            placeholder=""
                                                                            style={{ minWidth: '120px', maxWidth: '220px' }}
                                                                            onChange={(e) => handleAnswerChange(`q-${idx}-${qIdx}`, e.target.value)}
                                                                        />
                                                                        <span className="flex-1 whitespace-normal text-base">{after}</span>
                                                                        <button
                                                                            className="mt-6 px-4 py-2 bg-emerald-600 text-white rounded"
                                                                            onClick={() => handleSubmitQuestion(`q-${idx}-${qIdx}`)}
                                                                        >
                                                                            Submit
                                                                        </button>
                                                                        {isSubmittedPerQuestion[`q-${idx}-${qIdx}`] && userAnswers[`q-${idx}-${qIdx}`] && (
                                                                            <p className={`mt-1 font-semibold ${
                                                                                isCorrect(userAnswers[`q-${idx}-${qIdx}`], q.answer[idx]) ? 'text-green-600' : 'text-red-600'
                                                                            }`}>
                                                                                {isCorrect(userAnswers[`q-${idx}-${qIdx}`],q.answer[idx]) ? '✅ Correct' : '❌ Incorrect'}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    );
                                                }

                                                // Diagram Completion (một <h1> trong question)
                                                else if (((Array.isArray(q.question) ? q.question.join('') : q.question).match(/<h1>/g) || []).length === 1) {
                                                    const questionStr = Array.isArray(q.question) ? q.question.join('') : q.question;
                                                    const parts = questionStr.split("<h1>");
                                                    return (
                                                        <div className="ml-2 inline-block">
                                                            <p className="font-medium inline-block">{parts[0]}</p>
                                                            <input
                                                                type="text"
                                                                id={`input-${idx}-${qIdx}`}
                                                                className="border rounded px-2 py-1 ml-2 inline-block"
                                                                placeholder=""
                                                                onChange={(e) => handleAnswerChange(`q-${idx}-${qIdx}`, e.target.value)}
                                                            />
                                                            <p className="font-medium inline-block">{parts[1]}</p>
                                                            <button
                                                                className="mt-6 px-4 py-2 bg-emerald-600 text-white rounded"
                                                                onClick={() => handleSubmitQuestion(`q-${idx}-${qIdx}`)}
                                                            >
                                                                Submit
                                                            </button>
                                                            {isSubmittedPerQuestion[`q-${idx}-${qIdx}`] && userAnswers[`q-${idx}-${qIdx}`] && (
                                                                <p className={`mt-1 font-semibold ${
                                                                    isCorrect(userAnswers[`q-${idx}-${qIdx}`], q.answer) ? 'text-green-600' : 'text-red-600'
                                                                }`}>
                                                                    {isCorrect(userAnswers[`q-${idx}-${qIdx}`], q.answer) ? '✅ Correct' : '❌ Incorrect'}
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                }

                                                return null; // Trường hợp không xác định
                                            })()}
                                        </div>
                                        {/* Đáp án đúng */}
                                        {(isSubmittedPerQuestion[`q-${idx}-${qIdx}`] || isSubmitted) && (
                                            <details className="border-l-4 border-emerald-600 pl-3 mt-2">
                                                <summary className="cursor-pointer text-emerald-700">
                                                    Answer & Explanation
                                                </summary>
                                                <p className="mt-1">
                                                    <strong>Answer:</strong> {Array.isArray(q.answer) ? q.answer : q.answer}

                                                </p>
                                                <p className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: q.explanation ?? "" }}/>
                                            </details>
                                        )}

                                    </div>
                                ))}
                            </div>
                        ))}
                </>
            </CardContent>
        </Card>
    )
}