import React, { useState } from 'react';
import CityTime from './CityTime';
import './Global.css';

export default function ClockDashboard() {
    const [is12HourFormat, setIs12HourFormat] = useState(false);

    const toggleTimeFormat = () => {
        setIs12HourFormat(prevFormat => !prevFormat);
    };

    const cities = [
        { name: "New York", timezone: "America/New_York" },
        { name: "London", timezone: "Europe/London" },
        { name: "Melbourne", timezone: "Australia/Melbourne" },
        { name: "Tokyo", timezone: "Asia/Tokyo" },
        { name: "Colombo", timezone: "Asia/Colombo" },
        { name: "Kuala Lumpur", timezone: "Asia/Kuala_Lumpur" },
        { name: "Manila", timezone: "Asia/Manila" },
        { name: "Seoul", timezone: "Asia/Seoul" },
    ];

    return (
        <div className="dashboard-container">
            {/* Toggle Button */}
            <button className="toggle-btn" onClick={toggleTimeFormat}>
                {is12HourFormat ? "Switch to 24-Hour Format" : "Switch to 12-Hour Format"}
            </button>

            {/* City Time Display */}
            <div className='cities'>
                {cities.map((city, index) => (
                    <CityTime city={city} key={index} is12HourFormat={is12HourFormat} />
                ))}
            </div> 
        </div>
    );
}
