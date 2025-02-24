import React, { useState, useEffect, useCallback } from 'react';
import { productivityService } from '../../services/api';
import SessionWidget from './SessionWidget';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProductivityDashboard = () => {
    const [dailySummary, setDailySummary] = useState({
        totalProductiveTime: 0,
        totalUnproductiveTime: 0,
        windowTimes: []
    });
    
    const [currentSession, setCurrentSession] = useState({
        isActive: false,
        productiveTime: 0,
        unproductiveTime: 0,
        windowTimes: []
    });

    useEffect(() => {
        const fetchDailySummary = async () => {
            try {
                const response = await productivityService.getDailySummary();
                if (response.data) {
                    setDailySummary({
                        totalProductiveTime: parseInt(response.data.totalProductiveTime) || 0,
                        totalUnproductiveTime: parseInt(response.data.totalUnproductiveTime) || 0,
                        windowTimes: response.data.windowTimes || []
                    });
                }
            } catch (error) {
                console.error('Error fetching daily summary:', error);
            }
        };

        fetchDailySummary();
        const interval = setInterval(fetchDailySummary, 5000);
        return () => clearInterval(interval);
    }, []);

    // Use useCallback to memoize the function
    const handleSessionUpdate = useCallback((sessionData) => {
        setCurrentSession(sessionData);
    }, []);

    // Updated formatTime function to include seconds for current session
    const formatTime = (seconds, includeSeconds = false) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (includeSeconds) {
            const secs = seconds % 60;
            return `${hours}h ${minutes}m ${secs}s`;
        }
        
        return `${hours}h ${minutes}m`;
    };

    // Prepare pie chart data for time distribution
    const timeDistributionData = {
        labels: ['Productive', 'Unproductive'],
        datasets: [
            {
                data: [dailySummary.totalProductiveTime, dailySummary.totalUnproductiveTime],
                backgroundColor: ['rgba(40, 167, 69, 0.6)', 'rgba(220, 53, 69, 0.6)'],
                borderColor: ['rgba(40, 167, 69, 1)', 'rgba(220, 53, 69, 1)'],
                borderWidth: 1,
            },
        ],
    };

    // Prepare bar chart data for top windows
    const topWindows = dailySummary.windowTimes
        .filter(([_, __, isProductive]) => isProductive)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const windowBarData = {
        labels: topWindows.map(([window]) => window.length > 20 ? window.substring(0, 20) + '...' : window),
        datasets: [
            {
                label: 'Time (minutes)',
                data: topWindows.map(([_, time]) => Math.round(time / 60)),
                backgroundColor: 'rgba(13, 110, 253, 0.6)',
                borderColor: 'rgba(13, 110, 253, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="container py-4">
            <SessionWidget onSessionUpdate={handleSessionUpdate} />
            
            {/* Current Session Overview (only shown when active) */}
            {currentSession.isActive && (
                <div className="card mb-4">
                    <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">Current Session</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-4">
                            <div className="col-md-6">
                                <div className="card h-100 bg-success bg-opacity-10 border-success">
                                    <div className="card-body">
                                        <h6 className="text-success">Productive Time</h6>
                                        <h4 className="mb-0 fw-bold text-success">
                                            {formatTime(currentSession.productiveTime, true)}
                                        </h4>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="card h-100 bg-danger bg-opacity-10 border-danger">
                                    <div className="card-body">
                                        <h6 className="text-danger">Unproductive Time</h6>
                                        <h4 className="mb-0 fw-bold text-danger">
                                            {formatTime(currentSession.unproductiveTime, true)}
                                        </h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Daily Summary Dashboard */}
            <div className="card mb-4">
                <div className="card-header bg-dark text-white">
                    <h5 className="mb-0">Daily Productivity Summary</h5>
                </div>
                <div className="card-body">
                    <div className="row g-4 mb-4">
                        <div className="col-md-6">
                            <div className="card h-100 bg-success bg-opacity-10 border-success">
                                <div className="card-body">
                                    <h6 className="text-success">Total Productive Time Today</h6>
                                    <h4 className="mb-0 fw-bold text-success">
                                        {formatTime(dailySummary.totalProductiveTime)}
                                    </h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card h-100 bg-danger bg-opacity-10 border-danger">
                                <div className="card-body">
                                    <h6 className="text-danger">Total Unproductive Time Today</h6>
                                    <h4 className="mb-0 fw-bold text-danger">
                                        {formatTime(dailySummary.totalUnproductiveTime)}
                                    </h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4">
                        {/* Pie Chart - Time Distribution */}
                        <div className="col-md-6">
                            <div className="card h-100">
                                <div className="card-header">
                                    <h6 className="mb-0">Productivity Distribution</h6>
                                </div>
                                <div className="card-body d-flex justify-content-center align-items-center">
                                    <div style={{ maxHeight: '300px', maxWidth: '300px' }}>
                                        <Pie data={timeDistributionData} options={{ responsive: true, maintainAspectRatio: true }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Bar Chart - Top Productive Windows */}
                        <div className="col-md-6">
                            <div className="card h-100">
                                <div className="card-header">
                                    <h6 className="mb-0">Top Productive Windows</h6>
                                </div>
                                <div className="card-body">
                                    <Bar 
                                        data={windowBarData} 
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { display: false },
                                                title: { display: false }
                                            },
                                            scales: {
                                                y: { title: { display: true, text: 'Minutes' } }
                                            }
                                        }} 
                                        height={200}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Top Productive Windows List */}
            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">All Productive Windows Today</h5>
                </div>
                <div className="card-body">
                    <div className="list-group">
                        {dailySummary.windowTimes
                            .filter(([_, __, isProductive]) => isProductive)
                            .sort((a, b) => b[1] - a[1])
                            .map(([window, time], index) => (
                                <div 
                                    key={index} 
                                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center bg-success bg-opacity-10"
                                >
                                    <span className="fw-medium">{window}</span>
                                    <span className="text-muted">
                                        {formatTime(time)}
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductivityDashboard;