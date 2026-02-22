/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCrazyEights } from './hooks/useCrazyEights';
import { Card } from './components/Card';
import { SuitPicker } from './components/SuitPicker';
import { isPlayable, SUIT_COLORS } from './constants';
import { Trophy, RotateCcw, Info, Heart, Diamond, Club, Spade } from 'lucide-react';
import { Suit } from './types';

const SuitIcon = ({ suit, size = 16 }: { suit: Suit; size?: number }) => {
  switch (suit) {
    case 'hearts': return <Heart size={size} fill="currentColor" />;
    case 'diamonds': return <Diamond size={size} fill="currentColor" />;
    case 'clubs': return <Club size={size} fill="currentColor" />;
    case 'spades': return <Spade size={size} fill="currentColor" />;
  }
};

export default function App() {
  const { 
    state, 
    drawCard, 
    playCard, 
    skipTurn,
    showSuitPicker, 
    handleSuitSelect, 
    closeSuitPicker,
    resetGame 
  } = useCrazyEights();

  const topCard = state.discardPile[state.discardPile.length - 1];
  const isPlayerTurn = state.currentPlayer === 'player' && state.status === 'playing';
  const hasPlayable = state.playerHand.some(c => isPlayable(c, topCard, state.wildSuit));

  if (state.status === 'dealing' || !topCard) {
    return (
      <div className="min-h-screen bg-[#1a472a] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/60 font-medium animate-pulse">正在洗牌...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a472a] text-white font-sans overflow-hidden flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-black font-bold text-xl">8</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Tina 疯狂 8 点</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-sm">
            <Info size={16} className="text-yellow-400" />
            <span>{state.lastAction}</span>
          </div>
          <button 
            onClick={resetGame}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="重新开始"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 relative flex flex-col items-center justify-between p-4 sm:p-8">
        
        {/* AI Hand */}
        <div className="w-full flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${state.currentPlayer === 'ai' ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-sm font-medium opacity-80">对手 (AI) - {state.aiHand.length} 张牌</span>
          </div>
          <div className="flex -space-x-12 sm:-space-x-16 overflow-visible">
            {state.aiHand.map((card, idx) => (
              <Card 
                key={card.id} 
                card={card} 
                isFaceUp={false} 
                className="shadow-xl"
              />
            ))}
          </div>
        </div>

        {/* Center: Deck and Discard Pile */}
        <div className="flex items-center gap-8 sm:gap-16 my-8">
          {/* Draw Pile */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              {state.deck.length > 0 && (
                <div className="absolute -top-1 -left-1 w-20 h-28 sm:w-24 sm:h-36 bg-indigo-800 rounded-xl border-2 border-indigo-400 translate-x-1 translate-y-1" />
              )}
              <Card 
                card={{ id: 'deck', suit: 'spades', rank: 'A' }} 
                isFaceUp={false} 
                onClick={isPlayerTurn ? drawCard : undefined}
                className={isPlayerTurn ? 'hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-white/20' : 'opacity-50'}
              />
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold bg-black/40 px-2 py-0.5 rounded-full">
                {state.deck.length}
              </div>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">摸牌堆</span>
          </div>

          {/* Discard Pile */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <AnimatePresence mode="popLayout">
                <Card 
                  key={topCard.id}
                  card={topCard} 
                  isFaceUp={true}
                  className="shadow-2xl"
                />
              </AnimatePresence>
              
              {state.wildSuit && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`absolute -top-4 -right-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-slate-100 ${SUIT_COLORS[state.wildSuit]}`}
                >
                  <SuitIcon suit={state.wildSuit} size={20} />
                </motion.div>
              )}
            </div>
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">弃牌堆</span>
          </div>
        </div>

        {/* Player Hand */}
        <div className="w-full flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${state.currentPlayer === 'player' ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-sm font-medium opacity-80">你的手牌 - {state.playerHand.length} 张牌</span>
            </div>
            
            {isPlayerTurn && (
              <div className="flex gap-2">
                {(!hasPlayable || !state.hasDrawn) && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={drawCard}
                    className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-full text-sm font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2"
                  >
                    <div className="w-4 h-5 bg-indigo-700 rounded-sm border border-white/20" />
                    摸一张牌
                  </motion.button>
                )}

                {!hasPlayable && state.hasDrawn && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={skipTurn}
                    className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2"
                  >
                    跳过回合
                  </motion.button>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 max-w-4xl">
            {state.playerHand.map((card) => (
              <Card 
                key={card.id} 
                card={card} 
                isFaceUp={true}
                isPlayable={isPlayerTurn && isPlayable(card, topCard, state.wildSuit)}
                onClick={() => playCard(card)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Mobile Status Bar */}
      <div className="sm:hidden p-3 bg-black/30 text-center text-xs font-medium border-t border-white/10">
        {state.lastAction}
      </div>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {showSuitPicker && (
          <SuitPicker onSelect={handleSuitSelect} onClose={closeSuitPicker} />
        )}

        {state.status !== 'playing' && state.status !== 'dealing' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2rem] p-10 max-w-md w-full text-center shadow-2xl border-4 border-yellow-400"
            >
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy size={40} className="text-yellow-600" />
              </div>
              
              <h2 className="text-4xl font-black text-slate-900 mb-4">
                {state.status === 'player_won' ? '你赢了！' : 'AI 赢了！'}
              </h2>
              
              <p className="text-slate-500 mb-8 text-lg">
                {state.status === 'player_won' 
                  ? '太棒了！你清空了所有手牌。' 
                  : '下次努力！AI 率先清空了手牌。'}
              </p>
              
              <button 
                onClick={resetGame}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <RotateCcw size={24} />
                再玩一局
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-400/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/10 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
