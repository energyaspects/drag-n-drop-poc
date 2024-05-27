import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MultiBackend, TouchTransition } from 'dnd-multi-backend';
import update from 'immutability-helper';
import Card from './Card';

const generateCards = (numCards) => {
  return Array.from({ length: numCards }, (_, index) => ({
    id: index + 1,
    text: `Card ${index + 1}`,
  }));
};

const CardList = ({ numCards = 10 }) => {
  const [cards, setCards] = useState(generateCards(numCards));

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

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollThreshold = 20; // Pixels from the top/bottom to start scrolling
    const scrollSpeed = 10; // Pixels to scroll per frame

    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    if (clientY - container.getBoundingClientRect().top < scrollThreshold) {
      scrollIntervalRef.current = setInterval(() => {
        container.scrollTop = container.scrollTop - scrollSpeed;
      }, 100);
    } else if (container.getBoundingClientRect().bottom - clientY < scrollThreshold) {
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

    const preventDefault = (e) => {
      if (isDraggingRef.current) {
        e.preventDefault();
      }
    };

    container.addEventListener('dragover', handleScroll);
    container.addEventListener('touchmove', handleScroll, { passive: false });
    container.addEventListener('touchmove', preventDefault, { passive: false });
    container.addEventListener('dragleave', clearScrollInterval);
    container.addEventListener('touchend', clearScrollInterval);
    container.addEventListener('drop', clearScrollInterval);

    return () => {
      container.removeEventListener('dragover', handleScroll);
      container.removeEventListener('touchmove', handleScroll);
      container.removeEventListener('touchmove', preventDefault);
      container.removeEventListener('dragleave', clearScrollInterval);
      container.removeEventListener('touchend', clearScrollInterval);
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