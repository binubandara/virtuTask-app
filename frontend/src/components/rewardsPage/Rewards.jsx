import React, { useState, useEffect } from 'react';
import './Rewards.css';
import reward1 from '../../assets/reward1.png';
import reward2 from '../../assets/reward2.png';
import { useNavigate } from 'react-router-dom';

const Rewards = () => {
  const [gameTimeReward, setGameTimeReward] = useState(null);
  const [monthlyReward, setMonthlyReward] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          navigate('/rewards');
          return;
        }

        const gameResponse = await fetch('http://localhost:5006/api/game-time', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (gameResponse.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }

        if (gameResponse.ok) {
          const gameData = await gameResponse.json();
          setGameTimeReward(gameData);
        }

        const monthlyResponse = await fetch('http://localhost:5006/api/monthly', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (monthlyResponse.ok) {
          const monthlyData = await monthlyResponse.json();
          setMonthlyReward(monthlyData);
        }

      } catch (err) {
        setError('Failed to connect to the server');
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, [navigate]);

  const handleClaimGameTime = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch('http://localhost:5006/api/createGame', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const newReward = await response.json();
        setGameTimeReward(newReward);
      }
    } catch (err) {
      setError('Failed to claim game time reward');
    }
  };

  if (loading) {
    return (
      <div className="rewards-container">
        <div className="loading-spinner"></div>
        <p>Loading rewards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rewards-container">
        <div className="error-message">{error}</div>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="rewards-container">
      <h1 className="rewards-heading">My Rewards</h1>

      <div className="tiles-container">
        <div className="reward-tile">
          <h2 className="tile-heading">Game Time Reward</h2>
          <div className="image-placeholder">
            <img src={reward1} alt="Game Time Reward" className="tile-image" />
          </div>
          <div className="tile-data">
            {gameTimeReward ? (
              <>
                <p>🎉 You've earned {gameTimeReward.rewardAmount} minutes!</p>
                <p>Points: {gameTimeReward.points}</p>
                <p>Date: {new Date(gameTimeReward.date).toLocaleDateString()}</p>
              </>
            ) : (
              <>
                <p>No game time reward yet today</p>
                <button 
                  className="claim-button"
                  onClick={handleClaimGameTime}
                >
                  Claim Your Game Time
                </button>
              </>
            )}
          </div>
        </div>

        <div className="reward-tile">
          <h2 className="tile-heading">Monthly Rewards</h2>
          <div className="image-placeholder">
            <img src={reward2} alt="Monthly Rewards" className="tile-image" />
          </div>
          <div className="tile-data">
            {monthlyReward && !monthlyReward.message ? (
              <>
                <p>🏆 {monthlyReward.description}</p>
                <p>Amount: {monthlyReward.rewardAmount} credits</p>
                <p>Date: {new Date(monthlyReward.date).toLocaleDateString()}</p>
              </>
            ) : (
              <p>{monthlyReward?.message || 'Monthly reward not available yet'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewards;