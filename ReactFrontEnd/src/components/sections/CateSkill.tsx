import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Headphones, Book, PenLine, Mic, Target, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

type SkillName = 'Listening' | 'Reading' | 'Writing' | 'Speaking' | 'All Skills';

interface Skill {
    name: SkillName;
    icon: React.ReactNode;
    description: string;
}

interface CateSkillProps {
    onSkillChange: (skill: SkillName) => void;
    initialSkill?: SkillName;
    onSortChange?: (sortOption: string) => void;
}

function CateSkill({ onSkillChange, initialSkill = 'All Skills', onSortChange }: CateSkillProps) {
    const [selectedSkill, setSelectedSkill] = useState<SkillName>(initialSkill);
    const [showSort, setShowSort] = useState<boolean>(false);
    const [sortBy, setSortBy] = useState<string>('Newest');

    useEffect(() => {
        setSelectedSkill(initialSkill);
    }, [initialSkill]);

    const skills: Skill[] = [
        {
            name: 'All Skills',
            icon: <Target className="h-6 w-6" />,
            description: 'Practice all IELTS skills'
        },
        {
            name: 'Listening',
            icon: <Headphones className="h-6 w-6" />,
            description: 'Improve your listening comprehension'
        },
        {
            name: 'Reading',
            icon: <Book className="h-6 w-6" />,
            description: 'Enhance your reading skills'
        },
        {
            name: 'Writing',
            icon: <PenLine className="h-6 w-6" />,
            description: 'Perfect your writing abilities'
        },
        {
            name: 'Speaking',
            icon: <Mic className="h-6 w-6" />,
            description: 'Develop your speaking proficiency'
        },
    ];

    const handleSkillChange = (skillName: SkillName) => {
        setSelectedSkill(skillName);
        onSkillChange(skillName);
    };

    const handleSortChange = (option: string) => {
        setSortBy(option);
        setShowSort(false);
        if (onSortChange) onSortChange(option);
    };

    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">IELTS Practice Tests</h2>
                <p className="text-gray-600">Choose your skill and start practicing</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {skills.map((skill) => (
                    <motion.div
                        key={skill.name}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSkillChange(skill.name)}
                        className="cursor-pointer"
                    >
                        <Card className={`h-full transition-colors duration-300 ${
                            selectedSkill === skill.name
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white hover:border-emerald-600 hover:text-emerald-600'
                        }`}>
                            <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
                                <div className={`mb-3 transition-colors ${
                                    selectedSkill === skill.name
                                        ? 'text-white'
                                        : 'text-emerald-600'
                                }`}>
                                    {skill.icon}
                                </div>
                                <h3 className="font-semibold mb-1">{skill.name}</h3>
                                <p className={`text-xs ${
                                    selectedSkill === skill.name
                                        ? 'text-white/80'
                                        : 'text-gray-500'
                                }`}>
                                    {skill.description}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="relative flex justify-end mt-6">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSort(!showSort)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-emerald-600"
                >
                    <SlidersHorizontal size={20} />
                    <span>Sort by: {sortBy}</span>
                </motion.button>

                {showSort && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-lg py-2 z-10 min-w-[160px]"
                    >
                        {['Newest', 'Oldest', 'Most Popular'].map((option) => (
                            <button
                                key={option}
                                onClick={() => handleSortChange(option)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 hover:text-emerald-600 transition-colors"
                            >
                                {option}
                            </button>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default CateSkill;