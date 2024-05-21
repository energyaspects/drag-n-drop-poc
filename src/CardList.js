import React, { useState, useCallback, useRef, useEffect } from 'react';
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

  const containerRef = useRef(null);
  const scrollIntervalRef = useRef(null);
  const isDraggingRef = useRef(false);

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

  const handleScroll = (e) => {
    if (!isDraggingRef.current) return;

    const container = containerRef.current;
    if (!container) return;

    const scrollThreshold = 20; // Pixels from the top/bottom to start scrolling
    const scrollSpeed = 10; // Pixels to scroll per frame

    if (e.clientY - container.getBoundingClientRect().top < scrollThreshold) {
      scrollIntervalRef.current = setInterval(() => {
        container.scrollTop = container.scrollTop - scrollSpeed;
      }, 100);
    } else if (container.getBoundingClientRect().bottom - e.clientY < scrollThreshold) {
      scrollIntervalRef.current = setInterval(() => {
        container.scrollTop = container.scrollTop + scrollSpeed;
      }, 100);
    } else {
      clearInterval(scrollIntervalRef.current);
    }
  };

  const clearScrollInterval = () => {
    clearInterval(scrollIntervalRef.current);
  };

  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
    clearScrollInterval();
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('dragover', handleScroll);
    container.addEventListener('dragleave', clearScrollInterval);
    container.addEventListener('drop', clearScrollInterval);

    return () => {
      container.removeEventListener('dragover', handleScroll);
      container.removeEventListener('dragleave', clearScrollInterval);
      container.removeEventListener('drop', clearScrollInterval);
    };
  }, []);

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
      <div
        ref={containerRef}
        style={{
          width: '200px',
          height: '400px',
          overflowY: 'auto',
          margin: '0 auto',
          border: '1px solid black',
        }}
      >
        {cards.map((card, index) => (
          <Card
            key={card.id}
            index={index}
            id={card.id}
            text={card.text}
            moveCard={moveCard}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>
    </DndProvider>
  );
};

export default CardList;