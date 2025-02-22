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
    const [isLoading, setIsLoading] = useState(false);

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
                    const estimatedStartTime = new Date().getTime() - (totalSeconds * 1000);
                    setSessionStartTime(estimatedStartTime);
                    setElapsedTime(totalSeconds); // Set initial elapsed time
                    
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
            // Initialize with current elapsed time
            const initialElapsed = Math.floor((new Date().getTime() - sessionStartTime) / 1000);
            setElapsedTime(initialElapsed);
            
            // Update every second
            timer = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
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

        setIsLoading(true);
        setError(null);

        try {
            const response = await productivityService.startSession(sessionName.trim());

            if (response.data.status === 'success') {
                setSessionActive(true);
                setSessionStartTime(new Date().getTime());
                setElapsedTime(0);
                setError(null);
                setReportId(null);
                
                if (onSessionStateChange) {
                    onSessionStateChange(true);
                }
            } else {
                setError(response.data.message || 'Failed to start session');
            }
        } catch (error) {
            setError(error.userMessage || 'Failed to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEndSession = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await productivityService.endSession();
            
            if (response.data.status === 'success') {
                setSessionActive(false);
                setReportId(response.data.report_id);
                setSessionStartTime(null);
                setElapsedTime(0);
                setError(null);
                
                if (onSessionStateChange) {
                    onSessionStateChange(false);
                }
            } else {
                setError(response.data.message || 'Failed to end session');
            }
        } catch (error) {
            console.error('End session error:', error);
            setError(error.userMessage || 'Failed to end session. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadReport = async () => {
        if (!reportId) {
            setError('No report available');
            return;
        }

        setIsLoading(true);
        setError(null);

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
            setError(error.userMessage || 'Failed to download report. Please try again.');
        } finally {
            setIsLoading(false);
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
                            <button 
                                type="button" 
                                className="btn-close float-end" 
                                onClick={() => setError(null)}
                            ></button>
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
                                className={`btn btn-danger w-100 ${isLoading ? 'disabled' : ''}`}
                                onClick={handleEndSession}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Ending Session...
                                    </>
                                ) : (
                                    'End Session'
                                )}
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
                                className={`btn btn-primary w-100 ${isLoading ? 'disabled' : ''}`}
                                onClick={handleStartSession}
                                disabled={!sessionName.trim() || isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Starting Session...
                                    </>
                                ) : (
                                    'Start Session'
                                )}
                            </button>
                        </div>
                    )}

                    {reportId && !sessionActive && (
                        <div className="mt-3 p-3 bg-light rounded">
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">Session Report Ready</span>
                                <button
                                    className={`btn btn-outline-primary btn-sm ${isLoading ? 'disabled' : ''}`}
                                    onClick={handleDownloadReport}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Downloading...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-download me-1"></i>
                                            Download Report
                                        </>
                                    )}
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