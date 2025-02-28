import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { engagementHubService } from './services/engagementHubService';

const EngagementHub = () => {
  const [activeGame, setActiveGame] = useState(null);
  const [isHubEnabled, setIsHubEnabled] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef(null);
  const totalAllowedTime = 30 * 60; // 30 minutes in seconds
  
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

  // Check if hub is enabled when component mounts
  useEffect(() => {
    checkHubStatus();
    
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
    } catch (error) {
      console.error('Error checking hub status:', error);
      setError(error.userMessage || 'Failed to check engagement hub status');
    } finally {
      setIsLoading(false);
    }
  };

  // Start the timer when a game is active
  const startTimer = async () => {
    setIsPlaying(true);
    
    // Notify the backend that a game session has started
    try {
      await engagementHubService.updateHubStatus(true);
    } catch (error) {
      console.error('Error starting timer:', error);
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
      setError(error.userMessage || 'Failed to pause timer');
    }
  };

  // Disable the hub completely
  const disableHub = async () => {
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
      setError(error.userMessage || 'Failed to disable hub');
    }
  };

  // Start playing a game
  const startGame = async (game) => {
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