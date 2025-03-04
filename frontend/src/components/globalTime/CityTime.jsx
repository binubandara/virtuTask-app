import React, { useState, useEffect } from "react";
import ReactCountryFlag from "react-country-flag";
import { FaSun, FaMoon } from "react-icons/fa"; // Import sun and moon icons

export default function CityTime({ city, is12HourFormat, showDayNightIcon }) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    const formattedTime = time.toLocaleTimeString("en-US", {
        timeZone: city.timezone,
        hour12: is12HourFormat,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    // Determine if it's day or night (6 AM to 6 PM is day)
    const currentHour = time.toLocaleTimeString("en-US", {
        timeZone: city.timezone,
        hour: "numeric",
        hour12: false,
    });
    const isDay = currentHour >= 6 && currentHour < 18;

    return (
        <div className="city-zone">
            <h2 className="city-name">
                <ReactCountryFlag
                    countryCode={city.countryCode}
                    svg
                    style={{
                        width: "1.5em",
                        height: "1.5em",
                        marginRight: "0.5em",
                    }}
                />
                {city.name}
            </h2>
            <div className="city-time">{formattedTime}</div>
            {showDayNightIcon && (
                <div className="day-night-icon">
                    {isDay ? <FaSun className="sun" /> : <FaMoon className="moon" />}
                </div>
            )}
        </div>
    );
}