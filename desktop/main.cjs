const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");

const devUrl = process.env.DESKPAW_DEV_URL || "http://127.0.0.1:5173/deskpaw/";
const imageModel = process.env.DESKPAW_IMAGE_MODEL || "gpt-image-2";

let mainWindow;
let petWindow;

function appUrl(hash) {
  if (!app.isPackaged) return `${devUrl}#/${hash}`;
  return {
    pathname: path.join(__dirname, "..", "dist", "index.html"),
    hash: `/${hash}`
  };
}

async function loadRoute(window, hash) {
  const target = appUrl(hash);
  if (typeof target === "string") {
    await window.loadURL(target);
  } else {
    await window.loadFile(target.pathname, { hash: target.hash });
  }
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 980,
    minHeight: 680,
    title: "DeskPaw",
    backgroundColor: "#fff8ef",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  loadRoute(mainWindow, "");
}

async function createPetWindow() {
  if (petWindow && !petWindow.isDestroyed()) {
    petWindow.show();
    petWindow.focus();
    return { ok: true };
  }

  petWindow = new BrowserWindow({
    width: 380,
    height: 460,
    frame: false,
    transparent: true,
    resizable: false,
    movable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  petWindow.setAlwaysOnTop(true, "floating");
  await loadRoute(petWindow, "floating-pet");
  return { ok: true };
}

function dataUrlToBlob(dataUrl) {
  const [meta, base64] = dataUrl.split(",");
  const mime = /data:(.*?);base64/.exec(meta)?.[1] || "image/png";
  return new Blob([Buffer.from(base64, "base64")], { type: mime });
}

function stylePrompt({ styleId, petType, name, actionId }) {
  const stylePrompts = {
    "creamy-healing": "soft creamy healing mascot, warm pastel lighting, gentle rounded shape",
    "pixel-game": "retro pixel game sprite, crisp pixel silhouette, transparent background",
    "wool-felt": "handmade wool felt pet doll, fuzzy fibers, needle felt texture, soft plush volume",
    "japanese-journal": "Japanese journal sticker illustration, soft paper texture, cozy stationery style",
    "chibi-cute": "chibi cute pet character, round face, expressive eyes, adorable but polished",
    watercolor: "watercolor pet illustration, soft transparent washes, hand painted edges",
    "minimal-line": "minimal clean line art pet, simple elegant contour, white fill, tidy desktop style",
    "retro-desktop": "retro computer desktop mascot, small 90s pixel UI charm, cute window icon energy",
    "cartoon-sticker": "cartoon sticker pet, bold clean outline, white sticker border, transparent background",
    "soft-3d-toy": "soft 3D plush toy pet, rounded toy material, gentle studio lighting",
    "fairy-tale": "fairy tale picture book pet, soft storybook illustration, warm paper texture",
    "forest-nature": "forest nature pet companion, mossy natural palette, soft botanical charm",
    "night-companion": "quiet night companion pet, sleepy cozy glow, dark gentle palette",
    "minimal-productivity": "minimal productivity desktop mascot, restrained clean design, calm focus mood",
    "meme-expressive": "expressive meme pet mascot, playful exaggerated expression, still cute",
    "social-cute": "cute lifestyle social media pet sticker, clean bright adorable style",
    "dreamy-stardust": "dreamy stardust pet companion, soft stars, gentle fantasy glow"
  };

  const actionPrompts = {
    "idle-standing": "standing or sitting in a neutral idle pose",
    sitting: "sitting calmly",
    "lying-rest": "lying down resting",
    sleeping: "sleeping softly",
    "happy-jumping": "happy jumping pose",
    affection: "affectionate tail wagging pose",
    blinking: "gentle blinking expression",
    "head-tilt": "curious head tilt pose",
    grumpy: "tiny cute grumpy expression",
    pouty: "soft pouty expression",
    stretching: "stretching pose",
    "water-reminder": "holding or looking at a tiny water cup",
    "focus-mode": "quiet focused companion pose",
    waving: "waving hello",
    celebration: "celebrating task completion"
  };

  return [
    `Transform the uploaded ${petType} photo into the same pet as a desktop companion mascot named ${name || "DeskPaw"}.`,
    stylePrompts[styleId] || stylePrompts["creamy-healing"],
    actionPrompts[actionId] || actionPrompts["idle-standing"],
    "Preserve the pet identity, fur color, markings, and species.",
    "Return one isolated full-body character on a transparent background.",
    "Do not include UI, text, frames, humans, furniture, or a photo background."
  ].join(" ");
}

ipcMain.handle("deskpaw:open-pet-window", async () => {
  try {
    return await createPetWindow();
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
});

ipcMain.handle("deskpaw:generate-styled-pet", async (_event, payload) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "missing OPENAI_API_KEY", provider: "openai" };
  }

  try {
    const form = new FormData();
    form.append("model", imageModel);
    form.append("image[]", dataUrlToBlob(payload.imageDataUrl), "pet.png");
    form.append("prompt", stylePrompt(payload));
    form.append("size", "1024x1024");
    form.append("quality", "medium");
    form.append("background", "transparent");

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form
    });
    const json = await response.json();

    if (!response.ok) {
      return { ok: false, error: json.error?.message || response.statusText, provider: "openai" };
    }

    const base64 = json.data?.[0]?.b64_json;
    if (!base64) return { ok: false, error: "No image returned", provider: "openai" };
    return { ok: true, imageDataUrl: `data:image/png;base64,${base64}`, provider: "openai" };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error), provider: "openai" };
  }
});

app.whenReady().then(() => {
  createMainWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

