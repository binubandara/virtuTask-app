import React, { useState, useEffect  } from 'react';
import './HealthHabit.css';
import HabitInfo from './HabitInfo';
import postureImage_0 from '../../assets/posture0.jpg';
import postureImage_b from '../../assets/5674009.jpg';
import postureImage_d from '../../assets/Instruction for correct pose during office work.jpg';
import postureImage_e from '../../assets/3823107.jpg';
import postureImage_j from '../../assets/vect3.jpg';
import hydrationImage_0 from '../../assets/water0.jpg';
import hydrationImage_a from '../../assets/water.jpg';
import hydrationImage_b from '../../assets/w.jpg';
import hydrationImage_c from '../../assets/w3.jpg';
import hydrationImage_d from '../../assets/w4.jpg';
import eyeImage_0 from '../../assets/eye0.jpg';
import eyeImage_a from '../../assets/eye1.jpg';
import eyeImage_b from '../../assets/eye2.jpg';
import eyeImage_c from '../../assets/eye3.jpg';
import eyeImage_d from '../../assets/eye4.jpg';
import mentalImage_0 from '../../assets/mental0.jpg';
import mentalImage_a from '../../assets/mental1.jpg';
import mentalImage_b from '../../assets/mental2.jpg';
import mentalImage_c from '../../assets/mental3.jpg';
import mentalImage_d from '../../assets/mental4.jpg';
import screenImage_0 from '../../assets/screen0.jpg';
import screenImage_a from '../../assets/screen1.png';
import screenImage_b from '../../assets/screen2.jpg';
import screenImage_c from '../../assets/screen3.jpg';
import screenImage_d from '../../assets/screen4.jpg';
import mindImage_0 from '../../assets/mind0.jpg';
import mindImage_a from '../../assets/mind1.jpg';
import mindImage_b from '../../assets/mind2.jpg';
import mindImage_c from '../../assets/mind3.jpg';
import mindImage_d from '../../assets/mind4.jpg';
import socialImage_0 from '../../assets/social0.jpg';
import socialImage_a from '../../assets/social1.jpg';
import socialImage_b from '../../assets/social2.jpg';
import socialImage_c from '../../assets/social3.jpg';
import socialImage_d from '../../assets/social4.jpg';


const HealthHabit = () => {
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const tilesPerView = 4;
  const gap = 16; // Reduced gap between tiles

  const tiles = [
    { id: 1, title: 'Posture', image: postureImage_0,color: '#fcf0f2', borderColor: '#fec7d2' , // Light blue
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
    { id: 2, title: 'Hydration', image: hydrationImage_0 ,color: '#e2eafc',borderColor: '#b7cdff',// Light pink
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
    { id: 3, title: 'Eye Health', image: eyeImage_0 , color: 'rgba(253, 247, 217, 0.88)', borderColor: '#ffee9b',// Light yellow
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
    { id: 4, title: 'Mental Health Breaks', image: mentalImage_0 , color: '#f1e3fc', borderColor: '#d9a9fe', // Light purple
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
              'Step outside for 2 minutes of fresh air.',
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
                'Use an on-screen break reminder to nudge you to step away.',
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
    { id: 5, title: 'Screen Time Management', image: screenImage_0 , color: 'rgba(216, 243, 220, 0.95)', borderColor: '#a2dfab', // Light green
      subItems:  [
        { id: 1, 
          header: 'Smart Screen Time for Remote Work', 
          image: screenImage_a, 
          sections: [
          { health_habit_content: ['Balance Your Screen Time, Boost Your Well-being'] },

          { title: '✅ What to Do', 
            health_habit_content: [
              'Follow the 20-20-20 Rule: Every 20 minutes, look 20 feet away for 20 seconds.',
              'Reduce unnecessary screen exposure by prioritizing tasks and using blue light filters.',
              'Alternate screen-based tasks with offline activities to minimize strain.'
            ] },
          { title: '✅ How to Implement:', 
            health_habit_content: [
              'Enable digital wellness tools like Screen Time (Apple), Digital Wellbeing (Android), or TimeOut (Mac) to track usage.',
              'Use dark mode and night shift settings to reduce eye strain.',
              'Take handwritten notes instead of typing when possible.'
            ] },
          { title: '✅ Science Behind It:', 
            health_habit_content: [
              'Excessive screen time is linked to 40% higher risk of digital eye strain and increased mental fatigue (American Optometric Association).'
            ] }
        ]},
        { id: 2, 
          header: 'Why It Matters', 
          image: screenImage_b, 
          sections: [
            { health_habit_content: ['📉 Reduce Fatigue & Protect Your Eyes'] },
  
            { title: '🚨 The Risks of Too Much Screen Time:', 
              health_habit_content: [
                'Digital Eye Strain (DES) – 60% of remote workers report dry, irritated eyes and headaches.',
                'Disrupted Sleep – Blue light suppresses melatonin by 50%, leading to poor sleep quality.',
                'Increased Mental Exhaustion – Continuous screen use can reduce focus and productivity.'
              ] },
            { title: '🧠 Cognitive Benefits:', 
              health_habit_content: [
                'Information overload from constant screen exposure can reduce concentration.',
                'Studies show remote workers spend 30% longer on screens compared to office workers.'
              ] },
            { title: '📊 Remote Work Reality:', 
              health_habit_content: [
                '85% of remote employees feel they spend too much time on screens (Remote Work Wellness Report).',
                'Workers who manage screen time effectively report 25% higher productivity and fewer headaches.'
              ] }
        ]},
        { id: 3, 
          header: 'Healthy Screen Habits for Remote Work', 
          image: screenImage_c, 
          sections: [
          { title: '📅 Daily Habits:', 
            health_habit_content: [
              'Follow a screen-free morning routine before starting work.',
              'Schedule “off-screen” breaks—step away every hour to reduce fatigue.',
              'Blink more often to prevent dry eyes (reminder: blink 15 times per minute!).'
            ] },
          { title: '👓 Eye Protection Tips:', 
            health_habit_content: [
              'Adjust screen brightness to match ambient lighting.',
              'Position your screen an arm’s length away and at eye level.',
              'Use blue-light blocking glasses or computer screen filters for protection.'
            ] },
            { title: '🛠 Workspace Integration:', 
              health_habit_content: [
                'Set up screen reminders using apps like F.lux or Eye Care 20 20 20.',
                'Keep a notepad nearby to switch to handwriting for brainstorming.',
                'Use voice typing tools to reduce constant screen exposure.'
            ] }
        ]},
        { id: 4, 
          header: 'Long-Term Benefits of Screen Time Management ', 
          image:screenImage_d, 
          sections: [
          { health_habit_content: ['Protect Your Eyes, Boost Productivity'] },
          { title: '📈 Health Benefits Over Time:', 
            health_habit_content: [
              'Reduced eye strain and fewer headaches.',
              'Better sleep quality by limiting blue light exposure.',
              'Lower stress levels—less digital overload improves mental clarity.'
            ] },
          { title: '💼 Work Performance Gains::', 
            health_habit_content: [
              'Employees with structured screen breaks report 30% better focus.',
              'Less screen exposure means improved posture and reduced tension in the neck & shoulders.'
            ] },
          { title: '💡 Final Tip:', 
            health_habit_content: [
              'Mindful screen use isn’t about less productivity—it’s about better efficiency. Manage your screen time wisely and work smarter, not harder'
            ] }
        ]}
      ]
    },
    { id: 6, title: 'Mindfulness', image: mindImage_0 , color: 'rgba(255, 234, 220, 0.89)', borderColor: '#ffcba8',// Light orange
      subItems: [
        { id: 1, 
          header: 'Cultivate Mindfulness, Elevate Focus', 
          image: mindImage_a, 
          sections: [
          { health_habit_content: [' Stay Present, Reduce Stress, Work Better'] },

          { title: '✅ What to Do', 
            health_habit_content: [
              'Practice mindful breathing before meetings or deep-focus tasks.',
              'Use 5-minute mindfulness breaks to reset between work sessions.',
              'Engage in body scans to release tension from prolonged sitting.'
            ] },
          { title: '✅ How to Implement:', 
            health_habit_content: [
              'Use apps like Headspace or Calm for guided mindfulness exercises.',
              'Set a mindfulness reminder every few hours to check in with yourself.',
              'Try the "5-4-3-2-1" grounding technique: Notice 5 things you see, 4 things you feel, 3 things you hear, 2 things you smell, and 1 thing you taste.'
            ] },
          { title: '✅ Science Behind It:', 
            health_habit_content: [
              'Mindfulness reduces stress hormones by 31% and improves focus by 14% (American Psychological Association).'
            ] }
        ]},
        { id: 2, 
          header: 'Why It Matters', 
          image: mindImage_b, 
          sections: [
            { health_habit_content: ['Less Stress, More Clarity'] },
  
            { title: '🚨 Risks of a Distracted Mind:', 
              health_habit_content: [
                'Higher stress & burnout – Constant multitasking leads to mental fatigue.',
                'Lower productivity – A cluttered mind reduces efficiency and focus.',
                'Increased anxiety – Lack of mindfulness can amplify negative thoughts.'
              ] },
            { title: '📊 The Reality of Remote Work:', 
              health_habit_content: [
                '70% of remote workers struggle with mental distractions (Forbes).',
                'Regular mindfulness practice boosts decision-making skills by 20%.'
              ] }
        ]},
        { id: 3, 
          header: 'Simple Mindfulness Practices for Work', 
          image: mindImage_c, 
          sections: [
          { title: '🕰 Daily & Weekly Habits:', 
            health_habit_content: [
              'Start your workday with 2 minutes of deep breathing.',
              'Pause before reacting—take a breath before responding to emails.',
              'Use a mindful transition between tasks (stretch, breathe, or walk).'
            ] },
          { title: '💡 Mindful Workflows:', 
            health_habit_content: [
              'Single-tasking: Work on one thing at a time for better concentration.',
              'Mindful notifications: Turn off unnecessary alerts and check messages intentionally.',
              'Micro-meditations: Take 3 deep breaths before switching tasks.'
            ] },
            { title: '🏡 Offline Mindfulness Integration:', 
              health_habit_content: [
                'Eat lunch mindfully—focus on textures, flavors, and the experience.',
                'Step outside for fresh air and pay attention to nature.',
                'Journal for 5 minutes about your thoughts, emotions, or goals.'
            ] }
        ]},
        { id: 4, 
          header: 'Long-Term Benefits of Mindfulness ', 
          image:mindImage_d, 
          sections: [
          { health_habit_content: ['Think Clearer, Work Smarter, Feel Better'] },
          { title: '📈 Health & Work Benefits:', 
            health_habit_content: [
              'Lower stress & improved emotional resilience.',
              'Better concentration & reduced mental fatigue.',
              'Enhanced work-life balance & overall happiness..'
            ] },
          { title: '💼 Career & Productivity Gains:', 
            health_habit_content: [
              'Mindfulness boosts creativity & problem-solving by 22%.',
              'Mindful employees are 31% more engaged at work.'
            ] },
          { title: '💡 Final Tip:', 
            health_habit_content: [
              'Incorporate mindfulness into your daily routine—it’s not about stopping thoughts, but about noticing them and staying present.'
            ] }
        ]}
      ]
    },
    { id: 7, title: 'Social Connection', image: socialImage_0 , color: 'rgba(205, 255, 253, 0.75)', borderColor: '#7cf0ec',// Light cyan
      subItems: [
        { id: 1, 
          header: 'Stay Connected, Stay Energized', 
          image: socialImage_a, 
          sections: [
          { health_habit_content: ['Strengthen Social Bonds, Enhance Well-being'] },

          { title: '✅ What to Do', 
            health_habit_content: [
              'Schedule virtual coffee chats or casual check-ins with colleagues.',
              'Join online communities, Slack groups, or interest-based forums to stay socially engaged.',
              'Plan in-person meetups or coworking sessions with nearby remote workers.'
            ] },
          { title: '✅ How to Implement:', 
            health_habit_content: [
              'Use apps like Donut (Slack plugin) to match with teammates for virtual hangouts.',
              'Set a "social break" reminder to chat with a friend or colleague.',
              'Join a remote team-building activity (e.g., trivia, gaming, or online workshops).'
            ] },
          { title: '✅ Science Behind It:', 
            health_habit_content: [
              'Regular social interactions reduce stress, boost mood, and improve workplace collaboration by 20% (Harvard Business Review).'
            ] }
        ]},
        { id: 2, 
          header: 'Why It Matters', 
          image: socialImage_b, 
          sections: [
            { health_habit_content: ['Combat Isolation & Stay Engaged'] },
  
            { title: '🚨 Risks of Social Disconnection:', 
              health_habit_content: [
                'Increased stress & burnout – Lack of interaction can heighten anxiety and decrease motivation.',
                'Lower job satisfaction – Feeling disconnected leads to reduced engagement & teamwork.',
                'Reduced creativity – Collaboration sparks ideas, but isolation can limit innovation.'
              ] },
            { title: '📊 The Reality of Remote Work:', 
              health_habit_content: [
                '67% of remote workers feel lonely at least once a week (Buffer Remote Work Report).',
                'Employees with strong social connections are 21% more productive and happier at work.'
              ] }
        ]},
        { id: 3, 
          header: 'Simple Ways to Build Connection', 
          image: socialImage_c, 
          sections: [
          { title: '📅 Daily & Weekly Habits:', 
            health_habit_content: [
              'Start meetings with a casual icebreaker or a fun question.',
              'Join a virtual coworking session for motivation.',
              'Check in with a colleague or friend just to chat, not about work..'
            ] },
          { title: '💡 Building Remote-Friendly Bonds:', 
            health_habit_content: [
              'Use tools like Gather.Town or SpatialChat for a virtual office vibe.',
              'Plan a "no-work" chat session in your team’s calendar.',
              'Engage in social Slack channels (#pets, #hobbies, #music).'
            ] },
            { title: '🏡 Offline Social Integration:', 
              health_habit_content: [
                'Go outside for social interactions—grab coffee with a friend.',
                'Attend local networking events or coworking meetups.',
                'Volunteer or join a hobby group to balance online and real-life connections.'
            ] }
        ]},
        { id: 4, 
          header: 'Long-Term Benefits of Staying Social ', 
          image:socialImage_d, 
          sections: [
          { health_habit_content: ['Better Mood, Stronger Teams, More Fun!'] },
          { title: '📈 Health & Work Benefits:', 
            health_habit_content: [
              'Lower stress levels and increased job satisfaction.',
              'Stronger teamwork & collaboration skills.',
              'Higher motivation & reduced burnout.'
            ] },
          { title: '💼 Career & Productivity Gains:', 
            health_habit_content: [
              'Employees who regularly socialize report 25% higher engagement at work.',
              'Meaningful social interactions increase resilience & adaptability in remote work.'
            ] },
          { title: '💡 Final Tip:', 
            health_habit_content: [
              'Remote work doesn’t have to mean isolation—stay socially connected, and work will feel more enjoyable and energizing!'
            ] }
        ]}
      ]
    }
  ];

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? tiles.length - tilesPerView : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev >= tiles.length - tilesPerView ? 0 : prev + 1));
  };
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('healthHabitTasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  useEffect(() => {
    localStorage.setItem('healthHabitTasks', JSON.stringify(tasks));
  }, [tasks]);
  
  const [inputText, setInputText] = useState('');

  const handleAddTask = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      setTasks([...tasks, { 
        id: Date.now(), 
        text: inputText, 
        completed: false 
      }]);
      setInputText('');
    }
  };

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
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
      <div className="checklist-container">
      <div className="checklist-header">
        <h2>Checklist</h2>
        <div className="checklist-divider"></div>
      </div>
      
      <form onSubmit={handleAddTask} className="checklist-input-group">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Add a new habit to track..."
          className="checklist-input"
        />
        <button type="submit" className="checklist-add-button">
          Add Task
        </button>
      </form>
      
      <ul className="checklist-items">
        {tasks.map(task => (
          <li key={task.id} className="checklist-item">
            <label className="checklist-label">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="checklist-checkbox"
              />
              <span className={`task-text ${task.completed ? 'completed' : ''}`}>
                {task.text}
              </span>
            </label>
          </li>
        ))}
      </ul>
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