import React, { useState } from 'react';
import './HealthHabit.css';

const HealthHabit = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const tilesPerView = 4;
  const gap = 16; // Reduced gap between tiles

  const tiles = [
    { id: 1, title: 'Posture', image: 'placeholder.jpg' },
    { id: 2, title: 'Hydration', image: 'placeholder.jpg' },
    { id: 3, title: 'Eye Health', image: 'placeholder.jpg' },
    { id: 4, title: 'Mental Breaks', image: 'placeholder.jpg' },
    { id: 5, title: 'Ergonomics', image: 'placeholder.jpg' },
    { id: 6, title: 'Stretching', image: 'placeholder.jpg' },
    { id: 7, title: 'Mindfulness', image: 'placeholder.jpg' },
    { id: 8, title: 'Nutrition', image: 'placeholder.jpg' },
    { id: 9, title: 'Sleep', image: 'placeholder.jpg' },
  ];

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? tiles.length - tilesPerView : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev >= tiles.length - tilesPerView ? 0 : prev + 1));
  };

  return (
    <div className="health-habit-container">
      <h1 className="health-habit-main-title">HEALTH HABIT TRACKER</h1>
      
      <div className="health-habit-carousel-wrapper">
        <button 
          className="health-habit-nav-button prev" 
          onClick={handlePrev}
          aria-label="Previous"
        >
          ‹
        </button>

        <div className="health-habit-carousel">
          <div 
            className="health-habit-carousel-inner"
            style={{ 
              transform: `translateX(-${currentIndex * (230 + gap)}px)`, // Adjusted for reduced tile width
              gap: `${gap}px`
            }}
          >
            {tiles.map((tile) => (
              <div className="habit-tile" key={tile.id}>
                <div 
                  className="habit-tile-image"
                  style={{ backgroundImage: `url(${tile.image})` }}
                />
                <h3 className="habit-tile-title">{tile.title}</h3>
              </div>
            ))}
          </div>
        </div>

        <button 
          className="health-habit-nav-button next" 
          onClick={handleNext}
          aria-label="Next"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default HealthHabit;