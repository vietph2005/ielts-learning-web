export interface Question {
  questionNumber: number;
  question: string;
  answer: string;
  explanation: string;
  options: string[];
  isRichText: boolean;
}

export type QuestionField = keyof Question;
export type QuestionValue = string | number | boolean | string[];

export interface QuestionUpdate {
  field: QuestionField;
  value: QuestionValue;
}

export interface Section {
  sectionNumber: number;
  method: string;
  introduction: string;
  questions: Question[];
  paragraphs?: string[];
}

export interface Task {
  taskNumber: number;
  sections: Section[];
  cueCard?: {
    topic: string;
    points: string[];
    preparationTime: number;
    speakingTime: number;
  };
}

export interface Test {
  testId: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  listening: Task[];
  reading: Task[];
  writing: Task[];
  speaking: Task[];
}

export interface SkillColors {
  [key: string]: {
    bg: string;
    button: string;
    buttonHover: string;
    section: string;
  };
}

export const skillColors: SkillColors = {
  listening: {
    bg: 'bg-[#E6F3FF]',
    button: 'bg-[#CCE7FF]',
    buttonHover: 'hover:bg-[#B3DBFF]',
    section: 'bg-[#F0F8FF]'
  },
  reading: {
    bg: 'bg-[#FFE6E6]',
    button: 'bg-[#FFCCCC]',
    buttonHover: 'hover:bg-[#FFB3B3]',
    section: 'bg-[#FFF0F0]'
  },
  writing: {
    bg: 'bg-[#E6FFE6]',
    button: 'bg-[#CCFFCC]',
    buttonHover: 'hover:bg-[#B3FFB3]',
    section: 'bg-[#F0FFF0]'
  },
  speaking: {
    bg: 'bg-[#FFE6FF]',
    button: 'bg-[#FFCCFF]',
    buttonHover: 'hover:bg-[#FFB3FF]',
    section: 'bg-[#FFF0FF]'
  }
};

export const MAX_QUESTIONS_PER_SKILL = 40;
export const MIN_OPTIONS = 3;

export type QuestionUpdateHandler = {
  (field: 'questionNumber', value: number): void;
  (field: 'isRichText', value: boolean): void;
  (field: 'options', value: string[]): void;
  (field: 'question' | 'answer' | 'explanation', value: string): void;
  (field: QuestionField, value: QuestionValue): void;
}; 