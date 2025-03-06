import React from 'react';
import RewardItem from './RewardItem';

const RewardList = ({ rewards }) => {
  return (
    <div className="reward-list">
      {rewards.map(reward => (
        <RewardItem key={reward._id} reward={reward} />
      ))}
    </div>
  );
};

export default RewardList;