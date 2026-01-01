
import React from 'react';

interface ButtonProps {
  label: string | React.ReactNode;
  onClick: () => void;
  variant?: 'number' | 'operator' | 'action' | 'special';
  className?: string;
  gridSpan?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'number', 
  className = '',
  gridSpan = 'col-span-1'
}) => {
  const baseStyles = "aspect-square flex items-center justify-center rounded-full text-2xl font-normal transition-all btn-press select-none touch-manipulation";
  
  const variants = {
    // Dark gray
    number: "bg-[#333333] hover:bg-[#444444] text-white",
    // Orange
    operator: "bg-[#ff9f0a] hover:bg-[#ffb340] text-white",
    // Light gray
    action: "bg-[#a5a5a5] hover:bg-[#d4d4d4] text-black font-medium",
    // Blue/Indigo for special AI tools
    special: "bg-indigo-600 hover:bg-indigo-500 text-white"
  };

  return (
    <button 
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${gridSpan} ${className}`}
    >
      {label}
    </button>
  );
};
