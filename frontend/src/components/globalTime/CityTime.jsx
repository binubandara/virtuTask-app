import React, { useState, useEffect } from "react";
import ReactCountryFlag from "react-country-flag";
import { FaSun, FaMoon } from "react-icons/fa"; 

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

    const currentHour = time.toLocaleTimeString("en-US", {
        timeZone: city.timezone,
        hour: "numeric",
        hour12: false,
    });
    const isDay = currentHour >= 6 && currentHour < 18;

    return (
        <div className="city-zone">
            <ReactCountryFlag
                countryCode={city.countryCode}
                svg
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%", 
                    opacity: 0.2, 
                    zIndex: 1, 
                }}
            />
            <div style={{ position: "relative", zIndex: 2 }}>
                <h2 className="city-name">{city.name}</h2>
                <div className="city-time">{formattedTime}</div>
            </div>
            {showDayNightIcon && (
                <div className="day-night-icon">
                    {isDay ? <FaSun className="sun" /> : <FaMoon className="moon" />}
                </div>
            )}
        </div>
    );
}