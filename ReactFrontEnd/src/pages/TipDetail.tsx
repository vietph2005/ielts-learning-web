import {useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import {Button} from "@/components/ui/button.tsx";
import {PracticeExercise} from "@/components/sections/PracticeExcercise.tsx";
import type {Exercises} from "@/types/apiTypes"
import {StrategyAndTip} from "@/components/sections/StrategyAndTip.tsx";
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
    const API_URL = import.meta.env.VITE_API_URL;
    const { skill, id } = useParams<{ skill: string; id: string }>();
    const [detail, setDetail] = useState<TipDetail | null>(null);


    useEffect(() => {
        if (!id) return;
        window.scrollTo(0, 0);
        const data = fetch(`${API_URL}/api/${skill}/${id}`)
            .then((res) => res.json())
            .then((data: TipDetail) => {
                setDetail(data);
            })
            .catch((error) => {
                console.error("Error calling tip detail API:", error);
                setDetail(null);
            });
        console.log("Data ne:" + data);
    }, [id, skill]);

    if (!detail) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                {/*No data found.*/}
            </div>
        );
    }
    return(

        <div className="min-h-screen bg-white">
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    {/* Reading Skill Content */}
                    <div className="max-w-4xl mx-auto">
                        <StrategyAndTip {...detail}/>
                        {/* Practice Exercise */}
                        <PracticeExercise exercises={detail.exercises} skill={skill}/>
                        {/* Optional back button */}
                        <div className="px-6 pb-6">
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700"
                                    onClick={() => history.back()}>← Back</Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
};

export default TipDetail;
