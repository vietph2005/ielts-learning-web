import React from 'react';
import {
  Headphones as ListeningIcon,
  MenuBook as ReadingIcon,
  Edit as WritingIcon,
  Mic as SpeakingIcon,
  Apps as AllIcon,
} from '@mui/icons-material';

interface HistoryFilterProps {
  selectedSkill: string;
  onSkillChange: (skill: string) => void;
}

const skills = [
  { key: 'all', label: 'All Tests', icon: <AllIcon fontSize="large" />, color: 'bg-green-100', border: 'border-green-400' },
  { key: 'listening', label: 'Listening', icon: <ListeningIcon fontSize="large" />, color: 'bg-green-100', border: 'border-green-400' },
  { key: 'reading', label: 'Reading', icon: <ReadingIcon fontSize="large" />, color: 'bg-green-100', border: 'border-green-400' },
  { key: 'writing', label: 'Writing', icon: <WritingIcon fontSize="large" />, color: 'bg-green-100', border: 'border-green-400' },
  { key: 'speaking', label: 'Speaking', icon: <SpeakingIcon fontSize="large" />, color: 'bg-green-100', border: 'border-green-400' },
];

const HistoryFilter: React.FC<HistoryFilterProps> = ({ selectedSkill, onSkillChange }) => {
  return (
      <div className="rounded-xl bg-white shadow-md p-6">
        <h2 className="text-xl font-semibold text-green-700 mb-4">Filter by Skill</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {skills.map((skill) => (
              <button
                  key={skill.key}
                  onClick={() => onSkillChange(skill.key)}
                  className={`flex flex-col items-center p-4 border-2 rounded-xl transition-all duration-200 ${
                      selectedSkill === skill.key
                          ? 'bg-green-100 border-green-600 shadow-lg scale-105'
                          : 'hover:bg-green-50 hover:border-green-400 border-transparent'
                  }`}
              >
                <div className="text-green-600 mb-1">{skill.icon}</div>
                <span className="text-base font-medium text-gray-700">{skill.label}</span>
              </button>
          ))}
        </div>
      </div>
  );
};

export default HistoryFilter;
