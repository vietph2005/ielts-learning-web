""// src/pages/Vocabulary.tsx

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Vocabulary as VocabularyType } from '@/lib/type';
import VocabularyFormModal from '@/components/ui/vocabulary/VocabularyFormModal';
import VocabularyItem from '@/components/ui/vocabulary/VocabularyItem';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const Vocabulary: React.FC = () => {
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

    const [topics, setTopics] = useState<{ value: string, label: string }[]>([{ value: '', label: 'All Topics' }]);
    const [bands, setBands] = useState<{ value: string, label: string }[]>([{ value: '', label: 'All Bands' }]);

    const [showAdd, setShowAdd] = useState(false);
    const [editData, setEditData] = useState<VocabularyType | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_URL;
    const API_BASE = `${API_URL}/api/practice`;

    useEffect(() => {
        fetch(`${API_BASE}/vocabulary/topics`, { credentials: "include" })
            .then(res => res.json())
            .then(data => setTopics([{ value: '', label: 'All Topics' }, ...data.map((t: string) => ({ value: t, label: t }))]))
            .catch(() => setTopics([{ value: '', label: 'All Topics' }]));

        fetch(`${API_BASE}/vocabulary/bands`, { credentials: "include" })
            .then(res => res.json())
            .then(data => setBands([{ value: '', label: 'All Bands' }, ...data.map((b: string) => ({ value: b, label: b }))]))
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

            const response = await fetch(`${API_BASE}/vocabulary/filter?${params.toString()}`, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error('Failed to fetch vocabulary');
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

    useEffect(() => {
        if (user) fetchVocabularies();
    }, [user, page, search, appliedFilters]);

    const handleAddVocabulary = async (vocab: Omit<VocabularyType, 'id'>) => {
        try {
            const response = await fetch(`${API_BASE}/vocabulary/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(vocab)
            });
            if (!response.ok) throw new Error('Failed to add');
            await fetchVocabularies();
        } catch (err) {
            setError('Failed to add vocabulary');
        }
    };

    const handleEditVocabulary = async (id: string, vocab: Omit<VocabularyType, 'id'>) => {
        try {
            const response = await fetch(`${API_BASE}/vocabulary/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(vocab)
            });
            if (!response.ok) throw new Error('Failed to update');
            await fetchVocabularies();
        } catch {
            setError('Failed to update vocabulary');
        }
    };

    const handleDeleteVocabulary = async (id: string) => {
        try {
            const response = await fetch(`${API_BASE}/vocabulary/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to delete');
            await fetchVocabularies();
        } catch {
            setError('Failed to delete vocabulary');
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(0);
    };

    const applyFilters = () => {
        setAppliedFilters({ ...filters });
        setPage(0);
    };

    const resetFilters = () => {
        setFilters({ topic: '', band: '' });
        setAppliedFilters({ topic: '', band: '' });
        setSearch('');
        setSearchInput('');
        setPage(0);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setSearch(searchInput);
            setPage(0);
        }
    };

    if (!user) return <div className="text-center mt-12 text-lg text-gray-500">Please login to view vocabulary</div>;
    if (loading) return <div className="text-center mt-12 text-lg text-gray-500">Loading...</div>;
    if (error) return <div className="text-center mt-12 text-lg text-red-500">Error: {error}</div>;

    return (
        <motion.div
            className="max-w-4xl mx-auto py-8 px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}>

            <h1 className="text-3xl font-bold text-emerald-700 text-center mb-6"> Vocabulary Management</h1>

            <Card className="mb-6 p-6 shadow-md border border-emerald-200">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 flex gap-2">
                        <Input
                            placeholder="Search word..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                        />
                        <select name="topic" value={filters.topic} onChange={handleFilterChange} className="w-full px-2 py-2 border rounded">
                            {topics.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                        <select name="band" value={filters.band} onChange={handleFilterChange} className="w-full px-2 py-2 border rounded">
                            {bands.map(b => (
                                <option key={b.value} value={b.value}>{b.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={applyFilters} className="bg-emerald-600 hover:bg-emerald-700 text-white">Apply</Button>
                        <Button onClick={resetFilters} variant="outline" className="hover:bg-emerald-100 hover:text-emerald-700">Reset</Button>
                        <Button onClick={() => setShowAdd(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white">+ Add</Button>
                    </div>
                </div>
            </Card>

            <AnimatePresence>
                {vocabularies.length === 0 ? (
                    <Card className="p-4 text-center text-gray-500">No vocabulary found</Card>
                ) : (
                    <motion.div layout className="space-y-5">
                        {vocabularies.map(vocab => (
                            <VocabularyItem
                                key={vocab.id}
                                vocabulary={vocab}
                                onEdit={(v) => setEditData(v)}
                                onDelete={() => setConfirmDeleteId(vocab.id)}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex justify-between items-center mt-6">
                <span className="text-gray-600">Page {page + 1} / {totalPages} ({totalElements} words)</span>
                <div className="flex gap-2">
                    <Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</Button>
                    <Button variant="outline" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                </div>
            </div>

            <VocabularyFormModal
                open={showAdd}
                onClose={() => setShowAdd(false)}
                onSubmit={handleAddVocabulary}
                topics={topics}
                bands={bands}
            />
            <VocabularyFormModal
                open={!!editData}
                onClose={() => setEditData(null)}
                onSubmit={(updated) => {
                    if (editData) handleEditVocabulary(editData.id, updated);
                    setEditData(null);
                }}
                initialData={editData ? { ...editData, id: undefined } as any : undefined}
                isEdit
                topics={topics}
                bands={bands}
            />

            {confirmDeleteId && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-lg shadow-lg p-6 w-[320px]">
                        <h2 className="text-lg font-semibold mb-4 text-emerald-700">Confirm Delete</h2>
                        <p className="text-gray-700 mb-6">Are you sure you want to delete this vocabulary?</p>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" className="hover:bg-emerald-100" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
                            <Button className="bg-red-500 hover:bg-red-600 text-white"
                                    onClick={() => {
                                        handleDeleteVocabulary(confirmDeleteId);
                                        setConfirmDeleteId(null);
                                    }}>
                                Delete
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default Vocabulary;
