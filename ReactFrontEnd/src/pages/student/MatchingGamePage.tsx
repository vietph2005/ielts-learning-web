import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Vocabulary as VocabularyType } from '@/types/apiTypes';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface CardType {
    id: string;
    text: string;
    type: 'word' | 'translate';
    matched: boolean;
}

export default function MatchingGamePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const vocabList: VocabularyType[] = location.state?.vocabList || [];

    const batchSize = 6;
    const totalBatches = Math.ceil(vocabList.length / batchSize);

    const [batchIndex, setBatchIndex] = useState(0);
    const [cards, setCards] = useState<CardType[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [shakeIndexes, setShakeIndexes] = useState<number[]>([]);
    const [gameCompleted, setGameCompleted] = useState(false);

    const currentBatch = vocabList.slice(
        batchIndex * batchSize,
        (batchIndex + 1) * batchSize
    );

    useEffect(() => {
        const wordCards: CardType[] = currentBatch.map((v) => ({
            id: v.id,
            text: v.word,
            type: 'word',
            matched: false
        }));

        const translateCards: CardType[] = currentBatch.map((v) => ({
            id: v.id,
            text: v.translate,
            type: 'translate',
            matched: false
        }));

        const shuffled = shuffleArray([...wordCards, ...translateCards]);
        setCards(shuffled);
        setSelected([]);
        setShakeIndexes([]);
    }, [batchIndex, vocabList]);

    const handleCardClick = (index: number) => {
        if (cards[index].matched || selected.includes(index)) return;

        const newSelected = [...selected, index];
        setSelected(newSelected);

        if (newSelected.length === 2) {
            const [first, second] = newSelected;
            const firstCard = cards[first];
            const secondCard = cards[second];

            if (firstCard.id === secondCard.id && firstCard.type !== secondCard.type) {
                const updated = [...cards];
                updated[first].matched = true;
                updated[second].matched = true;
                setCards(updated);
            } else {
                setShakeIndexes([first, second]);
                setTimeout(() => setShakeIndexes([]), 600);
            }

            setTimeout(() => setSelected([]), 600);
        }
    };

    const handleNextBatch = () => {
        if (batchIndex < totalBatches - 1) {
            setBatchIndex(batchIndex + 1);
        } else {
            setGameCompleted(true);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 text-center">
            <h1 className="text-4xl font-bold mb-10 text-green-600">
                Match the Words with Their Meanings
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                <AnimatePresence>
                    {cards.map((card, index) => (
                        <motion.div
                            key={index}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card
                                className={cn(
                                    'p-6 text-lg sm:text-xl font-medium cursor-pointer transition-all rounded-2xl shadow-md border text-green-700 bg-white',
                                    selected.includes(index) && 'border-green-500 ring-2 ring-green-300',
                                    card.matched && 'bg-green-500 text-white pointer-events-none',
                                    shakeIndexes.includes(index) && 'shake border-red-400 bg-red-100'
                                )}
                                onClick={() => handleCardClick(index)}
                            >
                                {card.text}
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {cards.length > 0 && cards.every((c) => c.matched) && !gameCompleted && (
                <div className="mt-10">
                    <button
                        className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-lg"
                        onClick={handleNextBatch}
                    >
                        Continue with the next words
                    </button>
                </div>
            )}

            {gameCompleted && (
                <div className="text-2xl font-bold text-green-600 mt-10 animate-bounce">
                    Congratulations! You have matched all the word pairs!
                </div>
            )}

            <div className="mt-12 text-left">
                <button
                    onClick={() => navigate('/practice/vocabulary')}
                    className="inline-flex items-center gap-2 text-green-600 hover:underline text-base font-medium"
                >
                    <ArrowLeft className="w-5 h-5" /> Back to Vocabulary
                </button>
            </div>
        </div>
    );
}

function shuffleArray<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
}