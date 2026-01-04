
export type TestStep = 'intro' | 'house' | 'tree' | 'person' | 'analyzing' | 'result' | 'history';

export interface AnalysisResult {
  id: string;
  date: string;
  summary: string;
  personalityTraits: {
    trait: string;
    score: number;
    description: string;
  }[];
  emotionalState: string;
  advice: string;
  keyInsights: string[];
}

export interface DrawingData {
  house?: string;
  tree?: string;
  person?: string;
}
