import React, { useState } from 'react';
import CityTime from './CityTime';
import './Global.css';

export default function ClockDashboard() {
    const [is12HourFormat, setIs12HourFormat] = useState(false);

    const toggleTimeFormat = () => {
        setIs12HourFormat(prevFormat => !prevFormat);
    };

    const cities = [
        { name: "New York", timezone: "America/New_York", countryCode: "US" },
        { name: "London", timezone: "Europe/London", countryCode: "GB" },
        { name: "Melbourne", timezone: "Australia/Melbourne", countryCode: "AU" },
        { name: "Tokyo", timezone: "Asia/Tokyo", countryCode: "JP" },
        { name: "Colombo", timezone: "Asia/Colombo", countryCode: "LK" },
        { name: "Paris", timezone: "Europe/Paris", countryCode: "FR" },
        { name: "Manila", timezone: "Asia/Manila", countryCode: "PH" },
        { name: "Seoul", timezone: "Asia/Seoul", countryCode: "KR" },
    ];

    return (
        <div className="dashboard-container">
            <button className="toggle-btn" onClick={toggleTimeFormat}>
                {is12HourFormat ? "Switch to 24-Hour Format" : "Switch to 12-Hour Format"}
            </button>

            <div className='cities'>
                {cities.map((city, index) => (
                    <CityTime city={city} key={index} is12HourFormat={is12HourFormat} />
                ))}
            </div> 
        </div>
    );
}