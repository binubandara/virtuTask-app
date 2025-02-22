// electron/main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

function startPythonBackend() {
  let pythonProcess = null;
  
  if (!app.isPackaged) {
    // Development
    const scriptPath = path.join(__dirname, '../../backend/productivity-tracker/app.py');
    pythonProcess = spawn('python', [scriptPath], {
      env: {
        ...process.env,
        PYTHONPATH: path.join(__dirname, '../../backend/productivity-tracker')
      }
    });
  } else {
    // Production
    const exePath = path.join(process.resourcesPath, 'backend', 'app.exe');
    console.log('Looking for Python executable at:', exePath);
    
    if (!fs.existsSync(exePath)) {
      console.error('Python executable not found!');
      throw new Error(`Python executable not found at: ${exePath}`);
    }

    // Start the process with working directory set to resources/backend
    pythonProcess = spawn(exePath, [], {
      cwd: path.join(process.resourcesPath, 'backend'),
      stdio: 'pipe',
      windowsHide: true
    });
  }

  // Enhanced logging
  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python stdout: ${data.toString()}`);
    global.mainWindow?.webContents.send('python-log', data.toString());
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python stderr: ${data.toString()}`);
    global.mainWindow?.webContents.send('python-error', data.toString());
  });

  pythonProcess.on('error', (error) => {
    console.error('Failed to start Python process:', error);
    global.mainWindow?.webContents.send('python-error', error.message);
  });

  return pythonProcess;
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