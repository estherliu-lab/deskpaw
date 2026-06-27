export type Language = "zh" | "en";

export type PetStyle =
  | "creamy-healing"
  | "pixel-game"
  | "wool-felt"
  | "japanese-journal"
  | "chibi-cute"
  | "watercolor"
  | "minimal-line"
  | "retro-desktop"
  | "cartoon-sticker"
  | "soft-3d-toy"
  | "fairy-tale"
  | "forest-nature"
  | "night-companion"
  | "minimal-productivity"
  | "meme-expressive"
  | "social-cute"
  | "dreamy-stardust";

export type PetAction =
  | "idle-standing"
  | "sitting"
  | "lying-rest"
  | "sleeping"
  | "happy-jumping"
  | "affection"
  | "blinking"
  | "head-tilt"
  | "grumpy"
  | "pouty"
  | "stretching"
  | "water-reminder"
  | "focus-mode"
  | "waving"
  | "celebration";

export interface PetStyleMeta {
  id: PetStyle;
  zh: string;
  en: string;
  descriptionZh: string;
  descriptionEn: string;
  emoji: string;
  className: string;
}

export interface PetActionMeta {
  id: PetAction;
  zh: string;
  en: string;
  descriptionZh: string;
  descriptionEn: string;
  emoji: string;
  animationClass: string;
}

export type PetType = "cat" | "dog" | "rabbit" | "hamster" | "bird" | "other";

export interface PetProfile {
  id: string;
  name: string;
  petType: PetType;
  imageOriginal: string;
  imageAvatar?: string;
  selectedStyle: PetStyle;
  selectedActions: PetAction[];
  personalityTags: string[];
  moodToday?: string;
  statusToday?: string;
  messageToOwner?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedPet extends PetProfile {
  generatedCardTheme: string;
  shareCaption: string;
}
