import { API_URL } from "@/config/api";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Vocabulary as VocabularyType } from '@/lib/type';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VocabularyItemStudent } from '@/components/ui/vocabulary/VocabularyItemStudent';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';

const VocabularyList: React.FC = () => {
    const { user } = useAuth();
    const [vocabularies, setVocabularies] = useState<VocabularyType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ topic: '', band: '' });
    const [appliedFilters, setAppliedFilters] = useState({ topic: '', band: '' });
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(0);
    const pageSize = 10;
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [selectedVocab, setSelectedVocab] = useState<VocabularyType | null>(null);
    
    const API_BASE = `${API_URL}/api/practice`;
    const navigate = useNavigate();
    const [gameModalOpen, setGameModalOpen] = useState(false);
    const openGameModal = () => setGameModalOpen(true);
    const [topics, setTopics] = useState([{ value: '', label: 'All Topics' }]);
    const [bands, setBands] = useState([{ value: '', label: 'All Bands' }]);

    useEffect(() => {
        fetch(`${API_BASE}/vocabulary/topics`, { credentials: 'include' })
            .then((res) => res.json())
            .then((data) =>
                setTopics([{ value: '', label: 'All Topics' }, ...data.map((t: string) => ({ value: t, label: t }))])
            )
            .catch(() => setTopics([{ value: '', label: 'All Topics' }]));

        fetch(`${API_BASE}/vocabulary/bands`, { credentials: 'include' })
            .then((res) => res.json())
            .then((data) =>
                setBands([{ value: '', label: 'All Bands' }, ...data.map((b: string) => ({ value: b, label: b }))])
            )
            .catch(() => setBands([{ value: '', label: 'All Bands' }]));
    }, []);

    const fetchVocabularies = async () => {
        try {
            setLoading(true);
            const { topic, band } = appliedFilters;
            const params = new URLSearchParams();
            if (search) params.append('keyword', search);
            if (topic) params.append('topic', topic);
            if (band) params.append('band', band);
            params.append('page', page.toString());
            params.append('size', pageSize.toString());

            const url = `${API_BASE}/vocabulary/filter?${params.toString()}`;
            const response = await fetch(url, {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Failed to fetch vocabularies');
            const data = await response.json();
            setVocabularies(data.content || []);
            setTotalPages(data.totalPages || 1);
            setTotalElements(data.totalElements || 0);
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllFilteredVocabularies = async (): Promise<VocabularyType[]> => {
        const { topic, band } = appliedFilters;
        const params = new URLSearchParams();
        if (search) params.append('keyword', search);
        if (topic) params.append('topic', topic);
        if (band) params.append('band', band);
        params.append('page', '0');
        params.append('size', '1000');

        const url = `${API_BASE}/vocabulary/filter?${params.toString()}`;
        const response = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        const data = await response.json();
        return data.content || [];
    };

    useEffect(() => {
        if (user) fetchVocabularies();
    }, [user, page, pageSize, appliedFilters.topic, appliedFilters.band, search]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
        setPage(0);
    };

    const applyFilters = () => {
        setAppliedFilters({ ...filters });
        setPage(0);
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setSearch(searchInput);
            setPage(0);
        }
    };

    const resetFilters = () => {
        setFilters({ topic: '', band: '' });
        setAppliedFilters({ topic: '', band: '' });
        setSearch('');
        setSearchInput('');
        setPage(0);
        setTimeout(fetchVocabularies, 0);
    };

    if (!user) return <div className="text-center mt-12 text-lg text-gray-500">Please login to access vocabulary</div>;
    if (loading) return <div className="text-center mt-12 text-lg text-gray-500">Loading...</div>;
    if (error) return <div className="text-center mt-12 text-lg text-red-500">Error: {error}</div>;

    return (
        <>
            <Dialog open={gameModalOpen} onOpenChange={setGameModalOpen}>
                <DialogContent className="text-center">
                    <DialogTitle>Chọn trò chơi</DialogTitle>
                    <div className="flex flex-col gap-4 mt-4">
                        <Button onClick={() => navigate('/student/vocabulary-game', { state: { vocabList: vocabularies } })} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            Choose the correct answer
                        </Button>
                        <Button onClick={async () => {
                            const allFilteredVocab = await fetchAllFilteredVocabularies();
                            navigate('/student/vocabulary-matching-game', { state: { vocabList: allFilteredVocab } });
                        }} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            Matching words and meanings
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="max-w-5xl mx-auto py-10 px-4">
                <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-3xl font-bold text-center text-green-700 mb-8">
                    Vocabulary Practice
                </motion.h1>

                <Card className="p-6 mb-6 shadow-md">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1 flex gap-2">
                            <Input value={searchInput} onChange={handleSearchInputChange} onKeyDown={handleSearchKeyDown} placeholder="Search vocabulary..." className="w-full border-gray-300" />
                            <select name="topic" value={filters.topic} onChange={handleFilterChange} className="w-full border-gray-300 rounded">
                                {topics.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                            <select name="band" value={filters.band} onChange={handleFilterChange} className="w-full border-gray-300 rounded">
                                {bands.map((b) => (
                                    <option key={b.value} value={b.value}>{b.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={applyFilters} className="bg-emerald-600 hover:bg-emerald-700 text-white">Apply</Button>
                            <Button onClick={resetFilters} variant="outline" className="hover:bg-emerald-100 text-emerald-700">Reset</Button>
                            <Button onClick={openGameModal} className="bg-emerald-600 hover:bg-emerald-700 text-white"> Game</Button>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {vocabularies.length === 0 ? (
                        <Card className="text-center p-4 text-gray-500 col-span-2">No vocabulary found.</Card>
                    ) : (
                        vocabularies.map((vocab) => (
                            <VocabularyItemStudent key={vocab.id} vocabulary={vocab} onDetailClick={(v) => setSelectedVocab(v)} />
                        ))
                    )}
                </div>

                {selectedVocab && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                        <Card className="relative w-full max-w-xl mx-2 p-8">
                            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl" onClick={() => setSelectedVocab(null)}>×</button>
                            <h2 className="font-bold text-xl mb-3 flex items-center gap-2">
                                {selectedVocab.word}
                                {selectedVocab.partOfSpeech && (
                                    <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-xs ml-2">
                    {selectedVocab.partOfSpeech}
                  </span>
                                )}
                            </h2>
                            {selectedVocab.pronunciation && (
                                <div className="mb-2 text-gray-700">
                                    <b>Transcription:</b> <span className="italic text-gray-500 text-base">{selectedVocab.pronunciation}</span>
                                </div>
                            )}
                            <div className="mb-2 text-gray-700"><b>Translate:</b> {selectedVocab.translate}</div>
                            <div className="mb-2 text-gray-700"><b>Explanation:</b> {selectedVocab.explanation}</div>
                            {selectedVocab.exp?.length > 0 && (
                                <div className="mt-2">
                                    <div className="font-semibold text-gray-700 mb-1">Examples:</div>
                                    <ul className="list-disc list-inside">
                                        {selectedVocab.exp.map((ex, i) => (
                                            <React.Fragment key={i}>
                                                <li className="text-gray-800">{ex.esentence}</li>
                                                <li className="list-none pl-6 text-gray-800">{ex.vsentence}</li>
                                            </React.Fragment>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </Card>
                    </div>
                )}

                <div className="flex justify-between items-center mt-6">
          <span className="text-gray-600">
            Page {page + 1} / {totalPages} ({totalElements} words)
          </span>
                    <div className="flex gap-2">
                        <Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
                        <Button variant="outline" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VocabularyList;