import { FormEvent, ReactNode, useEffect, useState } from "react";
import { GeneratedPetVisual, PetVisual } from "./components/PetVisual";
import { enMessages, zhMessages } from "./data/companionMessages";
import { petActions } from "./data/petActions";
import { petStyles } from "./data/petStyles";
import { useLanguage } from "./hooks/useLanguage";
import { copy } from "./i18n/copy";
import { generatePetCharacter } from "./lib/generator";
import { downloadShareCard } from "./lib/shareCard";
import { appendLog, loadLogs, loadProfile, saveProfile } from "./lib/storage";
import type { GeneratedPet, Language, PetAction, PetProfile, PetStyle, PetType } from "./types/pet";

type Route = "home" | "upload" | "result" | "pet-home" | "install" | "about";

const routeMap: Record<string, Route> = {
  "": "home",
  home: "home",
  upload: "upload",
  result: "result",
  "pet-home": "pet-home",
  install: "install",
  about: "about"
};

const focusOptions = [25, 45, 60, 90];

function routeFromHash(): Route {
  return routeMap[window.location.hash.replace("#/", "")] ?? "home";
}

function go(route: Route) {
  window.location.hash = route === "home" ? "#/" : `#/${route}`;
}

export default function App() {
  const { language, setLanguage } = useLanguage();
  const [route, setRoute] = useState<Route>(routeFromHash);
  const [profile, setProfile] = useState<GeneratedPet | null>(() => loadProfile() as GeneratedPet | null);

  useEffect(() => {
    const onHashChange = () => setRoute(routeFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const updateProfile = (nextProfile: GeneratedPet) => {
    saveProfile(nextProfile);
    setProfile(nextProfile);
  };

  return (
    <div className="min-h-screen bg-cream text-ink">
      <Header language={language} setLanguage={setLanguage} route={route} />
      {route === "home" && <HomePage language={language} />}
      {route === "upload" && <UploadPage language={language} onGenerated={updateProfile} />}
      {route === "result" && <ResultPage language={language} profile={profile} />}
      {route === "pet-home" && <PetHomePage language={language} profile={profile} />}
      {route === "install" && <InstallPage language={language} />}
      {route === "about" && <AboutPage language={language} />}
      <Footer language={language} />
    </div>
  );
}

function Header({
  language,
  setLanguage,
  route
}: {
  language: Language;
  setLanguage: (language: Language) => void;
  route: Route;
}) {
  const t = copy[language];

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-paper/86 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <button className="brand-lockup" onClick={() => go("home")} aria-label="DeskPaw home">
          <span className="brand-icon">DP</span>
          <span>
            <strong>{language === "zh" ? "DeskPaw 桌面爪爪" : "DeskPaw"}</strong>
            <small>{language === "zh" ? "桌角陪伴工具" : "Desk companion"}</small>
          </span>
        </button>
        <div className="hidden items-center gap-2 lg:flex">
          <a href="#features">{t.nav.features}</a>
          <a href="#styles">{t.nav.styles}</a>
          <a href="#actions">{t.nav.actions}</a>
          <button className={route === "install" ? "nav-active" : ""} onClick={() => go("install")}>
            {t.nav.install}
          </button>
          <button onClick={() => go("about")}>{language === "zh" ? "关于" : "About"}</button>
        </div>
        <div className="flex items-center gap-2">
          <div className="segmented" aria-label="Language switcher">
            <button className={language === "zh" ? "selected" : ""} onClick={() => setLanguage("zh")}>
              中文
            </button>
            <button className={language === "en" ? "selected" : ""} onClick={() => setLanguage("en")}>
              English
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

function HomePage({ language }: { language: Language }) {
  const t = copy[language];

  return (
    <main>
      <section className="hero-section">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div>
            <p className="eyebrow">{t.sections.petHome}</p>
            <h1>{t.brand}</h1>
            <p className="hero-tagline">{t.tagline}</p>
            <p className="hero-en">{t.enTagline}</p>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/72">{t.hero.body}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button className="primary-button" onClick={() => go("upload")}>
                {t.hero.primary}
              </button>
              <a className="secondary-button" href="#styles">
                {t.hero.secondary}
              </a>
            </div>
          </div>
          <PetVisual language={language} message={t.hero.bubble} />
        </div>
      </section>

      <section id="features" className="section-band">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {t.benefits.map((item) => (
              <article className="feature-card" key={item.title}>
                <span className="feature-dot" />
                <h2>{item.title}</h2>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionTitle title={language === "zh" ? "一张照片，把它请到你的桌角" : "Bring your pet to your desk"} />
        <div className="flow-grid">
          {t.flow.map((step, index) => (
            <div className="flow-step" key={step}>
              <span>{index + 1}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <section id="styles" className="section-band alt">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <SectionTitle title={t.sections.styles} body={t.sections.stylesBody} />
          <div className="style-grid">
            {petStyles.map((style) => (
              <article className={`mini-card ${style.className}`} key={style.id}>
                <span>{style.emoji}</span>
                <h3>{language === "zh" ? style.zh : style.en}</h3>
                <p>{language === "zh" ? style.descriptionZh : style.descriptionEn}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="actions" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionTitle title={t.sections.actions} body={t.sections.actionsBody} />
        <div className="action-grid">
          {petActions.map((action) => (
            <article className="action-card" key={action.id}>
              <span className={`action-emoji ${action.animationClass}`}>{action.emoji}</span>
              <h3>{language === "zh" ? action.zh : action.en}</h3>
              <p>{language === "zh" ? action.descriptionZh : action.descriptionEn}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-3">
          {t.companion.map((item) => (
            <article className="feature-card" key={item.title}>
              <h2>{item.title}</h2>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <div className="share-panel">
          <SectionTitle title={t.sections.share} body={t.sections.shareBody} />
          <button className="primary-button" onClick={() => go("upload")}>
            {t.buttons.createShare}
          </button>
        </div>
        <div className="install-panel">
          <SectionTitle title={t.sections.install} body={t.sections.installBody} />
          <button className="secondary-button" onClick={() => go("install")}>
            {t.buttons.installGuide}
          </button>
        </div>
      </section>
    </main>
  );
}

function UploadPage({
  language,
  onGenerated
}: {
  language: Language;
  onGenerated: (profile: GeneratedPet) => void;
}) {
  const t = copy[language];
  const [image, setImage] = useState(`${import.meta.env.BASE_URL}demo/sample-pet.png`);
  const [name, setName] = useState(language === "zh" ? "小爪" : "Mochi");
  const [petType, setPetType] = useState<PetType>("cat");
  const [styleId, setStyleId] = useState<PetStyle>("creamy-healing");
  const [actions, setActions] = useState<PetAction[]>(["idle-standing"]);
  const [tags, setTags] = useState<string[]>([t.upload.personalities[0]]);

  const selectedAction = actions[0] ?? "idle-standing";

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const toggleAction = (action: PetAction) => {
    setActions((current) =>
      current.includes(action) ? current.filter((item) => item !== action) : [...current, action].slice(0, 5)
    );
  };

  const toggleTag = (tag: string) => {
    setTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const now = new Date().toISOString();
    const baseProfile: PetProfile = {
      id: crypto.randomUUID(),
      name: name.trim() || "DeskPaw",
      petType,
      imageOriginal: image,
      selectedStyle: styleId,
      selectedActions: actions.length ? actions : ["idle-standing"],
      personalityTags: tags,
      createdAt: now,
      updatedAt: now
    };
    const generated = await generatePetCharacter(baseProfile, language);
    onGenerated(generated);
    go("result");
  };

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.92fr_1.08fr]">
      <aside className="preview-column">
        <SectionTitle title={t.sections.upload} body={t.upload.helper} />
        <PetVisual image={image} name={name} styleId={styleId} actionId={selectedAction} language={language} />
      </aside>

      <form className="editor-surface" onSubmit={submit}>
        <label className="upload-zone">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => handleFile(event.currentTarget.files?.[0])}
          />
          <span>{t.upload.drop}</span>
          <small>{t.upload.helper}</small>
        </label>

        <div className="form-grid">
          <label>
            <span>{t.upload.name}</span>
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            <span>{t.upload.petType}</span>
            <select value={petType} onChange={(event) => setPetType(event.target.value as PetType)}>
              {(Object.keys(t.upload.types) as PetType[]).map((type) => (
                <option value={type} key={type}>
                  {t.upload.types[type]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ChoiceGroup title={t.upload.personality}>
          {t.upload.personalities.map((tag) => (
            <button type="button" className={tags.includes(tag) ? "chip selected" : "chip"} onClick={() => toggleTag(tag)} key={tag}>
              {tag}
            </button>
          ))}
        </ChoiceGroup>

        <ChoiceGroup title={t.upload.style}>
          {petStyles.map((style) => (
            <button
              type="button"
              className={styleId === style.id ? "select-card selected" : "select-card"}
              onClick={() => setStyleId(style.id)}
              key={style.id}
            >
              <span>{style.emoji}</span>
              <strong>{language === "zh" ? style.zh : style.en}</strong>
            </button>
          ))}
        </ChoiceGroup>

        <ChoiceGroup title={t.upload.actions}>
          {petActions.map((action) => (
            <button
              type="button"
              className={actions.includes(action.id) ? "select-card selected" : "select-card"}
              onClick={() => toggleAction(action.id)}
              key={action.id}
            >
              <span>{action.emoji}</span>
              <strong>{language === "zh" ? action.zh : action.en}</strong>
            </button>
          ))}
        </ChoiceGroup>

        <button className="primary-button w-full" type="submit">
          {t.upload.generate}
        </button>
      </form>
    </main>
  );
}

function ResultPage({ language, profile }: { language: Language; profile: GeneratedPet | null }) {
  const t = copy[language];
  const [copied, setCopied] = useState(false);

  if (!profile) {
    return <EmptyState language={language} message={language === "zh" ? "还没有生成宠物。" : "No pet has been created yet."} />;
  }

  const style = petStyles.find((item) => item.id === profile.selectedStyle);
  const actionNames = profile.selectedActions
    .map((id) => petActions.find((item) => item.id === id))
    .filter(Boolean)
    .map((item) => (language === "zh" ? item!.zh : item!.en));

  const copyCaption = async () => {
    await navigator.clipboard.writeText(profile.shareCaption);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_0.95fr]">
      <GeneratedPetVisual profile={profile} language={language} />
      <section className="result-panel">
        <SectionTitle title={t.sections.result} body={profile.shareCaption} />
        <div className="profile-list">
          <InfoRow label={t.result.profile} value={`${profile.name} · ${profile.personalityTags.join(", ")}`} />
          <InfoRow label={t.upload.style} value={style ? (language === "zh" ? style.zh : style.en) : ""} />
          <InfoRow label={t.upload.actions} value={actionNames.join(" / ")} />
          <InfoRow label={t.result.mood} value={profile.moodToday ?? ""} />
          <InfoRow label={t.result.status} value={profile.statusToday ?? ""} />
          <InfoRow label={t.result.message} value={profile.messageToOwner ?? ""} />
        </div>
        <div className="button-grid">
          <button className="primary-button" onClick={() => downloadShareCard(profile, language)}>
            {t.result.save}
          </button>
          <button className="secondary-button" onClick={copyCaption}>
            {copied ? t.result.copied : t.result.copy}
          </button>
          <button className="secondary-button" onClick={() => go("pet-home")}>
            {t.result.home}
          </button>
          <button className="ghost-button" onClick={() => go("upload")}>
            {t.result.edit}
          </button>
        </div>
      </section>
    </main>
  );
}

function PetHomePage({ language, profile }: { language: Language; profile: GeneratedPet | null }) {
  const t = copy[language];
  const [message, setMessage] = useState(profile?.messageToOwner ?? "");
  const [logs, setLogs] = useState(loadLogs);
  const [minutes, setMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  if (!profile) {
    return <EmptyState language={language} message={t.home.fallback} />;
  }

  const messages = language === "zh" ? zhMessages : enMessages;
  const interact = (nextMessage: string) => {
    setMessage(nextMessage);
    setLogs(appendLog(nextMessage));
  };
  const randomMessage = () => messages[Math.floor(Math.random() * messages.length)];
  const timeLabel = secondsLeft
    ? `${Math.floor(secondsLeft / 60).toString().padStart(2, "0")}:${(secondsLeft % 60).toString().padStart(2, "0")}`
    : `${minutes} ${t.home.minutes}`;

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
      <GeneratedPetVisual profile={{ ...profile, messageToOwner: message }} language={language} />
      <section className="home-console">
        <SectionTitle title={t.sections.petHome} body={message || profile.messageToOwner} />
        <div className="interaction-grid">
          <button onClick={() => interact(language === "zh" ? "摸摸收到，今天也一起加油。" : "Pat received. Let us keep going today.")}>
            {t.home.pet}
          </button>
          <button onClick={() => interact(language === "zh" ? "我会安静陪你专注这一段。" : "I will stay quietly through this focus session.")}>
            {t.home.focus}
          </button>
          <button onClick={() => interact(language === "zh" ? "喝口水吧，桌角监督员上线。" : "Drink some water. Your desk buddy is watching gently.")}>
            {t.home.water}
          </button>
          <button onClick={() => interact(randomMessage())}>{t.home.encourage}</button>
          <button onClick={() => downloadShareCard(profile, language)}>{t.home.card}</button>
        </div>

        <div className="timer-panel">
          <strong>{timeLabel}</strong>
          <div className="timer-options">
            {focusOptions.map((item) => (
              <button className={minutes === item ? "selected" : ""} onClick={() => setMinutes(item)} key={item}>
                {item}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="primary-button" onClick={() => setSecondsLeft(minutes * 60)}>
              {t.home.start}
            </button>
            <button className="secondary-button" onClick={() => setSecondsLeft(0)}>
              {t.home.reset}
            </button>
          </div>
        </div>

        <div className="log-list">
          <h3>{t.home.log}</h3>
          {logs.length === 0 ? <p>{message}</p> : logs.map((log) => <p key={log.createdAt}>{log.message}</p>)}
        </div>
      </section>
    </main>
  );
}

function InstallPage({ language }: { language: Language }) {
  const t = copy[language];
  const items = [
    [t.install.mobile, t.install.mobileBody],
    [t.install.pwa, t.install.pwaBody],
    [t.install.desktop, t.install.desktopBody],
    [t.install.difference, t.install.differenceBody]
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SectionTitle title={t.sections.install} body={t.sections.installBody} />
      <div className="doc-grid">
        {items.map(([title, body]) => (
          <article className="doc-card" key={title}>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </div>
      <button className="primary-button mt-8" onClick={() => go("upload")}>
        {language === "zh" ? "创建我的 DeskPaw" : "Create My DeskPaw"}
      </button>
    </main>
  );
}

function AboutPage({ language }: { language: Language }) {
  const t = copy[language];
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SectionTitle title={t.sections.about} body={t.about.what} />
      <div className="doc-grid">
        <article className="doc-card">
          <h2>{language === "zh" ? "为什么做它" : "Why it exists"}</h2>
          <p>{t.about.why}</p>
        </article>
        <article className="doc-card">
          <h2>{language === "zh" ? "隐私说明" : "Privacy"}</h2>
          <p>{t.about.privacy}</p>
        </article>
        <article className="doc-card">
          <h2>{language === "zh" ? "未来计划" : "Roadmap"}</h2>
          <p>{t.about.future}</p>
        </article>
      </div>
    </main>
  );
}

function Footer({ language }: { language: Language }) {
  return (
    <footer className="border-t border-black/5 bg-paper">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-ink/62 sm:px-6 md:flex-row md:items-center md:justify-between">
        <span>DeskPaw · {language === "zh" ? "桌面爪爪" : "Desktop Pet Companion"}</span>
        <div className="flex gap-4">
          <button onClick={() => go("about")}>Privacy</button>
          <button onClick={() => go("install")}>Install</button>
          <a href="https://github.com/" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

function SectionTitle({ title, body }: { title: string; body?: string }) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {body && <p>{body}</p>}
    </div>
  );
}

function ChoiceGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="choice-group">
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyState({ language, message }: { language: Language; message: string }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <SectionTitle title={language === "zh" ? "还没有 DeskPaw" : "No DeskPaw yet"} body={message} />
      <button className="primary-button" onClick={() => go("upload")}>
        {language === "zh" ? "去创建" : "Create one"}
      </button>
    </main>
  );
}
