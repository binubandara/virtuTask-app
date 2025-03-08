import React, { useState } from 'react';
import './HabitInfo.css';

const HabitInfo = ({ habit, onClose, color }) => {
  const [currentSubIndex, setCurrentSubIndex] = useState(0);
  const subTilesPerView = 2;

  const handlePrevSub = () => {
    setCurrentSubIndex(prev => (prev === 0 ? habit.subItems.length - subTilesPerView : prev - subTilesPerView));
  };
  
  const handleNextSub = () => {
    setCurrentSubIndex(prev => (prev >= habit.subItems.length - subTilesPerView ? 0 : prev + subTilesPerView));
  };

  const visibleSubItems = habit.subItems.slice(currentSubIndex, currentSubIndex + subTilesPerView);

  return (
    <div className="habit-info-overlay">
      <div className="habit-info-modal">
        <div className="habit-info-header">
          <h2>{habit.title}</h2>
          <button className="habit-info-close-button" onClick={onClose}>×</button>
        </div>

        <div className="habit-info-sub-carousel-wrapper">
          <button className="habit-info-sub-nav habit-info-sub-nav-prev" onClick={handlePrevSub}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#2c3e50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="habit-info-sub-carousel">
            <div className="habit-info-sub-carousel-inner">
              {visibleSubItems.map((subItem) => (
                <div 
                  className="habit-info-sub-tile" 
                  key={subItem.id}
                  style={{ backgroundColor: color,borderColor: color }} // Apply the color here
                >
                  <div 
                    className="habit-info-sub-tile-image"
                    style={{ backgroundImage: `url(${subItem.image})` }}
                  />
                  <div className="habit-info-sub-tile-content">
                    <h3>{subItem.header}</h3>
                    {subItem.sections?.map((section, index) => (
                      <div key={index} className="habit-info-content-section">
                        {section.title && <h4>{section.title}</h4>}
                        <ul>
                          {Array.isArray(section.health_habit_content) 
                            ? section.health_habit_content.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))
                            : <li>{section.health_habit_content}</li>
                          }
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="habit-info-sub-nav habit-info-sub-nav-next" onClick={handleNextSub}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="#2c3e50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HabitInfo;