# 🎨 应用图标管理器

一个简单易用的 macOS 应用图标替换工具，基于 Electron 开发，提供直观的图形界面来管理和替换应用程序图标。

![应用截图](https://img.shields.io/badge/Platform-macOS-blue?style=for-the-badge&logo=apple)
![Electron](https://img.shields.io/badge/Electron-Latest-47848F?style=for-the-badge&logo=electron)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## ✨ 功能特性

- 🎯 **直观的图形界面** - 简洁美观的现代化设计
- 📁 **文件选择器** - 轻松选择目标应用和图标文件
- 💾 **配置管理** - 自动保存配置，支持批量管理
- 🔄 **一键替换** - 支持单个替换和批量替换
- ⚡ **实时反馈** - 清晰的操作状态提示
- 🛡️ **安全可靠** - 自动备份原始图标，支持恢复

## 🖥️ 系统要求

- macOS 10.14 或更高版本
- Node.js 14.0 或更高版本
- npm 6.0 或更高版本

## 📦 安装说明

### 方式一：从源码运行

1. **克隆仓库**
   ```bash
   git clone https://github.com/your-username/icon-replacer.git
   cd icon-replacer
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动应用**
   ```bash
   npm start
   ```

### 方式二：构建可执行文件

1. **安装构建依赖**
   ```bash
   npm install --save-dev electron-builder
   ```

2. **构建应用**
   ```bash
   npm run build
   ```

3. **查找生成的应用**
   构建完成后，可执行文件将位于 `dist` 目录中。

## 🚀 使用方法

### 基本操作

1. **启动应用**
   - 运行 `npm start` 或双击构建后的应用图标

2. **添加新配置**
   - 点击左侧的 "➕ 添加新配置" 按钮
   - 选择目标应用（.app 文件）
   - 选择图标文件（.icns 文件）
   - 点击 "💾 保存配置"

3. **替换图标**
   - **单个替换**：选择配置后点击 "🔄 替换此应用图标"
   - **批量替换**：点击 "⚡ 一键替换所有" 替换所有已保存的配置

4. **管理配置**
   - 点击左侧列表中的配置项来选择和编辑
   - 选中配置后可以点击 "🗑️ 删除配置" 来移除

### 图标文件准备

应用支持 `.icns` 格式的图标文件。如果你有其他格式的图标，可以：

1. **在线转换**：使用 [CloudConvert](https://cloudconvert.com/png-to-icns) 等在线工具
2. **macOS 自带工具**：
   ```bash
   # 创建 iconset 目录
   mkdir MyIcon.iconset
   
   # 准备不同尺寸的 PNG 文件并放入 iconset 目录
   # 然后使用 iconutil 转换
   iconutil -c icns MyIcon.iconset
   ```

## 📁 项目结构

```
icon-replacer/
├── index.html          # 主界面 HTML
├── main.js             # Electron 主进程
├── renderer.js         # 渲染进程逻辑
├── preload.js          # 预加载脚本
├── package.json        # 项目配置
├── package-lock.json   # 依赖锁定文件
└── README.md          # 项目说明
```

## 🔧 技术栈

- **Electron** - 跨平台桌面应用框架
- **HTML/CSS/JavaScript** - 前端界面
- **Node.js** - 后端逻辑
- **macOS APIs** - 系统集成

## ⚠️ 注意事项

1. **权限要求**
   - 应用需要访问 `/Applications` 目录的权限
   - 首次运行时可能需要在系统偏好设置中授予权限

2. **图标缓存**
   - 替换图标后可能需要重启 Dock 才能看到变化
   - 应用会自动尝试刷新图标缓存

3. **备份建议**
   - 建议在替换重要应用图标前手动备份原始图标
   - 可以通过重新安装应用来恢复原始图标

4. **兼容性**
   - 某些系统应用可能受到 SIP（系统完整性保护）限制
   - 建议主要用于第三方应用的图标替换

## 🐛 故障排除

### 常见问题

**Q: 点击按钮没有反应**
A: 确保应用有足够的系统权限，尝试重启应用。

**Q: 图标替换后没有变化**
A: 尝试重启 Dock：`killall Dock`，或者重启系统。

**Q: 无法选择某些应用**
A: 某些系统应用受到保护，建议选择第三方应用。

**Q: 图标显示异常**
A: 确保 .icns 文件格式正确，包含多种尺寸的图标。

### 获取帮助

如果遇到问题，请：

1. 查看控制台输出的错误信息
2. 确认系统权限设置
3. 在 [Issues](https://github.com/your-username/icon-replacer/issues) 页面提交问题

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Electron](https://www.electronjs.org/) - 优秀的跨平台应用框架
- [macOS](https://www.apple.com/macos/) - 提供强大的系统 API
- 所有贡献者和用户的支持

## 📞 联系方式

- 项目主页：[https://github.com/your-username/icon-replacer](https://github.com/your-username/icon-replacer)
- 问题反馈：[Issues](https://github.com/your-username/icon-replacer/issues)

---

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！