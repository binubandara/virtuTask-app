import React, { useState } from 'react';
import './HealthHabit.css';
import HabitInfo from './HabitInfo';



const HealthHabit = () => {
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const tilesPerView = 4;
  const gap = 16; // Reduced gap between tiles

  const tiles = [
    { id: 1, title: 'Posture', image: 'placeholder.jpg',
        // Updated subItems structure with content blocks
        subItems: [
            {
              id: 1,// Add other slides similarly
              header: 'Posture Alignment',
              image: 'posture1.jpg',
              sections: [
                {
                 content:['Practice Active Sitting and Spinal Awareness'],
                },
                { 
                  title: 'What to Do',
                  content: [
                    'Maintain a neutral spine position while working.',' Engage your core and avoid slouching or leaning forward.'
                  ]
                },
                { 
                    title: 'How to Implement',
                    content: [
                      'Use posture-correcting apps like Posture Reminder or wearables like UPRIGHT Go for real-time feedback.',
                      'Perform seated pelvic tilts every 30 minutes to reset spinal alignment.',
                      'Align ears, shoulders, and hips vertically while sitting.'
                    ]
                  },
                {
                  title: 'Science Behind It',
                  content: [
                    'Reduces spinal disc pressure by 40%',
                    'Improves lung capacity (Mayo Clinic)'
                  ]
                }
              ]
            },
          
            { id: 2,// Add other slides similarly
                header: 'Posture Alignment',
                image: 'posture1.jpg',
                sections: [
                  {
                    title: 'What to Do',
                    content: [
                      'Maintain neutral spine position while working',
                      'Engage core and avoid slouching',
                      'Use posture-correcting apps'
                    ]
                  },
                  {
                    title: 'Science Behind It',
                    content: [
                      'Reduces spinal disc pressure by 40%',
                      'Improves lung capacity (Mayo Clinic)'
                    ]
                  }
                ]
              },
            { id: 3, // Add other slides similarly
                header: 'Posture Alignment',
                image: 'posture1.jpg',
                sections: [
                  {
                    title: 'What to Do',
                    content: [
                      'Maintain neutral spine position while working',
                      'Engage core and avoid slouching',
                      'Use posture-correcting apps'
                    ]
                  },
                  {
                    title: 'Science Behind It',
                    content: [
                      'Reduces spinal disc pressure by 40%',
                      'Improves lung capacity (Mayo Clinic)'
                    ]
                  }
                ]
              },
            { id: 4, // Add other slides similarly
                header: 'Posture Alignment',
                image: 'posture1.jpg',
                sections: [
                  {
                    title: 'What to Do',
                    content: [
                      'Maintain neutral spine position while working',
                      'Engage core and avoid slouching',
                      'Use posture-correcting apps'
                    ]
                  },
                  {
                    title: 'Science Behind It',
                    content: [
                      'Reduces spinal disc pressure by 40%',
                      'Improves lung capacity (Mayo Clinic)'
                    ]
                  }
                ]
              },  
          ]
     },
    { id: 2, title: 'Hydration', image: 'placeholder.jpg',
        subItems: [
            { id: 1, title: 'Hydration 1', habit_content: 'Neck alignment exercise', image: 'sub1.jpg' },
            { id: 2, title: 'Hydration 2', habit_content: 'Shoulder roll technique', image: 'sub2.jpg' },
            { id: 3, title: 'Hydration 3', habit_content: 'Neck alignment exercise', image: 'sub3.jpg' },
            { id: 4, title: 'Hydration 4', habit_content: 'Shoulder roll technique', image: 'sub4.jpg' },  
          ] },
    { id: 3, title: 'Eye Health', image: 'placeholder.jpg',
        subItems: [
            { id: 1, title: 'Eye Health 1', habit_content: 'Neck alignment exercise', image: 'sub1.jpg' },
            { id: 2, title: 'Eye Health 2', habit_content: 'Shoulder roll technique', image: 'sub2.jpg' },
            { id: 3, title: 'Eye Health 3', habit_content: 'Neck alignment exercise', image: 'sub3.jpg' },
            { id: 4, title: 'Eye Health 4', habit_content: 'Shoulder roll technique', image: 'sub4.jpg' },  
          ] },
    { id: 4, title: 'Mental Breaks', image: 'placeholder.jpg',
        subItems: [
            { id: 1, title: 'Mental Breaks 1', habit_content: 'Neck alignment exercise', image: 'sub1.jpg' },
            { id: 2, title: 'Mental Breaks 2', habit_content: 'Shoulder roll technique', image: 'sub2.jpg' },
            { id: 3, title: 'Mental Breaks 3', habit_content: 'Neck alignment exercise', image: 'sub3.jpg' },
            { id: 4, title: 'Mental Breaks 4', habit_content: 'Shoulder roll technique', image: 'sub4.jpg' },  
          ] },
    { id: 5, title: 'Ergonomics', image: 'placeholder.jpg',
        subItems: [
            { id: 1, title: 'Ergonomics 1', habit_content: 'Neck alignment exercise', image: 'sub1.jpg' },
            { id: 2, title: 'Ergonomics 2', habit_content: 'Shoulder roll technique', image: 'sub2.jpg' },
            { id: 3, title: 'Ergonomics 3', habit_content: 'Neck alignment exercise', image: 'sub3.jpg' },
            { id: 4, title: 'Ergonomics 4', habit_content: 'Shoulder roll technique', image: 'sub4.jpg' },  
          ] },
    { id: 6, title: 'Stretching', image: 'placeholder.jpg',
        subItems: [
            { id: 1, title: 'Stretching 1', habit_content: 'Neck alignment exercise', image: 'sub1.jpg' },
            { id: 2, title: 'Stretching 2', habit_content: 'Shoulder roll technique', image: 'sub2.jpg' },
            { id: 3, title: 'Stretching 3', habit_content: 'Neck alignment exercise', image: 'sub3.jpg' },
            { id: 4, title: 'Stretching 4', habit_content: 'Shoulder roll technique', image: 'sub4.jpg' },  
          ] },
    { id: 7, title: 'Mindfulness', image: 'placeholder.jpg',
        subItems: [
            { id: 1, title: 'Mindfulness 1', habit_content: 'Neck alignment exercise', image: 'sub1.jpg' },
            { id: 2, title: 'Mindfulness 2', habit_content: 'Shoulder roll technique', image: 'sub2.jpg' },
            { id: 3, title: 'Mindfulness 3', habit_content: 'Neck alignment exercise', image: 'sub3.jpg' },
            { id: 4, title: 'Mindfulness 4', habit_content: 'Shoulder roll technique', image: 'sub4.jpg' },  
          ] },
    { id: 8, title: 'Nutrition', image: 'placeholder.jpg',
        subItems: [
            { id: 1, title: 'Nutrition 1', habit_content: 'Neck alignment exercise', image: 'sub1.jpg' },
            { id: 2, title: 'Nutrition 2', habit_content: 'Shoulder roll technique', image: 'sub2.jpg' },
            { id: 3, title: 'Nutrition 3', habit_content: 'Neck alignment exercise', image: 'sub3.jpg' },
            { id: 4, title: 'Nutrition 4', habit_content: 'Shoulder roll technique', image: 'sub4.jpg' },  
          ] },
    { id: 9, title: 'Sleep', image: 'placeholder.jpg' ,
        subItems: [
            { id: 1, title: 'Sleep 1', habit_content: 'Neck alignment exercise', image: 'sub1.jpg' },
            { id: 2, title: 'Sleep 2', habit_content: 'Shoulder roll technique', image: 'sub2.jpg' },
            { id: 3, title: 'Sleep 3', habit_content: 'Neck alignment exercise', image: 'sub3.jpg' },
            { id: 4, title: 'Sleep 4', habit_content: 'Shoulder roll technique', image: 'sub4.jpg' },  
          ]},
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
              <div className="habit-tile" key={tile.id} onClick={() => setSelectedHabit(tile)}>
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
        {selectedHabit && (
        <HabitInfo 
            habit={selectedHabit} 
            onClose={() => setSelectedHabit(null)}
        />
        )}
    </div>
  );
};

export default HealthHabit;