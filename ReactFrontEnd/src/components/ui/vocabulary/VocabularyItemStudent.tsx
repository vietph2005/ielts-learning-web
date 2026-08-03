import React, { useState } from 'react';
import type { Vocabulary as VocabularyType } from '@/lib/type.ts';
import { Card } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';

export interface VocabularyItemStudentProps {
    vocabulary: VocabularyType;
    onDetailClick?: (vocab: VocabularyType) => void;
}

export const VocabularyItemStudent: React.FC<VocabularyItemStudentProps> = ({
                                                                                vocabulary,
                                                                                onDetailClick,
                                                                            }) => {
    const [flipped, setFlipped] = useState(false);

    return (
        <div className="relative w-full flex justify-center">
            <div
                className="flashcard-container cursor-pointer w-full"
                onClick={() => setFlipped(f => !f)}
            >
                <div className={`flashcard ${flipped ? 'flipped' : ''}`}>
                    {/* Front: word, partOfSpeech, pronunciation, topic, band */}
                    <Card className="flashcard-face flashcard-front p-8 flex flex-col items-center justify-center min-h-[140px] bg-white text-black rounded-2xl">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-semibold">{vocabulary.word}</span>
                                {vocabulary.partOfSpeech && (
                                    <span className="bg-[#059669] text-white px-2 py-0.5 rounded text-xs ml-2">
                                        {vocabulary.partOfSpeech}
                                    </span>
                                )}
                            </div>
                            {vocabulary.pronunciation && (
                                <span className="italic text-gray-500 text-base mt-1 block">
                                    {vocabulary.pronunciation}
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2 mt-4">
                            <span className="px-3 py-1 bg-[#059669] text-white rounded text-xs font-semibold">{vocabulary.topic}</span>
                            <span className="px-3 py-1 bg-[#059669] text-white rounded text-xs font-semibold">Band {vocabulary.band}</span>
                        </div>
                    </Card>
                    {/* Back: translate, topic, band */}
                    <Card className="flashcard-face flashcard-back p-8 flex flex-col items-center justify-center min-h-[140px] bg-white text-black rounded-2xl">
                        <span className="text-2xl font-semibold">{vocabulary.translate}</span>
                        <div className="flex gap-2 mt-4">
                            <span className="px-3 py-1 bg-[#059669] text-white rounded text-xs font-semibold">{vocabulary.topic}</span>
                            <span className="px-3 py-1 bg-[#059669] text-white rounded text-xs font-semibold">Band {vocabulary.band}</span>
                        </div>
                    </Card>
                </div>
            </div>
            <div className="absolute top-4 right-4 z-10">
                <Button
                    size="sm"
                    variant="outline"
                    className="detail-btn"
                    onClick={e => {
                        e.stopPropagation();
                        onDetailClick?.(vocabulary);
                    }}
                >
                    Detail
                </Button>
            </div>
        </div>
    );
};