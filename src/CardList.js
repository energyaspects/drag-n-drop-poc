import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MultiBackend, TouchTransition } from 'dnd-multi-backend';
import update from 'immutability-helper';
import Card from './Card';

const CardList = () => {
  const [cards, setCards] = useState([
    { id: 1, text: 'Card 1' },
    { id: 2, text: 'Card 2' },
    { id: 3, text: 'Card 3' },
    { id: 4, text: 'Card 4' },
    { id: 5, text: 'Card 5' },
    { id: 6, text: 'Card 6' },
    { id: 7, text: 'Card 7' },
    { id: 8, text: 'Card 8' },
    { id: 9, text: 'Card 9' },
    { id: 10, text: 'Card 10' },
    { id: 11, text: 'Card 11' },
    { id: 12, text: 'Card 12' },
    { id: 13, text: 'Card 13' },
    { id: 14, text: 'Card 14' },
    { id: 15, text: 'Card 15' },
    { id: 16, text: 'Card 16' },
  ]);

  const moveCard = useCallback((dragIndex, hoverIndex) => {
    const dragCard = cards[dragIndex];
    setCards(
      update(cards, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragCard],
        ],
      })
    );
  }, [cards]);

  return (
    <DndProvider
      backend={MultiBackend}
      options={{
        backends: [
          {
            backend: HTML5Backend,
          },
          {
            backend: TouchBackend,
            options: { enableMouseEvents: true },
            preview: true,
            transition: TouchTransition,
          },
        ],
      }}
    >
      <div style={{ width: '200px', margin: '0 auto' }}>
        {cards.map((card, index) => (
          <Card key={card.id} index={index} id={card.id} text={card.text} moveCard={moveCard} />
        ))}
      </div>
    </DndProvider>
  );
};

export default CardList;