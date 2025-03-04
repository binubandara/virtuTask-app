import React from 'react';
import CityTime from './CityTime';
import './Global.css';

export default function ClockDashboard() {
    const cities = [{name: "New York", timezone: "America/New_York"},
        {name: "London", timezone: "Europe/London"},

    ];

    return (
        <div className='world-clock'>
            <h1>Clock Dashboard</h1>
            <ul className='cities'>
                {cities.map((city, index) => (
                    <CityTime city={city} key={index} />
                ))}
            </ul> 
        </div>
    );
}