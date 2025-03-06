import React from 'react';
import moment from 'moment';

const RewardItem = ({ reward }) => {
  return (
    <div className="reward-item">
      <h3>{reward.name}</h3>
      <p>Points: {reward.points}</p>
      <p>Amount: {reward.rewardAmount}</p>
      <p>Date: {moment(reward.date).format('MMMM DD, YYYY')}</p>
      <p>Description: {reward.description}</p>
    </div>
  );
};

export default RewardItem;