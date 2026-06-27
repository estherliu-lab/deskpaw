import { petStyles } from "../data/petStyles";
import type { GeneratedPet, Language } from "../types/pet";

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export async function downloadShareCard(profile: GeneratedPet, language: Language) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const style = petStyles.find((item) => item.id === profile.selectedStyle);
  const petImage = await loadImage(profile.imageAvatar ?? profile.imageOriginal);

  const gradient = ctx.createLinearGradient(0, 0, 1080, 1350);
  gradient.addColorStop(0, "#fff8ef");
  gradient.addColorStop(0.55, "#e7f2ee");
  gradient.addColorStop(1, "#f9d6c8");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.78)";
  roundRect(ctx, 90, 100, 900, 1150, 42);
  ctx.fill();

  ctx.fillStyle = "#283034";
  ctx.font = "700 68px Arial";
  ctx.fillText("DeskPaw", 150, 205);
  ctx.font = "400 34px Arial";
  ctx.fillText(language === "zh" ? "今天，它在桌角陪你一起努力。" : "A little paw by your desk.", 150, 260);

  roundRect(ctx, 210, 330, 660, 660, 56);
  ctx.save();
  ctx.clip();
  coverImage(ctx, petImage, 210, 330, 660, 660);
  ctx.restore();

  ctx.fillStyle = "#e97863";
  ctx.font = "700 64px Arial";
  ctx.fillText(profile.name, 150, 1100);
  ctx.fillStyle = "#497f83";
  ctx.font = "500 34px Arial";
  ctx.fillText(style ? (language === "zh" ? style.zh : style.en) : "DeskPaw Style", 150, 1160);

  ctx.fillStyle = "#283034";
  ctx.font = "400 38px Arial";
  wrapText(ctx, profile.shareCaption, 150, 1230, 780, 48);

  const link = document.createElement("a");
  link.download = `${profile.name || "deskpaw"}-share-card.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function coverImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const testLine = `${line}${word} `;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = `${word} `;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  ctx.fillText(line.trim(), x, currentY);
}
