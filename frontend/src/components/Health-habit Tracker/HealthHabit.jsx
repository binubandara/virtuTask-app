import React, { useState } from 'react';
import './HealthHabit.css';
import HabitInfo from './HabitInfo';
import ergonomicsImage from '../../assets/Home-Office-Ergonomics.png';

const HealthHabit = () => {
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const tilesPerView = 4;
  const gap = 16; // Reduced gap between tiles

  const tiles = [
    { id: 1, title: 'Posture', image: 'placeholder.jpg', color: '#e2eafc', // Light blue
      subItems: [
        { id: 1, 
          header: 'Posture Alignment', 
          image: ergonomicsImage, 
          sections: [
          { health_habit_content: ['Practice Active Sitting and Spinal Awareness'] },

          { title: 'What to Do', 
            health_habit_content: [
              'Maintain a neutral spine position while working.', 
              'Engage your core and avoid slouching or leaning forward.'
            ] },
          { title: 'How to Implement', 
            health_habit_content: [
              'Use posture-correcting apps like Posture Reminder or wearables like UPRIGHT Go for real-time feedback.', 
              'Perform seated pelvic tilts every 30 minutes to reset spinal alignment.', 
              'Align ears, shoulders, and hips vertically while sitting.'
            ] },
          { title: 'Science Behind It', 
            health_habit_content: [
              'Reduces spinal disc pressure by 40%', 
              'Improves lung capacity (Mayo Clinic)'
            ] }
        ]},
        { id: 1, 
          header: 'Posture Alignment', 
          image: ergonomicsImage, 
          sections: [
          { health_habit_content: ['Practice Active Sitting and Spinal Awareness'] },

          { title: 'What to Do', 
            health_habit_content: [
              'Maintain a neutral spine position while working.', 
              'Engage your core and avoid slouching or leaning forward.'
            ] },
          { title: 'How to Implement', 
            health_habit_content: [
              'Use posture-correcting apps like Posture Reminder or wearables like UPRIGHT Go for real-time feedback.', 
              'Perform seated pelvic tilts every 30 minutes to reset spinal alignment.', 
              'Align ears, shoulders, and hips vertically while sitting.'
            ] },
          { title: 'Science Behind It', 
            health_habit_content: [
              'Reduces spinal disc pressure by 40%', 
              'Improves lung capacity (Mayo Clinic)'
            ] }
        ]},
        { id: 3, 
          header: 'Pro Tips for Successful Posture Alignment', 
          image: 'posture1.jpg', 
          sections: [
          { title: 'Daily Habits', 
            health_habit_content: [
              'Do a 2-minute “posture reset” every hour: Stand, roll shoulders back, and align head over hips.', 
              'Use a lumbar roll or cushion to support your lower back’s natural curve.'
            ] },
          { title: 'Strengthening Exercises', 
            health_habit_content: [
              'Tape a reminder note to your monitor: “Shoulders down, chin tucked!”', 
              'Invest in an adjustable standing desk to alternate positions.'
            ] },
          { title: 'Workspace Integration', 
            health_habit_content: ['Reduces spinal disc pressure by 40%', 
              'Improves lung capacity (Mayo Clinic)'
            ] }
        ]},
        { id: 4, 
          header: 'Long-Term Benefits of Good Posture', 
          image: 'posture1.jpg', 
          sections: [
          { health_habit_content: ['Invest in Your Future Health'] },
          { title: 'Health Benefits Over Time', 
            health_habit_content: [
              'Reduces Risk of Spinal Degeneration – Maintaining spinal alignment prevents excessive wear on discs and joints, reducing the likelihood of conditions like herniated discs and arthritis.', 
              'Enhances Breathing and Circulation – Proper posture allows the diaphragm to expand fully, improving oxygen intake and blood flow, which supports overall vitality.', 
              'Boosts Energy and Productivity – Less strain on muscles and joints means reduced fatigue, allowing for better focus and endurance throughout the day.'
            ] },
          { title: 'Posture & Longevity', 
            health_habit_content: [
              'Studies link good posture with lower stress hormone levels and better balance in old age, reducing fall risks by up to 30%.', 
              'Athletes and professionals with consistent posture habits experience fewer injuries and faster recovery times.'
            ] },
          { title: 'Workspace Integration', 
            health_habit_content: [
              'Think of posture as a long-term investment in your health, just like exercise and nutrition. Small daily adjustments lead to lifelong benefits!'
            ] }
        ]}
      ]
    },
    { id: 2, title: 'Hydration', image: 'placeholder.jpg', color: '#fadadd', // Light pink
      subItems: [
        { id: 1, title: 'Hydration 1', health_habit_content: 'Neck alignment exercise', image: 'sub1.jpg' },
        { id: 2, title: 'Hydration 2', health_habit_content: 'Shoulder roll technique', image: 'sub2.jpg' },
        { id: 3, title: 'Hydration 3', health_habit_content: 'Neck alignment exercise', image: 'sub3.jpg' },
        { id: 4, title: 'Hydration 4', health_habit_content: 'Shoulder roll technique', image: 'sub4.jpg' }
      ]
    },
    { id: 3, title: 'Eye Health', image: 'placeholder.jpg', color: '#fffacd', // Light yellow
      subItems: [
        { id: 1, title: 'Eye Health 1', health_habit_content: 'Neck alignment exercise', image: 'sub1.jpg' },
        { id: 2, title: 'Eye Health 2', health_habit_content: 'Shoulder roll technique', image: 'sub2.jpg' },
        { id: 3, title: 'Eye Health 3', health_habit_content: 'Neck alignment exercise', image: 'sub3.jpg' },
        { id: 4, title: 'Eye Health 4', health_habit_content: 'Shoulder roll technique', image: 'sub4.jpg' }
      ]
    },
    { id: 4, title: 'Mental Breaks', image: 'placeholder.jpg', color: '#e6e6fa', // Light purple
      subItems: [
        { id: 1, title: 'Mental Breaks 1', health_habit_content: 'Neck alignment exercise', image: 'sub1.jpg' },
        { id: 2, title: 'Mental Breaks 2', health_habit_content: 'Shoulder roll technique', image: 'sub2.jpg' },
        { id: 3, title: 'Mental Breaks 3', health_habit_content: 'Neck alignment exercise', image: 'sub3.jpg' },
        { id: 4, title: 'Mental Breaks 4', health_habit_content: 'Shoulder roll technique', image: 'sub4.jpg' }
      ]
    },
    { id: 5, title: 'Ergonomics', image: 'placeholder.jpg', color: '#d3f8d3', // Light green
      subItems: [
        { id: 1, title: 'Ergonomics 1', health_habit_content: 'Neck alignment exercise', image: 'sub1.jpg' },
        { id: 2, title: 'Ergonomics 2', health_habit_content: 'Shoulder roll technique', image: 'sub2.jpg' },
        { id: 3, title: 'Ergonomics 3', health_habit_content: 'Neck alignment exercise', image: 'sub3.jpg' },
        { id: 4, title: 'Ergonomics 4', health_habit_content: 'Shoulder roll technique', image: 'sub4.jpg' }
      ]
    },
    { id: 6, title: 'Stretching', image: 'placeholder.jpg', color: '#ffebcd', // Light orange
      subItems: [
        { id: 1, title: 'Stretching 1', health_habit_content: 'Neck alignment exercise', image: 'sub1.jpg' },
        { id: 2, title: 'Stretching 2', health_habit_content: 'Shoulder roll technique', image: 'sub2.jpg' },
        { id: 3, title: 'Stretching 3', health_habit_content: 'Neck alignment exercise', image: 'sub3.jpg' },
        { id: 4, title: 'Stretching 4', health_habit_content: 'Shoulder roll technique', image: 'sub4.jpg' }
      ]
    },
    { id: 7, title: 'Mindfulness', image: 'placeholder.jpg', color: '#f0f8ff', // Light cyan
      subItems: [
        { id: 1, title: 'Mindfulness 1', health_habit_content: 'Neck alignment exercise', image: 'sub1.jpg' },
        { id: 2, title: 'Mindfulness 2', health_habit_content: 'Shoulder roll technique', image: 'sub2.jpg' },
        { id: 3, title: 'Mindfulness 3', health_habit_content: 'Neck alignment exercise', image: 'sub3.jpg' },
        { id: 4, title: 'Mindfulness 4', health_habit_content: 'Shoulder roll technique', image: 'sub4.jpg' }
      ]
    },
    { id: 8, title: 'Nutrition', image: 'placeholder.jpg', color: '#f5f5dc', // Light beige
      subItems: [
        { id: 1, title: 'Nutrition 1', health_habit_content: 'Neck alignment exercise', image: 'sub1.jpg' },
        { id: 2, title: 'Nutrition 2', health_habit_content: 'Shoulder roll technique', image: 'sub2.jpg' },
        { id: 3, title: 'Nutrition 3', health_habit_content: 'Neck alignment exercise', image: 'sub3.jpg' },
        { id: 4, title: 'Nutrition 4', health_habit_content: 'Shoulder roll technique', image: 'sub4.jpg' }
      ]
    },
    { id: 9, title: 'Sleep', image: 'placeholder.jpg', color: '#f0e68c', // Light khaki
      subItems: [
        { id: 1, title: 'Sleep 1', health_habit_content: 'Neck alignment exercise', image: 'sub1.jpg' },
        { id: 2, title: 'Sleep 2', health_habit_content: 'Shoulder roll technique', image: 'sub2.jpg' },
        { id: 3, title: 'Sleep 3', health_habit_content: 'Neck alignment exercise', image: 'sub3.jpg' },
        { id: 4, title: 'Sleep 4', health_habit_content: 'Shoulder roll technique', image: 'sub4.jpg' }
      ]
    }
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
              <div className="health-habit-tile" key={tile.id} onClick={() => setSelectedHabit(tile)}>
                <div 
                  className="health-habit-tile-image"
                  style={{ backgroundImage: `url(${tile.image})` }}
                />
                <h3 className="health-habit-tile-title">{tile.title}</h3>
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
          color={selectedHabit.color} // Pass the color to HabitInfo
        />
      )}
    </div>
  );
};

export default HealthHabit;