import React from 'react';
import { Plane, Receipt, Plus } from 'lucide-react';

interface QuickActionsProps {
  onNavigate: (view: 'dashboard' | 'business-trip' | 'expense' | 'tax-simulation') => void;
}

function QuickActions({ onNavigate }: QuickActionsProps) {
  return (
    <div className="mb-6 lg:mb-8">
      <h2 className="text-lg lg:text-xl font-semibold text-slate-800 mb-4">クイックアクション</h2>
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <button 
          onClick={() => onNavigate('business-trip')}
          className="flex items-center justify-center space-x-3 px-6 py-3 bg-gradient-to-r from-navy-700 to-navy-900 hover:from-navy-800 hover:to-navy-950 rounded-lg text-white font-medium shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 backdrop-blur-sm"
        >
          <Plus className="w-5 h-5" />
          <Plane className="w-5 h-5" />
          <span>出張申請</span>
        </button>
        <button 
          onClick={() => onNavigate('expense')}
          className="flex items-center justify-center space-x-3 px-6 py-3 bg-gradient-to-r from-navy-600 to-navy-800 hover:from-navy-700 hover:to-navy-900 rounded-lg text-white font-medium shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 backdrop-blur-sm"
        >
          <Plus className="w-5 h-5" />
          <Receipt className="w-5 h-5" />
          <span>経費申請</span>
        </button>
      </div>
    </div>
  );
}

export default QuickActions;