import { petActions } from "../data/petActions";
import { petStyles } from "../data/petStyles";
import type { GeneratedPet, Language, PetAction, PetStyle } from "../types/pet";

interface PetVisualProps {
  image?: string;
  name?: string;
  styleId?: PetStyle;
  actionId?: PetAction;
  language: Language;
  message?: string;
  compact?: boolean;
}

export function PetVisual({ image, name, styleId, actionId, language, message, compact }: PetVisualProps) {
  const style = petStyles.find((item) => item.id === styleId) ?? petStyles[0];
  const action = petActions.find((item) => item.id === actionId) ?? petActions[0];
  const title = name || (language === "zh" ? "示例爪爪" : "Sample Paw");
  const bubble = message || (language === "zh" ? "今天别太累，我陪你。" : "I will stay with you today.");
  const fallbackImage = `${import.meta.env.BASE_URL}demo/sample-pet.png`;

  return (
    <div className={`pet-stage ${style.className} ${compact ? "pet-stage-compact" : ""}`}>
      <div className="pet-bubble">{bubble}</div>
      <div className={`pet-orbit ${action.animationClass}`}>
        <div className="pet-image-wrap">
          <img src={image || fallbackImage} alt={title} className="pet-image" />
        </div>
        <span className="pet-action-mark">{action.emoji}</span>
      </div>
      <div className="pet-stage-meta">
        <strong>{title}</strong>
        <span>{language === "zh" ? style.zh : style.en}</span>
      </div>
    </div>
  );
}

export function GeneratedPetVisual({ profile, language, compact }: { profile: GeneratedPet; language: Language; compact?: boolean }) {
  return (
    <PetVisual
      image={profile.imageAvatar || profile.imageOriginal}
      name={profile.name}
      styleId={profile.selectedStyle}
      actionId={profile.selectedActions[0]}
      language={language}
      message={profile.messageToOwner}
      compact={compact}
    />
  );
}
