const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec, execFile } = require('child_process');

const configPath = path.join(app.getPath('userData'), 'config.json');
const iconsDir = path.join(app.getPath('userData'), 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

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
    const processedConfigs = configs.map(config => {
        const icnsName = path.basename(config.icnsPath);
        const targetIcnsPath = path.join(iconsDir, icnsName);

        if (config.icnsPath !== targetIcnsPath && fs.existsSync(config.icnsPath)) {
            fs.copyFileSync(config.icnsPath, targetIcnsPath);
            return { ...config, icnsPath: targetIcnsPath };
        }
        return config;
    });

    const configsWithAppName = processedConfigs.map(c => ({
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
    const icnsName = path.basename(icnsPath);
    const targetIcnsPath = path.join(iconsDir, icnsName);

    if (icnsPath !== targetIcnsPath) {
        if (!fs.existsSync(targetIcnsPath) || fs.statSync(icnsPath).mtimeMs > fs.statSync(targetIcnsPath).mtimeMs) {
            fs.copyFileSync(icnsPath, targetIcnsPath);
        }
    }

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

    fs.copyFileSync(targetIcnsPath, iconPath);

    // Clear icon cache
    exec(`touch "${appPath}" && killall Dock`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
    });

    return { success: true, newIcnsPath: targetIcnsPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.on('hide-docker-icon', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const modifiedPlistPath = path.join(__dirname, 'DockMenus.plist');

  const shellScriptContent = `#!/bin/bash
    set -e
    echo "脚本开始执行..."

    MOUNT_POINT=~/systemmount_temp
    mkdir -p -m 777 "$MOUNT_POINT"
    echo "挂载点已创建于 $MOUNT_POINT"

    DISK_IDENTIFIER=$(diskutil list | grep "APFS Volume Macintosh HD" | awk '{print $NF}')
    if [ -z "$DISK_IDENTIFIER" ]; then
        echo "错误：找不到 'Macintosh HD' 卷。"
        exit 1
    fi
    echo "找到 'Macintosh HD' 位于 $DISK_IDENTIFIER"

    echo "正在挂载系统分区..."
    sudo mount -o nobrowse -t apfs "/dev/$DISK_IDENTIFIER" "$MOUNT_POINT"
    echo "系统分区挂载成功。"

    DOCK_PLIST_PATH="$MOUNT_POINT/System/Library/CoreServices/Dock.app/Contents/Resources/DockMenus.plist"
    MODIFIED_PLIST_PATH="${modifiedPlistPath}"

    echo "正在备份原始Dock菜单配置文件..."
    sudo cp "$DOCK_PLIST_PATH" "${DOCK_PLIST_PATH}.bak"
    echo "备份完成。"

    echo "正在替换Dock菜单配置文件..."
    sudo cp "$MODIFIED_PLIST_PATH" "$DOCK_PLIST_PATH"
    echo "文件替换完成。"

    echo "正在设置文件权限..."
    sudo chmod 644 "$DOCK_PLIST_PATH"
    sudo chown root:wheel "$DOCK_PLIST_PATH"
    echo "权限设置完成。"

    echo "正在设置启动分区并创建快照..."
    sudo bless --mount "$MOUNT_POINT/System/Library/CoreServices" --setBoot --create-snapshot
    echo "快照创建成功。"

    echo "正在卸载挂载点..."
    sudo diskutil unmount "$MOUNT_POINT"
    rmdir "$MOUNT_POINT"
    echo "卸载完成。"

    echo "操作成功！请必须重启电脑以应用更改。"
  `;

  const tempShellScriptPath = path.join(os.tmpdir(), `hide_docker_icon_${Date.now()}.sh`);
  const tempAppleScriptPath = path.join(os.tmpdir(), `run_script_${Date.now()}.scpt`);

  const appleScriptContent = [
    'on run argv',
    '  do shell script "/bin/bash " & quoted form of (item 1 of argv) with administrator privileges',
    'end run'
  ].join('\n');

  try {
    fs.writeFileSync(tempShellScriptPath, shellScriptContent, { mode: 0o755 });
    fs.writeFileSync(tempAppleScriptPath, appleScriptContent);

    const child = execFile('osascript', [tempAppleScriptPath, tempShellScriptPath]);

    const cleanup = () => {
      if (fs.existsSync(tempShellScriptPath)) fs.unlinkSync(tempShellScriptPath);
      if (fs.existsSync(tempAppleScriptPath)) fs.unlinkSync(tempAppleScriptPath);
    };

    child.on('close', (code) => {
      win.webContents.send('hide-docker-icon-status', `脚本执行完毕，退出码: ${code}`);
      cleanup();
    });

    child.stdout.on('data', (data) => {
      win.webContents.send('hide-docker-icon-status', data.toString());
    });

    child.stderr.on('data', (data) => {
      win.webContents.send('hide-docker-icon-status', `错误: ${data.toString()}`);
    });

  } catch (error) {
    win.webContents.send('hide-docker-icon-status', `执行失败: ${error.message}`);
  }
});