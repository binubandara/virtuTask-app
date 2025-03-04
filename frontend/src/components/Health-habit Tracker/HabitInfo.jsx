import React, { useState } from 'react';
import './HabitInfo.css';

const HabitInfo = ({ habit, onClose }) => {
  const [currentSubIndex, setCurrentSubIndex] = useState(0);
  const subTilesPerView = 2;

  const handlePrevSub = () => {
    setCurrentSubIndex(prev => (prev === 0 ? habit.subItems.length - 1 : prev - 1));
  };
  
  const handleNextSub = () => {
    setCurrentSubIndex(prev => (prev === habit.subItems.length - 1 ? 0 : prev + 1));
  };
  
  return (
    <div className="habit-info-overlay">
      <div className="habit-info-modal">
        <div className="habit-info-header">
          <h2>{habit.title}</h2>
          <button className="habit-info-close-button" onClick={onClose}>×</button>
        </div>

        <div className="habit-info-sub-carousel-wrapper">
          <button className="habit-info-sub-nav prev" onClick={handlePrevSub}>‹</button>
          
          <div className="habit-info-sub-carousel">
            <div className="habit-info-sub-carousel-inner" 
              style={{ transform: `translateX(-${currentSubIndex * 50}%)` }}>
              {habit.subItems.map((subItem) => (
                <div className="habit-info-sub-tile" key={subItem.id}>
                  <div 
                    className="habit-info-sub-tile-image"
                    style={{ backgroundImage: `url(${subItem.image})` }}
                  />
                  <div className="habit-info-sub-tile-content">
                    <h3>{subItem.header}</h3>
                    {subItem.sections?.map((section, index) => (
                      <div key={index} className="habit-info-content-section">
                        <h4>{section.title}</h4>
                        <ul>
                          {section.content.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="habit-info-sub-nav next" onClick={handleNextSub}>›</button>
        </div>
      </div>
    </div>
  );
};

export default HabitInfo;