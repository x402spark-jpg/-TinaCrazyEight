import React from 'react';
import { motion } from 'motion/react';
import { CardData, Suit } from '../types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../constants';
import { Heart, Diamond, Club, Spade } from 'lucide-react';

interface CardProps {
  card: CardData;
  isFaceUp?: boolean;
  onClick?: () => void;
  isPlayable?: boolean;
  className?: string;
}

const SuitIcon = ({ suit, size = 20 }: { suit: Suit; size?: number }) => {
  switch (suit) {
    case 'hearts': return <Heart size={size} fill="currentColor" />;
    case 'diamonds': return <Diamond size={size} fill="currentColor" />;
    case 'clubs': return <Club size={size} fill="currentColor" />;
    case 'spades': return <Spade size={size} fill="currentColor" />;
  }
};

export const Card: React.FC<CardProps> = ({ 
  card, 
  isFaceUp = true, 
  onClick, 
  isPlayable = false,
  className = ""
}) => {
  if (!card) return null;

  return (
    <motion.div
      layoutId={card.id}
      whileHover={isPlayable ? { y: -10, scale: 1.05 } : {}}
      whileTap={isPlayable ? { scale: 0.95 } : {}}
      onClick={isPlayable ? onClick : undefined}
      className={`
        relative w-20 h-28 sm:w-24 sm:h-36 rounded-xl border-2 shadow-md flex flex-col items-center justify-center cursor-pointer transition-colors
        ${isFaceUp ? 'bg-white border-slate-200' : 'bg-indigo-600 border-indigo-400'}
        ${isPlayable ? 'ring-4 ring-yellow-400 ring-offset-2' : ''}
        ${className}
      `}
    >
      {isFaceUp ? (
        <div className={`w-full h-full p-2 flex flex-col justify-between ${SUIT_COLORS[card.suit]}`}>
          <div className="flex flex-col items-start">
            <span className="text-lg sm:text-xl font-bold leading-none">{card.rank}</span>
            <SuitIcon suit={card.suit} size={14} />
          </div>
          
          <div className="flex justify-center items-center opacity-20">
             <SuitIcon suit={card.suit} size={40} />
          </div>
          
          <div className="flex flex-col items-end rotate-180">
            <span className="text-lg sm:text-xl font-bold leading-none">{card.rank}</span>
            <SuitIcon suit={card.suit} size={14} />
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center p-2">
           <div className="w-full h-full border-2 border-white/20 rounded-lg flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-white/10" />
           </div>
        </div>
      )}
    </motion.div>
  );
};
