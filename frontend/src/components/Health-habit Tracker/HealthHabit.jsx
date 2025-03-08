import React, { useState } from 'react';
import './HealthHabit.css';
import HabitInfo from './HabitInfo';
import ergonomicsImage from '../../assets/Home-Office-Ergonomics.png';
import postureImage_a from '../../assets/2211.i126.043.P.m005.c33.office workplace stretches exercises set.jpg';
import postureImage_b from '../../assets/5674009.jpg';
import postureImage_c from '../../assets/5502121.jpg';
import postureImage_d from '../../assets/Instruction for correct pose during office work.jpg';
import postureImage_e from '../../assets/3823107.jpg';
import postureImage_f from '../../assets/3663857.jpg';
import postureImage_g from '../../assets/Remote team-pana.png';
import postureImage_h from '../../assets/Remote team-rafiki.png';
import postureImage_i from '../../assets/Remote team-bro.png';
import postureImage_j from '../../assets/vect3.jpg';
import postureImage_k from '../../assets/vect1.jpg';
import postureImage_l from '../../assets/vest2.jpg';
import postureImage_m from '../../assets/5482221.jpg';
import hydrationImage_a from '../../assets/water.jpg';
import hydrationImage_b from '../../assets/w.jpg';
import hydrationImage_c from '../../assets/w3.jpg';
import hydrationImage_d from '../../assets/w4.jpg';
import eyeImage_a from '../../assets/eye1.jpg';
import eyeImage_b from '../../assets/eye2.jpg';
import eyeImage_c from '../../assets/eye3.jpg';
import eyeImage_d from '../../assets/eye4.jpg';
import mentalImage_a from '../../assets/mental1.jpg';
import mentalImage_b from '../../assets/mental2.jpg';
import mentalImage_c from '../../assets/mental3.jpg';
import mentalImage_d from '../../assets/mental4.jpg';


const HealthHabit = () => {
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const tilesPerView = 4;
  const gap = 16; // Reduced gap between tiles

  const tiles = [
    { id: 1, title: 'Posture', image: 'placeholder.jpg',color: '#fcf0f2', borderColor: '#fec7d2' , // Light blue
      subItems: [
        { id: 1, 
          header: 'Posture Alignment', 
          image: postureImage_d, 
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
        { id: 2, 
          header: 'Why It Matters', 
          image: postureImage_j, 
          sections: [
            { health_habit_content: ['Prevent Chronic Pain and Fatigue'] },
  
            { title: 'Physical Risks of Poor Posture:', 
              health_habit_content: [
                'Forward head posture (common with screens) adds 10 lbs of strain per inch of forward tilt.', 
                'Slouching compresses organs, reducing digestion efficiency and energy levels.'
              ] },
            { title: 'Cognitive Impact', 
              health_habit_content: [
                'Poor posture correlates with lower mood and confidence (Harvard Business Review).', 
                'Upright posture boosts focus by improving oxygen flow to the brain.'
              ] },
            { title: 'Remote Work Reality', 
              health_habit_content: [
                '65% of remote workers report worsening posture after 1+ year of remote work (Chiropractic Economics).'
              ] }
        ]},
        { id: 3, 
          header: 'Pro Tips for Successful Posture Alignment', 
          image: postureImage_e, 
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
          image: postureImage_b, 
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
    { id: 2, title: 'Hydration', image: 'placeholder.jpg',color: '#e2eafc',borderColor: '#b7cdff',// Light pink
      subItems: [
        { id: 1, 
          header: 'Hydration Essentials', 
          image: hydrationImage_d, 
          sections: [
          { health_habit_content: ['Stay Hydrated, Stay Energized'] },

          { title: '✅ What to Do', 
            health_habit_content: [
              'Drink at least 8 cups (2L) of water daily to maintain optimal hydration levels and cognitive function.'
            ] },
          { title: '✅ How to Implement:', 
            health_habit_content: [
              'Set reminders using apps like WaterMinder or Hydro Coach to track intake.', 
              'Keep a water bottle within reach while working', 
              'Start your day with 500ml of water to jumpstart hydration.',
              'Infuse water with lemon, mint, or berries for variety.'
            ] },
          { title: '✅ Science Behind It:', 
            health_habit_content: [
              'Mild dehydration (even 1-2% fluid loss) can impair focus, increase fatigue, and reduce work performance by up to 25% (National Hydration Council).'
            ] }
        ]},
        { id: 2, 
          header: 'Why It Matters', 
          image: hydrationImage_a, 
          sections: [
            { health_habit_content: ['Prevent Fatigue & Brain Fog'] },
  
            { title: '🔴 Physical Effects of Dehydration:', 
              health_habit_content: [
                'Headaches, dry skin, and sluggish metabolism.', 
                'Joint stiffness from reduced lubrication.',
                'Higher risk of kidney stones and UTIs.'
              ] },
            { title: '🧠 Cognitive Impact:', 
              health_habit_content: [
                'Dehydration reduces short-term memory and reaction time (Journal of Nutrition).', 
                'Well-hydrated individuals process information 14% faster than dehydrated ones.'
              ] },
            { title: '💻 Remote Work Reality:', 
              health_habit_content: [
                '60% of remote workers forget to drink water while working (Workplace Wellness Report).',
                'Caffeine dehydrates—balance coffee intake with equal amounts of water.',
              ] }
        ]},
        { id: 3, 
          header: 'Make Hydration Effortless', 
          image: hydrationImage_c, 
          sections: [
          { title: '💡 Daily Habits:', 
            health_habit_content: [
              'Start each work session by drinking a full glass of water.',
              'Use a large bottle (1L) and set a goal to refill twice daily.',
              'Pair hydration with breaks—drink water before checking your phone!'
            ] },
          { title: '🏋️ Hydration-Boosting Foods:', 
            health_habit_content: [
              '🥒 Cucumbers, 🍉 watermelon, 🍊 oranges, and 🥬 spinach all contain over 90% water.'
            ] },
          { title: 'Signs of Dehydration', 
            health_habit_content: ['Dark urine, dry mouth, or midday energy slumps.', 
              'Fix it fast: Coconut water or electrolyte tablets (e.g., Nuun).'
            ] },
            { title: '🛠 Workspace Integration:', 
              health_habit_content: ['Keep a water tracker widget on your remote work app dashboard.', 
                'Set a hydration reminder after every virtual meeting.','Use a smart bottle (like HidrateSpark) for real-time tracking.'
            ] }
        ]},
        { id: 4, 
          header: 'Long-Term Benefits of Hydration', 
          image: hydrationImage_b, 
          sections: [
          { health_habit_content: ['Hydrate for Health & Productivity'] },
          { title: '🌿 Health Benefits Over Time:', 
            health_habit_content: [
              'Better skin elasticity and fewer wrinkles.', 
              'Improved digestion and reduced bloating.', 
              'Stronger immune system—proper hydration helps flush toxins.'
            ] },
          { title: '🚀 Boosts Performance & Focus:', 
            health_habit_content: [
              'Hydrated employees report higher energy levels and 23% fewer sick days (Workplace Health Institute).', 
              'Proper hydration leads to better posture by keeping joints lubricated.'
            ] },
          { title: '💡 Final Tip:', 
            health_habit_content: [
              'Make hydration an effortless habit—integrate it into your remote work routine for long-term health and peak productivity!'
            ] }
        ]}
      ]
    },
    { id: 3, title: 'Eye Health', image: 'placeholder.jpg', color: 'rgba(253, 247, 217, 0.88)', borderColor: '#f3de77',// Light yellow
      subItems: [
        { id: 1, 
          header: 'Eye Care Essentials', 
          image: eyeImage_a, 
          sections: [
          { health_habit_content: ['Protect Your Vision for Better Work Performance'] },

          { title: '✅ What to Do', 
            health_habit_content: [
              'Follow the 20-20-20 Rule: Every 20 minutes, look 20 feet away for 20 seconds to reduce eye strain.',
              'Blink more! Aim for 15-20 blinks per minute to prevent dryness.',
              'Adjust screen brightness & contrast to match your surroundings.'
            ] },
          { title: '✅ How to Implement:', 
            health_habit_content: [
              'Use blue light filters like f.lux or Night Shift on screens.',
              'Increase font size and opt for dark mode to reduce glare.',
              'Keep screens at least an arm’s length away and position them slightly below eye level.'
            ] },
          { title: '✅ Science Behind It:', 
            health_habit_content: [
              'Digital Eye Strain (DES) affects over 60% of remote workers, causing headaches, blurred vision, and fatigue (American Optometric Association).'
            ] }
        ]},
        { id: 2, 
          header: 'Why It Matters', 
          image: eyeImage_b, 
          sections: [
            { health_habit_content: ['Prevent Eye Strain & Long-Term Damage'] },
  
            { title: '💻 The Risks of Excessive Screen Time:', 
              health_habit_content: [
                'Blue light exposure disrupts sleep, reducing melatonin production.',
                'Staring at screens for hours reduces blink rate by 66%, leading to dryness & irritation.',
                'Uncorrected strain can cause headaches, dizziness, and even neck pain.'
              ] },
            { title: '🧠 Cognitive Impact:', 
              health_habit_content: [
                'Tired eyes = tired brain—eye strain reduces focus and work efficiency.',
                'Good eye health improves reaction time and memory retention (Harvard Medical School).'
              ] },
            { title: '📊 Remote Work Reality:', 
              health_habit_content: [
                'The average remote worker spends 7+ hours daily on screens.',
                '80% of screen users experience some form of digital eye strain (Vision Council).'
              ] }
        ]},
        { id: 3, 
          header: 'Reduce Eye Strain', 
          image: eyeImage_c, 
          sections: [
          { title: '💡 Daily Habits:', 
            health_habit_content: [
              'Set a 20-20-20 timer using apps like Eye Care 20 20 20.',
              'Increase contrast & enlarge text to reduce effort on the eyes.',
              'Blink consciously—every time you pause, blink 3 times to refresh moisture.'
            ] },
          { title: '🥦 Eye-health Nutrition:', 
            health_habit_content: [
              '🥕 Carrots, 🥑 avocados, 🥬 leafy greens, and 🐟 omega-3-rich fish support long-term eye health.'
            ] },
            { title: '🛠 Workspace Integration:', 
              health_habit_content: [
                'Use an anti-glare screen filter to reduce reflections.',
                'Adjust room lighting to prevent harsh screen glare.',
                'Invest in blue light-blocking glasses if you work late.'
            ] }
        ]},
        { id: 4, 
          header: 'Long-Term Benefits of Eye Care', 
          image:eyeImage_d, 
          sections: [
          { health_habit_content: ['Protect Your Vision for a Lifetime'] },
          { title: '🩺 Health Benefits Over Time:', 
            health_habit_content: [
              'Lower risk of eye diseases like macular degeneration & cataracts.',
              'Reduced migraines and less eye fatigue throughout the day.',
              'Better sleep quality by limiting blue light exposure before bed.'
            ] },
          { title: '🚀 Boosts Performance & Focus:', 
            health_habit_content: [
              'Remote workers with good eye habits report 30% better focus throughout the day.',
              'Proper screen breaks reduce mental fatigue and improve decision-making.'
            ] },
          { title: '💡 Final Tip:', 
            health_habit_content: [
              'Treat your eyes like you do the rest of your body—small daily habits now will ensure better vision for years to come!'
            ] }
        ]}
      ]
    },
    { id: 4, title: 'Mental Health Breaks', image: 'placeholder.jpg', color: '#f1e3fc', borderColor: '#d9a9fe', // Light purple
      subItems:  [
        { id: 1, 
          header: 'The Power of Mental Health Breaks', 
          image: mentalImage_a, 
          sections: [
          { health_habit_content: ['Recharge Your Mind, Boost Your Productivity'] },

          { title: '✅ What to Do', 
            health_habit_content: [
              'Take 5-10 minute breaks every hour to reset your focus and reduce stress.',
              'Step away from screens and engage in mindful activities like deep breathing, stretching, or listening to music.',
              'Use microbreaks—a 60-second pause to relax your mind without disrupting workflow.'
            ] },
          { title: '✅ How to Implement:', 
            health_habit_content: [
              'Set reminders using apps like Break Timer or Mindful Breaks.',
              'Try guided 2-minute meditations using apps like Headspace or Calm.',
              'Use the Pomodoro Technique (25 min work, 5 min break) for structured rest.'
            ] },
          { title: '✅ Science Behind It:', 
            health_habit_content: [
              'Short breaks reduce stress hormones by 30% and boost creativity & problem-solving (American Psychological Association).'
            ] }
        ]},
        { id: 2, 
          header: 'Why It Matters', 
          image: mentalImage_b, 
          sections: [
            { health_habit_content: ['Prevent Burnout & Stay Motivated'] },
  
            { title: '🚨 Risks of Skipping Breaks:', 
              health_habit_content: [
                'Increased anxiety & irritability from continuous work.',
                'Higher risk of burnout—remote workers often work longer hours than in-office employees.',
                'Decision fatigue—constant focus leads to poor judgment and decreased productivity.'
              ] },
            { title: '🧠 Cognitive Benefits:', 
              health_habit_content: [
                'Short breaks improve concentration by 45% (Harvard Business Review).',
                'Stepping away from work enhances memory and problem-solving skills.'
              ] },
            { title: '📊 Remote Work Reality:', 
              health_habit_content: [
                '70% of remote employees experience stress due to lack of boundaries between work & home (Workplace Wellness Report).',
                'Employees who take regular breaks report 30% higher job satisfaction.'
              ] }
        ]},
        { id: 3, 
          header: ' Simple Ways to Take Effective Breaks', 
          image: mentalImage_c, 
          sections: [
          { title: '💡 Daily Habits:', 
            health_habit_content: [
              '✔ Step outside for 2 minutes of fresh air.',
              'Stretch or do light movement to release tension.',
              'Hydrate—drink a glass of water to refresh your body & mind.'
            ] },
          { title: '🧘 Mindfulness & Relaxation:', 
            health_habit_content: [
              'Try box breathing: Inhale 4 sec, hold 4 sec, exhale 4 sec, hold 4 sec.',
              'Listen to relaxing music or ambient sounds.',
              'Read something non-work-related for a mental reset'
            ] },
            { title: '🛠 Workspace Integration:', 
              health_habit_content: [
                ' Use an on-screen break reminder to nudge you to step away.',
                'Keep a stress ball or fidget tool on your desk.',
                'Switch tasks—doing something different for a few minutes refreshes your brain.'
            ] }
        ]},
        { id: 4, 
          header: 'Long-Term Benefits of Mental Health Breaks', 
          image:mentalImage_d, 
          sections: [
          { health_habit_content: ['Better Mental Health, Better Work Performance'] },
          { title: '💙 Health Benefits Over Time:', 
            health_habit_content: [
              'Lower stress levels and improved emotional resilience.',
              'Better mood & increased motivation throughout the day.',
              'Improved sleep—breaks reduce overstimulation from constant screen exposure.'
            ] },
          { title: '📈 Boosts Productivity & Focus:', 
            health_habit_content: [
              'Employees who take breaks report 50% higher engagement at work.',
              'Regular breaks increase creativity and problem-solving by allowing the brain to reset.'
            ] },
          { title: '💡 Final Tip:', 
            health_habit_content: [
              'Breaks aren’t wasted time—they make you more productive, creative, and mentally strong. Take intentional pauses to work smarter, not harder!'
            ] }
        ]}
      ]
    },
    { id: 5, title: 'Screen Time Management', image: 'placeholder.jpg', color: 'rgba(216, 243, 220, 0.95)', borderColor: '#a2dfab', // Light green
      subItems:  [
        { id: 1, 
          header: 'The Power of Mental Health Breaks', 
          image: mentalImage_a, 
          sections: [
          { health_habit_content: ['Recharge Your Mind, Boost Your Productivity'] },

          { title: '✅ What to Do', 
            health_habit_content: [
              'Take 5-10 minute breaks every hour to reset your focus and reduce stress.',
              'Step away from screens and engage in mindful activities like deep breathing, stretching, or listening to music.',
              'Use microbreaks—a 60-second pause to relax your mind without disrupting workflow.'
            ] },
          { title: '✅ How to Implement:', 
            health_habit_content: [
              'Set reminders using apps like Break Timer or Mindful Breaks.',
              'Try guided 2-minute meditations using apps like Headspace or Calm.',
              'Use the Pomodoro Technique (25 min work, 5 min break) for structured rest.'
            ] },
          { title: '✅ Science Behind It:', 
            health_habit_content: [
              'Short breaks reduce stress hormones by 30% and boost creativity & problem-solving (American Psychological Association).'
            ] }
        ]},
        { id: 2, 
          header: 'Why It Matters', 
          image: mentalImage_b, 
          sections: [
            { health_habit_content: ['Prevent Burnout & Stay Motivated'] },
  
            { title: '🚨 Risks of Skipping Breaks:', 
              health_habit_content: [
                'Increased anxiety & irritability from continuous work.',
                'Higher risk of burnout—remote workers often work longer hours than in-office employees.',
                'Decision fatigue—constant focus leads to poor judgment and decreased productivity.'
              ] },
            { title: '🧠 Cognitive Benefits:', 
              health_habit_content: [
                'Short breaks improve concentration by 45% (Harvard Business Review).',
                'Stepping away from work enhances memory and problem-solving skills.'
              ] },
            { title: '📊 Remote Work Reality:', 
              health_habit_content: [
                '70% of remote employees experience stress due to lack of boundaries between work & home (Workplace Wellness Report).',
                'Employees who take regular breaks report 30% higher job satisfaction.'
              ] }
        ]},
        { id: 3, 
          header: ' Simple Ways to Take Effective Breaks', 
          image: mentalImage_c, 
          sections: [
          { title: '💡 Daily Habits:', 
            health_habit_content: [
              '✔ Step outside for 2 minutes of fresh air.',
              'Stretch or do light movement to release tension.',
              'Hydrate—drink a glass of water to refresh your body & mind.'
            ] },
          { title: '🧘 Mindfulness & Relaxation:', 
            health_habit_content: [
              'Try box breathing: Inhale 4 sec, hold 4 sec, exhale 4 sec, hold 4 sec.',
              'Listen to relaxing music or ambient sounds.',
              'Read something non-work-related for a mental reset'
            ] },
            { title: '🛠 Workspace Integration:', 
              health_habit_content: [
                ' Use an on-screen break reminder to nudge you to step away.',
                'Keep a stress ball or fidget tool on your desk.',
                'Switch tasks—doing something different for a few minutes refreshes your brain.'
            ] }
        ]},
        { id: 4, 
          header: 'Long-Term Benefits of Mental Health Breaks', 
          image:mentalImage_d, 
          sections: [
          { health_habit_content: ['Better Mental Health, Better Work Performance'] },
          { title: '💙 Health Benefits Over Time:', 
            health_habit_content: [
              'Lower stress levels and improved emotional resilience.',
              'Better mood & increased motivation throughout the day.',
              'Improved sleep—breaks reduce overstimulation from constant screen exposure.'
            ] },
          { title: '📈 Boosts Productivity & Focus:', 
            health_habit_content: [
              'Employees who take breaks report 50% higher engagement at work.',
              'Regular breaks increase creativity and problem-solving by allowing the brain to reset.'
            ] },
          { title: '💡 Final Tip:', 
            health_habit_content: [
              'Breaks aren’t wasted time—they make you more productive, creative, and mentally strong. Take intentional pauses to work smarter, not harder!'
            ] }
        ]}
      ]
    },
    { id: 6, title: 'Social Interaction', image: 'placeholder.jpg', color: '#ffebcd', borderColor: '#ffa500',// Light orange
      subItems: [
        { id: 1, title: 'Stretching 1', health_habit_content: 'Neck alignment exercise', image: 'sub1.jpg' },
        { id: 2, title: 'Stretching 2', health_habit_content: 'Shoulder roll technique', image: 'sub2.jpg' },
        { id: 3, title: 'Stretching 3', health_habit_content: 'Neck alignment exercise', image: 'sub3.jpg' },
        { id: 4, title: 'Stretching 4', health_habit_content: 'Shoulder roll technique', image: 'sub4.jpg' }
      ]
    },
    { id: 7, title: 'Mindfulness', image: 'placeholder.jpg', color: '#f0f8ff', borderColor: '#00bfff',// Light cyan
      subItems: [
        { id: 1, title: 'Mindfulness 1', health_habit_content: 'Neck alignment exercise', image: 'sub1.jpg' },
        { id: 2, title: 'Mindfulness 2', health_habit_content: 'Shoulder roll technique', image: 'sub2.jpg' },
        { id: 3, title: 'Mindfulness 3', health_habit_content: 'Neck alignment exercise', image: 'sub3.jpg' },
        { id: 4, title: 'Mindfulness 4', health_habit_content: 'Shoulder roll technique', image: 'sub4.jpg' }
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
          color={selectedHabit.color}
          borderColor={selectedHabit.borderColor} // Pass border color
        />
      )}
    </div>
  );
};

export default HealthHabit;