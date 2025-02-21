import React, { useState, useEffect } from 'react';
import { productivityService } from '../../services/api';
import SessionWidget from './SessionWidget';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);

const ProductivityDashboard = () => {
    const [productivityData, setProductivityData] = useState({
        totalProductiveTime: 0,
        totalUnproductiveTime: 0,
        windowTimes: []
    });
    
    const [viewMode, setViewMode] = useState('daily');
    const [sessionActive, setSessionActive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSessionData = async () => {
        try {
            const sessionResponse = await productivityService.getCurrentSession();
            return {
                totalProductiveTime: parseInt(sessionResponse.data.totalProductiveTime) || 0,
                totalUnproductiveTime: parseInt(sessionResponse.data.totalUnproductiveTime) || 0,
                windowTimes: sessionResponse.data.windowTimes || []
            };
        } catch (error) {
            console.error('Error fetching session data:', error);
            return null;
        }
    };

    const fetchDailyData = async () => {
        try {
            const dailyResponse = await productivityService.getDailySummary();
            return {
                totalProductiveTime: parseInt(dailyResponse.data.totalProductiveTime) || 0,
                totalUnproductiveTime: parseInt(dailyResponse.data.totalUnproductiveTime) || 0,
                windowTimes: dailyResponse.data.windowTimes || []
            };
        } catch (error) {
            console.error('Error fetching daily data:', error);
            return null;
        }
    };

    const checkSessionStatus = async () => {
        try {
            const sessionResponse = await productivityService.getCurrentSession();
            return sessionResponse.data.sessionActive;
        } catch (error) {
            console.error('Error checking session status:', error);
            return false;
        }
    };

    useEffect(() => {
        let intervalId;

        const updateData = async () => {
            setIsLoading(true);
            
            // First check session status
            const isSessionActive = await checkSessionStatus();
            setSessionActive(isSessionActive);

            // If no active session, force daily view
            if (!isSessionActive) {
                setViewMode('daily');
                const dailyData = await fetchDailyData();
                if (dailyData) {
                    setProductivityData(dailyData);
                }
            } else {
                // If session is active, fetch appropriate data based on viewMode
                const data = viewMode === 'session' ? 
                    await fetchSessionData() : 
                    await fetchDailyData();
                
                if (data) {
                    setProductivityData(data);
                }
            }
            
            setIsLoading(false);
        };

        updateData();
        intervalId = setInterval(updateData, 5000);

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [viewMode]);

    const handleSessionStateChange = async (isActive) => {
        setSessionActive(isActive);
        if (isActive) {
            setViewMode('session');
        } else {
            setViewMode('daily');
        }
    };

    const handleViewModeChange = (newMode) => {
        setViewMode(newMode);
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    const cleanWindowTitle = (title) => {
        let cleaned = title.replace(/[^:]+\.exe:/, '');
        cleaned = cleaned.replace(/\s-\s.*?\s-\s/, ' - ');
        return cleaned;
    };

    const productiveWindows = productivityData.windowTimes
        .filter(([_, __, isProductive]) => isProductive)
        .map(([title, time, isProductive]) => [cleanWindowTitle(title), time, isProductive]);

    const pieChartData = {
        labels: ['Productive', 'Unproductive'],
        datasets: [
            {
                data: [productivityData.totalProductiveTime, productivityData.totalUnproductiveTime],
                backgroundColor: ['rgba(75, 192, 112, 0.8)', 'rgba(255, 99, 132, 0.8)'],
                borderColor: ['rgba(75, 192, 112, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1,
            },
        ],
    };

    const topProductiveWindows = productiveWindows.slice(0, 5);
    const barChartData = {
        labels: topProductiveWindows.map(([title]) => title),
        datasets: [
            {
                label: 'Time Spent (seconds)',
                data: topProductiveWindows.map(([_, time]) => time),
                backgroundColor: 'rgba(118, 189, 252, 0.8)',
                borderColor: 'rgb(44, 163, 165)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="container py-4">
            <SessionWidget 
                onSessionStateChange={(isActive) => {
                    setSessionActive(isActive);
                    // Default to session view when session starts
                    if (isActive) setViewMode('session');
                    else setViewMode('daily');
                }}
            />
            
            {/* Only show view toggle when session is active */}
            {sessionActive && (
                <div className="mb-3">
                    <div className="btn-group w-100">
                        <button 
                            className={`btn ${viewMode === 'session' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setViewMode('session')}
                        >
                            Current Session
                        </button>
                        <button 
                            className={`btn ${viewMode === 'daily' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setViewMode('daily')}
                        >
                            Daily Summary
                        </button>
                    </div>
                </div>
            )}
            
            {/* Current Session View (simple layout) */}
            {viewMode === 'session' && sessionActive && (
                <div className="card mb-4">
                    <div className="card-header">
                        <h5 className="mb-0">Current Session Overview</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-4">
                            <div className="col-md-6">
                                <div className="card h-100 bg-success bg-opacity-10 border-success">
                                    <div className="card-body">
                                        <h6 className="text-success">Productive Time</h6>
                                        <h4 className="mb-0 fw-bold text-success">
                                            {formatTime(productivityData.totalProductiveTime)}
                                        </h4>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="card h-100 bg-danger bg-opacity-10 border-danger">
                                    <div className="card-body">
                                        <h6 className="text-danger">Unproductive Time</h6>
                                        <h4 className="mb-0 fw-bold text-danger">
                                            {formatTime(productivityData.totalUnproductiveTime)}
                                        </h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Productive windows for current session */}
                        {productiveWindows.length > 0 && (
                            <div className="mt-4">
                                <h6 className="mb-3">Productive Applications</h6>
                                <div className="list-group">
                                    {productiveWindows.map(([window, time], index) => (
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
                        )}
                    </div>
                </div>
            )}
            
            {/* Daily Summary View (enhanced with charts) */}
            {(viewMode === 'daily' || !sessionActive) && (
                <>
                    <div className="card mb-4">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">Daily Productivity Summary</h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-4 mb-4">
                                <div className="col-md-6">
                                    <div className="card h-100 shadow-sm">
                                        <div className="card-body text-center">
                                            <h6 className="text-primary mb-3">Productivity Distribution</h6>
                                            <div style={{ height: '250px' }}>
                                                <Pie 
                                                    data={pieChartData} 
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        plugins: {
                                                            legend: {
                                                                position: 'bottom'
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card h-100 shadow-sm">
                                        <div className="card-body p-3">
                                            <div className="row">
                                                <div className="col-6">
                                                    <div className="p-3 rounded bg-success bg-opacity-10">
                                                        <div className="small text-success mb-1">Productive Time</div>
                                                        <h3 className="fw-bold text-success mb-0">
                                                            {formatTime(productivityData.totalProductiveTime)}
                                                        </h3>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="p-3 rounded bg-danger bg-opacity-10">
                                                        <div className="small text-danger mb-1">Unproductive Time</div>
                                                        <h3 className="fw-bold text-danger mb-0">
                                                            {formatTime(productivityData.totalUnproductiveTime)}
                                                        </h3>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-3">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="fw-medium">Productivity Score</span>
                                                    <span className="badge bg-primary rounded-pill">
                                                        {productivityData.totalProductiveTime + productivityData.totalUnproductiveTime > 0 
                                                            ? Math.round((productivityData.totalProductiveTime / 
                                                                (productivityData.totalProductiveTime + productivityData.totalUnproductiveTime)) * 100) 
                                                            : 0}%
                                                    </span>
                                                </div>
                                                <div className="progress" style={{ height: '8px' }}>
                                                    <div 
                                                        className="progress-bar bg-success" 
                                                        style={{ 
                                                            width: `${productivityData.totalProductiveTime + productivityData.totalUnproductiveTime > 0 
                                                                ? (productivityData.totalProductiveTime / 
                                                                    (productivityData.totalProductiveTime + productivityData.totalUnproductiveTime)) * 100 
                                                                : 0}%` 
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {topProductiveWindows.length > 0 && (
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <h6 className="text-primary mb-3">Top Productive Applications</h6>
                                        <div style={{ height: '300px' }}>
                                            <Bar 
                                                data={barChartData}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    scales: {
                                                        y: {
                                                            beginAtZero: true,
                                                            title: {
                                                                display: true,
                                                                text: 'Time (seconds)'
                                                            }
                                                        },
                                                        x: {
                                                            title: {
                                                                display: true,
                                                                text: 'Applications'
                                                            }
                                                        }
                                                    },
                                                    plugins: {
                                                        legend: {
                                                            display: false
                                                        },
                                                        title: {
                                                            display: true,
                                                            text: 'Time Spent in Productive Applications'
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {productiveWindows.length > 0 && (
                        <div className="card mb-4 shadow-sm">
                            <div className="card-header bg-success text-white">
                                <h5 className="mb-0">Productive Applications Breakdown</h5>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Application</th>
                                                <th className="text-end">Time Spent</th>
                                                <th className="text-end">Percentage</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productiveWindows.map(([window, time], index) => {
                                                const percentage = productivityData.totalProductiveTime > 0 
                                                    ? ((time / productivityData.totalProductiveTime) * 100).toFixed(1)
                                                    : '0.0';
                                                    
                                                return (
                                                    <tr key={index}>
                                                        <td>{window}</td>
                                                        <td className="text-end">{formatTime(time)}</td>
                                                        <td className="text-end">{percentage}%</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProductivityDashboard;