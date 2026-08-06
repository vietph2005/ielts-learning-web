export interface ExerciseSection {
    question: string | string[];
    options?: string[];
    answer: string | string[];
    explanation: string | string[];
}
export interface Exercises {
    paragraph?: string;
    audioUrl?: string;
    instruction: string;
    imageUrl?: string;
    section: ExerciseSection[];
}

export interface IELTSTest {
    id: string
    testTitle: string
    tags: string[]
    createdAt: string
}

export interface Tip {
    id: number
    skill: string
    type: string
    description: string
}

export interface FAQ {
    question: string
    answer: string
}

export interface User {
    username: string
    role: 'student' | 'teacher' | 'manager' | 'admin'
    firstName?: string
    lastName?: string
    birthDate?: string
    gender?: string
    phone?: string
    isPremium?: boolean
}

export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string, role : string) => Promise<LoginResponse>;
    logout: () => void;
    register: (email: string, password: string, role?: string) => Promise<void>;
    isLoading: boolean;
    fetchUser: () => Promise<void>;
}
export interface LoginResponse {
    status: string;
    message?: string;
    redirectUrl?: string;
}

export interface ListeningQuestion {
    id: number;
    questionNumber: number;
    question: string;
    type: 'text' | 'multiple-choice' | 'matching';
    options?: string[];
    correctAnswer: string;
}

export interface ListeningPart {
    id: number;
    partNumber: number;
    title: string;
    instructions: string;
    description: string;
    questions: ListeningQuestion[];
}

export interface ListeningTest {
    id: number;
    title: string;
    description: string;
    audioUrl: string;
    duration: number;
    parts: ListeningPart[];
}
export interface Question {
  questionNumber: number;
  question: string;
  answer: string;
  explanation: string;
  options: string[];
}


export type QuestionField = keyof Question;
export type QuestionValue = string | number | boolean | string[];

export interface QuestionUpdate {
  field: QuestionField;
  value: QuestionValue;
}

export interface Section {
  sectionNumber: number;
  type: string;
  introduction: string;
  questions: Question[];
  imageUrl?: string;
}

export interface Task {
  taskNumber: number;
  sections: Section[];
  cueCard?: {
    topic: string;
    points: string[];
  };
}

export interface Test {
  testId: string;
  title: string;
  tags: string[];
  createdAt: string;
  listening: Task[];
  reading: Task[];
  writing: Task[];
  speaking: Task[];
}
export type WritingTask = {
  imageUrl?: string;
  prompt?: string;
};
export interface Vocabulary {
    id: string;
    word: string;
    translate: string;
    partOfSpeech?: string;
    pronunciation?: string;
}

export interface SkillColors {
  [key: string]: {
    bg: string;
    button: string;
    buttonHover: string;
    section: string;
  };
}
export interface TestDataState extends Test {
  newTag: string;
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

export interface SpeakingTask {
  prompt?: string;
  questions?: string[];
  cueCard?: {
    topic: string;
    points: string[];
  };
}
export interface StudentSkillResult {
    username: string;
    skill: string;
    band: number;
    totalCorrect: number;
    submittedAt: string;
}

export interface AggregatedStudent {
    _id: string;
    username: string;
    averageBand: number;
    bandWriting: number;
    bandReading: number;
    bandSpeaking: number;
    bandListening: number;

}
