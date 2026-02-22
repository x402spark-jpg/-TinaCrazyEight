import { useState, useEffect, useCallback } from 'react';
import { CardData, GameState, Suit, PlayerType } from '../types';
import { createDeck, isPlayable, shuffle } from '../constants';

export const useCrazyEights = () => {
  const [state, setState] = useState<GameState>({
    deck: [],
    playerHand: [],
    aiHand: [],
    discardPile: [],
    currentPlayer: 'player',
    wildSuit: null,
    status: 'dealing',
    lastAction: '正在准备游戏...',
    hasDrawn: false,
  });

  const [showSuitPicker, setShowSuitPicker] = useState(false);
  const [pendingWildCard, setPendingWildCard] = useState<CardData | null>(null);

  // Initialize Game
  const initGame = useCallback(() => {
    const fullDeck = createDeck();
    const playerHand = fullDeck.splice(0, 8);
    const aiHand = fullDeck.splice(0, 8);
    
    // Find a non-8 card for the start of discard pile
    let firstCardIndex = fullDeck.findIndex(c => c.rank !== '8');
    if (firstCardIndex === -1) firstCardIndex = 0;
    const discardPile = [fullDeck.splice(firstCardIndex, 1)[0]];

    setState({
      deck: fullDeck,
      playerHand,
      aiHand,
      discardPile,
      currentPlayer: 'player',
      wildSuit: null,
      status: 'playing',
      lastAction: '游戏开始！你的回合。',
      hasDrawn: false,
    });
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const drawCard = (player: PlayerType) => {
    if (state.deck.length === 0) {
      if (state.discardPile.length <= 1) {
        setState(prev => ({ ...prev, lastAction: '摸牌堆已空，跳过回合。', currentPlayer: prev.currentPlayer === 'player' ? 'ai' : 'player', hasDrawn: false }));
        return;
      }
      
      const topCard = state.discardPile[state.discardPile.length - 1];
      const newDeck = shuffle(state.discardPile.slice(0, -1));
      
      setState(prev => ({
        ...prev,
        deck: newDeck,
        discardPile: [topCard],
        lastAction: '重新洗牌摸牌堆。'
      }));
      return;
    }

    const newDeck = [...state.deck];
    const card = newDeck.pop()!;
    
    setState(prev => {
      const isPlayer = player === 'player';
      return {
        ...prev,
        deck: newDeck,
        playerHand: isPlayer ? [...prev.playerHand, card] : prev.playerHand,
        aiHand: !isPlayer ? [...prev.aiHand, card] : prev.aiHand,
        lastAction: `${isPlayer ? '你' : 'AI'} 摸了一张牌。`,
        hasDrawn: true,
      };
    });
  };

  const skipTurn = () => {
    setState(prev => ({
      ...prev,
      currentPlayer: prev.currentPlayer === 'player' ? 'ai' : 'player',
      lastAction: `${prev.currentPlayer === 'player' ? '你' : 'AI'} 跳过了回合。`,
      hasDrawn: false,
    }));
  };

  const playCard = (card: CardData, player: PlayerType, chosenSuit?: Suit) => {
    const isPlayer = player === 'player';
    const hand = isPlayer ? state.playerHand : state.aiHand;
    const newHand = hand.filter(c => c.id !== card.id);
    
    if (card.rank === '8' && !chosenSuit && isPlayer) {
      setPendingWildCard(card);
      setShowSuitPicker(true);
      return;
    }

    setState(prev => {
      const newStatus = newHand.length === 0 ? (isPlayer ? 'player_won' : 'ai_won') : 'playing';
      
      return {
        ...prev,
        playerHand: isPlayer ? newHand : prev.playerHand,
        aiHand: !isPlayer ? newHand : prev.aiHand,
        discardPile: [...prev.discardPile, card],
        wildSuit: chosenSuit || null,
        status: newStatus,
        currentPlayer: isPlayer ? 'ai' : 'player',
        lastAction: `${isPlayer ? '你' : 'AI'} 打出了 ${card.rank} ${card.suit}${chosenSuit ? ` (变色为 ${chosenSuit})` : ''}`,
        hasDrawn: false,
      };
    });
  };

  const handleSuitSelect = (suit: Suit) => {
    if (pendingWildCard) {
      playCard(pendingWildCard, 'player', suit);
      setPendingWildCard(null);
      setShowSuitPicker(false);
    }
  };

  // AI Logic
  useEffect(() => {
    if (state.status === 'playing' && state.currentPlayer === 'ai') {
      const timer = setTimeout(() => {
        const topCard = state.discardPile[state.discardPile.length - 1];
        if (!topCard) return;
        
        const playableCards = state.aiHand.filter(c => isPlayable(c, topCard, state.wildSuit));
        
        if (playableCards.length > 0) {
          // AI Strategy: Play non-8s first, then 8s
          const nonEight = playableCards.find(c => c.rank !== '8');
          const cardToPlay = nonEight || playableCards[0];
          
          if (cardToPlay.rank === '8') {
            // AI chooses suit based on most frequent suit in hand
            const suitCounts: Record<Suit, number> = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
            state.aiHand.forEach(c => { if(c.id !== cardToPlay.id) suitCounts[c.suit]++ });
            const bestSuit = (Object.keys(suitCounts) as Suit[]).reduce((a, b) => suitCounts[a] > suitCounts[b] ? a : b);
            playCard(cardToPlay, 'ai', bestSuit);
          } else {
            playCard(cardToPlay, 'ai');
          }
        } else if (!state.hasDrawn) {
          drawCard('ai');
        } else {
          skipTurn();
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.currentPlayer, state.status, state.aiHand, state.discardPile, state.wildSuit]);

  return {
    state,
    drawCard: () => drawCard('player'),
    playCard: (card: CardData) => playCard(card, 'player'),
    skipTurn,
    showSuitPicker,
    handleSuitSelect,
    closeSuitPicker: () => setShowSuitPicker(false),
    resetGame: initGame
  };
};
