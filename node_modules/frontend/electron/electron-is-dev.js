// electron/electron-is-dev.js
const isDev = process.env.NODE_ENV === 'development' || 
  process.env.NODE_ENV === undefined && !app?.isPackaged;

export default isDev;