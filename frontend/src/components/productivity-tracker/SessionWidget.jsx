import React, { useState, useEffect } from 'react';
import { productivityService } from '../../services/api';

const SessionWidget = ({ onSessionStateChange }) => {
    const [expanded, setExpanded] = useState(false);
    const [sessionName, setSessionName] = useState('');
    const [sessionActive, setSessionActive] = useState(false);
    const [reportId, setReportId] = useState(null);
    const [error, setError] = useState(null);
    const [sessionStartTime, setSessionStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    // Check if session is active on component mount
    useEffect(() => {
        const checkSessionStatus = async () => {
            try {
                const response = await productivityService.getCurrentSession();
                const isActive = response.data.sessionActive;
                setSessionActive(isActive);
                
                if (isActive) {
                    // If a session is active, we need to estimate the start time
                    // based on current productive + unproductive time
                    const totalSeconds = response.data.totalProductiveTime + response.data.totalUnproductiveTime;
                    const estimatedStartTime = Date.now() - (totalSeconds * 1000);
                    setSessionStartTime(estimatedStartTime);
                    
                    // Call the parent's callback if provided
                    if (onSessionStateChange) {
                        onSessionStateChange(true);
                    }
                }
            } catch (error) {
                console.error('Error checking session status:', error);
            }
        };
        
        checkSessionStatus();
    }, [onSessionStateChange]);

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
                
                // Notify parent component about session state change
                if (onSessionStateChange) {
                    onSessionStateChange(true);
                }
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
            console.log('End session response:', response.data);

            if (response.data.status === 'success') {
                setSessionActive(false);
                setReportId(response.data.report_id);
                setSessionStartTime(null);
                setElapsedTime(0);
                setError(null);
                
                // Notify parent component about session state change
                if (onSessionStateChange) {
                    onSessionStateChange(false);
                }
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
                                    <h6 className="mb-0">{sessionName || "Active Session"}</h6>
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