import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const EngagementHub = () => {
  const [activeGame, setActiveGame] = useState(null);
  const games = [
    {
      id: 1,
      title: "Riddle Challenge",
      image: "/flappyBird.png",
      path: "/games/flappyBird/index.html"
    },
    {
      id: 2,
      title: "Memory Game",
      image: "/path-to-memory-image.jpg",
      path: "/games/memory/index.html"
    }
  ];

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
                      onClick={() => setActiveGame(game)}
                      className="btn btn-success position-absolute"
                      style={{ bottom: '10px', right: '10px' }}
                    >
                      Play
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <button
              onClick={() => setActiveGame(null)}
              className="btn btn-primary mb-4"
            >
              Back to Games
            </button>
            <div className="ratio ratio-16x9">
              <iframe
                src={activeGame.path}
                title={activeGame.title}
                allowFullScreen
                style={{ border: 'none' }}
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EngagementHub;