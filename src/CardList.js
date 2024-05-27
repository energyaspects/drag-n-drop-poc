import React, { useState, useRef, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

const generateCards = (numCards) => {
  return Array.from({ length: numCards }, (_, index) => ({
    id: index + 1,
    text: `Card ${index + 1}`,
  }));
};

const Card = ({ id, text }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '16px',
    margin: '4px 0',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {text}
    </div>
  );
};

const CardList = ({ numCards = 10 }) => {
  const [cards, setCards] = useState(generateCards(numCards));
  const containerRef = useRef(null);
  const scrollAnimationFrameRef = useRef(null);
  const isDraggingRef = useRef(false);
  const lastClientYRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }

    isDraggingRef.current = false;
    clearScrollAnimationFrame();
  };

  const handleScroll = () => {
    if (!isDraggingRef.current) return;

    const container = containerRef.current;
    if (!container) return;

    const scrollThreshold = 20; 
    const scrollSpeed = 10; 

    const clientY = lastClientYRef.current;

    const scroll = () => {
      if (clientY - container.getBoundingClientRect().top < scrollThreshold) {
        container.scrollTop = container.scrollTop - scrollSpeed;
      } else if (container.getBoundingClientRect().bottom - clientY < scrollThreshold) {
        container.scrollTop = container.scrollTop + scrollSpeed;
      }
      scrollAnimationFrameRef.current = requestAnimationFrame(scroll);
    };

    cancelAnimationFrame(scrollAnimationFrameRef.current);
    scrollAnimationFrameRef.current = requestAnimationFrame(scroll);
  };

  const clearScrollAnimationFrame = () => {
    cancelAnimationFrame(scrollAnimationFrameRef.current);
  };

  const handleTouchMove = (e) => {
    lastClientYRef.current = e.touches[0].clientY;
    handleScroll();
  };

  const handleMouseMove = (e) => {
    lastClientYRef.current = e.clientY;
    handleScroll();
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventDefault = (e) => {
      if (isDraggingRef.current) {
        e.preventDefault();
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchmove', preventDefault, { passive: false });
    container.addEventListener('mouseleave', clearScrollAnimationFrame);
    container.addEventListener('touchend', clearScrollAnimationFrame);
    container.addEventListener('drop', clearScrollAnimationFrame);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchmove', preventDefault);
      container.removeEventListener('mouseleave', clearScrollAnimationFrame);
      container.removeEventListener('touchend', clearScrollAnimationFrame);
      container.removeEventListener('drop', clearScrollAnimationFrame);
    };
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <div
        ref={containerRef}
        style={{
          width: '200px',
          height: '400px',
          overflowY: 'scroll',
          margin: '0 auto',
          border: '1px solid black',
          WebkitOverflowScrolling: 'touch', // Ensures smooth scrolling on iOS
          scrollbarWidth: 'thin', // For Firefox
        }}
        className="scroll-container"
      >
        <SortableContext items={cards} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <Card key={card.id} id={card.id} text={card.text} />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
};

export default CardList;