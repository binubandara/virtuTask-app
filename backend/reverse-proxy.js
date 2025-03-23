const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Logging middleware
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

// Define proxy rules
const proxyOptions = {
  target: 'http://localhost:5000', // Default target
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying request to: ${proxyReq.path}`);
  },
  onError: (err, req, res) => {
    console.error(`Proxy error: ${err.message}`);
    res.status(500).json({ error: 'Proxy error' });
  },
};

// Route requests to the appropriate backend service
app.use('/api/auth', createProxyMiddleware({ ...proxyOptions, target: 'http://localhost:5001' }));
app.use('/api/engagement-hub', createProxyMiddleware({ ...proxyOptions, target: 'http://localhost:5002' }));
app.use('/api/profile', createProxyMiddleware({ ...proxyOptions, target: 'http://localhost:5003' }));
app.use('/', createProxyMiddleware({ ...proxyOptions, target: 'http://localhost:5000' })); // Python Tracker

// Start the reverse proxy server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Reverse proxy server running on port ${PORT}`);
});