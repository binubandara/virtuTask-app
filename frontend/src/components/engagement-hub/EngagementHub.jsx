import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { engagementHubService } from './services/engagementHubService';
import { useNavigate } from 'react-router-dom'; // Assuming you're using React Router

const EngagementHub = () => {
  const [activeGame, setActiveGame] = useState(null);
  const [isHubEnabled, setIsHubEnabled] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const [productivityScore, setProductivityScore] = useState(0);
  const [totalAllowedTime, setTotalAllowedTime] = useState(30 * 60);
  
  const games = [
    {
      id: 1,
      title: "Flappy Bird",
      image: "/flappyBird.png",
      path: "/games/flappyBird/index.html"
    },
    {
      id: 2,
      title: "Astro Dash",
      image: "/astroDash.png",
      path: "/games/astroDash/index.html"
    },
    {
      id: 3,
      title: "Snake Game",
      image: "/snakeGame.jpg",
      path: "/games/snakeGame/index.html"
    }
  ];

  // Check authentication status
  const checkAuthStatus = () => {
    const token = localStorage.getItem('userToken');
    
    if (!token) {
      setError('You must be logged in to access the Engagement Hub');
      setIsAuthenticated(false);
      // Redirect to login page
      navigate('/login', { state: { from: '/engagement-hub' } });
      return false;
    }
    
    // Check token validity before assuming authentication
    // This could be a simple check like trying to decode the JWT
    try {
      // Just check if it's a valid JWT format (this doesn't verify signature)
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid token format');
      
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      setError('Your session has expired. Please login again.');
      setIsAuthenticated(false);
      navigate('/login', { state: { from: '/engagement-hub' } });
      return false;
    }
  };

  // Check if hub is enabled when component mounts
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    console.log("Current token:", token); // Debug log
    
    if (checkAuthStatus()) {
      checkHubStatus();
    }
    
    // Clean up timer when component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        // Save remaining time to server when navigating away
        if (isPlaying && isHubEnabled) {
          pauseTimer();
        }
      }
    };
  }, []);

  // Listen for page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User navigated away, pause the timer
        if (isPlaying && isHubEnabled) {
          pauseTimer();
        }
      } else {
        // User came back, but don't auto-resume
        // Timer will resume when they continue playing
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, isHubEnabled]);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Check hub status from the server
  const checkHubStatus = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await engagementHubService.getHubStatus();
      setIsHubEnabled(data.isEnabled);
      setTimeRemaining(data.remainingTime || 0);
      setProductivityScore(data.productivityScore || 0);
      setTotalAllowedTime(data.totalAllowedTime || 30 * 60);
    } catch (error) {
      console.error('Error checking hub status:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        setIsAuthenticated(false);
        navigate('/login');
        return;
      }
      
      setError(error.userMessage || 'Failed to check engagement hub status');
    } finally {
      setIsLoading(false);
    }
  };

  // Start the timer when a game is active
  const startTimer = async () => {
    // First verify authentication
    if (!isAuthenticated && !checkAuthStatus()) {
      return;
    }
    
    setIsPlaying(true);
    
    // Notify the backend that a game session has started
    try {
      await engagementHubService.updateHubStatus(true);
    } catch (error) {
      console.error('Error starting timer:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        setIsAuthenticated(false);
        navigate('/login');
        return;
      }
      
      setError(error.userMessage || 'Failed to start timer');
      return;
    }
    
    // Start local timer
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prevTime => {
        const newTime = prevTime - 1;
        
        // If time is up, disable the hub
        if (newTime <= 0) {
          pauseTimer();
          disableHub();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);
  };

  // Pause the timer when game is not active
  const pauseTimer = async () => {
    // Verify authentication first
    if (!isAuthenticated && !checkAuthStatus()) {
      return;
    }
    
    setIsPlaying(false);
    
    // Clear the interval
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Update the backend with the current remaining time
    try {
      await engagementHubService.updatePlayTime(totalAllowedTime - timeRemaining);
    } catch (error) {
      console.error('Error pausing timer:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        setIsAuthenticated(false);
        navigate('/login');
        return;
      }
      
      setError(error.userMessage || 'Failed to pause timer');
    }
  };

  const getTimeTierMessage = (score) => {
    if (score >= 90) {
      return "You've earned 60 minutes of game time for your excellent productivity!";
    } else if (score >= 75) {
      return "You've earned 30 minutes of game time for your good productivity.";
    } else {
      return "You've earned 15 minutes of game time. Improve your productivity to earn more!";
    }
  };

  // Disable the hub completely
  const disableHub = async () => {
    // Verify authentication first
    if (!isAuthenticated && !checkAuthStatus()) {
      return;
    }
    
    try {
      await engagementHubService.updateHubStatus(false);
      setIsHubEnabled(false);
      setTimeRemaining(0);
      setActiveGame(null);
      setIsPlaying(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } catch (error) {
      console.error('Error disabling hub:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        setIsAuthenticated(false);
        navigate('/login');
        return;
      }
      
      setError(error.userMessage || 'Failed to disable hub');
    }
  };

  // Start playing a game
  const startGame = async (game) => {
    // Verify authentication first
    if (!isAuthenticated && !checkAuthStatus()) {
      return;
    }
    
    // If hub is not enabled, check if it can be enabled
    if (!isHubEnabled) {
      try {
        const status = await engagementHubService.getHubStatus();
        if (!status.isEnabled) {
          setError('The Engagement Hub is disabled for today. It will be available again tomorrow.');
          return;
        }
        setIsHubEnabled(status.isEnabled);
        setTimeRemaining(status.remainingTime || 0);
      } catch (error) {
        console.error('Error checking hub status:', error);
        
        // Handle authentication errors
        if (error.response?.status === 401) {
          setIsAuthenticated(false);
          navigate('/login');
          return;
        }
        
        setError(error.userMessage || 'Failed to check engagement hub status');
        return;
      }
    }
    
    // Make sure there's time left
    if (timeRemaining <= 0) {
      setError('Your daily game time is up. The Engagement Hub will be available again tomorrow.');
      return;
    }
    
    setActiveGame(game);
    // Start the timer when the game is loaded
    startTimer();
  };

  // Stop playing and return to game selection
  const stopPlaying = async () => {
    // Pause the timer
    await pauseTimer();
    // Return to game selection
    setActiveGame(null);
  };

  // If not authenticated, show a login message
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning mb-4">
          <h4>Authentication Required</h4>
          <p>You must be logged in to access the Engagement Hub.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <div className="position-relative mb-4">
        <div style={{
          background: 'rgba(255, 255, 255, 0.21)',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}></div>
        <img
          src="/gaming.jpg"
          className="w-100"
          alt="Gaming Hero"
          style={{
            height: '300px',
            objectFit: 'cover'
          }}
        />
        <h1 className="position-absolute top-50 start-50 translate-middle text-black fw-bold">
          ENGAGEMENT HUB
        </h1>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="container mb-4">
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError(null)}
            ></button>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="container mb-4">
        <div className="card">
          <div className="card-body">
            {isHubEnabled ? (
              <>
                <div className="d-flex justify-content-between align-items-center">
                  <span>
                    Time remaining: <strong>{formatTime(timeRemaining)}</strong>
                    {isPlaying && <span className="badge bg-success ms-2">Active</span>}
                  </span>
                  <div className="progress" style={{ width: '70%', height: '20px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      role="progressbar" 
                      style={{ width: `${(timeRemaining / totalAllowedTime) * 100}%` }}
                      aria-valuenow={timeRemaining} 
                      aria-valuemin="0" 
                      aria-valuemax={totalAllowedTime}
                    ></div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="d-flex justify-content-between">
                    <span>Productivity Score: <strong>{productivityScore.toFixed(1)}%</strong></span>
                    <span>{getTimeTierMessage(productivityScore)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="alert alert-warning m-0">
                The Engagement Hub is currently disabled. It will be available again tomorrow.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Games Section */}
      <div className="container py-4">
        {!activeGame ? (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {games.map((game) => (
              <div key={game.id} className="col">
                <div className="card h-100">
                  <div className="position-relative">
                    <img
                      src={game.image}
                      className="card-img-top"
                      alt={game.title}
                      style={{ height: '250px', objectFit: 'cover' }}
                    />
                    <button
                      onClick={() => startGame(game)}
                      className="btn btn-success position-absolute"
                      style={{ bottom: '10px', right: '10px' }}
                      disabled={!isHubEnabled || timeRemaining <= 0}
                    >
                      Play
                    </button>
                  </div>
                  <div className="card-body">
                    <h5 className="card-title">{game.title}</h5>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <button
                onClick={() => stopPlaying()}
                className="btn btn-primary"
              >
                Back to Games
              </button>
              <div className="d-flex align-items-center">
                <span className="me-2">
                  <strong>{formatTime(timeRemaining)}</strong> remaining
                </span>
                <div className="spinner-grow spinner-grow-sm text-success" role="status" style={{ opacity: isPlaying ? 1 : 0 }}>
                  <span className="visually-hidden">Active</span>
                </div>
              </div>
            </div>
            <div className="ratio ratio-16x9">
              <iframe
                src={activeGame.path}
                title={activeGame.title}
                allowFullScreen
                style={{ border: 'none' }}
                onLoad={() => {
                  // Make sure timer is running when the iframe loads
                  if (!isPlaying && isHubEnabled && timeRemaining > 0) {
                    startTimer();
                  }
                }}
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EngagementHub;