import type { PetAction, PetStyle, PetType } from "./pet";

export interface StyledPetRequest {
  imageDataUrl: string;
  styleId: PetStyle;
  actionId?: PetAction;
  petType: PetType;
  name: string;
}

export interface StyledPetResult {
  ok: boolean;
  imageDataUrl?: string;
  error?: string;
  provider?: "openai" | "local";
}

export interface DeskPawDesktopApi {
  isDesktop: true;
  openPetWindow: () => Promise<{ ok: boolean; error?: string }>;
  generateStyledPet: (request: StyledPetRequest) => Promise<StyledPetResult>;
}

declare global {
  interface Window {
    deskpawDesktop?: DeskPawDesktopApi;
  }
}

