export interface ExampleSentence {
  esentence: string;
  vsentence: string;
}

export interface Vocabulary {
  id: string;
  word: string;
  translate: string;
  explanation: string;
  topic: string;
  band: string;
  exp: ExampleSentence[];
  partOfSpeech: string;
  pronunciation: string;
}

export interface AuthState {
  token: string | null;
  user: {
    id: string;
    email: string;
    // Add other user properties as needed
  } | null;
}