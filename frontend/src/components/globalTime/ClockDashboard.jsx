import React, { useState } from "react";
import CityTime from "./CityTime";
import "./Global.css";

export default function ClockDashboard() {
    const [is12HourFormat, setIs12HourFormat] = useState(false);
    const [showDayNightIcons, setShowDayNightIcons] = useState(true);

    const toggleTimeFormat = () => {
        setIs12HourFormat((prevFormat) => !prevFormat);
    };

    const toggleDayNightIcons = () => {
        setShowDayNightIcons((prev) => !prev);
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
           { name: "Dubai", timezone: "Asia/Dubai", countryCode: "AE" },
    { name: "Toronto", timezone: "America/Toronto", countryCode: "CA" }
    ];

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-heading">World Clock Dashboard</h1>
            <div className="button-container">
                <button className="toggle-btn" onClick={toggleTimeFormat}>
                    {is12HourFormat ? "24-Hour Format" : "12-Hour Format"}
                </button>
                <button className="toggle-btn" onClick={toggleDayNightIcons}>
                    {showDayNightIcons ? "Hide Icons" : "Show Icons"}
                </button>
            </div>

            <div className="cities">
                {cities.map((city, index) => (
                    <CityTime
                        city={city}
                        key={index}
                        is12HourFormat={is12HourFormat}
                        showDayNightIcon={showDayNightIcons}
                    />
                ))}
            </div>
        </div>
    );
}