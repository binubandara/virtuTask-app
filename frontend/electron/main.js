const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');

let pythonProcess = null;

function startPythonBackend() {
  const pythonExecutablePath = isDev 
    ? 'python'
    : path.join(process.resourcesPath, 'backend', 'app.exe');

  // Updated path to match your project structure
  const scriptPath = isDev
    ? path.join(__dirname, '../../backend/productivity-tracker/app.py')
    : path.join(process.resourcesPath, 'backend', 'app.py');

  console.log('Python script path:', scriptPath); // For debugging

  pythonProcess = spawn(pythonExecutablePath, [scriptPath]);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python stdout: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python stderr: ${data}`);
  });

  pythonProcess.on('error', (error) => {
    console.error(`Error spawning Python process: ${error}`);
  });

  return new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });
}

async function createWindow() {
  try {
    await startPythonBackend();

    const mainWindow = new BrowserWindow({
      width: 1024,
      height: 768,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      icon: path.join(__dirname, '../public/icon.ico')
    });

    if (isDev) {
      mainWindow.loadURL('http://localhost:5173');
      mainWindow.webContents.openDevTools();
    } else {
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
  } catch (error) {
    console.error('Error creating window:', error);
  }
}

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