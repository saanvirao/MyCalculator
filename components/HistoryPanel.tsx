
import React from 'react';
import { Calculation } from '../types';

interface HistoryPanelProps {
  history: Calculation[];
  onClear: () => void;
  onSelect: (calc: Calculation) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ 
  history, 
  onClear, 
  onSelect
}) => {
  return (
    <div className="flex flex-col h-full bg-slate-900/50 p-4 border-l border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">History</h3>
        <button 
          onClick={onClear}
          className="text-xs text-slate-500 hover:text-red-400 transition-colors"
        >
          Clear
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
        {history.length === 0 ? (
          <div className="text-center py-8 text-slate-600 italic text-sm">
            No calculations yet
          </div>
        ) : (
          history.map((calc) => (
            <div 
              key={calc.id}
              onClick={() => onSelect(calc)}
              className="p-3 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
            >
              <div className="text-slate-400 text-xs text-right mono">{calc.expression}</div>
              <div className="text-slate-100 font-bold text-lg text-right mono">= {calc.result}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
