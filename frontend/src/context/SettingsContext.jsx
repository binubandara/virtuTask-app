import React, { createContext, useState } from "react";

export const SettingContext = createContext();

function SettingContextProvider({ children }) {
  const [pomodoro, setPomodoro] = useState(0);
  const [executing, setExecuting] = useState({});
  const [startAnimate, setStartAnimate] = useState(false);

  function setCurrentTimer(active_state) {
    setExecuting((prev) => ({ ...prev, active: active_state }));
    setTimerTime(executing);
  }

  function startTimer() {
    setStartAnimate(true);
  }
  function pauseTimer() {
    setStartAnimate(false);
  }
  function stopTimer() {
    setStartAnimate(false);
  }

  const SettingBtn = () => {
    setExecuting({});
    setPomodoro(0);
  };

  const updateExecute = (updatedSettings) => {
    setExecuting(updatedSettings);
    setTimerTime(updatedSettings);
  };

  const setTimerTime = (evaluate) => {
    setPomodoro(evaluate[evaluate.active] || 0);
    console.log("Pomodoro value: ", evaluate[evaluate.active]);
  };
  

  return (
    <SettingContext.Provider
      value={{
        stopTimer,
        updateExecute,
        pomodoro,
        executing,
        startAnimate,
        startTimer,
        pauseTimer,
        SettingBtn,
        setCurrentTimer,
      }}
    >
      {children}
    </SettingContext.Provider>
  );
}

export default SettingContextProvider;