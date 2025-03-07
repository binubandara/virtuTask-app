import React from "react";
import { useContext, useEffect } from "react";
import { SettingContext } from "./context/SettingsContext";
import SetPomodoro from "./component/SetPomodoro";
import CountdownAnimation from './component/CountDownAnimation';
import Button from "./component/Button"; 
import TaskList from "./component/TaskList"; 

function App() {
  const {
    pomodoro, 
    executing, 
    setCurrentTimer,
    SettingBtn,
    startAnimate,
    startTimer,
    pauseTimer,
    updateExecute
  } = useContext(SettingContext);

  useEffect(() => {
    console.log("Pomodoro value updated:", pomodoro);
  }, [pomodoro]);

  useEffect(() => {
    updateExecute(executing);
  }, [executing, startAnimate, updateExecute]); 

  return (
    <div className="container">
      <h1>Focus Mode</h1>
      <small>Be productive the right way</small>
      {pomodoro !== 0 ? (
        <>
          <ul className="labels">
            <li>
              <Button
                title="Work"
                activeClass={executing.active === 'work' ? 'active-label' : undefined}
                _callback={() => setCurrentTimer('work')}
              />
            </li>
            <li>
              <Button
                title="Short Break"
                activeClass={executing.active === 'short' ? 'active-label' : undefined}
                _callback={() => setCurrentTimer('short')}
              />
            </li>
            <li>
              <Button
                title="Long Break"
                activeClass={executing.active === 'long' ? 'active-label' : undefined}
                _callback={() => setCurrentTimer('long')}
              />
            </li>
          </ul>
          
          <div className="settings-button">
            <Button title="Settings" _callback={SettingBtn} />
          </div>

          <div className={"time-container"}>
            <div className="time-wrapper">
              <CountdownAnimation
                key={pomodoro}
                timer={pomodoro}
                animate={startAnimate}
              />
            </div>
          </div>

          <div className="button-swapper">
            <Button title="Start" activeClass={!startAnimate ? 'active' : undefined} _callback={startTimer} />
            <Button title="Pause" activeClass={startAnimate ? 'active' : undefined} _callback={pauseTimer} />
          </div>
      
          <TaskList />

        </>
      ) : (
        <SetPomodoro />
      )}
    </div>
  );
}

export default App;
