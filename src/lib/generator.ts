import { enMessages, zhMessages } from "../data/companionMessages";
import { enShareCaptions, zhShareCaptions } from "../data/shareCaptions";
import { petActions } from "../data/petActions";
import { petStyles } from "../data/petStyles";
import { createStyledPetImage } from "./stylizePetImage";
import type { GeneratedPet, Language, PetProfile } from "../types/pet";

function pick<T>(items: T[], seed: string): T {
  const value = [...seed].reduce((total, char) => total + char.charCodeAt(0), 0);
  return items[value % items.length];
}

export async function generatePetCharacter(input: PetProfile, language: Language): Promise<GeneratedPet> {
  const message = pick(language === "zh" ? zhMessages : enMessages, input.id + input.name);
  const shareCaption = pick(language === "zh" ? zhShareCaptions : enShareCaptions, input.id + input.selectedStyle);
  const style = petStyles.find((item) => item.id === input.selectedStyle);
  const action = petActions.find((item) => item.id === input.selectedActions[0]);
  const styledImage = input.imageOriginal
    ? await createStyledPetImage({
        imageDataUrl: input.imageOriginal,
        styleId: input.selectedStyle,
        actionId: input.selectedActions[0],
        petType: input.petType,
        name: input.name
      })
    : null;

  return {
    ...input,
    imageAvatar: styledImage?.imageDataUrl ?? input.imageOriginal,
    moodToday: language === "zh" ? "温柔陪伴中" : "Soft companion mode",
    statusToday: action ? (language === "zh" ? action.zh : action.en) : "",
    messageToOwner: message,
    generatedCardTheme: style?.className ?? "theme-creamy",
    shareCaption,
    updatedAt: new Date().toISOString()
  };
}
