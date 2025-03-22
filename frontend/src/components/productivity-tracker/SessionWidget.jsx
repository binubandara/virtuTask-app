import React, { useState, useEffect, useRef } from 'react';
import { productivityService } from '../../services/api';

const SessionWidget = ({ onSessionUpdate }) => {
    const [expanded, setExpanded] = useState(false);
    const [sessionName, setSessionName] = useState('');
    const [sessionActive, setSessionActive] = useState(false);
    const [reportId, setReportId] = useState(null);
    const [error, setError] = useState(null);
    const [sessionStartTime, setSessionStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    
    // Current session data
    const [currentProductiveTime, setCurrentProductiveTime] = useState(0);
    const [currentUnproductiveTime, setCurrentUnproductiveTime] = useState(0);
    const [currentWindows, setCurrentWindows] = useState([]);
    
    // Use refs to store the latest state values without causing re-renders
    const productiveTimeRef = useRef(currentProductiveTime);
    const unproductiveTimeRef = useRef(currentUnproductiveTime);
    const windowsRef = useRef(currentWindows);
    
    // Update refs when state changes
    useEffect(() => {
        productiveTimeRef.current = currentProductiveTime;
    }, [currentProductiveTime]);
    
    useEffect(() => {
        unproductiveTimeRef.current = currentUnproductiveTime;
    }, [currentUnproductiveTime]);
    
    useEffect(() => {
        windowsRef.current = currentWindows;
    }, [currentWindows]);

    // Single effect for session activity management
    useEffect(() => {
        let dataTimer;
        
        if (sessionActive) {
            // Initial update to parent
            onSessionUpdate({
                isActive: true,
                productiveTime: productiveTimeRef.current,
                unproductiveTime: unproductiveTimeRef.current,
                windowTimes: windowsRef.current
            });
            
            // Set up timer to update session data
            dataTimer = setInterval(() => {
                // Update productive time
                setCurrentProductiveTime(prev => {
                    const newValue = prev + (Math.random() > 0.3 ? 2 : 0);
                    return newValue;
                });
                
                // Update unproductive time
                setCurrentUnproductiveTime(prev => {
                    const newValue = prev + (Math.random() > 0.7 ? 1 : 0);
                    return newValue;
                });
                
                // Use a slight delay to ensure state has updated before notifying parent
                setTimeout(() => {
                    onSessionUpdate({
                        isActive: true,
                        productiveTime: productiveTimeRef.current,
                        unproductiveTime: unproductiveTimeRef.current,
                        windowTimes: windowsRef.current
                    });
                }, 0);
                
            }, 2000);
        } else {
            // Reset session data and notify parent
            setCurrentProductiveTime(0);
            setCurrentUnproductiveTime(0);
            setCurrentWindows([]);
            
            onSessionUpdate({
                isActive: false,
                productiveTime: 0,
                unproductiveTime: 0,
                windowTimes: []
            });
        }
        
        return () => {
            clearInterval(dataTimer);
        };
    }, [sessionActive, onSessionUpdate]);

    // Timer for elapsed time display
    useEffect(() => {
        let timer;
        if (sessionActive && sessionStartTime) {
            timer = setInterval(() => {
                const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
                setElapsedTime(elapsed);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [sessionActive, sessionStartTime]);

    const formatElapsedTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartSession = async () => {
        if (!sessionName.trim()) {
            setError('Please enter a session name');
            return;
        }

        try {
            const response = await productivityService.startSession(sessionName.trim());

            if (response.data.status === 'success') {
                setSessionActive(true);
                setSessionStartTime(Date.now());
                setError(null);
                setReportId(null);
                
                // Reset current session counters
                setCurrentProductiveTime(0);
                setCurrentUnproductiveTime(0);
                setCurrentWindows([]);
            } else {
                setError(response.data.message || 'Failed to start session');
            }
        } catch (error) {
            setError('Failed to connect to server. Please check if the backend is running.');
        }
    };

    const handleEndSession = async () => {
        try {
            const response = await productivityService.endSession();

            if (response.data.status === 'success') {
                setSessionActive(false);
                setReportId(response.data.report_id);
                setSessionStartTime(null);
                setElapsedTime(0);
                setError(null);
            } else {
                setError(response.data.message || 'Failed to end session');
            }
        } catch (error) {
            console.error('End session error:', error);
            setError('Failed to end session. Please try again.');
        }
    };

    const handleDownloadReport = async () => {
        if (!reportId) {
            setError('No report available');
            return;
        }

        try {
            const response = await productivityService.downloadReport(reportId);
            
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `report_${sessionName}_${new Date().toISOString()}.pdf`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            setError(
                error.response?.data?.message ||
                'Failed to download report. Please try again.'
            );
        }
    };

    return (
        <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                    <i className="bi bi-clock me-2"></i>
                    <h5 className="mb-0">Session Management</h5>
                </div>
                <button
                    className="btn btn-link"
                    onClick={() => setExpanded(!expanded)}
                >
                    <i className={`bi bi-chevron-${expanded ? 'up' : 'down'}`}></i>
                </button>
            </div>

            <div className={`collapse ${expanded ? 'show' : ''}`}>
                <div className="card-body">
                    {error && (
                        <div className="alert alert-danger mb-3" role="alert">
                            {error}
                        </div>
                    )}

                    {sessionActive ? (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <div className="text-muted small">Current Session</div>
                                    <h6 className="mb-0">{sessionName}</h6>
                                </div>
                                <div className="text-end">
                                    <div className="text-muted small">Elapsed Time</div>
                                    <h6 className="mb-0 font-monospace">
                                        {formatElapsedTime(elapsedTime)}
                                    </h6>
                                </div>
                            </div>

                            <button
                                className="btn btn-danger w-100"
                                onClick={handleEndSession}
                            >
                                End Session
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-3">
                                <label htmlFor="sessionName" className="form-label">Session Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="sessionName"
                                    value={sessionName}
                                    onChange={(e) => setSessionName(e.target.value)}
                                    placeholder="Enter session name"
                                />
                            </div>
                            <button
                                className="btn btn-primary w-100"
                                onClick={handleStartSession}
                                disabled={!sessionName.trim()}
                            >
                                Start Session
                            </button>
                        </div>
                    )}

                    {reportId && !sessionActive && (
                        <div className="mt-3 p-3 bg-light rounded">
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">Session Report Ready</span>
                                <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={handleDownloadReport}
                                >
                                    <i className="bi bi-download me-1"></i>
                                    Download Report
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SessionWidget;