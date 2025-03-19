const { app, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");
const { exec } = require("child_process");

const isDev =
  process.env.NODE_ENV === "development" ||
  (process.env.NODE_ENV === undefined && !app.isPackaged);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load React App (Wait for frontend to start)
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
}

app.whenReady().then(() => {
  // Start Backend & Frontend
  if (isDev) {
    console.log("🚀 Starting Backend & Frontend...");
    exec("concurrently \"cd backend && yarn start\" \"cd frontend && yarn start\"", (err, stdout, stderr) => {
      if (err) {
        console.error("Error starting servers:", err);
      }
      console.log(stdout);
      console.error(stderr);
    });

    // Wait before opening Electron
    setTimeout(createWindow, 5000);
  } else {
    createWindow();
  }

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
