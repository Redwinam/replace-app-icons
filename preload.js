// preload.js
const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

// 暴露安全的 API 到渲染进程
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel, ...args) => {
      // 只允许特定的频道
      const validChannels = [
        'get-configs',
        'save-configs', 
        'select-app',
        'select-icns',
        'replace-icon'
      ];
      
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      } else {
        throw new Error(`Invalid IPC channel: ${channel}`);
      }
    }
  }
});

contextBridge.exposeInMainWorld('path', {
  basename: (filePath, ext) => path.basename(filePath, ext),
  dirname: (filePath) => path.dirname(filePath),
  extname: (filePath) => path.extname(filePath),
  join: (...paths) => path.join(...paths)
});

// 添加调试信息
console.log('Preload script loaded successfully');