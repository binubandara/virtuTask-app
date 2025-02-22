const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// Simple development check
const isDev = !app.isPackaged;

let pythonProcess = null;
let mainWindow = null;

function startPythonBackend() {
  const pythonExecutablePath = isDev 
    ? 'python'
    : path.join(process.resourcesPath, 'backend', 'app.exe');

  if (!isDev) {
    // Production: just run the exe
    pythonProcess = spawn(pythonExecutablePath);
    console.log('Starting production Python backend:', pythonExecutablePath);
  } else {
    // Development: run the Python script
    const scriptPath = path.join(__dirname, '../../backend/productivity-tracker/app.py');
    const env = {
      ...process.env,
      PYTHONPATH: path.join(__dirname, '../../backend/productivity-tracker')
    };
    pythonProcess = spawn('python', [scriptPath], { env });
    console.log('Starting development Python backend:', scriptPath);
  }

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python stdout: ${data}`);
    mainWindow?.webContents.send('python-log', data.toString());
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python stderr: ${data}`);
    mainWindow?.webContents.send('python-error', data.toString());
  });

  pythonProcess.on('error', (error) => {
    console.error('Failed to start Python process:', error);
    mainWindow?.webContents.send('python-error', error.message);
  });

  // Give the Python process time to start
  return new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });
}

function setupIPC() {
  ipcMain.handle('get-server-status', async () => {
    try {
      const response = await fetch('http://localhost:5000/test');
      return response.ok;
    } catch (error) {
      console.error('Server status check failed:', error);
      return false;
    }
  });

  ipcMain.handle('get-version', () => {
    return app.getVersion();
  });

  ipcMain.handle('get-app-path', () => {
    return app.getAppPath();
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/icon.ico')
  });

  setupIPC();

  try {
    // Start Python backend first
    await startPythonBackend();

    // Then load the frontend
    if (isDev) {
      await mainWindow.loadURL('http://localhost:5173');
      mainWindow.webContents.openDevTools();
    } else {
      await mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
  } catch (error) {
    console.error('Error during window creation:', error);
    mainWindow?.webContents.send('python-error', error.message);
  }
}

// App lifecycle handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle app errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  if (mainWindow) {
    mainWindow.webContents.send('python-error', error.message);
  }
});