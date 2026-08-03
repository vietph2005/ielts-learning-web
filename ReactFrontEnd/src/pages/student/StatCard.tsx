import React from "react";

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
    return (
        <div className="bg-white rounded-xl shadow p-6 flex items-center space-x-4 border">
            <div className="p-3 rounded-full" style={{ backgroundColor: color + '22' }}>
                <div className="text-xl" style={{ color }}>{icon}</div>
            </div>
            <div>
                <h3 className="text-sm text-gray-600">{title}</h3>
                <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
};

export default StatCard;
