import apiClient from "@/lib/apiClient";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PracticeExercise } from "@/components/sections/PracticeExcercise";
import type { Exercises } from "@/types/apiTypes";
import { StrategyAndTip } from "@/components/sections/StrategyAndTip";

interface TipDetail {
    id: string | number;
    type: string;
    skill: string;
    description: string;
    strategy?: string[];
    tips?: string[];
    exercises: Exercises[];
}

function TipDetail() {
    const { skill, id } = useParams<{ skill: string; id: string }>();
    const [detail, setDetail] = useState<TipDetail | null>(null);

    useEffect(() => {
        if (!id || !skill) return;
        window.scrollTo(0, 0);
        apiClient.get<TipDetail>(`/tips/${skill.toLowerCase()}/${id}`)
            .then((data: TipDetail) => {
                setDetail(data);
            })
            .catch((error) => {
                console.error("Error calling tip detail API:", error);
                setDetail(null);
            });
    }, [id, skill]);

    if (!detail) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                <p>Loading tip details...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <StrategyAndTip {...detail} />
                        <PracticeExercise exercises={detail.exercises} skill={skill} />
                        <div className="px-6 pb-6">
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => history.back()}>← Back</Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default TipDetail;
