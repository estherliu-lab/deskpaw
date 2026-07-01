import { petActions } from "../data/petActions";
import { petStyles } from "../data/petStyles";
import type { GeneratedPet, Language, PetAction, PetStyle } from "../types/pet";

interface PetVisualProps {
  image?: string;
  imageMode?: "photo" | "avatar";
  name?: string;
  styleId?: PetStyle;
  actionId?: PetAction;
  language: Language;
  message?: string;
  compact?: boolean;
}

export function PetVisual({ image, imageMode = "photo", name, styleId, actionId, language, message, compact }: PetVisualProps) {
  const style = petStyles.find((item) => item.id === styleId) ?? petStyles[0];
  const action = petActions.find((item) => item.id === actionId) ?? petActions[0];
  const title = name || (language === "zh" ? "示例爪爪" : "Sample Paw");
  const bubble = message || (language === "zh" ? "今天别太累，我陪你。" : "I will stay with you today.");
  const imageClass = image ? (imageMode === "avatar" ? "pet-character-avatar" : "pet-character-photo") : "pet-character-demo";
  return (
    <div className={`pet-stage ${style.className} ${compact ? "pet-stage-compact" : ""}`}>
      <div className="pet-bubble">{bubble}</div>
      <div className="pet-orbit">
        <div
          className={`pet-character pet-style-${style.id} ${action.animationClass} ${imageClass}`}
          data-pet-style={style.id}
          data-pet-action={action.id}
          key={`${style.id}-${action.id}-${image ? imageMode : "demo"}`}
        >
          <div className={`pet-image-wrap ${image ? "pet-image-photo" : "pet-image-demo"}`}>
            {image && imageMode === "avatar" ? (
              <img src={image} alt={title} className="pet-image pet-avatar-sprite" />
            ) : image ? (
              <div className="pet-photo-puppet" aria-label={title}>
                <img src={image} alt={title} className="pet-image pet-image-base pet-photo-part pet-photo-body" />
                <img src={image} alt="" className="pet-image pet-image-base pet-photo-part pet-photo-tail" aria-hidden="true" />
                <img src={image} alt="" className="pet-image pet-image-base pet-photo-part pet-photo-chest" aria-hidden="true" />
                <img src={image} alt="" className="pet-image pet-image-base pet-photo-part pet-photo-head" aria-hidden="true" />
                <img src={image} alt="" className="pet-image pet-image-base pet-photo-part pet-photo-paw pet-photo-paw-left" aria-hidden="true" />
                <img src={image} alt="" className="pet-image pet-image-base pet-photo-part pet-photo-paw pet-photo-paw-right" aria-hidden="true" />
                <img src={image} alt="" className="pet-image pet-image-effect pet-photo-part pet-photo-effect" aria-hidden="true" />
              </div>
            ) : (
              <div className="demo-companion" aria-label={title}>
                <span className="demo-ear demo-ear-left" />
                <span className="demo-ear demo-ear-right" />
                <span className="demo-face">
                  <i />
                  <i />
                  <b />
                </span>
                <span className="demo-paw demo-paw-left" />
                <span className="demo-paw demo-paw-right" />
              </div>
            )}
          </div>
          <span className="pet-action-mark">{action.emoji}</span>
        </div>
      </div>
      <div className="pet-stage-meta">
        <strong>{title}</strong>
        <span>{language === "zh" ? style.zh : style.en}</span>
      </div>
    </div>
  );
}

export function GeneratedPetVisual({ profile, language, compact }: { profile: GeneratedPet; language: Language; compact?: boolean }) {
  const hasGeneratedAvatar = Boolean(profile.imageAvatar && profile.imageAvatar !== profile.imageOriginal);
  return (
    <PetVisual
      image={profile.imageAvatar || profile.imageOriginal}
      imageMode={hasGeneratedAvatar ? "avatar" : "photo"}
      name={profile.name}
      styleId={profile.selectedStyle}
      actionId={profile.selectedActions[0]}
      language={language}
      message={profile.messageToOwner}
      compact={compact}
    />
  );
}
