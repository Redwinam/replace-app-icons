const { contextBridge, ipcRenderer } = require('electron');

const api = {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
};

contextBridge.exposeInMainWorld('api', api);