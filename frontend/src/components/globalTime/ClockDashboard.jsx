import React from 'react';
import CityTime from './CityTime';
import './Global.css';

export default function ClockDashboard() {
    const cities = [{name: "New York", timezone: "America/New_York"}];

    return (
        <div className='world-clock'>
            <h1>Clock Dashboard</h1>
            <ul className='cities'>
                <CityTime city={cities[0]} />
            </ul> 
        </div>
    );
}