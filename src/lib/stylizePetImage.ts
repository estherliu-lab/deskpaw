import type { PetAction, PetStyle, PetType } from "../types/pet";
import type { StyledPetRequest, StyledPetResult } from "../types/desktop";

const size = 768;

interface Palette {
  base: string;
  light: string;
  dark: string;
  blush: string;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SourceSubject {
  image: HTMLImageElement;
  mask: HTMLCanvasElement;
  crop: Rect;
}

interface Pose {
  bodyY: number;
  headX: number;
  headY: number;
  headRotate: number;
  bodyScaleX: number;
  bodyScaleY: number;
  pawLift: number;
  tailRotate: number;
  eyeScaleY: number;
  mouth: "smile" | "sleep" | "pout" | "grumpy";
}

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
  actionId: PetAction = "idle-standing"
): Promise<string> {
  const image = await loadImage(imageDataUrl);
  const palette = samplePalette(image);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return imageDataUrl;

  ctx.clearRect(0, 0, size, size);
  const subject = extractSourceSubject(image);
  drawPhotoBasedPet(ctx, subject, palette, styleId, petType, actionId);
  applyFinish(ctx, styleId, palette);
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

function extractSourceSubject(image: HTMLImageElement): SourceSubject {
  const probeSize = 220;
  const probe = document.createElement("canvas");
  probe.width = probeSize;
  probe.height = probeSize;
  const probeCtx = probe.getContext("2d", { willReadFrequently: true });
  if (!probeCtx) {
    return {
      image,
      mask: createFullMask(image.width, image.height),
      crop: fullImageCrop(image)
    };
  }

  const fit = containRect(image.width, image.height, probeSize, probeSize);
  probeCtx.clearRect(0, 0, probeSize, probeSize);
  probeCtx.drawImage(image, fit.x, fit.y, fit.width, fit.height);
  const data = probeCtx.getImageData(0, 0, probeSize, probeSize);
  const corners = [
    sampleAverage(data, 0, 0, 30, 30, probeSize),
    sampleAverage(data, probeSize - 30, 0, 30, 30, probeSize),
    sampleAverage(data, 0, probeSize - 30, 30, 30, probeSize),
    sampleAverage(data, probeSize - 30, probeSize - 30, 30, 30, probeSize)
  ];
  const bg = averageRgb(corners);
  const alpha = new Uint8ClampedArray(probeSize * probeSize);
  let minX = probeSize;
  let minY = probeSize;
  let maxX = 0;
  let maxY = 0;
  let hits = 0;

  for (let y = 0; y < probeSize; y++) {
    for (let x = 0; x < probeSize; x++) {
      const i = (y * probeSize + x) * 4;
      const r = data.data[i];
      const g = data.data[i + 1];
      const b = data.data[i + 2];
      const a = data.data[i + 3];
      const brightness = (r + g + b) / 3;
      const contrast = colorDistance([r, g, b], bg);
      const centerBias = 1 - Math.min(1, Math.hypot(x - probeSize / 2, y - probeSize / 2) / (probeSize * 0.72));
      const keep = a > 24 && (contrast > 34 || centerBias > 0.42) && brightness < 248;
      if (!keep) continue;
      alpha[y * probeSize + x] = Math.round(155 + centerBias * 100);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      hits++;
    }
  }

  const usableMask = hits > probeSize * probeSize * 0.05 && maxX > minX && maxY > minY;
  if (!usableMask) {
    return {
      image,
      mask: createFullMask(image.width, image.height),
      crop: fullImageCrop(image)
    };
  }

  const mask = document.createElement("canvas");
  mask.width = probeSize;
  mask.height = probeSize;
  const maskCtx = mask.getContext("2d", { willReadFrequently: true });
  if (!maskCtx) {
    return {
      image,
      mask: createFullMask(image.width, image.height),
      crop: fullImageCrop(image)
    };
  }
  const maskImage = maskCtx.createImageData(probeSize, probeSize);
  for (let i = 0; i < alpha.length; i++) {
    const edgeSoftness = alpha[i];
    maskImage.data[i * 4] = 255;
    maskImage.data[i * 4 + 1] = 255;
    maskImage.data[i * 4 + 2] = 255;
    maskImage.data[i * 4 + 3] = edgeSoftness;
  }
  maskCtx.putImageData(maskImage, 0, 0);
  featherMask(maskCtx, mask, 7);

  const pad = 20;
  const cropProbe = {
    x: Math.max(fit.x, minX - pad),
    y: Math.max(fit.y, minY - pad),
    width: Math.min(fit.x + fit.width, maxX + pad) - Math.max(fit.x, minX - pad),
    height: Math.min(fit.y + fit.height, maxY + pad) - Math.max(fit.y, minY - pad)
  };
  const scaleX = image.width / fit.width;
  const scaleY = image.height / fit.height;
  const crop = {
    x: Math.max(0, (cropProbe.x - fit.x) * scaleX),
    y: Math.max(0, (cropProbe.y - fit.y) * scaleY),
    width: Math.min(image.width, cropProbe.width * scaleX),
    height: Math.min(image.height, cropProbe.height * scaleY)
  };

  const croppedMask = document.createElement("canvas");
  croppedMask.width = Math.max(1, Math.round(cropProbe.width));
  croppedMask.height = Math.max(1, Math.round(cropProbe.height));
  const croppedMaskCtx = croppedMask.getContext("2d");
  if (!croppedMaskCtx) return { image, mask, crop };
  croppedMaskCtx.drawImage(
    mask,
    cropProbe.x,
    cropProbe.y,
    cropProbe.width,
    cropProbe.height,
    0,
    0,
    croppedMask.width,
    croppedMask.height
  );

  return { image, mask: croppedMask, crop };
}

function drawPhotoBasedPet(
  ctx: CanvasRenderingContext2D,
  subject: SourceSubject,
  palette: Palette,
  styleId: PetStyle,
  petType: PetType,
  actionId: PetAction
) {
  const pose = poseFor(actionId);
  const stage = document.createElement("canvas");
  stage.width = size;
  stage.height = size;
  const stageCtx = stage.getContext("2d", { willReadFrequently: true });
  if (!stageCtx) {
    drawStylizedMascot(ctx, palette, styleId, petType, actionId);
    return;
  }

  const target = fitSubjectTarget(subject.crop, pose, actionId);
  stageCtx.save();
  stageCtx.translate(target.x + target.width / 2, target.y + target.height / 2);
  stageCtx.rotate(pose.headRotate * 0.35);
  stageCtx.scale(pose.bodyScaleX, pose.bodyScaleY);
  stageCtx.translate(-(target.x + target.width / 2), -(target.y + target.height / 2));
  stageCtx.drawImage(
    subject.image,
    subject.crop.x,
    subject.crop.y,
    subject.crop.width,
    subject.crop.height,
    target.x,
    target.y,
    target.width,
    target.height
  );
  stageCtx.globalCompositeOperation = "destination-in";
  stageCtx.drawImage(subject.mask, target.x, target.y, target.width, target.height);
  stageCtx.restore();
  stageCtx.globalCompositeOperation = "source-over";

  transformSubjectPixels(stageCtx, styleId, palette);
  drawSubjectSilhouette(ctx, stage, styleId, palette);
  ctx.drawImage(stage, 0, 0);
  drawPhotoStyleAccents(ctx, target, palette, styleId, petType, actionId);
}

function fitSubjectTarget(crop: Rect, pose: Pose, actionId: PetAction): Rect {
  const maxWidth = actionId === "lying-rest" || actionId === "sleeping" ? 620 : 570;
  const maxHeight = actionId === "lying-rest" || actionId === "sleeping" ? 430 : 590;
  const scale = Math.min(maxWidth / crop.width, maxHeight / crop.height);
  const width = crop.width * scale;
  const height = crop.height * scale;
  const x = (size - width) / 2 + pose.headX * 0.16;
  const y = (size - height) / 2 + 24 + pose.bodyY - (actionId === "happy-jumping" || actionId === "celebration" ? 44 : 0);
  return { x, y, width, height };
}

function transformSubjectPixels(ctx: CanvasRenderingContext2D, styleId: PetStyle, palette: Palette) {
  const image = ctx.getImageData(0, 0, size, size);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 8) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = (r + g + b) / 3;
    const warm = parseColor(palette.light);
    const base = parseColor(palette.base);
    const dark = parseColor(palette.dark);

    if (styleId === "wool-felt") {
      const felt = gray > 172 ? warm : gray < 82 ? dark : base;
      data[i] = Math.round(r * 0.34 + felt[0] * 0.66);
      data[i + 1] = Math.round(g * 0.34 + felt[1] * 0.66);
      data[i + 2] = Math.round(b * 0.34 + felt[2] * 0.66);
      data[i + 3] = Math.min(255, data[i + 3] + 18);
    } else if (styleId === "watercolor" || styleId === "japanese-journal" || styleId === "fairy-tale") {
      data[i] = Math.round(r * 0.74 + warm[0] * 0.26);
      data[i + 1] = Math.round(g * 0.74 + warm[1] * 0.26);
      data[i + 2] = Math.round(b * 0.74 + warm[2] * 0.26);
      data[i + 3] = Math.round(data[i + 3] * 0.88);
    } else if (styleId === "minimal-line") {
      const ink = gray < 150 ? 38 : 255;
      data[i] = data[i + 1] = data[i + 2] = ink;
    } else if (styleId === "pixel-game") {
      data[i] = quantize(r, 48);
      data[i + 1] = quantize(g, 48);
      data[i + 2] = quantize(b, 48);
    } else if (styleId === "night-companion" || styleId === "dreamy-stardust") {
      data[i] = Math.round(r * 0.58 + 72);
      data[i + 1] = Math.round(g * 0.54 + 72);
      data[i + 2] = Math.round(b * 0.72 + 96);
    } else if (styleId === "soft-3d-toy") {
      data[i] = Math.min(255, Math.round(r * 1.08 + 18));
      data[i + 1] = Math.min(255, Math.round(g * 1.08 + 18));
      data[i + 2] = Math.min(255, Math.round(b * 1.08 + 18));
    } else if (styleId === "cartoon-sticker" || styleId === "social-cute") {
      data[i] = Math.min(255, quantize(r, 28) + 8);
      data[i + 1] = Math.min(255, quantize(g, 28) + 8);
      data[i + 2] = Math.min(255, quantize(b, 28) + 8);
    }
  }
  ctx.putImageData(image, 0, 0);
  if (styleId === "pixel-game") pixelate(ctx, 18);
  if (styleId === "wool-felt") softenSubject(ctx, 0.45);
}

function drawSubjectSilhouette(ctx: CanvasRenderingContext2D, stage: HTMLCanvasElement, styleId: PetStyle, palette: Palette) {
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.shadowColor =
    styleId === "cartoon-sticker" || styleId === "social-cute"
      ? "rgba(255,253,248,0.98)"
      : styleId === "minimal-line"
        ? "rgba(40,48,52,0.8)"
        : "rgba(40,48,52,0.22)";
  ctx.shadowBlur = styleId === "cartoon-sticker" || styleId === "social-cute" ? 26 : 18;
  ctx.drawImage(stage, 0, 0);
  ctx.shadowBlur = styleId === "cartoon-sticker" || styleId === "social-cute" ? 10 : 4;
  ctx.shadowColor = styleId === "minimal-line" ? "#283034" : toAlpha(palette.dark, 0.42);
  ctx.drawImage(stage, 0, 0);
  ctx.restore();
}

function drawPhotoStyleAccents(
  ctx: CanvasRenderingContext2D,
  target: Rect,
  palette: Palette,
  styleId: PetStyle,
  petType: PetType,
  actionId: PetAction
) {
  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  if (styleId === "wool-felt") {
    ctx.lineCap = "round";
    for (let i = 0; i < 2600; i++) {
      const x = target.x + seeded(i * 19) * target.width;
      const y = target.y + seeded(i * 23) * target.height;
      const angle = seeded(i * 31) * Math.PI * 2;
      const len = 5 + seeded(i * 41) * 18;
      ctx.strokeStyle = i % 2 ? "rgba(255,253,248,0.44)" : toAlpha(palette.dark, 0.2);
      ctx.lineWidth = 1.1 + seeded(i * 47) * 2.8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
      ctx.stroke();
    }
  }

  if (styleId === "watercolor" || styleId === "japanese-journal") {
    ctx.globalAlpha = 0.28;
    for (let i = 0; i < 26; i++) {
      ctx.fillStyle = i % 2 ? "rgba(255,253,248,0.72)" : "rgba(73,127,131,0.2)";
      ctx.beginPath();
      ctx.ellipse(
        target.x + seeded(i * 7) * target.width,
        target.y + seeded(i * 11) * target.height,
        24 + seeded(i * 13) * 60,
        14 + seeded(i * 17) * 42,
        seeded(i * 19) * Math.PI,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }
  ctx.restore();

  ctx.save();
  if (actionId === "affection" || styleId === "social-cute") {
    ctx.fillStyle = "rgba(233,120,99,0.78)";
    drawHeart(ctx, target.x + target.width * 0.76, target.y + target.height * 0.16, 22);
  }
  if (actionId === "water-reminder") {
    ctx.fillStyle = "rgba(73,127,131,0.78)";
    drawDrop(ctx, target.x + target.width * 0.72, target.y + target.height * 0.2, 26);
  }
  if (petType === "bird") {
    ctx.strokeStyle = toAlpha(palette.dark, 0.32);
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(target.x + target.width * 0.55, target.y + target.height * 0.45, target.width * 0.16, -0.2, 0.8);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, radius * 0.72);
  ctx.bezierCurveTo(-radius * 1.15, -radius * 0.12, -radius * 0.86, -radius * 0.92, 0, -radius * 0.42);
  ctx.bezierCurveTo(radius * 0.86, -radius * 0.92, radius * 1.15, -radius * 0.12, 0, radius * 0.72);
  ctx.fill();
  ctx.restore();
}

function drawDrop(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, -radius);
  ctx.bezierCurveTo(radius * 0.82, -radius * 0.16, radius * 0.72, radius * 0.78, 0, radius);
  ctx.bezierCurveTo(-radius * 0.72, radius * 0.78, -radius * 0.82, -radius * 0.16, 0, -radius);
  ctx.fill();
  ctx.restore();
}

function containRect(sourceWidth: number, sourceHeight: number, targetWidth: number, targetHeight: number): Rect {
  const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  return {
    x: (targetWidth - width) / 2,
    y: (targetHeight - height) / 2,
    width,
    height
  };
}

function fullImageCrop(image: HTMLImageElement): Rect {
  const padX = image.width * 0.04;
  const padY = image.height * 0.04;
  return {
    x: padX,
    y: padY,
    width: Math.max(1, image.width - padX * 2),
    height: Math.max(1, image.height - padY * 2)
  };
}

function createFullMask(width: number, height: number) {
  const mask = document.createElement("canvas");
  mask.width = width;
  mask.height = height;
  const ctx = mask.getContext("2d");
  if (!ctx) return mask;
  const gradient = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.18, width / 2, height / 2, Math.max(width, height) * 0.56);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.74, "rgba(255,255,255,0.98)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  return mask;
}

function featherMask(ctx: CanvasRenderingContext2D, mask: HTMLCanvasElement, blur: number) {
  const copy = document.createElement("canvas");
  copy.width = mask.width;
  copy.height = mask.height;
  const copyCtx = copy.getContext("2d");
  if (!copyCtx) return;
  copyCtx.filter = `blur(${blur}px)`;
  copyCtx.drawImage(mask, 0, 0);
  ctx.clearRect(0, 0, mask.width, mask.height);
  ctx.drawImage(copy, 0, 0);
}

function sampleAverage(image: ImageData, x: number, y: number, width: number, height: number, stride: number): [number, number, number] {
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  for (let yy = y; yy < y + height; yy++) {
    for (let xx = x; xx < x + width; xx++) {
      const i = (yy * stride + xx) * 4;
      if (image.data[i + 3] < 10) continue;
      r += image.data[i];
      g += image.data[i + 1];
      b += image.data[i + 2];
      count++;
    }
  }
  return [Math.round(r / Math.max(1, count)), Math.round(g / Math.max(1, count)), Math.round(b / Math.max(1, count))];
}

function averageRgb(colors: Array<[number, number, number]>): [number, number, number] {
  return [
    Math.round(colors.reduce((sum, color) => sum + color[0], 0) / colors.length),
    Math.round(colors.reduce((sum, color) => sum + color[1], 0) / colors.length),
    Math.round(colors.reduce((sum, color) => sum + color[2], 0) / colors.length)
  ];
}

function colorDistance(a: [number, number, number], b: [number, number, number]) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function parseColor(color: string): [number, number, number] {
  if (color.startsWith("#") && color.length === 7) {
    return [Number.parseInt(color.slice(1, 3), 16), Number.parseInt(color.slice(3, 5), 16), Number.parseInt(color.slice(5, 7), 16)];
  }
  const match = color.match(/\d+/g);
  if (!match) return [217, 167, 108];
  return [Number(match[0]), Number(match[1]), Number(match[2])];
}

function quantize(value: number, step: number) {
  return Math.max(0, Math.min(255, Math.round(value / step) * step));
}

function softenSubject(ctx: CanvasRenderingContext2D, alpha: number) {
  const copy = document.createElement("canvas");
  copy.width = size;
  copy.height = size;
  const copyCtx = copy.getContext("2d");
  if (!copyCtx) return;
  copyCtx.filter = "blur(1.2px)";
  copyCtx.drawImage(ctx.canvas, 0, 0);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(copy, 0, 0);
  ctx.restore();
}

function samplePalette(image: HTMLImageElement): Palette {
  const canvas = document.createElement("canvas");
  canvas.width = 80;
  canvas.height = 80;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return fallbackPalette();
  ctx.drawImage(image, 0, 0, 80, 80);
  const data = ctx.getImageData(0, 0, 80, 80).data;
  const samples: Array<[number, number, number, number]> = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max - min;
    const brightness = (r + g + b) / 3;
    if (brightness > 235 || brightness < 22 || saturation < 7) continue;
    samples.push([r, g, b, brightness]);
  }

  if (samples.length < 40) return fallbackPalette();
  samples.sort((a, b) => a[3] - b[3]);
  const middle = average(samples.slice(Math.floor(samples.length * 0.28), Math.floor(samples.length * 0.68)));
  const light = average(samples.slice(Math.floor(samples.length * 0.68), Math.floor(samples.length * 0.9)));
  const dark = average(samples.slice(Math.floor(samples.length * 0.06), Math.floor(samples.length * 0.24)));

  return {
    base: rgb(middle),
    light: rgb(mix(light, [255, 244, 224], 0.28)),
    dark: rgb(mix(dark, [44, 34, 28], 0.3)),
    blush: "rgba(235, 136, 132, 0.46)"
  };
}

function fallbackPalette(): Palette {
  return {
    base: "#d9a76c",
    light: "#fff0d2",
    dark: "#4a3325",
    blush: "rgba(235, 136, 132, 0.46)"
  };
}

function drawStylizedMascot(ctx: CanvasRenderingContext2D, palette: Palette, styleId: PetStyle, petType: PetType, actionId: PetAction) {
  const pose = poseFor(actionId);
  const line = styleId === "minimal-line" ? "#283034" : palette.dark;
  const strokeWidth = styleId === "pixel-game" ? 10 : styleId === "minimal-line" ? 9 : 7;

  ctx.save();
  ctx.translate(size / 2, size / 2 + 40 + pose.bodyY);
  if (actionId === "happy-jumping" || actionId === "celebration") ctx.translate(0, -38);
  ctx.scale(pose.bodyScaleX, pose.bodyScaleY);

  drawShadow(ctx, styleId);
  drawTail(ctx, palette, line, strokeWidth, petType, pose, styleId);
  drawBody(ctx, palette, line, strokeWidth, styleId);
  drawPaws(ctx, palette, line, strokeWidth, pose, styleId);
  drawHead(ctx, palette, line, strokeWidth, petType, pose, styleId);
  drawFace(ctx, palette, pose, styleId);
  drawStyleProps(ctx, styleId, palette);

  ctx.restore();
}

function poseFor(actionId: PetAction): Pose {
  const poses: Partial<Record<PetAction, Partial<Pose>>> = {
    sitting: { bodyY: 24, bodyScaleY: 0.92, headY: 8 },
    "lying-rest": { bodyY: 58, bodyScaleX: 1.22, bodyScaleY: 0.72, headX: 52, headY: 38, headRotate: -0.12 },
    sleeping: { bodyY: 58, bodyScaleX: 1.18, bodyScaleY: 0.7, headX: 48, headY: 42, headRotate: -0.14, eyeScaleY: 0.08, mouth: "sleep" },
    "happy-jumping": { bodyY: -18, bodyScaleY: 1.05, pawLift: 38, tailRotate: 0.45 },
    affection: { tailRotate: 0.65, headRotate: -0.08 },
    blinking: { eyeScaleY: 0.08 },
    "head-tilt": { headRotate: 0.24, headX: 20, headY: -6 },
    grumpy: { headRotate: -0.06, mouth: "grumpy" },
    pouty: { bodyY: 18, eyeScaleY: 0.82, mouth: "pout" },
    stretching: { bodyScaleX: 1.2, bodyScaleY: 0.86, headX: 66, headY: 28, pawLift: -12 },
    "water-reminder": { pawLift: 58, headRotate: -0.05 },
    waving: { pawLift: 72, headRotate: 0.08 },
    celebration: { bodyY: -28, pawLift: 84, tailRotate: 0.6 },
    "focus-mode": { bodyY: 0, eyeScaleY: 0.72 }
  };
  return {
    bodyY: 0,
    headX: 0,
    headY: 0,
    headRotate: 0,
    bodyScaleX: 1,
    bodyScaleY: 1,
    pawLift: 0,
    tailRotate: 0.2,
    eyeScaleY: 1,
    mouth: "smile",
    ...poses[actionId]
  };
}

function drawShadow(ctx: CanvasRenderingContext2D, styleId: PetStyle) {
  ctx.save();
  ctx.globalAlpha = styleId === "night-companion" ? 0.18 : 0.14;
  ctx.fillStyle = "#283034";
  ctx.beginPath();
  ctx.ellipse(0, 226, 220, 48, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBody(ctx: CanvasRenderingContext2D, palette: Palette, line: string, strokeWidth: number, styleId: PetStyle) {
  const fill = bodyFill(ctx, palette, styleId, -210, -40, 420, 330);
  ctx.save();
  ctx.fillStyle = fill;
  ctx.strokeStyle = line;
  ctx.lineWidth = strokeWidth;
  ctx.beginPath();
  ctx.ellipse(0, 86, 178, 164, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  drawPatch(ctx, -52, 52, 68, 88, palette.light, 0.82);
  ctx.restore();
}

function drawHead(
  ctx: CanvasRenderingContext2D,
  palette: Palette,
  line: string,
  strokeWidth: number,
  petType: PetType,
  pose: Pose,
  styleId: PetStyle
) {
  ctx.save();
  ctx.translate(pose.headX, -110 + pose.headY);
  ctx.rotate(pose.headRotate);

  const floppy = petType === "dog";
  ctx.fillStyle = bodyFill(ctx, palette, styleId, -180, -190, 360, 260);
  ctx.strokeStyle = line;
  ctx.lineWidth = strokeWidth;

  if (floppy) {
    drawEar(ctx, -138, -28, -0.46, palette.base, line, strokeWidth, styleId);
    drawEar(ctx, 138, -28, 0.46, palette.base, line, strokeWidth, styleId);
  } else {
    drawTriangleEar(ctx, -92, -116, -0.22, palette.base, line, strokeWidth);
    drawTriangleEar(ctx, 92, -116, 0.22, palette.base, line, strokeWidth);
  }

  ctx.beginPath();
  ctx.ellipse(0, -18, 152, 130, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  drawPatch(ctx, -38, 18, 92, 62, palette.light, 0.88);
  ctx.restore();
}

function drawEar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rotate: number,
  fill: string,
  line: string,
  strokeWidth: number,
  styleId: PetStyle
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotate);
  ctx.fillStyle = styleId === "wool-felt" ? fill : fill;
  ctx.strokeStyle = line;
  ctx.lineWidth = strokeWidth;
  ctx.beginPath();
  ctx.ellipse(0, 0, 48, 98, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawTriangleEar(ctx: CanvasRenderingContext2D, x: number, y: number, rotate: number, fill: string, line: string, strokeWidth: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotate);
  ctx.fillStyle = fill;
  ctx.strokeStyle = line;
  ctx.lineWidth = strokeWidth;
  ctx.beginPath();
  ctx.moveTo(0, -74);
  ctx.lineTo(-56, 44);
  ctx.lineTo(56, 44);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawTail(
  ctx: CanvasRenderingContext2D,
  palette: Palette,
  line: string,
  strokeWidth: number,
  petType: PetType,
  pose: Pose,
  styleId: PetStyle
) {
  if (petType === "bird") return;
  ctx.save();
  ctx.translate(154, 66);
  ctx.rotate(-0.55 + pose.tailRotate);
  ctx.strokeStyle = line;
  ctx.lineWidth = strokeWidth + 18;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(76, -86, 126, -10);
  ctx.stroke();
  ctx.strokeStyle = styleId === "wool-felt" ? palette.light : palette.base;
  ctx.lineWidth = strokeWidth + 8;
  ctx.stroke();
  ctx.restore();
}

function drawPaws(ctx: CanvasRenderingContext2D, palette: Palette, line: string, strokeWidth: number, pose: Pose, styleId: PetStyle) {
  const pawFill = styleId === "minimal-line" ? "#fffdf8" : palette.light;
  drawPaw(ctx, -88, 196 - pose.pawLift * 0.2, -0.08, pawFill, line, strokeWidth);
  drawPaw(ctx, 88, 196 - pose.pawLift, 0.16, pawFill, line, strokeWidth);
}

function drawPaw(ctx: CanvasRenderingContext2D, x: number, y: number, rotate: number, fill: string, line: string, strokeWidth: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotate);
  ctx.fillStyle = fill;
  ctx.strokeStyle = line;
  ctx.lineWidth = strokeWidth;
  ctx.beginPath();
  ctx.ellipse(0, 0, 54, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawFace(ctx: CanvasRenderingContext2D, palette: Palette, pose: Pose, styleId: PetStyle) {
  ctx.save();
  ctx.translate(pose.headX, -110 + pose.headY);
  ctx.rotate(pose.headRotate);
  const eye = styleId === "minimal-line" ? "#283034" : "#1f1c18";
  ctx.fillStyle = eye;
  drawEye(ctx, -54, -34, pose.eyeScaleY);
  drawEye(ctx, 54, -34, pose.eyeScaleY);

  ctx.fillStyle = styleId === "wool-felt" ? "#3c2a21" : "#231f1b";
  ctx.beginPath();
  ctx.ellipse(0, 8, 22, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#3a2a23";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  if (pose.mouth === "sleep") {
    ctx.arc(0, 44, 36, 0.15, Math.PI - 0.15);
  } else if (pose.mouth === "pout") {
    ctx.moveTo(-20, 52);
    ctx.quadraticCurveTo(0, 40, 20, 52);
  } else if (pose.mouth === "grumpy") {
    ctx.moveTo(-26, 52);
    ctx.lineTo(26, 42);
  } else {
    ctx.moveTo(0, 24);
    ctx.quadraticCurveTo(-24, 58, -54, 44);
    ctx.moveTo(0, 24);
    ctx.quadraticCurveTo(24, 58, 54, 44);
  }
  ctx.stroke();

  ctx.fillStyle = palette.blush;
  ctx.beginPath();
  ctx.ellipse(-92, 24, 28, 16, 0, 0, Math.PI * 2);
  ctx.ellipse(92, 24, 28, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawEye(ctx: CanvasRenderingContext2D, x: number, y: number, scaleY: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, Math.max(0.08, scaleY));
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  if (scaleY > 0.2) {
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.beginPath();
    ctx.arc(-7, -8, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawPatch(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fill: string, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, width, height, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawStyleProps(ctx: CanvasRenderingContext2D, styleId: PetStyle, palette: Palette) {
  if (styleId === "retro-desktop") {
    ctx.save();
    ctx.fillStyle = "#fffdf8";
    ctx.strokeStyle = palette.dark;
    ctx.lineWidth = 6;
    roundedRect(ctx, -120, 230, 240, 34, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function bodyFill(ctx: CanvasRenderingContext2D, palette: Palette, styleId: PetStyle, x: number, y: number, width: number, height: number) {
  if (styleId === "minimal-line") return "#fffdf8";
  if (styleId === "night-companion" || styleId === "dreamy-stardust") {
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, "#66709a");
    gradient.addColorStop(1, palette.base);
    return gradient;
  }
  if (styleId === "soft-3d-toy") {
    const gradient = ctx.createRadialGradient(x + width * 0.3, y + height * 0.22, 20, x + width * 0.5, y + height * 0.5, width * 0.66);
    gradient.addColorStop(0, palette.light);
    gradient.addColorStop(1, palette.base);
    return gradient;
  }
  return palette.base;
}

function applyFinish(ctx: CanvasRenderingContext2D, styleId: PetStyle, palette: Palette) {
  if (styleId === "pixel-game") pixelate(ctx, 18);
  if (styleId === "minimal-line") applyLineArt(ctx);
  if (styleId === "wool-felt") drawWoolFibers(ctx, palette);
  if (styleId === "watercolor" || styleId === "japanese-journal" || styleId === "fairy-tale") drawPaperWash(ctx, styleId);
  if (styleId === "cartoon-sticker" || styleId === "social-cute") drawStickerOutline(ctx);
  if (styleId === "soft-3d-toy") drawToyHighlights(ctx);
  if (styleId === "dreamy-stardust" || styleId === "night-companion") drawSparkles(ctx);
  if (styleId === "forest-nature") drawLeaves(ctx, palette);
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

function applyLineArt(ctx: CanvasRenderingContext2D) {
  const image = ctx.getImageData(0, 0, size, size);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 20) continue;
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const ink = gray < 170 ? 42 : 255;
    data[i] = data[i + 1] = data[i + 2] = ink;
  }
  ctx.putImageData(image, 0, 0);
}

function drawWoolFibers(ctx: CanvasRenderingContext2D, palette: Palette) {
  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  ctx.lineCap = "round";
  for (let i = 0; i < 5200; i++) {
    const x = seeded(i * 17) * size;
    const y = seeded(i * 31 + 7) * size;
    const angle = seeded(i * 43) * Math.PI * 2;
    const len = 7 + seeded(i * 59) * 22;
    ctx.strokeStyle = i % 3 === 0 ? "rgba(255,253,248,0.46)" : i % 3 === 1 ? "rgba(90,64,45,0.22)" : toAlpha(palette.base, 0.32);
    ctx.lineWidth = 1.2 + seeded(i * 71) * 3.4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }

  for (let i = 0; i < 800; i++) {
    const x = seeded(i * 101) * size;
    const y = seeded(i * 131) * size;
    ctx.fillStyle = i % 2 ? "rgba(255,253,248,0.34)" : "rgba(70,48,34,0.16)";
    ctx.beginPath();
    ctx.arc(x, y, 1 + seeded(i * 41) * 2.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawPaperWash(ctx: CanvasRenderingContext2D, styleId: PetStyle) {
  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  ctx.globalAlpha = styleId === "watercolor" ? 0.38 : 0.24;
  for (let i = 0; i < 110; i++) {
    const x = seeded(i * 9) * size;
    const y = seeded(i * 13) * size;
    const radius = 26 + seeded(i * 19) * 96;
    ctx.fillStyle = i % 2 ? "rgba(255,253,248,0.72)" : "rgba(91,145,150,0.16)";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawStickerOutline(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.globalCompositeOperation = "destination-over";
  for (let offset = 28; offset >= 10; offset -= 6) {
    ctx.shadowColor = offset > 16 ? "rgba(255,255,255,0.98)" : "rgba(40,48,52,0.72)";
    ctx.shadowBlur = offset;
    ctx.drawImage(ctx.canvas, 0, 0);
  }
  ctx.restore();
}

function drawToyHighlights(ctx: CanvasRenderingContext2D) {
  const gradient = ctx.createRadialGradient(245, 170, 20, 245, 170, 380);
  gradient.addColorStop(0, "rgba(255,255,255,0.55)");
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
  ctx.fillStyle = "rgba(255,253,248,0.86)";
  for (let i = 0; i < 34; i++) {
    const x = seeded(i * 23) * size;
    const y = seeded(i * 29) * size;
    const r = 1.5 + seeded(i * 31) * 4.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawLeaves(ctx: CanvasRenderingContext2D, palette: Palette) {
  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillStyle = toAlpha(palette.dark, 0.18);
  for (let i = 0; i < 42; i++) {
    const x = seeded(i * 37) * size;
    const y = seeded(i * 47) * size;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(seeded(i * 53) * Math.PI);
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function average(samples: Array<[number, number, number, number]>) {
  const total = samples.reduce(
    (sum, item) => [sum[0] + item[0], sum[1] + item[1], sum[2] + item[2]],
    [0, 0, 0]
  );
  return total.map((value) => Math.round(value / Math.max(1, samples.length))) as [number, number, number];
}

function mix(a: [number, number, number], b: [number, number, number], amount: number): [number, number, number] {
  return [
    Math.round(a[0] * (1 - amount) + b[0] * amount),
    Math.round(a[1] * (1 - amount) + b[1] * amount),
    Math.round(a[2] * (1 - amount) + b[2] * amount)
  ];
}

function rgb(color: [number, number, number]) {
  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
}

function toAlpha(color: string, alpha: number) {
  const match = color.match(/\d+/g);
  if (!match) return `rgba(217, 167, 108, ${alpha})`;
  return `rgba(${match[0]}, ${match[1]}, ${match[2]}, ${alpha})`;
}

function seeded(value: number) {
  const x = Math.sin(value * 999) * 10000;
  return x - Math.floor(x);
}
