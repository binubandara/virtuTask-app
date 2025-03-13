import React from 'react';
import './Rewards.css';
import reward1 from '../../assets/reward1.png'; // Import the first image
import reward2 from '../../assets/reward2.png'; // Import the second image

const Rewards = () => {
  const gameTimeData = {
    title: "Game Time Reward",
    description: "You have been awarded xxxxxxx",
    progress: "Snakes and ladders (idk)",
  };

  const monthlyData = {
    title: "Monthly Rewards",
    description: "Trip to France.",
    progress: "150/200 points earned",
  };

  return (
    <div className="rewards-container">
      <h1 className="rewards-heading">My Rewards</h1>

      <div className="tiles-container">
        <div className="reward-tile">
          <h2 className="tile-heading">{gameTimeData.title}</h2>
          <div className="tile-data">
            <p>{gameTimeData.description}</p>
            <p><strong>{gameTimeData.progress}</strong></p>
          </div>
          <div className="image-placeholder">
            <img src={reward1} alt="Game Time Reward" className="tile-image" />
          </div>
        </div>

        <div className="reward-tile">
          <h2 className="tile-heading">{monthlyData.title}</h2>
          <div className="tile-data">
            <p>{monthlyData.description}</p>
            <p><strong>{monthlyData.progress}</strong></p>
          </div>
          <div className="image-placeholder">
            <img src={reward2} alt="Monthly Rewards" className="tile-image" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewards;