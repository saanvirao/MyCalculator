
export interface Calculation {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface AIExplanation {
  explanation: string;
  steps: string[];
  tips: string[];
}

export type CalculatorMode = 'basic' | 'scientific' | 'custom';
