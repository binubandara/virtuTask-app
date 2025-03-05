const { app, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");
const { exec } = require("child_process");

let mainWindow;
let backendProcess;

// Manually check if in development mode
const isDev = process.env.NODE_ENV === "development" || 
  (process.env.NODE_ENV === undefined && !app.isPackaged);

// Function to start the backend server
function startBackend() {
  const backendCommand = isDev ? "yarn start" : "node backend/server.js";

  backendProcess = exec(backendCommand, { cwd: path.join(__dirname, "backend") });

  backendProcess.stdout.on("data", (data) => console.log(`Backend: ${data}`));
  backendProcess.stderr.on("data", (data) => console.error(`Backend Error: ${data}`));

  backendProcess.on("close", (code) => console.log(`Backend exited with code ${code}`));
}

// Function to create the main Electron window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const startUrl = isDev
    ? "http://localhost:5173"
    : url.format({
        pathname: path.join(__dirname, "../dist/index.html"),
        protocol: "file:",
        slashes: true,
      });

  mainWindow.loadURL(startUrl);

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Start backend before opening the Electron window
app.whenReady().then(() => {
  startBackend(); // Start backend server
  setTimeout(createWindow, 3000); // Wait 3 seconds to ensure backend starts

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Ensure backend stops when Electron is closed
app.on("window-all-closed", () => {
  if (backendProcess) backendProcess.kill(); // Kill backend process
  if (process.platform !== "darwin") app.quit();
});
