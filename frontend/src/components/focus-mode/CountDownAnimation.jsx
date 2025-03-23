import React, { useContext } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { SettingContext } from "../../context/SettingsContext";
import { TaskContext } from "../../context/TaskContext";

const CountdownAnimation = ({ taskId, timer = 20, animate = true }) => {
  const { stopTimer } = useContext(SettingContext);
  const { logFocusSession } = useContext(TaskContext); // Get function from context

  return (
    <CountdownCircleTimer
      isPlaying={animate}
      duration={timer * 60}
      colors={["#159075"]}
      strokeWidth={6}
      size={240}
      trailColor="#151932"
      onComplete={() => {
        stopTimer();
        
        // Log the completed focus session
        if (taskId) {
          logFocusSession(taskId, timer);
        }

        return { shouldRepeat: false };
      }}
    >
      {({ remainingTime }) => {
        // Convert seconds to minutes and seconds
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;

        return (
          <div className="timer-text">
            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </div>
        );
      }}
    </CountdownCircleTimer>
  );
};

export default CountdownAnimation;