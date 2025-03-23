import React, { useContext, useState } from "react";
import Button from "./Button";
import { SettingContext } from "../../context/SettingsContext";

const SetPomodoro = () => {
  const [newTimer, setNewTimer] = useState({
    work: 5,
    short: 2,
    long: 10,
    active: "work",
  });

  const { updateExecute } = useContext(SettingContext);

  const handleChange = (input) => {
    const { name, value } = input.target;
    setNewTimer((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0, 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateExecute(newTimer);
  };

  return (
    <div className="form-container" style={{ margin: 0, width: '100%', textAlign: 'center' }}>
      <h1 className="focus-title">FOCUS MODE</h1>
      <small className='focus-desc'>Be productive the right way</small>
      <form noValidate onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <input className="input" name="work" onChange={handleChange} value={newTimer.work} />
          <input className="input" name="short" onChange={handleChange} value={newTimer.short} />
          <input className="input" name="long" onChange={handleChange} value={newTimer.long} />
        </div>
        <Button type="submit" title="Set Timer" />
      </form>
    </div>
  );
};

export default SetPomodoro;