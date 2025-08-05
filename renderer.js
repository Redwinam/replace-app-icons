const selectAppBtn = document.getElementById('select-app-btn');
const selectIcnsBtn = document.getElementById('select-icns-btn');
const saveConfigBtn = document.getElementById('save-config-btn');
const deleteConfigBtn = document.getElementById('delete-config-btn');
const replaceSingleBtn = document.getElementById('replace-single-btn');
const replaceAllBtn = document.getElementById('replace-all-btn');
const addConfigBtn = document.getElementById('add-config-btn');
const appPathDiv = document.getElementById('app-path');
const icnsPathDiv = document.getElementById('icns-path');
const statusDiv = document.getElementById('status');
const configsListDiv = document.getElementById('configs-list');

let configs = [];
let currentConfig = null;
let currentAppPath = '';
let currentIcnsPath = '';

async function loadConfigs() {
  configs = await window.electron.ipcRenderer.invoke('get-configs');
  renderConfigs();
}

function renderConfigs() {
  configsListDiv.innerHTML = '';
  
  if (configs.length === 0) {
    configsListDiv.innerHTML = '<div class="empty-state">暂无配置，点击上方按钮添加新配置</div>';
    return;
  }
  
  configs.forEach((config, index) => {
    const configEl = document.createElement('div');
    configEl.className = 'config-item';
    configEl.innerHTML = `
      <div class="config-name">${config.appName}</div>
      <div class="config-path">${config.appPath}</div>
      <div class="config-path">图标: ${window.path.basename(config.icnsPath)}</div>
    `;
    
    configEl.addEventListener('click', () => {
      // 移除其他选中状态
      document.querySelectorAll('.config-item').forEach(el => el.classList.remove('active'));
      // 添加选中状态
      configEl.classList.add('active');
      
      // 设置当前配置
      currentConfig = config;
      currentAppPath = config.appPath;
      currentIcnsPath = config.icnsPath;
      
      // 更新显示
      appPathDiv.textContent = config.appPath;
      icnsPathDiv.textContent = config.icnsPath;
      
      // 显示删除按钮
      deleteConfigBtn.style.display = 'inline-block';
      
      statusDiv.textContent = `已选择配置: ${config.appName}`;
      statusDiv.style.color = 'blue';
    });
    
    configsListDiv.appendChild(configEl);
  });
}

function clearForm() {
  currentConfig = null;
  currentAppPath = '';
  currentIcnsPath = '';
  appPathDiv.textContent = '未选择应用';
  icnsPathDiv.textContent = '未选择图标文件';
  deleteConfigBtn.style.display = 'none';
  
  // 移除所有选中状态
  document.querySelectorAll('.config-item').forEach(el => el.classList.remove('active'));
  
  statusDiv.textContent = '请选择应用和图标文件来创建新配置';
  statusDiv.style.color = 'black';
}

selectAppBtn.addEventListener('click', async () => {
  const filePath = await window.electron.ipcRenderer.invoke('select-app');
  if (filePath) {
    currentAppPath = filePath;
    appPathDiv.textContent = filePath;
    statusDiv.textContent = '应用已选择，请选择图标文件';
    statusDiv.style.color = 'blue';
  }
});

selectIcnsBtn.addEventListener('click', async () => {
  const filePath = await window.electron.ipcRenderer.invoke('select-icns');
  if (filePath) {
    currentIcnsPath = filePath;
    icnsPathDiv.textContent = filePath;
    statusDiv.textContent = '图标已选择，可以保存配置了';
    statusDiv.style.color = 'blue';
  }
});

addConfigBtn.addEventListener('click', () => {
  clearForm();
});

saveConfigBtn.addEventListener('click', async () => {
  if (!currentAppPath || !currentIcnsPath) {
    statusDiv.textContent = '请选择应用和图标文件';
    statusDiv.style.color = 'red';
    return;
  }

  const appName = window.path.basename(currentAppPath, '.app');
  
  const newConfig = {
    appName: appName,
    appPath: currentAppPath,
    icnsPath: currentIcnsPath
  };

  // 检查是否已存在相同应用的配置
  const existingIndex = configs.findIndex(c => c.appPath === currentAppPath);
  if (existingIndex > -1) {
    configs[existingIndex] = newConfig;
    statusDiv.textContent = `配置已更新: ${appName}`;
  } else {
    configs.push(newConfig);
    statusDiv.textContent = `配置已保存: ${appName}`;
  }

  await window.electron.ipcRenderer.invoke('save-configs', configs);
  loadConfigs();
  statusDiv.style.color = 'green';
});

deleteConfigBtn.addEventListener('click', async () => {
  if (currentConfig) {
    const index = configs.findIndex(c => c.appPath === currentConfig.appPath);
    if (index > -1) {
      configs.splice(index, 1);
      await window.electron.ipcRenderer.invoke('save-configs', configs);
      loadConfigs();
      clearForm();
      statusDiv.textContent = `配置已删除: ${currentConfig.appName}`;
      statusDiv.style.color = 'green';
    }
  }
});

replaceSingleBtn.addEventListener('click', async () => {
  if (!currentAppPath || !currentIcnsPath) {
    statusDiv.textContent = '请先选择应用和图标文件';
    statusDiv.style.color = 'red';
    return;
  }

  statusDiv.textContent = '正在替换图标...';
  statusDiv.style.color = 'black';

  const result = await window.electron.ipcRenderer.invoke('replace-icon', currentAppPath, currentIcnsPath);

  if (result.success) {
    statusDiv.textContent = '图标替换成功！可能需要重启Dock才能看到变化。';
    statusDiv.style.color = 'green';
    
    // 自动保存配置
    const appName = window.path.basename(currentAppPath, '.app');
    const newConfig = { 
      appName: appName, 
      appPath: currentAppPath, 
      icnsPath: currentIcnsPath 
    };

    const existingIndex = configs.findIndex(c => c.appPath === currentAppPath);
    if (existingIndex > -1) {
      configs[existingIndex] = newConfig;
    } else {
      configs.push(newConfig);
    }
    
    await window.electron.ipcRenderer.invoke('save-configs', configs);
    loadConfigs();
  } else {
    statusDiv.textContent = `替换失败: ${result.error}`;
    statusDiv.style.color = 'red';
  }
});

replaceAllBtn.addEventListener('click', async () => {
  if (configs.length === 0) {
    statusDiv.textContent = '没有可替换的配置';
    statusDiv.style.color = 'red';
    return;
  }

  statusDiv.textContent = '开始批量替换...';
  statusDiv.style.color = 'black';
  let successCount = 0;
  let errorCount = 0;

  for (const config of configs) {
    const result = await window.electron.ipcRenderer.invoke('replace-icon', config.appPath, config.icnsPath);
    if (result.success) {
      successCount++;
    } else {
      errorCount++;
      console.error(`Failed to replace icon for ${config.appName}: ${result.error}`);
    }
  }

  statusDiv.textContent = `批量替换完成！成功 ${successCount} 个, 失败 ${errorCount} 个。`;
  statusDiv.style.color = errorCount > 0 ? 'orange' : 'green';
});

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
  loadConfigs();
  clearForm();
});