const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const tcpPortUsed = require('tcp-port-used');
const kill = require('tree-kill');
const { exec } = require('child_process');

// Store all backend processes
global.backendProcesses = {
  pythonTracker: null,
  authServer: null,
  engagementHub: null
};

// Use a more reliable approach to check and kill processes on Windows
async function killProcessOnPort(port) {
  try {
    const isPortInUse = await tcpPortUsed.check(port, '127.0.0.1');
    
    if (isPortInUse) {
      console.log(`Port ${port} is in use, attempting to free it...`);
      
      if (process.platform === 'win32') {
        // Improved Windows port killing
        return new Promise((resolve, reject) => {
          exec(`netstat -ano | findstr :${port} | findstr LISTENING`, (error, stdout) => {
            if (error || !stdout) {
              console.log(`No process found listening on port ${port}`);
              resolve();
              return;
            }
            
            const lines = stdout.trim().split('\n');
            if (lines.length > 0) {
              // Extract PID - last column of netstat output
              const pidMatch = lines[0].match(/(\d+)$/);
              if (pidMatch && pidMatch[1]) {
                const pid = pidMatch[1].trim();
                console.log(`Found process with PID ${pid} on port ${port}, killing...`);
                
                exec(`taskkill /F /PID ${pid}`, (err) => {
                  if (err) {
                    console.warn(`Error killing PID ${pid}: ${err.message}`);
                  } else {
                    console.log(`Successfully killed process ${pid}`);
                  }
                  // Continue anyway, even if there was an error
                  resolve();
                });
              } else {
                console.log(`Could not extract PID from netstat output`);
                resolve();
              }
            } else {
              resolve();
            }
          });
        });
      } else {
        // Unix systems
        return new Promise((resolve) => {
          exec(`lsof -i :${port} | grep LISTEN | awk '{print $2}' | xargs -r kill -9`, (error) => {
            if (error) {
              console.warn(`Error killing process on port ${port}: ${error.message}`);
            }
            resolve();
          });
        });
      }
    } else {
      console.log(`Port ${port} is not in use`);
      return Promise.resolve();
    }
  } catch (error) {
    console.error(`Error in killProcessOnPort: ${error.message}`);
    // Continue execution even if there's an error
    return Promise.resolve();
  }
}

// Function to check if port is free with timeout
async function waitForPortToBeFree(port, timeoutMs = 5000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    try {
      const inUse = await tcpPortUsed.check(port, '127.0.0.1');
      if (!inUse) {
        console.log(`Port ${port} is free now`);
        return true;
      }
      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.warn(`Error checking port: ${err.message}`);
      // If we can't check, assume it might be free
      return true;
    }
  }
  
  console.warn(`Timeout waiting for port ${port} to be free`);
  return false;
}

// Start Python Productivity Tracker backend
async function startPythonBackend() {
  const port = 5000;
  console.log(`Checking if port ${port} is in use...`);
  
  try {
    // Try to kill any process using our port
    await killProcessOnPort(port);
    
    // Wait for port to be free (with reasonable timeout)
    const portFree = await waitForPortToBeFree(port, 8000);
    if (!portFree) {
      console.warn(`Port ${port} could not be freed, but continuing anyway...`);
    }
    
    console.log('Starting Python backend...');
    let pythonProcess;
    
    if (!app.isPackaged) {
      const scriptPath = path.join(__dirname, '../../backend/productivity-tracker/app.py');
      console.log(`Spawning Python script from: ${scriptPath}`);
      
      pythonProcess = spawn('python', [scriptPath], {
        env: {
          ...process.env,
          PYTHONPATH: path.join(__dirname, '../../backend/productivity-tracker')
        }
      });
    } else {
      const exePath = path.join(process.resourcesPath, 'backend', 'app.exe');
      console.log(`Checking for packaged executable at: ${exePath}`);
      
      if (!fs.existsSync(exePath)) {
        throw new Error(`Python executable not found at: ${exePath}`);
      }
      
      console.log(`Spawning packaged executable from: ${exePath}`);
      pythonProcess = spawn(exePath, [], {
        cwd: path.join(process.resourcesPath, 'backend'),
        stdio: 'pipe',
        windowsHide: true
      });
    }

    // Handle process cleanup
    pythonProcess.on('exit', (code, signal) => {
      console.log(`Python process exited with code ${code} and signal ${signal}`);
      if (global.backendProcesses.pythonTracker === pythonProcess) {
        global.backendProcesses.pythonTracker = null;
      }
    });

    // Handle stdout/stderr
    pythonProcess.stdout.on('data', (data) => {
      console.log(`Python stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python stderr: ${data}`);
    });

    // Handle process error
    pythonProcess.on('error', (err) => {
      console.error(`Failed to start Python process: ${err.message}`);
    });

    return pythonProcess;
  } catch (error) {
    console.error(`Failed to start Python process: ${error.message}`);
    throw error;
  }
}

// Start Auth Server (nodejs)
async function startAuthServer() {
  const port = 5001;
  console.log(`Checking if port ${port} is in use...`);
  
  try {
    // Try to kill any process using our port
    await killProcessOnPort(port);
    
    // Wait for port to be free
    const portFree = await waitForPortToBeFree(port, 5000);
    if (!portFree) {
      console.warn(`Port ${port} could not be freed, but continuing anyway...`);
    }
    
    console.log('Starting Auth Server...');
    let authProcess;
    
    if (!app.isPackaged) {
      const scriptPath = path.join(__dirname, '../../backend/loginPage/server.js');
      console.log(`Spawning Auth server from: ${scriptPath}`);
      
      // Set environment variable for the port
      const env = { ...process.env, PORT: port };
      
      authProcess = spawn('node', [scriptPath], { env });
    } else {
      const scriptPath = path.join(process.resourcesPath, 'backend', 'auth-server', 'server.js');
      console.log(`Spawning Auth server from: ${scriptPath}`);
      
      authProcess = spawn('node', [scriptPath], { 
        env: { ...process.env, PORT: port },
        cwd: path.join(process.resourcesPath, 'backend', 'auth-server')
      });
    }

    // Handle process stdout/stderr
    authProcess.stdout.on('data', (data) => {
      console.log(`Auth server stdout: ${data}`);
    });

    authProcess.stderr.on('data', (data) => {
      console.error(`Auth server stderr: ${data}`);
    });

    // Handle process exit
    authProcess.on('exit', (code, signal) => {
      console.log(`Auth server exited with code ${code} and signal ${signal}`);
      if (global.backendProcesses.authServer === authProcess) {
        global.backendProcesses.authServer = null;
      }
    });

    // Handle process error
    authProcess.on('error', (err) => {
      console.error(`Failed to start Auth server: ${err.message}`);
    });

    return authProcess;
  } catch (error) {
    console.error(`Failed to start Auth server: ${error.message}`);
    throw error;
  }
}

// Start Engagement Hub Server (nodejs)
async function startEngagementHubServer() {
  const port = 5002;
  console.log(`Checking if port ${port} is in use...`);
  
  try {
    // Try to kill any process using our port
    await killProcessOnPort(port);
    
    // Wait for port to be free
    const portFree = await waitForPortToBeFree(port, 5000);
    if (!portFree) {
      console.warn(`Port ${port} could not be freed, but continuing anyway...`);
    }
    
    console.log('Starting Engagement Hub Server...');
    let hubProcess;
    
    if (!app.isPackaged) {
      const scriptPath = path.join(__dirname, '../../backend/engagement-hub/server.js');
      console.log(`Spawning Engagement Hub server from: ${scriptPath}`);
      
      // Set environment variable for the port
      const env = { 
        ...process.env, 
        ENGAGEMENT_HUB_PORT: port,
        NODE_ENV: process.env.NODE_ENV || 'development'
      };
      
      hubProcess = spawn('node', [scriptPath], { env });
    } else {
      const scriptPath = path.join(process.resourcesPath, 'backend', 'engagement-hub', 'app.js');
      console.log(`Spawning Engagement Hub server from: ${scriptPath}`);
      
      hubProcess = spawn('node', [scriptPath], { 
        env: { 
          ...process.env, 
          ENGAGEMENT_HUB_PORT: port,
          NODE_ENV: 'production'
        },
        cwd: path.join(process.resourcesPath, 'backend', 'engagement-hub')
      });
    }

    // Handle process stdout/stderr
    hubProcess.stdout.on('data', (data) => {
      console.log(`Engagement Hub stdout: ${data}`);
    });

    hubProcess.stderr.on('data', (data) => {
      console.error(`Engagement Hub stderr: ${data}`);
    });

    // Handle process exit
    hubProcess.on('exit', (code, signal) => {
      console.log(`Engagement Hub exited with code ${code} and signal ${signal}`);
      if (global.backendProcesses.engagementHub === hubProcess) {
        global.backendProcesses.engagementHub = null;
      }
    });

    // Handle process error
    hubProcess.on('error', (err) => {
      console.error(`Failed to start Engagement Hub: ${err.message}`);
    });

    return hubProcess;
  } catch (error) {
    console.error(`Failed to start Engagement Hub: ${error.message}`);
    throw error;
  }
}

async function createWindow() {
  global.mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  let backendsStarted = {
    python: false,
    auth: false,
    hub: false
  };

  try {
    console.log('Starting all backend processes...');
    
    // Start processes in parallel
    const startPromises = [
      startPythonBackend().then(process => {
        global.backendProcesses.pythonTracker = process;
        backendsStarted.python = true;
      }).catch(err => {
        console.error(`Python backend failed to start: ${err.message}`);
      }),
      
      startAuthServer().then(process => {
        global.backendProcesses.authServer = process;
        backendsStarted.auth = true;
      }).catch(err => {
        console.error(`Auth server failed to start: ${err.message}`);
      }),
      
      startEngagementHubServer().then(process => {
        global.backendProcesses.engagementHub = process;
        backendsStarted.hub = true;
      }).catch(err => {
        console.error(`Engagement Hub failed to start: ${err.message}`);
      })
    ];
    
    // Wait for all processes to start (or fail)
    await Promise.allSettled(startPromises);
    
    console.log('Waiting for backends to initialize...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log('Loading frontend...');
    if (!app.isPackaged) {
      // In development, check if Vite server is running first
      console.log('Attempting to load from development server...');
      try {
        await global.mainWindow.loadURL('http://localhost:5173');
        global.mainWindow.webContents.openDevTools();
      } catch (err) {
        console.error(`Error loading development URL: ${err.message}`);
        throw new Error('Could not connect to development server. Make sure Vite is running.');
      }
    } else {
      console.log('Loading from packaged app...');
      await global.mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
    
    // Send backend status to frontend
    global.mainWindow.webContents.on('did-finish-load', () => {
      global.mainWindow.webContents.send('backend-status', {
        python: backendsStarted.python,
        auth: backendsStarted.auth,
        hub: backendsStarted.hub
      });
    });
    
  } catch (error) {
    console.error(`Error during startup: ${error.message}`);
    
    // Only attempt to send message if window was created successfully
    if (global.mainWindow && !global.mainWindow.isDestroyed()) {
      global.mainWindow.webContents.send('startup-error', error.message);
      
      // If no backends started, show an error page
      if (!backendsStarted.python && !backendsStarted.auth && !backendsStarted.hub) {
        global.mainWindow.loadFile(path.join(__dirname, 'error.html'));
      }
    }
  }
}

// Modified app lifecycle handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  console.log('All windows closed, cleaning up...');
  
  // Terminate all backend processes
  Object.entries(global.backendProcesses).forEach(([name, process]) => {
    if (process) {
      console.log(`Killing ${name} process with PID ${process.pid}...`);
      kill(process.pid, 'SIGTERM', (err) => {
        if (err) console.error(`Error killing ${name} process: ${err.message}`);
        else console.log(`${name} process terminated successfully`);
      });
    }
  });
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle IPC messages from renderer
ipcMain.on('restart-python', async () => {
  console.log('Restart Python request received');
  
  if (global.backendProcesses.pythonTracker) {
    // Kill existing process
    kill(global.backendProcesses.pythonTracker.pid, 'SIGTERM', async (err) => {
      if (err) console.error(`Error killing Python process: ${err.message}`);
      
      global.backendProcesses.pythonTracker = null;
      
      try {
        // Start new process
        global.backendProcesses.pythonTracker = await startPythonBackend();
        
        if (global.mainWindow && !global.mainWindow.isDestroyed()) {
          global.mainWindow.webContents.send('python-restarted');
        }
      } catch (error) {
        console.error(`Failed to restart Python: ${error.message}`);
        if (global.mainWindow && !global.mainWindow.isDestroyed()) {
          global.mainWindow.webContents.send('python-error', error.message);
        }
      }
    });
  }
});

// Add handlers for other services
ipcMain.on('restart-auth-server', async () => {
  console.log('Restart Auth Server request received');
  
  if (global.backendProcesses.authServer) {
    kill(global.backendProcesses.authServer.pid, 'SIGTERM', async (err) => {
      if (err) console.error(`Error killing Auth Server: ${err.message}`);
      
      global.backendProcesses.authServer = null;
      
      try {
        global.backendProcesses.authServer = await startAuthServer();
        
        if (global.mainWindow && !global.mainWindow.isDestroyed()) {
          global.mainWindow.webContents.send('auth-server-restarted');
        }
      } catch (error) {
        console.error(`Failed to restart Auth Server: ${error.message}`);
        if (global.mainWindow && !global.mainWindow.isDestroyed()) {
          global.mainWindow.webContents.send('auth-server-error', error.message);
        }
      }
    });
  }
});

ipcMain.on('restart-engagement-hub', async () => {
  console.log('Restart Engagement Hub request received');
  
  if (global.backendProcesses.engagementHub) {
    kill(global.backendProcesses.engagementHub.pid, 'SIGTERM', async (err) => {
      if (err) console.error(`Error killing Engagement Hub: ${err.message}`);
      
      global.backendProcesses.engagementHub = null;
      
      try {
        global.backendProcesses.engagementHub = await startEngagementHubServer();
        
        if (global.mainWindow && !global.mainWindow.isDestroyed()) {
          global.mainWindow.webContents.send('engagement-hub-restarted');
        }
      } catch (error) {
        console.error(`Failed to restart Engagement Hub: ${error.message}`);
        if (global.mainWindow && !global.mainWindow.isDestroyed()) {
          global.mainWindow.webContents.send('engagement-hub-error', error.message);
        }
      }
    });
  }
});

// Global error handler
process.on('uncaughtException', (error) => {
  console.error(`Uncaught Exception: ${error.message}`);
  console.error(error.stack);
  
  if (global.mainWindow && !global.mainWindow.isDestroyed()) {
    global.mainWindow.webContents.send('app-error', error.message);
  }
});