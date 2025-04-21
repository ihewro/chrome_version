# Chromium 下载指南

## 下载 Chromium 历史版本

Chromium 的历史版本可以通过以下几种方式获取：

### 方法一：使用官方 Chromium 下载存档

1. 访问 Chromium 官方下载存档网站：https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html

2. 选择对应的平台：
   - 对于 macOS ARM (M1/M2/M3)，选择 `Mac_Arm`
   - 对于 Intel macOS，选择 `Mac`
   - 对于 Windows，选择 `Win` 或 `Win_x64`
   - 对于 Linux，选择 `Linux` 或 `Linux_x64`

3. 输入你想要的版本号或日期，然后浏览可用的构建版本

4. 下载对应版本的 zip 文件，通常命名为 `chrome-mac.zip`

### 方法二：使用特定版本号下载

如果你知道特定的 Chromium 版本号，可以直接构造下载链接：

例如，下载版本号为 1002119 的 macOS ARM 版本：

https://commondatastorage.googleapis.com/chromium-browser-snapshots/Mac_Arm/1002119/chrome-mac.zip


### 方法三：查找特定版本对应的构建号

如果你想要下载特定 Chrome 版本（如 Chrome 113）对应的 Chromium 版本：

1. 访问 https://chromiumdash.appspot.com/releases
2. 查找你想要的版本号（例如 113.0.5672.126）
3. 记下对应的 Branch Base Position 数字
4. 使用该数字在 Chromium 下载存档中查找最接近的构建版本

## 安装下载的 Chromium

1. 解压下载的 zip 文件
2. 对于 macOS：
   - 将解压出的 `chrome-mac` 文件夹中的 `Chromium.app` 拖到应用程序文件夹
   - 如果遇到安全警告，请在"系统偏好设置" > "安全性与隐私"中允许打开

## 注意事项

- Chromium 是开源项目，不包含 Google Chrome 中的一些专有功能
- 历史版本可能存在安全漏洞，建议仅用于测试和开发目的
- 某些非常老的版本可能与当前操作系统不兼容

