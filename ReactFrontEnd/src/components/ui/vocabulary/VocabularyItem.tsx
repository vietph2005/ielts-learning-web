import React from 'react';
import type { Vocabulary as VocabularyType } from '@/lib/type';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Props = {
    vocabulary: VocabularyType;
    onEdit: (vocab: VocabularyType) => void;
    onDelete: (id: string) => void;
};

const VocabularyItem: React.FC<Props> = ({ vocabulary, onEdit, onDelete }) => (
    <Card className="p-5 flex flex-col gap-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">{vocabulary.word}</h2>
                    {vocabulary.partOfSpeech && (
                        <Badge className="bg-emerald-600 text-white ml-2">{vocabulary.partOfSpeech}</Badge>
                    )}
                </div>
                {vocabulary.pronunciation && (
                    <div className="text-gray-700 mt-1">
                        <b>Pronunciation:</b>{' '}
                        <span className="italic text-gray-500 text-base">{vocabulary.pronunciation}</span>
                    </div>
                )}
                <div className="flex flex-wrap gap-2 my-1">
                    <Badge className="bg-emerald-600 text-white">{vocabulary.topic}</Badge>
                    <Badge className="bg-emerald-600 text-white">Band {vocabulary.band}</Badge>
                </div>
            </div>
            <div>
                <Button
                    size="sm"
                    variant="outline"
                    className="mr-2 hover:bg-emerald-600 hover:text-white"
                    onClick={() => onEdit(vocabulary)}
                >
                    Edit
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="mr-2 hover:bg-emerald-600 hover:text-white "
                    onClick={() => onDelete(vocabulary.id)}
                >
                    Delete
                </Button>
            </div>
        </div>
        <div className="pl-1">
            <div className="text-gray-700">
                <b>Translate:</b> {vocabulary.translate}
            </div>
            <div className="text-gray-700">
                <b>Explanation:</b> {vocabulary.explanation}
            </div>
            {vocabulary.exp?.length > 0 && (
                <div className="mt-2">
                    <div className="font-semibold text-gray-700 mb-1">Examples:</div>
                    <ul className="list-disc list-inside">
                        {vocabulary.exp.map((ex, i) => (
                            <React.Fragment key={i}>
                                <li>
                                    <span className="text-gray-800"> {ex.esentence}</span>
                                </li>
                                <li className="list-none pl-6">
                                    <span className="text-gray-800">{ex.vsentence}</span>
                                </li>
                            </React.Fragment>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    </Card>
);

export default VocabularyItem;
