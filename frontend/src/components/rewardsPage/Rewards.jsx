import React from 'react';
import './Rewards.css';
import reward1 from '../../assets/reward1.png';
import reward2 from '../../assets/reward2.png'; 

const Rewards = () => {
  const gameTimeData = {
    title: "Game Time Reward",
    progress: "You have been awarded xxxxxxx",
  };

  const monthlyData = {
    title: "Monthly Rewards",
    progress: "Trip to France.",
  };

  return (
    <div className="rewards-container">
      <h1 className="rewards-heading">My Rewards</h1>

      <div className="tiles-container">
        <div className="reward-tile">
          <h2 className="tile-heading">{gameTimeData.title}</h2>
          <div className="image-placeholder">
            <img src={reward1} alt="Game Time Reward" className="tile-image" />
          </div>
          <div className="tile-data">
            <p>{gameTimeData.progress}</p>
          </div>
        </div>

        <div className="reward-tile">
          <h2 className="tile-heading">{monthlyData.title}</h2>
          <div className="image-placeholder">
            <img src={reward2} alt="Monthly Rewards" className="tile-image" />
          </div>
          <div className="tile-data">
            <p>{monthlyData.progress}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewards;