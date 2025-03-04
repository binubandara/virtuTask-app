import React, { useState, useEffect, useCallback } from 'react';
import { productivityService } from '../../services/api';
import SessionWidget from './SessionWidget';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProductivityDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [authenticated, setAuthenticated] = useState(false);
    
    const [dailySummary, setDailySummary] = useState({
        totalProductiveTime: 0,
        totalUnproductiveTime: 0,
        productivityScore: 0,
        windowTimes: []
    });
    
    const [currentSession, setCurrentSession] = useState({
        isActive: false,
        productiveTime: 0,
        unproductiveTime: 0,
        windowTimes: []
    });

    // Verify token when component mounts
    useEffect(() => {
        const verifyAndFetchData = async () => {
            setLoading(true);
            try {
                // First verify token with the productivity backend
                await productivityService.verifyToken();
                setAuthenticated(true);
                
                // Then fetch initial data
                const response = await productivityService.getDailySummary();
                if (response.data) {
                    setDailySummary({
                        totalProductiveTime: parseInt(response.data.totalProductiveTime) || 0,
                        totalUnproductiveTime: parseInt(response.data.totalUnproductiveTime) || 0,
                        productivityScore: parseFloat(response.data.productivityScore) || 0,
                        windowTimes: response.data.windowTimes || []
                    });
                }
                setError(null);
            } catch (error) {
                console.error('Authentication or data loading error:', error);
                setError(error.userMessage || 'Failed to authenticate with the productivity service');
                
                // If there's an authentication error, redirect to login
                if (error.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        verifyAndFetchData();
    }, [navigate]);

    // Set up polling for data updates only after successful authentication
    useEffect(() => {
        if (!authenticated) return;
        
        const fetchDailySummary = async () => {
            try {
                const response = await productivityService.getDailySummary();
                if (response.data) {
                    setDailySummary({
                        totalProductiveTime: parseInt(response.data.totalProductiveTime) || 0,
                        totalUnproductiveTime: parseInt(response.data.totalUnproductiveTime) || 0,
                        productivityScore: parseFloat(response.data.productivityScore) || 0,
                        windowTimes: response.data.windowTimes || []
                    });
                }
            } catch (error) {
                console.error('Error fetching daily summary:', error);
                // Only set error if it's not an auth error (which would be handled by the interceptor)
                if (error.response?.status !== 401) {
                    setError('Failed to update productivity data');
                }
            }
        };

        const interval = setInterval(fetchDailySummary, 5000);
        return () => clearInterval(interval);
    }, [authenticated]);

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

    // Get score color based on productivity score
    const getScoreColor = (score) => {
        if (score >= 75) return 'success';
        if (score >= 50) return 'warning';
        return 'danger';
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

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Authenticating and loading your productivity data...</p>
            </div>
        );
    }

    if (error && !authenticated) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Authentication Error</h4>
                    <p>{error}</p>
                    <hr />
                    <p className="mb-0">
                        <button 
                            className="btn btn-outline-danger" 
                            onClick={() => navigate('/login')}
                        >
                            Return to Login
                        </button>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            {error && (
                <div className="alert alert-warning alert-dismissible fade show" role="alert">
                    <strong>Warning:</strong> {error}
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setError(null)}></button>
                </div>
            )}
            
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
                        {/* Productivity Score Card */}
                        <div className="col-md-4">
                            <div className={`card h-100 bg-${getScoreColor(dailySummary.productivityScore)} bg-opacity-10 border-${getScoreColor(dailySummary.productivityScore)}`}>
                                <div className="card-body text-center">
                                    <h6 className={`text-${getScoreColor(dailySummary.productivityScore)}`}>Productivity Score</h6>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <div className={`display-3 fw-bold text-${getScoreColor(dailySummary.productivityScore)}`}>
                                            {Math.round(dailySummary.productivityScore)}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-md-4">
                            <div className="card h-100 bg-success bg-opacity-10 border-success">
                                <div className="card-body">
                                    <h6 className="text-success">Total Productive Time Today</h6>
                                    <h4 className="mb-0 fw-bold text-success">
                                        {formatTime(dailySummary.totalProductiveTime)}
                                    </h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
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