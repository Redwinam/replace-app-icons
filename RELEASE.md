# 🚀 发布指南

本文档将指导你如何将项目发布到 GitHub 并构建可分发的应用程序。

## 📋 发布前检查清单

在发布之前，请确保完成以下步骤：

- [ ] 更新 `package.json` 中的版本号
- [ ] 更新 `README.md` 中的 GitHub 链接
- [ ] 测试所有功能正常工作
- [ ] 确保没有敏感信息在代码中
- [ ] 运行 `npm install` 确保依赖正确

## 🔧 准备发布

### 1. 更新项目信息

编辑 `package.json` 文件，将以下占位符替换为实际信息：

```json
{
  "homepage": "https://github.com/YOUR_USERNAME/icon-replacer",
  "repository": {
    "url": "https://github.com/YOUR_USERNAME/icon-replacer.git"
  },
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/icon-replacer/issues"
  },
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  }
}
```

### 2. 更新 README

编辑 `README.md` 文件，将所有的 `your-username` 替换为你的 GitHub 用户名。

## 📦 构建应用

### 安装构建依赖

```bash
npm install electron-builder --save-dev
```

### 构建 macOS 应用

```bash
# 构建 DMG 和 ZIP 文件
npm run build

# 仅构建 DMG
npm run build:mac

# 构建但不打包（用于测试）
npm run pack
```

构建完成后，可分发文件将位于 `dist/` 目录中。

## 🌐 发布到 GitHub

### 1. 创建 GitHub 仓库

1. 登录 GitHub
2. 点击 "New repository"
3. 仓库名称：`icon-replacer`
4. 添加描述：`🎨 一个简单易用的 macOS 应用图标替换工具`
5. 选择 "Public"
6. 不要初始化 README（我们已经有了）

### 2. 推送代码

```bash
# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "🎉 Initial release: macOS Icon Replacer v1.0.0"

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/icon-replacer.git

# 推送到 GitHub
git push -u origin main
```

### 3. 创建 Release

1. 在 GitHub 仓库页面点击 "Releases"
2. 点击 "Create a new release"
3. 标签版本：`v1.0.0`
4. 发布标题：`🎨 应用图标管理器 v1.0.0`
5. 描述发布内容：

```markdown
## ✨ 新功能

- 🎯 直观的图形界面
- 📁 文件选择器支持
- 💾 配置管理功能
- 🔄 单个和批量替换
- ⚡ 实时操作反馈

## 📦 下载

- **macOS (Intel)**: [icon-replacer-1.0.0-mac-x64.dmg](链接)
- **macOS (Apple Silicon)**: [icon-replacer-1.0.0-mac-arm64.dmg](链接)
- **源代码**: [Source code (zip)](链接)

## 🔧 安装说明

1. 下载对应架构的 DMG 文件
2. 双击打开 DMG
3. 将应用拖拽到 Applications 文件夹
4. 首次运行时可能需要在系统偏好设置中允许运行

## ⚠️ 系统要求

- macOS 10.14 或更高版本
- 需要访问 Applications 目录的权限
```

6. 上传构建的 DMG 文件
7. 点击 "Publish release"

## 🔄 后续更新

当你需要发布新版本时：

1. 更新 `package.json` 中的版本号
2. 提交更改并推送到 GitHub
3. 重新构建应用
4. 创建新的 Release 并上传新的构建文件

## 📈 推广建议

- 在 README 中添加截图
- 创建演示视频
- 在相关社区分享
- 收集用户反馈并持续改进

## 🆘 需要帮助？

如果在发布过程中遇到问题：

1. 检查 GitHub 文档
2. 查看 Electron Builder 文档
3. 在项目 Issues 中寻求帮助

---

祝你发布顺利！🎉