const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Python productivity tracker
  restartPython: () => ipcRenderer.send('restart-python'),
  onPythonRestarted: (callback) => ipcRenderer.on('python-restarted', callback),
  onPythonError: (callback) => ipcRenderer.on('python-error', callback),
  
  // Auth server
  restartAuthServer: () => ipcRenderer.send('restart-auth-server'),
  onAuthServerRestarted: (callback) => ipcRenderer.on('auth-server-restarted', callback),
  onAuthServerError: (callback) => ipcRenderer.on('auth-server-error', callback),
  
  // Engagement hub
  restartEngagementHub: () => ipcRenderer.send('restart-engagement-hub'),
  onEngagementHubRestarted: (callback) => ipcRenderer.on('engagement-hub-restarted', callback),
  onEngagementHubError: (callback) => ipcRenderer.on('engagement-hub-error', callback),
  
 // Focus mode
 restartFocusMode: () => ipcRenderer.send('restart-focus-mode'),
 onFocusModeRestarted: (callback) => ipcRenderer.on('focus-mode-restarted', callback),
 onFocusModeError: (callback) => ipcRenderer.on('focus-mode-error', callback),
  
  // General application status
  onBackendStatus: (callback) => ipcRenderer.on('backend-status', (_, status) => callback(status)),
  onStartupError: (callback) => ipcRenderer.on('startup-error', (_, error) => callback(error)),
  onAppError: (callback) => ipcRenderer.on('app-error', (_, error) => callback(error))
});