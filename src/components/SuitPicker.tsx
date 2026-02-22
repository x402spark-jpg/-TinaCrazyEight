import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Suit } from '../types';
import { SUIT_COLORS } from '../constants';
import { Heart, Diamond, Club, Spade, X } from 'lucide-react';

interface SuitPickerProps {
  onSelect: (suit: Suit) => void;
  onClose: () => void;
}

const SuitIcon = ({ suit, size = 32 }: { suit: Suit; size?: number }) => {
  switch (suit) {
    case 'hearts': return <Heart size={size} fill="currentColor" />;
    case 'diamonds': return <Diamond size={size} fill="currentColor" />;
    case 'clubs': return <Club size={size} fill="currentColor" />;
    case 'spades': return <Spade size={size} fill="currentColor" />;
  }
};

export const SuitPicker: React.FC<SuitPickerProps> = ({ onSelect, onClose }) => {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">万能 8 点!</h2>
        <p className="text-slate-500 text-center mb-8">请选择一个新的花色：</p>

        <div className="grid grid-cols-2 gap-4">
          {suits.map((suit) => (
            <button
              key={suit}
              onClick={() => onSelect(suit)}
              className={`
                flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-100 
                hover:border-indigo-500 hover:bg-indigo-50 transition-all group
                ${SUIT_COLORS[suit]}
              `}
            >
              <SuitIcon suit={suit} />
              <span className="mt-2 font-semibold capitalize text-slate-700 group-hover:text-indigo-600">
                {suit === 'hearts' ? '红心' : suit === 'diamonds' ? '方块' : suit === 'clubs' ? '梅花' : '黑桃'}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
