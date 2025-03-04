import React, { useState, useEffect } from "react";

export default function CityTime({ city, is12HourFormat }) {
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

    return (
        <div className="city-zone">
            <h2 className="city-name">{city.name}</h2>
            <div className="city-time">{formattedTime}</div>
        </div>
    );
}
