export const copy = {
  zh: {
    brand: "DeskPaw 桌面爪爪",
    shortBrand: "DeskPaw",
    tagline: "今天，它在桌角陪你一起努力。",
    enTagline: "A little paw by your desk, keeping you company every day.",
    nav: {
      features: "功能",
      styles: "风格",
      actions: "动作",
      install: "安装",
      github: "GitHub"
    },
    hero: {
      body:
        "上传一张宠物照片，生成你的专属桌面宠物。它可以陪你专注、提醒你休息，在你累的时候给你一点温柔，也可以安装到手机主屏幕。",
      primary: "上传我家宠物照片",
      secondary: "看看示例宠物",
      bubble: "今天别太累，我陪你。"
    },
    benefits: [
      {
        title: "一张照片生成专属宠物",
        body: "把你家的猫、狗、兔子或其他小动物，变成属于你的数字小伙伴。"
      },
      {
        title: "手机桌面随手打开",
        body: "V1 是可安装的 PWA 宠物小屋，像 App 一样从手机主屏幕打开。"
      },
      {
        title: "可爱，也很实用",
        body: "陪你专注、提醒喝水、给你鼓励，还能生成漂亮的分享卡片。"
      }
    ],
    flow: ["上传照片", "选择风格", "选择动作", "生成桌宠", "安装或分享"],
    sections: {
      styles: "选择你喜欢的宠物风格",
      stylesBody: "从治愈手作到像素游戏，从极简办公到梦幻星空，给你的宠物挑一个最合适的样子。",
      actions: "让它有自己的小动作",
      actionsBody: "它可以睡觉、撒娇、提醒你喝水，也可以在你完成任务时认真庆祝。",
      companion: "不只是可爱，也能陪你把日子过稳一点",
      share: "生成你的 DeskPaw 分享卡",
      shareBody: "把桌面爪爪做成一张卡片，分享给朋友，或保存成今日陪伴记录。",
      install: "安装到手机桌面",
      installBody: "手机端可以添加到主屏幕，像 App 一样打开。后续版本可扩展为真正的电脑桌面宠物。",
      upload: "上传你家宠物照片",
      result: "生成结果",
      petHome: "宠物小屋",
      about: "关于 DeskPaw"
    },
    companion: [
      {
        title: "陪你专注",
        body: "选择 25、45、60 或 90 分钟，让它安静陪你完成一段专注时间。"
      },
      {
        title: "提醒你休息",
        body: "当你工作太久，它会轻轻提醒你喝水、伸展、放松一下。"
      },
      {
        title: "给你一点鼓励",
        body: "累的时候，它会在桌角给你一句温柔的话。"
      }
    ],
    upload: {
      helper: "支持 jpg/png/webp。尽量选择清晰、正面、光线好的照片。",
      drop: "点击选择宠物照片",
      name: "宠物名字",
      petType: "宠物类型",
      style: "视觉风格",
      actions: "动作状态",
      personality: "性格标签",
      generate: "生成我的 DeskPaw",
      types: {
        cat: "猫",
        dog: "狗",
        rabbit: "兔子",
        hamster: "仓鼠",
        bird: "小鸟",
        other: "其他"
      },
      personalities: ["黏人", "安静", "好奇", "勇敢", "爱睡", "治愈", "调皮", "专注"]
    },
    result: {
      profile: "宠物档案",
      mood: "今日心情",
      status: "当前状态",
      message: "它想对你说",
      save: "保存宠物卡片",
      share: "生成分享卡片",
      copy: "复制分享文案",
      home: "进入宠物小屋",
      edit: "返回重新编辑",
      copied: "已复制分享文案"
    },
    home: {
      log: "今日陪伴记录",
      pet: "摸摸它",
      focus: "让我专注",
      water: "提醒我喝水",
      encourage: "给我一句鼓励",
      card: "生成今日卡片",
      minutes: "分钟",
      start: "开始专注",
      reset: "重置",
      fallback: "先生成一个 DeskPaw，再回到宠物小屋。"
    },
    install: {
      mobile: "如何添加到手机主屏幕",
      pwa: "如何使用 PWA",
      desktop: "未来的桌面宠物版本",
      difference: "手机端和电脑端区别",
      mobileBody: "在 Safari 或 Chrome 中打开网站，选择分享或菜单，然后点击“添加到主屏幕”。",
      pwaBody: "添加后可像普通 App 一样打开，照片和宠物档案默认保存在本地浏览器。",
      desktopBody: "第一版先提供网页 PWA。后续可用 Tauri 或 Electron 打包成透明、可拖拽的桌面宠物窗口。",
      differenceBody: "手机端是 PWA 宠物小屋；电脑端目标是浮动桌宠、托盘菜单、专注计时和喝水提醒。"
    },
    about: {
      what: "DeskPaw 是一个照片生成宠物陪伴、手机可安装 PWA、未来可扩展为电脑桌面宠物的治愈型实用工具。",
      why: "它希望让工作和学习不只是效率，也多一点真实的陪伴感。",
      privacy:
        "DeskPaw V1 默认在本地处理和保存用户上传的宠物图片。图片不会自动上传到服务器。如果未来接入云端保存或 AI 生成服务，会在界面中明确提示用户。",
      future: "后续计划包括真实 AI 生成、透明桌宠窗口、托盘菜单、更多互动动作和云端同步。"
    },
    buttons: {
      installGuide: "查看安装说明",
      createShare: "生成分享卡片",
      goHome: "回到首页",
      github: "查看 README"
    }
  },
  en: {
    brand: "DeskPaw",
    shortBrand: "DeskPaw",
    tagline: "A little paw by your desk, keeping you company every day.",
    enTagline: "A little paw by your desk, keeping you company every day.",
    nav: {
      features: "Features",
      styles: "Styles",
      actions: "Actions",
      install: "Install",
      github: "GitHub"
    },
    hero: {
      body:
        "Upload one pet photo and create your own desktop-style companion. It can stay with you while you focus, remind you to rest, offer a little comfort when you feel tired, and live on your mobile home screen.",
      primary: "Upload My Pet Photo",
      secondary: "See Example Pets",
      bubble: "Do not get too tired today. I am here."
    },
    benefits: [
      {
        title: "Create a pet from one photo",
        body: "Turn your cat, dog, rabbit, or any little friend into a personal digital companion."
      },
      {
        title: "Install it on mobile",
        body: "V1 is an installable PWA pet home that opens from your mobile home screen like an app."
      },
      {
        title: "Cute, but also useful",
        body: "It can help you focus, remind you to drink water, encourage you, and create shareable cards."
      }
    ],
    flow: ["Upload photo", "Choose style", "Pick actions", "Create DeskPaw", "Install or share"],
    sections: {
      styles: "Choose Your Favorite Pet Style",
      stylesBody: "From handmade healing to pixel game, from minimal productivity to dreamy stardust, choose the look that fits your pet best.",
      actions: "Give It Little Actions",
      actionsBody: "It can sleep, show affection, remind you to drink water, and celebrate when you finish a task.",
      companion: "Cute, but also useful",
      share: "Create Your DeskPaw Share Card",
      shareBody: "Turn your little desk companion into a card, share it with friends, or save it as today's companion memory.",
      install: "Install on Mobile",
      installBody: "Add it to your mobile home screen and open it like an app. The desktop route can grow into a real floating pet later.",
      upload: "Upload Your Pet Photo",
      result: "Generated Result",
      petHome: "Pet Home",
      about: "About DeskPaw"
    },
    companion: [
      {
        title: "Focus with you",
        body: "Choose 25, 45, 60, or 90 minutes and let it stay with you through a focus session."
      },
      {
        title: "Remind you to rest",
        body: "When you work for too long, it gently reminds you to drink water, stretch, and breathe."
      },
      {
        title: "Give you a little encouragement",
        body: "When you feel tired, it offers a soft word from the corner of your desk."
      }
    ],
    upload: {
      helper: "Supports jpg/png/webp. A clear front-facing photo with good light works best.",
      drop: "Click to choose a pet photo",
      name: "Pet name",
      petType: "Pet type",
      style: "Visual style",
      actions: "Action states",
      personality: "Personality tags",
      generate: "Create My DeskPaw",
      types: {
        cat: "Cat",
        dog: "Dog",
        rabbit: "Rabbit",
        hamster: "Hamster",
        bird: "Bird",
        other: "Other"
      },
      personalities: ["Clingy", "Quiet", "Curious", "Brave", "Sleepy", "Healing", "Playful", "Focused"]
    },
    result: {
      profile: "Pet Profile",
      mood: "Today's Mood",
      status: "Current Status",
      message: "A note to you",
      save: "Save Pet Card",
      share: "Create Share Card",
      copy: "Copy Caption",
      home: "Enter Pet Home",
      edit: "Edit Again",
      copied: "Share caption copied"
    },
    home: {
      log: "Today's companion log",
      pet: "Pet it",
      focus: "Start Focus Mode",
      water: "Remind Me to Drink Water",
      encourage: "Give Me Encouragement",
      card: "Create Today's Card",
      minutes: "min",
      start: "Start Focus",
      reset: "Reset",
      fallback: "Create a DeskPaw first, then come back to the pet home."
    },
    install: {
      mobile: "How to install on mobile home screen",
      pwa: "How to use the PWA",
      desktop: "Future desktop pet version",
      difference: "Difference between mobile and desktop versions",
      mobileBody: "Open the site in Safari or Chrome, choose Share or Menu, then tap Add to Home Screen.",
      pwaBody: "After installation, open it like an app. Photos and pet profiles are stored locally by default.",
      desktopBody: "V1 ships as a web PWA. Later builds can use Tauri or Electron for a transparent draggable pet window.",
      differenceBody: "Mobile is a PWA pet home. Desktop is planned as a floating companion with tray menu, focus timer, and water reminders."
    },
    about: {
      what: "DeskPaw is a photo-to-pet companion, installable mobile PWA, and future desktop pet utility.",
      why: "It is built for people who want work and study to feel a little less lonely and a little more cared for.",
      privacy:
        "DeskPaw V1 processes and stores uploaded pet photos locally by default. Images are not automatically uploaded to a server. If cloud storage or AI generation services are added in the future, users will be clearly informed in the interface.",
      future: "Future plans include real AI generation, transparent desktop windows, tray menus, more actions, and cloud sync."
    },
    buttons: {
      installGuide: "View Install Guide",
      createShare: "Create Share Card",
      goHome: "Back Home",
      github: "View README"
    }
  }
} as const;
