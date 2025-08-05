const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const configPath = path.join(app.getPath('userData'), 'config.json');

function readConfigs() {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading configs:', error);
  }
  return [];
}

function saveConfigs(configs) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(configs, null, 2));
  } catch (error) {
    console.error('Error saving configs:', error);
  }
}

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');

}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

ipcMain.handle('get-configs', async () => {
  const configs = readConfigs();
  return configs.map(config => ({
      ...config,
      icnsName: path.basename(config.icnsPath)
  }));
});

ipcMain.handle('save-configs', async (event, configs) => {
  const configsWithAppName = configs.map(c => ({
      ...c,
      appName: path.basename(c.appPath, '.app')
  }));
  saveConfigs(configsWithAppName);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('select-app', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Applications', extensions: ['app'] }
    ],
    defaultPath: '/Applications'
  });
  return result.filePaths[0];
});

ipcMain.handle('select-icns', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Icons', extensions: ['icns'] }
    ]
  });
  return result.filePaths[0];
});

ipcMain.handle('replace-icon', async (event, appPath, icnsPath) => {
  try {
    const plistPath = path.join(appPath, 'Contents', 'Info.plist');
    const plist = fs.readFileSync(plistPath, 'utf8');
    const match = plist.match(/<key>CFBundleIconFile<\/key>\s*<string>(.*?)<\/string>/);

    if (!match || !match[1]) {
      throw new Error('Could not find CFBundleIconFile in Info.plist');
    }

    let iconName = match[1];
    if (!iconName.endsWith('.icns')) {
        iconName += '.icns';
    }

    const iconPath = path.join(appPath, 'Contents', 'Resources', iconName);

    fs.copyFileSync(icnsPath, iconPath);

    // Clear icon cache
    exec(`touch "${appPath}" && killall Dock`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});