
import React, { useState, useEffect } from 'react';
import { Button } from './components/Button';
import { HistoryPanel } from './components/HistoryPanel';
import { AIPanel } from './components/AIPanel';
import { Calculation, AIExplanation, CalculatorMode } from './types';
import { getMathExplanation } from './services/geminiService';

const App: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<Calculation[]>([]);
  const [lastExplanation, setLastExplanation] = useState<AIExplanation | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [mode, setMode] = useState<CalculatorMode>('basic');

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleNumber(e.key);
      if (['+', '-', '*', '/'].includes(e.key)) handleOperator(e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key);
      if (e.key === 'Enter' || e.key === '=') handleEvaluate();
      if (e.key === 'Backspace') handleBackspace();
      if (e.key === 'Escape') handleClear();
      if (e.key === '.') handleDecimal();
      if (e.key === ',') handleComma();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, expression]);

  const handleNumber = (num: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    setExpression(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleComma = () => {
    if (display !== 'Error') {
      setDisplay(display + ',');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleDecimal = () => {
    const segments = display.split(',');
    const currentSegment = segments[segments.length - 1];
    if (!currentSegment.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleNegate = () => {
    if (display === '0' || display === 'Error') return;
    if (display.startsWith('-')) {
      setDisplay(display.slice(1));
    } else {
      setDisplay('-' + display);
    }
  };

  const handleMax = () => {
    try {
      const numbers = display.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
      if (numbers.length === 0) return;
      const maxVal = Math.max(...numbers);
      const resultStr = maxVal.toString();
      setDisplay(resultStr);
      addToHistory(`max(${display})`, resultStr);
    } catch {
      setDisplay('Error');
    }
  };

  const handleHyp = () => {
    try {
      const numbers = display.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
      if (numbers.length === 0) return;
      const sumOfSquares = numbers.reduce((sum, n) => sum + Math.pow(n, 2), 0);
      const hypVal = Math.sqrt(sumOfSquares);
      const resultStr = hypVal.toFixed(4).replace(/\.?0+$/, "");
      setDisplay(resultStr);
      addToHistory(`hypot(${display})`, resultStr);
    } catch {
      setDisplay('Error');
    }
  };

  const handleScientific = (func: string) => {
    try {
      const val = parseFloat(display);
      let res = 0;
      switch (func) {
        case 'sin': res = Math.sin(val); break;
        case 'cos': res = Math.cos(val); break;
        case 'tan': res = Math.tan(val); break;
        case '√': res = Math.sqrt(val); break;
        case 'x²': res = Math.pow(val, 2); break;
        case 'log': res = Math.log10(val); break;
        case 'π': setDisplay(Math.PI.toString()); return;
      }
      const resultStr = res.toFixed(4).replace(/\.?0+$/, "");
      setDisplay(resultStr);
      addToHistory(`${func}(${val})`, resultStr);
    } catch {
      setDisplay('Error');
    }
  };

  const addToHistory = async (exp: string, result: string) => {
    const newCalc: Calculation = {
      id: Math.random().toString(36).substr(2, 9),
      expression: exp,
      result: result,
      timestamp: Date.now()
    };
    setHistory(prev => [newCalc, ...prev].slice(0, 20));
    
    setIsExplaining(true);
    try {
      const expl = await getMathExplanation(exp, result);
      setLastExplanation(expl);
    } catch (e) {
      console.error("AI Insight Error", e);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleEvaluate = () => {
    if (!expression) return;
    try {
      const fullExp = expression + display;
      if (fullExp.includes(',')) {
        setDisplay('Error');
        return;
      }
      const sanitized = fullExp.replace(/×/g, '*').replace(/÷/g, '/');
      const result = new Function(`return ${sanitized}`)();
      const resultStr = result.toString();
      setDisplay(resultStr);
      setExpression('');
      addToHistory(fullExp, resultStr);
    } catch {
      setDisplay('Error');
    }
  };

  const selectHistoryItem = (calc: Calculation) => {
    setDisplay(calc.result);
    setExpression(calc.expression);
  };

  return (
    <div className="h-screen w-full flex bg-black text-white overflow-hidden safe-top safe-bottom">
      {/* Sidebar - History (Desktop) */}
      <div className="hidden lg:block w-80">
        <HistoryPanel 
          history={history} 
          onClear={() => setHistory([])} 
          onSelect={selectHistoryItem}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center">
        {/* iOS Styled Content Container */}
        <div className="w-full max-w-md h-full flex flex-col p-4 md:p-8">
          
          {/* Top Control Bar */}
          <div className="mb-4">
            <div className="segmented-control">
              {(['basic', 'scientific', 'custom'] as CalculatorMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`segment-btn ${mode === m ? 'active' : 'text-slate-400'}`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Display Area */}
          <div className="flex-1 flex flex-col justify-end text-right px-4 mb-6">
            <div className="text-[#a5a5a5] text-xl h-8 mono overflow-hidden whitespace-nowrap overflow-ellipsis">
              {expression}
            </div>
            <div className="text-white text-7xl font-light tracking-tight truncate leading-none py-2">
              {display}
            </div>
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-4 gap-3 md:gap-4 mb-4">
            {/* Contextual Mode Rows */}
            {mode === 'scientific' && (
              <>
                <Button label="sin" onClick={() => handleScientific('sin')} variant="action" className="!text-sm" />
                <Button label="cos" onClick={() => handleScientific('cos')} variant="action" className="!text-sm" />
                <Button label="tan" onClick={() => handleScientific('tan')} variant="action" className="!text-sm" />
                <Button label="√" onClick={() => handleScientific('√')} variant="action" />
                <Button label="log" onClick={() => handleScientific('log')} variant="action" className="!text-sm" />
                <Button label="x²" onClick={() => handleScientific('x²')} variant="action" className="!text-sm" />
                <Button label="π" onClick={() => handleScientific('π')} variant="action" />
                <div className="aspect-square"></div>
              </>
            )}

            {mode === 'custom' && (
              <>
                <Button label="Max" onClick={handleMax} variant="special" className="!text-sm" />
                <Button label="Hyp" onClick={handleHyp} variant="special" className="!text-sm" />
                <Button label="," onClick={handleComma} variant="action" />
                <div className="col-span-1"></div>
              </>
            )}

            {/* Standard Keypad */}
            <Button label="AC" onClick={handleClear} variant="action" />
            <Button label={<i className="fas fa-backspace text-lg"></i>} onClick={handleBackspace} variant="action" />
            <Button label="%" onClick={() => setDisplay((parseFloat(display)/100).toString())} variant="action" />
            <Button label="÷" onClick={() => handleOperator('÷')} variant="operator" />

            <Button label="7" onClick={() => handleNumber('7')} />
            <Button label="8" onClick={() => handleNumber('8')} />
            <Button label="9" onClick={() => handleNumber('9')} />
            <Button label="×" onClick={() => handleOperator('×')} variant="operator" />

            <Button label="4" onClick={() => handleNumber('4')} />
            <Button label="5" onClick={() => handleNumber('5')} />
            <Button label="6" onClick={() => handleNumber('6')} />
            <Button label="-" onClick={() => handleOperator('-')} variant="operator" />

            <Button label="1" onClick={() => handleNumber('1')} />
            <Button label="2" onClick={() => handleNumber('2')} />
            <Button label="3" onClick={() => handleNumber('3')} />
            <Button label="+" onClick={() => handleOperator('+')} variant="operator" />

            {/* Final Row: Added +/- for symmetry and logic */}
            <Button label="±" onClick={handleNegate} />
            <Button label="0" onClick={() => handleNumber('0')} />
            <Button label="." onClick={handleDecimal} />
            <Button label="=" onClick={handleEvaluate} variant="operator" />
          </div>
        </div>
      </div>

      {/* AI Sidebar - Explanation (Desktop) */}
      <div className="hidden xl:block">
        <AIPanel explanation={lastExplanation} isLoading={isExplaining} />
      </div>
    </div>
  );
};

export default App;
