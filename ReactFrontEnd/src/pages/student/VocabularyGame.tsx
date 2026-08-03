import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Vocabulary as VocabularyType } from '@/types/apiTypes';
import { ArrowLeft } from 'lucide-react';

const VocabularyGame: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const initialWords: VocabularyType[] = location.state?.vocabList || [];

    const [remainingWords, setRemainingWords] = useState<VocabularyType[]>([]);
    const [currentWord, setCurrentWord] = useState<VocabularyType | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [shakeIndex, setShakeIndex] = useState<number | null>(null);
    const [shakeMessage, setShakeMessage] = useState(false);
    const [correctIndex, setCorrectIndex] = useState<number | null>(null);

    useEffect(() => {
        if (!initialWords || initialWords.length === 0) {
            navigate('/student/vocabulary');
            return;
        }
        setRemainingWords([...initialWords]);
    }, []);

    useEffect(() => {
        if (remainingWords.length > 0) {
            loadNextWord(remainingWords[0]);
        } else if (remainingWords.length === 0 && currentWord !== null) {
            setCurrentWord(null);
            setOptions([]);
            setMessage('Congratulations! You’ve finished the game.');
        }
    }, [remainingWords]);

    const loadNextWord = (word: VocabularyType) => {
        const incorrectOptions = initialWords
            .filter((v) => v.id !== word.id && !!v.translate)
            .map((v) => v.translate)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        const allOptions = [...incorrectOptions, word.translate].sort(
            () => 0.5 - Math.random()
        );

        setCurrentWord(word);
        setOptions(allOptions);
        setMessage('');
    };

    const handleAnswer = (answer: string, idx: number) => {
        if (!currentWord) return;

        if (answer === currentWord.translate) {
            setCorrectIndex(idx);

            setTimeout(() => {
                setCorrectIndex(null);
                setShakeIndex(null);
                setShakeMessage(false);
                setRemainingWords((prev) => prev.slice(1));
            }, 800);
        } else {

            setShakeIndex(idx);
            setShakeMessage(true);
            setTimeout(() => {
                setShakeIndex(null);
                setShakeMessage(false);
            }, 600);
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-12 text-center animate-fade-in">
            <h1 className="text-4xl font-bold mb-8 text-green-600 animate-slide-in-top">
                Choose the correct meaning
            </h1>

            {currentWord ? (
                <>
                    <Card className="p-10 mb-10 text-3xl shadow-xl rounded-2xl border-2 border-green-300 animate-fade-in">
                        <div className="font-bold mb-2 text-green-700 animate-pulse">
                            {currentWord.word}
                        </div>
                        {currentWord.partOfSpeech && (
                            <div className="text-xl text-gray-600 mb-1">
                                ({currentWord.partOfSpeech})
                            </div>
                        )}
                        {currentWord.pronunciation && (
                            <div className="text-xl italic text-gray-500">
                                /{currentWord.pronunciation}/
                            </div>
                        )}
                    </Card>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        {options.map((opt, idx) => (
                            <Button
                                key={idx}
                                variant="outline"
                                className={`py-6 text-2xl font-bold rounded-xl shadow-md transition-transform duration-300 
                  ${shakeIndex === idx ? 'shake bg-red-100 border-red-500' : ''}
                  ${correctIndex === idx ? 'bg-green-500 text-white border-green-500 scale-105' : ''}`}
                                onClick={() => handleAnswer(opt, idx)}
                            >
                                {opt}
                            </Button>
                        ))}
                    </div>

                    {shakeMessage && message && (
                        <span className="mt-4 inline-block text-2xl font-bold text-red-600 animate-shake">
              {message}
            </span>
                    )}
                </>
            ) : (
                <div className="text-2xl font-bold text-green-600 mt-10 animate-bounce">
                    {message}
                </div>
            )}

            <button
                onClick={() => navigate('/practice/vocabulary')}
                className="inline-flex items-center gap-2 text-green-600 hover:underline text-base font-medium mt-6"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Vocabulary
            </button>
        </div>
    );
};

export default VocabularyGame;