import React, { useState, useEffect } from 'react';
import { productivityService } from '../../services/api';
import SessionWidget from './SessionWidget';

const ProductivityDashboard = () => {
    const [productivityData, setProductivityData] = useState({
        totalProductiveTime: 0,
        totalUnproductiveTime: 0,
        windowTimes: []
    });

    useEffect(() => {
        const fetchProductivityData = async () => {
            try {
                const response = await productivityService.getDailySummary();
                console.log('Raw API response:', response.data);
                
                if (response.data) {
                    const data = {
                        totalProductiveTime: parseInt(response.data.totalProductiveTime) || 0,
                        totalUnproductiveTime: parseInt(response.data.totalUnproductiveTime) || 0,
                        windowTimes: response.data.windowTimes || []
                    };
                    console.log('Processed data:', data);
                    setProductivityData(data);
                }
            } catch (error) {
                console.error('Error fetching productivity data:', error);
            }
        };

        fetchProductivityData();
        const interval = setInterval(fetchProductivityData, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    const productiveWindows = productivityData.windowTimes.filter(([_, __, isProductive]) => isProductive);

    return (
        <div className="container py-4">
            <SessionWidget />
            
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0">Daily Productivity Overview</h5>
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
                                    <small className="text-muted">
                                        Raw seconds: {productivityData.totalProductiveTime}
                                    </small>
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
                                    <small className="text-muted">
                                        Raw seconds: {productivityData.totalUnproductiveTime}
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">Productive Windows</h5>
                </div>
                <div className="card-body">
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
            </div>
        </div>
    );
};

export default ProductivityDashboard;