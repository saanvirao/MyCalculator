
import React, { useState } from 'react';
import { AIExplanation } from '../types';
import { solveWordProblem } from '../services/geminiService';

interface AIPanelProps {
  explanation: AIExplanation | null;
  isLoading: boolean;
}

export const AIPanel: React.FC<AIPanelProps> = ({ explanation, isLoading }) => {
  const [wordProblem, setWordProblem] = useState('');
  const [aiResult, setAIResult] = useState<string | null>(null);
  const [isSolving, setIsSolving] = useState(false);

  const handleSolve = async () => {
    if (!wordProblem.trim()) return;
    setIsSolving(true);
    setAIResult(null);
    try {
      const res = await solveWordProblem(wordProblem);
      setAIResult(res);
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 p-6 border-l border-slate-700 max-w-md w-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <i className="fas fa-robot text-white"></i>
        </div>
        <h3 className="text-lg font-bold text-white">Gemini Math Wizard</h3>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
        {/* Word Problem Solver */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Solve word problem</label>
          <div className="relative">
            <textarea
              value={wordProblem}
              onChange={(e) => setWordProblem(e.target.value)}
              placeholder="e.g., If I have 5 apples and buy 3 more, then double them, how many do I have?"
              className="w-full bg-slate-800 rounded-xl p-3 text-sm text-slate-200 border border-slate-700 focus:border-indigo-500 outline-none min-h-[100px] resize-none"
            />
            <button
              onClick={handleSolve}
              disabled={isSolving || !wordProblem}
              className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              {isSolving ? 'Solving...' : 'Ask AI'}
            </button>
          </div>
          {aiResult && (
            <div className="p-4 bg-slate-800/80 rounded-xl border border-indigo-500/30 text-sm animate-fade-in">
              <div className="whitespace-pre-wrap text-slate-200">{aiResult}</div>
            </div>
          )}
        </div>

        {/* Calculation Explanation */}
        <div className="space-y-4">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Step-by-step Insight</label>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-500">
              <i className="fas fa-spinner fa-spin text-2xl text-indigo-500"></i>
              <p className="text-sm">Gemini is thinking...</p>
            </div>
          ) : explanation ? (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                <p className="text-slate-300 text-sm leading-relaxed">{explanation.explanation}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase">Process</h4>
                {explanation.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-3 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-slate-800 rounded-full text-indigo-400 font-mono text-xs">{idx + 1}</span>
                    <p className="text-slate-300 py-0.5">{step}</p>
                  </div>
                ))}
              </div>

              {explanation.tips.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase">Pro Tips</h4>
                  {explanation.tips.map((tip, idx) => (
                    <div key={idx} className="flex gap-2 items-start bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/10">
                      <i className="fas fa-lightbulb text-amber-400 mt-1"></i>
                      <p className="text-slate-300 text-sm italic">{tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
              <i className="fas fa-brain text-slate-600 text-3xl mb-3"></i>
              <p className="text-slate-500 text-sm px-6">Calculate something to see the AI breakdown!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
