import React from 'react';
import './Rewards.css';
import reward1 from '../../assets/reward1.png'; 
import reward2 from '../../assets/reward2.png';

const Rewards = () => {
  return (
    <div className="rewards-container">
      <h1 className="rewards-heading">My Rewards</h1>

      <div className="tiles-container">
        <div className="reward-tile">
          <h2 className="tile-heading">Game Time Reward</h2>
          <div className="image-placeholder">
            <img src={reward1} alt="Game Time Reward" className="tile-image" />
          </div>
        </div>

        <div className="reward-tile">
          <h2 className="tile-heading">Monthly Rewards</h2>
          <div className="image-placeholder">
            <img src={reward2} alt="Monthly Rewards" className="tile-image" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewards;