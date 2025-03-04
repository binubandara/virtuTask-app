import React, { useState } from "react";

export default function CityTime({ city }) {
    const[time, setTime] = useState(new Date());

    const formattedTime = time.toLocaleTimeString("en-US", {
        timeZone: city.timezone,
    });

    return(
        <div className="city-zone">
            <h2 className="city-name">{city.name}
            </h2>
            <div className="city-time">
                {formattedTime}</div>
        </div>
    );
}