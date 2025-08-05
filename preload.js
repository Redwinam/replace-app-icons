const { contextBridge, ipcRenderer } = require('electron');

const api = {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
};

contextBridge.exposeInMainWorld('api', api);