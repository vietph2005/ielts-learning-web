import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import type { Vocabulary as VocabularyInputType } from '@/lib/type';

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<VocabularyInputType, 'id'>) => void;
    initialData?: Omit<VocabularyInputType, 'id'>;
    isEdit?: boolean;
    topics: { value: string; label: string }[];
    bands: { value: string; label: string }[];
};

const VocabularyFormModal: React.FC<Props> = ({
                                                  open,
                                                  onClose,
                                                  onSubmit,
                                                  initialData,
                                                  isEdit = false,
                                                  topics,
                                                  bands
                                              }) => {
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors }
    } = useForm<Omit<VocabularyInputType, 'id'>>({
        defaultValues: initialData || {
            word: '',
            pronunciation: '',
            partOfSpeech: '',
            translate: '',
            explanation: '',
            topic: '',
            band: '',
            exp: [{ esentence: '', vsentence: '' }]
        },
        mode: 'onChange'
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'exp' });

    useEffect(() => {
        reset(initialData || {
            word: '',
            pronunciation: '',
            partOfSpeech: '',
            translate: '',
            explanation: '',
            topic: '',
            band: '',
            exp: [{ esentence: '', vsentence: '' }]
        });
    }, [initialData, reset]);

    const onFormSubmit = (data: Omit<VocabularyInputType, 'id'>) => {
        onSubmit(data);
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded p-6 max-h-[90vh] overflow-y-auto w-full max-w-xl">
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-500 text-xl font-bold"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <h2 className="text-lg font-bold mb-4">{isEdit ? 'Edit Vocabulary' : 'Add Vocabulary'}</h2>

                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                    {/* Word */}
                    <div>
                        <Label>Word *</Label>
                        <Input {...register('word', {
                            required: 'Word is required',
                            pattern: {
                                value: /^[A-Za-z\-\'\s]{1,50}$/,
                                message: 'Only letters, hyphens, apostrophes (1-50 chars)'
                            }
                        })} />
                        {errors.word && <p className="text-red-500 text-sm">{errors.word.message}</p>}
                    </div>

                    {/* Pronunciation */}
                    <div>
                        <Label>Pronunciation *</Label>
                        <Input {...register('pronunciation', {
                            required: 'Pronunciation is required',
                            pattern: {
                                value: /^\/[ˈˌa-zA-Zɪʊɛɔæɑːθðʃʒŋəɜ:ʊ:ɒ:. ]+\/$/,
                                message: 'Must be wrapped in slashes (e.g., /wɜːd/)',
                            },
                        })
                               } />
                        {errors.pronunciation && <p className="text-red-500 text-sm">{errors.pronunciation.message}</p>}
                    </div>

                    {/* Part of speech */}
                    <div>
                        <Label>Part of Speech *</Label>
                        <select className="w-full p-2 border rounded" {...register('partOfSpeech', {
                            required: 'Part of speech is required'
                        })}>
                            <option value="">Select Part of Speech</option>
                            <option value="noun">Noun</option>
                            <option value="verb">Verb</option>
                            <option value="adjective">Adjective</option>
                            <option value="adverb">Adverb</option>
                            <option value="other">Other</option>
                        </select>
                        {errors.partOfSpeech && <p className="text-red-500 text-sm">{errors.partOfSpeech.message}</p>}
                    </div>

                    {/* Translate */}
                    <div>
                        <Label>Translate *</Label>
                        <Input {...register('translate', {
                            required: 'Translate is required',
                            minLength: { value: 2, message: 'Minimum 2 characters' },
                            maxLength: { value: 100, message: 'Maximum 100 characters' }
                        })} />
                        {errors.translate && <p className="text-red-500 text-sm">{errors.translate.message}</p>}
                    </div>

                    {/* Explanation */}
                    <div>
                        <Label>Explanation *</Label>
                        <Textarea {...register('explanation', {
                            required: 'Explanation is required',
                            minLength: { value: 5, message: 'Minimum 5 characters' },
                            maxLength: { value: 200, message: 'Maximum 200 characters' }
                        })} />
                        {errors.explanation && <p className="text-red-500 text-sm">{errors.explanation.message}</p>}
                    </div>

                    {/* Topic and Band */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Label>Topic *</Label>
                            <select className="w-full p-2 border rounded" {...register('topic', { required: 'Topic is required' })}>
                                <option value="">Select Topic</option>
                                {topics.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                            {errors.topic && <p className="text-red-500 text-sm">{errors.topic.message}</p>}
                        </div>
                        <div className="flex-1">
                            <Label>Band *</Label>
                            <select className="w-full p-2 border rounded" {...register('band', { required: 'Band is required' })}>
                                <option value="">Select Band</option>
                                {bands.map(b => (
                                    <option key={b.value} value={b.value}>{b.label}</option>
                                ))}
                            </select>
                            {errors.band && <p className="text-red-500 text-sm">{errors.band.message}</p>}
                        </div>
                    </div>

                    {/* Examples */}
                    <div>
                        <Label>Examples *</Label>
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex flex-col gap-1 mb-2">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="EN"
                                        {...register(`exp.${index}.esentence` as const, {
                                            required: 'EN is required',
                                            pattern: {
                                                value: /^[A-Z][^.!?]*[.!?]$/,
                                                message: 'Start with capital and end with punctuation',
                                            },
                                        })}
                                    />
                                    <Input
                                        placeholder="VI"
                                        {...register(`exp.${index}.vsentence` as const, {
                                            required: 'VI is required',
                                        })}
                                    />
                                    {fields.length > 1 && (
                                        <Button type="button" variant="outline" onClick={() => remove(index)}>
                                            Remove
                                        </Button>
                                    )}
                                </div>
                                {errors.exp?.[index]?.esentence && (
                                    <p className="text-red-500 text-sm">{errors.exp[index]?.esentence?.message}</p>
                                )}
                                {errors.exp?.[index]?.vsentence && (
                                    <p className="text-red-500 text-sm">{errors.exp[index]?.vsentence?.message}</p>
                                )}
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => append({ esentence: '', vsentence: '' })}
                        >
                            + Add Example
                        </Button>
                    </div>

                    {/* Submit */}
                    <Button type="submit" className="w-full">
                        {isEdit ? 'Update Vocabulary' : 'Add Vocabulary'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default VocabularyFormModal;