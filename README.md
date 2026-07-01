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

DeskPaw turns a pet photo into a styled mobile and desktop companion.

[Live App](https://estherliu-lab.github.io/deskpaw/) ·
[GitHub Repo](https://github.com/estherliu-lab/deskpaw)

### Features

- Upload a pet photo and create a local DeskPaw profile.
- Choose from 17 visual styles and 15 action states.
- Generate a styled pet image locally in the browser as a fallback.
- Run the Electron desktop version to open a transparent, draggable, always-on-top pet window.
- Use `OPENAI_API_KEY` locally in the desktop version for real image-edit based style generation.
- Use a pet home with focus timer, water reminder, encouragement, and interaction logs.
- Generate and download share cards with Canvas.
- Install the web version as a PWA with manifest, icons, service worker, and offline fallback.

### Desktop Pet

```bash
npm install
npm run desktop:dev
```

For higher-quality AI style generation, set `OPENAI_API_KEY` before starting the desktop app. The key is read locally by Electron and is not stored in the GitHub Pages app.

### Mobile Install

Scan the QR code above with your phone, open DeskPaw in Safari or Chrome, then choose **Add to Home Screen**.

### Privacy

The hosted web app processes uploaded pet photos locally by default. The Electron desktop version only sends an image to OpenAI when `OPENAI_API_KEY` is configured and the user generates a styled pet.

<a id="中文"></a>

## 中文

DeskPaw 桌面爪爪：把宠物照片生成一个有风格、有动作、可以安装到手机或作为桌面小窗陪伴你的宠物。

[在线体验](https://estherliu-lab.github.io/deskpaw/) ·
[GitHub 仓库](https://github.com/estherliu-lab/deskpaw)

### 功能

- 上传宠物照片，生成本地 DeskPaw 档案。
- 支持 17 种视觉风格和 15 种动作状态。
- 网页版会先用本地 Canvas 生成风格化宠物图，作为无需 API 的 fallback。
- 桌面版使用 Electron，可以打开透明、可拖动、置顶的桌面宠物窗口。
- 如果本地设置了 `OPENAI_API_KEY`，桌面版会调用图片编辑生成真正的风格化宠物图。
- 宠物小屋包含专注计时、喝水提醒、鼓励语和互动记录。
- 支持生成并下载分享卡片。
- 网页版支持 PWA，可添加到手机主屏幕。

### 桌面宠物

```bash
npm install
npm run desktop:dev
```

如果想要更高质量的 AI 风格生成，请先在本地设置 `OPENAI_API_KEY`，再启动桌面版。这个 key 只在你自己的电脑上被 Electron 读取，不会写进 GitHub Pages。

### 手机安装

用手机扫描上方二维码，在 Safari 或 Chrome 中打开 DeskPaw，然后选择 **添加到主屏幕**。

### 隐私

托管网页默认只在浏览器本地处理上传照片。只有在桌面版配置了 `OPENAI_API_KEY` 并生成风格化宠物时，才会把图片发送给 OpenAI 图片编辑接口。

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
