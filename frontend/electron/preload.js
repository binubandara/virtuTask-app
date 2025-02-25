// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    'api', {
        // Python process messages
        onPythonLog: (callback) => ipcRenderer.on('python-log', callback),
        onPythonError: (callback) => ipcRenderer.on('python-error', callback),
        
        // Server status
        getServerStatus: () => ipcRenderer.invoke('get-server-status'),
        
        // App version
        getVersion: () => ipcRenderer.invoke('get-version'),
        
        // App paths
        getAppPath: () => ipcRenderer.invoke('get-app-path')
    }
);

fgeyfffff