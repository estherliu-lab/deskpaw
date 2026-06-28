# DeskPaw | 桌面爪爪

[English](#english) | [中文](#中文)

<p>
  <img
    src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=16&data=https%3A%2F%2Festherliu-lab.github.io%2Fdeskpaw%2F"
    width="180"
    alt="QR code for DeskPaw"
  />
</p>

<a id="english"></a>

## English

DeskPaw turns a pet photo into a warm, installable mobile companion.

[Live App](https://estherliu-lab.github.io/deskpaw/) ·
[GitHub Repo](https://github.com/estherliu-lab/deskpaw)

### Features

- Upload a pet photo and create a local DeskPaw profile.
- Choose from 17 visual styles and 15 action states.
- Switch the app interface between English and Chinese.
- Use a pet home with focus timer, water reminder, encouragement, and interaction logs.
- Generate and download share cards with Canvas.
- Install as a PWA with manifest, icons, service worker, and offline fallback.
- Keep a clear `generatePetCharacter` integration point for future AI image generation or background removal.

### Mobile Install

Scan the QR code above with your phone, open DeskPaw in Safari or Chrome, then choose **Add to Home Screen**.

### Privacy

DeskPaw V1 processes uploaded pet photos locally by default. Images are not automatically uploaded to a server.

### Roadmap

- AI pet character generation and background removal.
- More share-card templates.
- IndexedDB storage for local image archives.
- Transparent, draggable, always-on-top desktop pet version.
- Tray menu, focus timer, and water reminders.
- Optional cloud sync with clear user consent.

<a id="中文"></a>

## 中文

DeskPaw 桌面爪爪：把宠物照片生成一个可安装到手机桌面的陪伴小宠。

[在线体验](https://estherliu-lab.github.io/deskpaw/) ·
[GitHub 仓库](https://github.com/estherliu-lab/deskpaw)

### 功能

- 上传宠物照片，生成本地 DeskPaw 档案。
- 支持 17 种视觉风格和 15 种动作状态。
- App 界面支持中文和英文切换。
- 宠物小屋包含专注计时、喝水提醒、鼓励语和互动记录。
- 用 Canvas 生成并下载分享卡片。
- 支持 PWA：manifest、图标、service worker、离线页。
- 预留 `generatePetCharacter` 接口，后续可接入 AI 图像生成或背景移除。

### 手机安装

用手机扫描上方二维码，在 Safari 或 Chrome 中打开 DeskPaw，然后选择 **添加到主屏幕**。

### 隐私

DeskPaw V1 默认在浏览器本地处理和保存上传的宠物照片，不会自动上传到服务器。

### 后续计划

- AI 宠物形象生成与背景移除。
- 更多分享卡片模板。
- IndexedDB 本地图片库。
- 真正透明、可拖拽、可置顶的桌面宠物版本。
- 托盘菜单、专注计时、喝水提醒。
- 可选云同步，并明确提示用户授权。

## Local Development

```bash
npm install
npm run dev
npm run build
npm run preview
```

The development server defaults to:

```text
http://127.0.0.1:5173/deskpaw/
```

## License

MIT
