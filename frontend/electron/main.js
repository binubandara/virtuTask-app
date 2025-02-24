// electron/main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const tcpPortUsed = require('tcp-port-used');
const kill = require('tree-kill');

async function killProcessOnPort(port) {
  const isPortInUse = await tcpPortUsed.check(port);
  if (isPortInUse) {
    if (process.platform === 'win32') {
      // On Windows, use netstat to find and kill the process
      const { exec } = require('child_process');
      exec(`for /f "tokens=5" %a in ('netstat -aon ^| find ":${port}"') do taskkill /F /PID %a`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error killing process on port ${port}:`, error);
        }
      });
    } else {
      // On Unix-like systems
      exec(`lsof -i :${port} | grep LISTEN | awk '{print $2}' | xargs kill -9`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error killing process on port ${port}:`, error);
        }
      });
    }
    
    // Wait for port to be released
    await tcpPortUsed.waitUntilFree(port, 300, 1000);
  }
}

async function startPythonBackend() {
  // Ensure port 5000 is free
  await killProcessOnPort(5000);
  
  let pythonProcess = null;
  
  try {
    if (!app.isPackaged) {
      const scriptPath = path.join(__dirname, '../../backend/productivity-tracker/app.py');
      pythonProcess = spawn('python', [scriptPath], {
        env: {
          ...process.env,
          PYTHONPATH: path.join(__dirname, '../../backend/productivity-tracker')
        }
      });
    } else {
      const exePath = path.join(process.resourcesPath, 'backend', 'app.exe');
      if (!fs.existsSync(exePath)) {
        throw new Error(`Python executable not found at: ${exePath}`);
      }
      pythonProcess = spawn(exePath, [], {
        cwd: path.join(process.resourcesPath, 'backend'),
        stdio: 'pipe',
        windowsHide: true
      });
    }

    // Handle process cleanup
    pythonProcess.on('exit', (code, signal) => {
      console.log(`Python process exited with code ${code} and signal ${signal}`);
      if (global.pythonProcess === pythonProcess) {
        global.pythonProcess = null;
      }
    });

    return pythonProcess;
  } catch (error) {
    console.error('Failed to start Python process:', error);
    throw error;
  }
}

// Modified createWindow function
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

  // Start Python backend first
  try {
    global.pythonProcess = startPythonBackend();
    
    // Wait for backend to initialize
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Load the frontend
    if (!app.isPackaged) {
      await global.mainWindow.loadURL('http://localhost:5173');
      global.mainWindow.webContents.openDevTools();
    } else {
      await global.mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
  } catch (error) {
    console.error('Error during startup:', error);
    global.mainWindow?.webContents.send('python-error', error.message);
  }
}

// Modified app lifecycle handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (global.pythonProcess) {
    global.pythonProcess.kill();
  }
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Global error handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  global.mainWindow?.webContents.send('python-error', error.message);
});