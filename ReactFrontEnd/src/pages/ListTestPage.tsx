import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CateSkill from "@/components/sections/CateSkill";
import MockTest from "@/components/sections/MockTest";
import {HeroSection} from "@/components/sections/HeroSection";

type SkillType = 'Listening' | 'Reading' | 'Writing' | 'Speaking' | 'All Skills';

const ListTestPage = () => {
    const { skill } = useParams<{ skill?: string }>();
    const navigate = useNavigate();
    const [selectedSkill, setSelectedSkill] = useState<SkillType>('All Skills');
//    const [sortBy, setSortBy] = useState<string>('Newest');

    useEffect(() => {
        if (skill) {
            const formattedSkill = skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase();
            if (
                ['Listening', 'Reading', 'Writing', 'Speaking'].includes(formattedSkill)
            ) {
                setSelectedSkill(formattedSkill as SkillType);
            } else {
                setSelectedSkill('All Skills');
            }
        } else {
            setSelectedSkill('All Skills');
        }
    }, [skill]);

    const handleSkillChange = (newSkill: SkillType) => {
        setSelectedSkill(newSkill);
        if (newSkill === 'All Skills') {
            navigate('/test');
        } else {
            navigate(`/test/${newSkill.toLowerCase()}`);
        }
    };

    // const handleSortChange = (option: string) => {
    //     setSortBy(option);
    // };

    return (
        <>
            <HeroSection />
        <div className="min-h-screen bg-white">
            <section className="py-8 bg-gray-50">
                <div className="container mx-auto">
                    <CateSkill
                        onSkillChange={handleSkillChange}
                        initialSkill={selectedSkill}
                        //onSortChange={handleSortChange}
                    />
                </div>
            </section>
            <section className="py-8">
                <div className="container mx-auto">
                    <MockTest selectedSkill={selectedSkill}/>
                </div>
            </section>
        </div>
        </>
    );
};

export default ListTestPage;
