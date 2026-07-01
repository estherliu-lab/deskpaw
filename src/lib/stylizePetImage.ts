import type { PetAction, PetStyle, PetType } from "../types/pet";
import type { StyledPetRequest, StyledPetResult } from "../types/desktop";

const size = 768;

export function hasDesktopAiGenerator() {
  return Boolean(window.deskpawDesktop?.generateStyledPet);
}

export async function createStyledPetImage(request: StyledPetRequest): Promise<StyledPetResult> {
  if (!request.imageDataUrl) return { ok: false, error: "missing-image" };

  if (window.deskpawDesktop?.generateStyledPet) {
    const result = await window.deskpawDesktop.generateStyledPet(request);
    if (result.ok && result.imageDataUrl) return result;
  }

  return {
    ok: true,
    provider: "local",
    imageDataUrl: await renderLocalStyledPet(request.imageDataUrl, request.styleId, request.petType, request.actionId)
  };
}

export async function renderLocalStyledPet(
  imageDataUrl: string,
  styleId: PetStyle,
  petType: PetType,
  actionId?: PetAction
): Promise<string> {
  const image = await loadImage(imageDataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return imageDataUrl;

  ctx.clearRect(0, 0, size, size);
  drawSubjectBase(ctx, image, styleId, petType, actionId);
  applyStyleFinish(ctx, styleId);
  return canvas.toDataURL("image/png");
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawSubjectBase(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  styleId: PetStyle,
  petType: PetType,
  actionId?: PetAction
) {
  const subject = subjectShape(petType, actionId);

  ctx.save();
  ctx.translate(size / 2, size / 2 + subject.offsetY);
  ctx.rotate(subject.rotate);
  ctx.scale(subject.scaleX, subject.scaleY);
  drawShapePath(ctx, subject.kind);
  ctx.clip();
  coverImage(ctx, image, -size / 2, -size / 2, size, size);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  ctx.translate(size / 2, size / 2 + subject.offsetY);
  ctx.rotate(subject.rotate);
  ctx.scale(subject.scaleX, subject.scaleY);
  drawShapePath(ctx, subject.kind);
  ctx.fill();
  ctx.restore();

  if (styleId !== "minimal-line") {
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "rgba(255, 253, 248, 0.01)";
    ctx.fillRect(0, 0, size, size);
    ctx.restore();
  }
}

function subjectShape(petType: PetType, actionId?: PetAction) {
  const longBody = petType === "dog" || petType === "cat";
  const resting = actionId === "lying-rest" || actionId === "sleeping";
  return {
    kind: resting ? "rest" : longBody ? "pet" : "round",
    offsetY: resting ? 44 : 12,
    rotate: actionId === "head-tilt" ? -0.06 : actionId === "grumpy" ? 0.04 : 0,
    scaleX: resting ? 1.08 : 1,
    scaleY: actionId === "sitting" ? 0.94 : resting ? 0.82 : 1
  };
}

function drawShapePath(ctx: CanvasRenderingContext2D, kind: string) {
  ctx.beginPath();
  if (kind === "rest") {
    ctx.ellipse(0, 54, 300, 178, -0.08, 0, Math.PI * 2);
    ctx.ellipse(64, -104, 178, 148, 0.08, 0, Math.PI * 2);
    ctx.rect(-290, -20, 580, 260);
    return;
  }

  if (kind === "round") {
    ctx.ellipse(0, 0, 276, 302, 0, 0, Math.PI * 2);
    return;
  }

  ctx.ellipse(0, 62, 260, 224, 0, 0, Math.PI * 2);
  ctx.ellipse(22, -136, 202, 168, 0, 0, Math.PI * 2);
  ctx.ellipse(-174, -168, 70, 118, -0.28, 0, Math.PI * 2);
  ctx.ellipse(190, -164, 70, 118, 0.28, 0, Math.PI * 2);
}

function coverImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function applyStyleFinish(ctx: CanvasRenderingContext2D, styleId: PetStyle) {
  const original = ctx.getImageData(0, 0, size, size);
  const data = original.data;

  if (styleId === "pixel-game") pixelate(ctx, 16);
  if (styleId === "minimal-line") lineArt(ctx, original);

  tunePixels(data, styleId);
  ctx.putImageData(original, 0, 0);

  if (styleId === "wool-felt") drawWoolFibers(ctx, original);
  if (styleId === "watercolor" || styleId === "japanese-journal" || styleId === "fairy-tale") drawPaperWash(ctx, styleId);
  if (styleId === "cartoon-sticker" || styleId === "social-cute") drawStickerOutline(ctx);
  if (styleId === "soft-3d-toy") drawToyHighlights(ctx);
  if (styleId === "dreamy-stardust" || styleId === "night-companion") drawSparkles(ctx);
}

function tunePixels(data: Uint8ClampedArray, styleId: PetStyle) {
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 8) continue;
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    const gray = (r + g + b) / 3;

    if (styleId === "wool-felt") {
      r = r * 1.08 + 12;
      g = g * 1.02 + 8;
      b = b * 0.92;
    } else if (styleId === "watercolor") {
      r = r * 1.06 + 10;
      g = g * 1.05 + 8;
      b = b * 1.08 + 12;
      data[i + 3] *= 0.92;
    } else if (styleId === "pixel-game" || styleId === "meme-expressive") {
      r = r * 1.18;
      g = g * 1.12;
      b = b * 1.08;
    } else if (styleId === "minimal-line") {
      r = g = b = gray > 150 ? 248 : 40;
    } else if (styleId === "night-companion" || styleId === "dreamy-stardust") {
      r = r * 0.78 + 34;
      g = g * 0.76 + 38;
      b = b * 1.12 + 44;
    } else if (styleId === "forest-nature") {
      r *= 0.92;
      g = g * 1.08 + 8;
      b *= 0.9;
    } else {
      r = r * 1.04 + 6;
      g = g * 1.02 + 4;
      b = b * 1.01 + 4;
    }

    data[i] = clamp(r);
    data[i + 1] = clamp(g);
    data[i + 2] = clamp(b);
  }
}

function pixelate(ctx: CanvasRenderingContext2D, blockSize: number) {
  const small = document.createElement("canvas");
  small.width = Math.ceil(size / blockSize);
  small.height = Math.ceil(size / blockSize);
  const smallCtx = small.getContext("2d");
  if (!smallCtx) return;
  smallCtx.imageSmoothingEnabled = false;
  smallCtx.drawImage(ctx.canvas, 0, 0, small.width, small.height);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(small, 0, 0, size, size);
  ctx.imageSmoothingEnabled = true;
}

function lineArt(ctx: CanvasRenderingContext2D, imageData: ImageData) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 8) continue;
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const ink = gray < 118 ? 34 : gray < 178 ? 110 : 248;
    data[i] = data[i + 1] = data[i + 2] = ink;
  }
}

function drawWoolFibers(ctx: CanvasRenderingContext2D, imageData: ImageData) {
  const data = imageData.data;
  ctx.save();
  ctx.globalAlpha = 0.42;
  ctx.lineCap = "round";
  for (let i = 0; i < 3800; i++) {
    const x = seeded(i * 17) * size;
    const y = seeded(i * 31 + 7) * size;
    const index = (Math.floor(y) * size + Math.floor(x)) * 4;
    if (data[index + 3] < 30) continue;
    const angle = seeded(i * 43) * Math.PI * 2;
    const len = 5 + seeded(i * 59) * 15;
    ctx.strokeStyle = `rgba(${data[index]}, ${data[index + 1]}, ${data[index + 2]}, 0.55)`;
    ctx.lineWidth = 1 + seeded(i * 71) * 2.4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPaperWash(ctx: CanvasRenderingContext2D, styleId: PetStyle) {
  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  ctx.globalAlpha = styleId === "watercolor" ? 0.28 : 0.18;
  for (let i = 0; i < 80; i++) {
    const x = seeded(i * 9) * size;
    const y = seeded(i * 13) * size;
    const radius = 28 + seeded(i * 19) * 90;
    ctx.fillStyle = i % 2 ? "rgba(255,253,248,0.7)" : "rgba(91,145,150,0.16)";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawStickerOutline(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.globalCompositeOperation = "destination-over";
  for (let offset = 22; offset >= 8; offset -= 7) {
    ctx.shadowColor = offset > 10 ? "rgba(255,255,255,0.95)" : "rgba(40,48,52,0.75)";
    ctx.shadowBlur = offset;
    ctx.drawImage(ctx.canvas, 0, 0);
  }
  ctx.restore();
}

function drawToyHighlights(ctx: CanvasRenderingContext2D) {
  const gradient = ctx.createRadialGradient(250, 180, 20, 250, 180, 360);
  gradient.addColorStop(0, "rgba(255,255,255,0.45)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();
}

function drawSparkles(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillStyle = "rgba(255,253,248,0.82)";
  for (let i = 0; i < 28; i++) {
    const x = seeded(i * 23) * size;
    const y = seeded(i * 29) * size;
    const r = 1.5 + seeded(i * 31) * 3.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function clamp(value: number) {
  return Math.max(0, Math.min(255, value));
}

function seeded(value: number) {
  const x = Math.sin(value * 999) * 10000;
  return x - Math.floor(x);
}

