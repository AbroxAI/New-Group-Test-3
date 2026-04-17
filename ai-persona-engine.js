// ====================== AI PERSONA ENGINE v11.0 (Auto‑Discovery Media, Fixed Naming) ======================
// 150 custom personas · Files named: "paul_jande_1.jpg", "das_haruna_fearless_1.jpg", etc.
// =======================================================================================================

(function(){
  "use strict";

  // ---------- CONFIGURATION ----------
  const CONFIG = {
    BASE_INTERVAL: 8000,
    BURST_CHANCE: 0.20,
    TRADE_RESULT_INTERVAL: 20000,
    TRADE_RESULT_CHANCE: 0.40,
    TESTIMONIAL_CHANCE: 0.12,
    JOIN_CHANCE: 0.06,
    MAX_BURST_MESSAGES: 4,
    ENABLE_LOGGING: true,
    WATCHER_ACTIVITY_PENALTY: 0.65,
    REPLY_CHANCE: 0.95,
    MEDIA_ATTACH_CHANCE: 0.75,
    MIN_MEDIA_PER_SESSION: 1,
    MAX_MEDIA_PER_SESSION: 3,
    SESSION_RESET_TIMEOUT: 3600000,
    MAX_FILES_PER_PERSONA: 20
  };

  // ---------- MESSAGE TYPES ----------
  const MessageType = {
    QUESTION: "question", RESULT: "result", REACTION: "reaction", ADVICE: "advice",
    HYPE: "hype", GREETING: "greeting", CONFUSED: "confused", FLEX: "flex",
    COMMUNITY: "community", TESTIMONIAL: "testimonial", JOIN: "join",
    SARCASTIC: "sarcastic", FUNNY: "funny", ANALYTICAL: "analytical"
  };

  const conversationFlow = {
    [MessageType.QUESTION]:   [MessageType.ADVICE, MessageType.REACTION, MessageType.CONFUSED, MessageType.ANALYTICAL],
    [MessageType.ADVICE]:     [MessageType.REACTION, MessageType.RESULT, MessageType.QUESTION],
    [MessageType.RESULT]:     [MessageType.REACTION, MessageType.HYPE, MessageType.FLEX, MessageType.TESTIMONIAL, MessageType.SARCASTIC],
    [MessageType.REACTION]:   [MessageType.QUESTION, MessageType.RESULT, MessageType.GREETING, MessageType.FUNNY],
    [MessageType.HYPE]:       [MessageType.REACTION, MessageType.RESULT, MessageType.FLEX],
    [MessageType.GREETING]:   [MessageType.QUESTION, MessageType.REACTION, MessageType.COMMUNITY],
    [MessageType.CONFUSED]:   [MessageType.ADVICE, MessageType.QUESTION],
    [MessageType.FLEX]:       [MessageType.REACTION, MessageType.HYPE, MessageType.TESTIMONIAL, MessageType.SARCASTIC],
    [MessageType.COMMUNITY]:  [MessageType.REACTION, MessageType.QUESTION, MessageType.GREETING],
    [MessageType.TESTIMONIAL]: [MessageType.REACTION, MessageType.QUESTION, MessageType.HYPE],
    [MessageType.JOIN]:       [MessageType.GREETING, MessageType.REACTION, MessageType.COMMUNITY],
    [MessageType.SARCASTIC]:  [MessageType.REACTION, MessageType.FLEX, MessageType.QUESTION],
    [MessageType.FUNNY]:      [MessageType.REACTION, MessageType.HYPE, MessageType.COMMUNITY],
    [MessageType.ANALYTICAL]: [MessageType.ADVICE, MessageType.QUESTION, MessageType.REACTION]
  };

  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const log = (...args) => CONFIG.ENABLE_LOGGING && console.log('[AI]', ...args);

  // ---------- TIMEZONE HELPER ----------
  function getTimezoneForCountry(country) {
    const map = {
      Nigeria: "Africa/Lagos", "United Kingdom": "Europe/London", UAE: "Asia/Dubai",
      US: "America/New_York", India: "Asia/Kolkata", Brazil: "America/Sao_Paulo",
      SouthAfrica: "Africa/Johannesburg", Germany: "Europe/Berlin",
      Indonesia: "Asia/Jakarta", Mexico: "America/Mexico_City"
    };
    return map[country] || "UTC";
  }

  // ---------- AVATAR SYSTEM ----------
  function getAvatarUrl(displayName, gender, country, isFallback) {
    if (!isFallback) {
      let safeName = displayName
        .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
        .replace(/[^\w\s]/g, '')
        .trim()
        .replace(/\s+/g, '_')
        .toLowerCase();
      return `assets/avatars/${safeName}.jpg`;
    } else {
      const names = displayName.split(' ');
      const firstLetter = names[0]?.[0] || '';
      const lastLetter = names[names.length - 1]?.[0] || '';
      return `https://ui-avatars.com/api/?name=${firstLetter}+${lastLetter}&background=2f5b9c&color=fff&size=200&bold=true`;
    }
  }

  // ---------- HELPER: STRIP EMOJIS AND NORMALIZE FOR FILENAME (FIXED) ----------
  function normalizeNameForMedia(name) {
    return name
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')   // remove emojis
      .replace(/[^\w\s]/g, '')                  // remove punctuation
      .trim()
      .replace(/\s+/g, '_')                     // spaces → underscores
      .toLowerCase();                           // all lowercase
  }

  // ---------- PERSONALITY PRESETS ----------
  const personalityPresets = {
    boss:       { archetype: 'leader', experience: 'advanced', intent: 'flex' },
    analyst:    { archetype: 'analytical', experience: 'advanced', intent: 'engaged' },
    joker:      { archetype: 'funny', experience: 'intermediate', intent: 'community' },
    wit:        { archetype: 'sarcastic', experience: 'intermediate', intent: 'flex' },
    newbie:     { archetype: 'active', experience: 'beginner', intent: 'learner' },
    lurker:     { archetype: 'watcher', experience: 'beginner', intent: 'confused' },
    expert:     { archetype: 'active', experience: 'advanced', intent: 'authority' },
    thoughtful: { archetype: 'analytical', experience: 'intermediate', intent: 'community' }
  };

  // ---------- 150 CUSTOM PERSONAS (100 real + 50 fallback) ----------
  const customPersonas = [
    // 100 real names
    { name: "oladapo ogunsakin", gender: "men", country: "Nigeria", isFallback: false },
    { name: "narciso panganiban", gender: "men", country: "Mexico", isFallback: false },
    { name: "Elmer nunez 📉", gender: "men", country: "Mexico", isFallback: false },
    { name: "Penwell leslie", gender: "men", country: "SouthAfrica", isFallback: false },
    { name: "G.a. Scott", gender: "men", country: "US", isFallback: false },
    { name: "Cherry Reichhart", gender: "women", country: "Germany", isFallback: false },
    { name: "Flash BE", gender: "men", country: "United Kingdom", isFallback: false },
    { name: "scott jung", gender: "men", country: "US", isFallback: false },
    { name: "Dottie Ragland", gender: "women", country: "US", isFallback: false },
    { name: "Andrew Funk", gender: "men", country: "US", isFallback: false },
    { name: "Amy Jasmine", gender: "women", country: "US", isFallback: false },
    { name: "Brian Kahle", gender: "men", country: "US", isFallback: false },
    { name: "Maureen joan jefferys", gender: "women", country: "United Kingdom", isFallback: false },
    { name: "Stanley willingham jr", gender: "men", country: "US", isFallback: false },
    { name: "Frank Lowry", gender: "men", country: "US", isFallback: false },
    { name: "Micheal Shaw", gender: "men", country: "US", isFallback: false },
    { name: "Arlene paz rodriguez", gender: "women", country: "Mexico", isFallback: false },
    { name: "louis wayne", gender: "men", country: "US", isFallback: false },
    { name: "Jennifer West", gender: "women", country: "US", isFallback: false },
    { name: "Connie H. Price", gender: "women", country: "US", isFallback: false },
    { name: "ashley muse", gender: "women", country: "US", isFallback: false },
    { name: "Trovis banks 🏦💰", gender: "men", country: "US", isFallback: false },
    { name: "Carmeal Smith", gender: "men", country: "US", isFallback: false },
    { name: "Jamie Terrell", gender: "men", country: "US", isFallback: false },
    { name: "Trovao Duchness 🦊", gender: "men", country: "Brazil", isFallback: false },
    { name: "Lessie Willhite", gender: "women", country: "US", isFallback: false },
    { name: "Chiquita Tate", gender: "women", country: "US", isFallback: false },
    { name: "Eric Harris", gender: "men", country: "US", isFallback: false },
    { name: "Mona Dent", gender: "women", country: "US", isFallback: false },
    { name: "Salman Rasheed", gender: "men", country: "UAE", isFallback: false },
    { name: "Syed Ali Zohaib", gender: "men", country: "India", isFallback: false },
    { name: "Moshin Ansari", gender: "men", country: "India", isFallback: false },
    { name: "Saqib Naveed", gender: "men", country: "India", isFallback: false },
    { name: "Sergio Vega munoz 🔥", gender: "men", country: "Mexico", isFallback: false },
    { name: "frankie elric", gender: "men", country: "US", isFallback: false },
    { name: "Chris Alexander", gender: "men", country: "US", isFallback: false },
    { name: "Angel Lopez", gender: "men", country: "Mexico", isFallback: false },
    { name: "Anthony Onyinkwa", gender: "men", country: "Nigeria", isFallback: false },
    { name: "victor e keyz 🎹🎺📉", gender: "men", country: "Nigeria", isFallback: false },
    { name: "Dereje haile", gender: "men", country: "Nigeria", isFallback: false },
    { name: "Sym Ple", gender: "men", country: "US", isFallback: false },
    { name: "Das Haruna Fearless", gender: "men", country: "Nigeria", isFallback: false },
    { name: "Tomas Yende", gender: "men", country: "SouthAfrica", isFallback: false },
    { name: "Stanley Ezeorjika 💰", gender: "men", country: "Nigeria", isFallback: false },
    { name: "jen lee", gender: "women", country: "US", isFallback: false },
    { name: "Nieves yazita 🌹❣️", gender: "women", country: "Mexico", isFallback: false },
    { name: "Dominic Harley", gender: "men", country: "United Kingdom", isFallback: false },
    { name: "Abita Fong", gender: "women", country: "Indonesia", isFallback: false },
    { name: "Oskar Lopez", gender: "men", country: "Mexico", isFallback: false },
    { name: "Ricardo Antonio mex", gender: "men", country: "Mexico", isFallback: false },
    { name: "Sarahi Reynaga", gender: "women", country: "Mexico", isFallback: false },
    { name: "Ana Montes", gender: "women", country: "Mexico", isFallback: false },
    { name: "jacqueline alvarado", gender: "women", country: "Mexico", isFallback: false },
    { name: "Yadira Torres Rivera", gender: "women", country: "Mexico", isFallback: false },
    { name: "Valentina Orozco 😎", gender: "women", country: "Mexico", isFallback: false },
    { name: "Manuel ascota", gender: "men", country: "Mexico", isFallback: false },
    { name: "David Magana 💹📉", gender: "men", country: "Mexico", isFallback: false },
    { name: "Besty Claudio Lopez", gender: "women", country: "Mexico", isFallback: false },
    { name: "Yadira rodriguez", gender: "women", country: "Mexico", isFallback: false },
    { name: "Juan torres nunez", gender: "men", country: "Mexico", isFallback: false },
    { name: "Valerina Pedraza", gender: "women", country: "Mexico", isFallback: false },
    { name: "eric ortiz", gender: "men", country: "Mexico", isFallback: false },
    { name: "Edd Trulli", gender: "men", country: "US", isFallback: false },
    { name: "marcy saenz", gender: "women", country: "Mexico", isFallback: false },
    { name: "Andy Zensation 📊", gender: "men", country: "US", isFallback: false },
    { name: "Latex mt tozer", gender: "men", country: "US", isFallback: false },
    { name: "Kluta wangempella ll", gender: "men", country: "SouthAfrica", isFallback: false },
    { name: "Boaster Friday", gender: "men", country: "Nigeria", isFallback: false },
    { name: "Philp Otive", gender: "men", country: "Nigeria", isFallback: false },
    { name: "Akiiga Fabian", gender: "men", country: "Nigeria", isFallback: false },
    { name: "Kelly TV", gender: "women", country: "US", isFallback: false },
    { name: "Esther Fidelis", gender: "women", country: "Nigeria", isFallback: false },
    { name: "Mates nsikak", gender: "men", country: "Nigeria", isFallback: false },
    { name: "Friday Kelly", gender: "men", country: "Nigeria", isFallback: false },
    { name: "Edeh Favour", gender: "men", country: "Nigeria", isFallback: false },
    { name: "Lazy Dark 🌑💰💲", gender: "men", country: "US", isFallback: false },
    { name: "Kullest Kidd 🪐", gender: "men", country: "US", isFallback: false },
    { name: "Paul jande", gender: "men", country: "Nigeria", isFallback: false },
    { name: "Bwalya Coxy", gender: "men", country: "SouthAfrica", isFallback: false },
    { name: "Boss  Mega ⚡⚡⚡", gender: "men", country: "Nigeria", isFallback: false },
    { name: "Regard Nyakane", gender: "men", country: "SouthAfrica", isFallback: false },
    { name: "Tdk Mj", gender: "men", country: "US", isFallback: false },
    { name: "Mbg Mook 🍒", gender: "men", country: "US", isFallback: false },
    { name: "Larry Verb Washington", gender: "men", country: "US", isFallback: false },
    { name: "Md aldarondo", gender: "men", country: "Mexico", isFallback: false },
    { name: "jens kleinschmidt", gender: "men", country: "Germany", isFallback: false },
    { name: "Buchi Joseph", gender: "men", country: "Nigeria", isFallback: false },
    { name: "mitchell dufort", gender: "men", country: "US", isFallback: false },
    { name: "marvel Da' sauce", gender: "men", country: "US", isFallback: false },
    { name: "Red Barron", gender: "men", country: "US", isFallback: false },
    { name: "Oliver Meszaros", gender: "men", country: "Germany", isFallback: false },
    { name: "Ben Leary", gender: "men", country: "United Kingdom", isFallback: false },
    { name: "Ron  Thomson 🏍️", gender: "men", country: "US", isFallback: false },
    { name: "Nicholas Marchese", gender: "men", country: "US", isFallback: false },
    { name: "Joe Cottrell", gender: "men", country: "US", isFallback: false },
    { name: "Jovan Mircetic", gender: "men", country: "US", isFallback: false },
    { name: "Jordan A Ashcer", gender: "men", country: "US", isFallback: false },
    { name: "matt donald", gender: "men", country: "US", isFallback: false },
    { name: "Chris harney", gender: "men", country: "US", isFallback: false },
    { name: "Dvedat Demirci", gender: "men", country: "Germany", isFallback: false },
    { name: "Serhat Nuri Kaya", gender: "men", country: "Germany", isFallback: false },
    { name: "Julibel Golilao", gender: "women", country: "Indonesia", isFallback: false },

    // 50 fallback personas
    { name: "Maria Gonzalez", gender: "women", country: "Mexico", isFallback: true },
    { name: "Carlos Mendez", gender: "men", country: "Mexico", isFallback: true },
    { name: "Linda Schmidt", gender: "women", country: "Germany", isFallback: true },
    { name: "Hans Becker", gender: "men", country: "Germany", isFallback: true },
    { name: "Priya Sharma", gender: "women", country: "India", isFallback: true },
    { name: "Raj Patel", gender: "men", country: "India", isFallback: true },
    { name: "Aisha Al-Farsi", gender: "women", country: "UAE", isFallback: true },
    { name: "Omar Hassan", gender: "men", country: "UAE", isFallback: true },
    { name: "Sofia Rossi", gender: "women", country: "Brazil", isFallback: true },
    { name: "Lucas Silva", gender: "men", country: "Brazil", isFallback: true },
    { name: "Chloe Martin", gender: "women", country: "United Kingdom", isFallback: true },
    { name: "James Taylor", gender: "men", country: "United Kingdom", isFallback: true },
    { name: "Emily Johnson", gender: "women", country: "US", isFallback: true },
    { name: "Michael Brown", gender: "men", country: "US", isFallback: true },
    { name: "Siti Nurhaliza", gender: "women", country: "Indonesia", isFallback: true },
    { name: "Budi Santoso", gender: "men", country: "Indonesia", isFallback: true },
    { name: "Zinhle Dlamini", gender: "women", country: "SouthAfrica", isFallback: true },
    { name: "Thabo Nkosi", gender: "men", country: "SouthAfrica", isFallback: true },
    { name: "Amara Okonkwo", gender: "women", country: "Nigeria", isFallback: true },
    { name: "Chidi Eze", gender: "men", country: "Nigeria", isFallback: true },
    { name: "Isabella Costa", gender: "women", country: "Brazil", isFallback: true },
    { name: "Mateo Fernandez", gender: "men", country: "Mexico", isFallback: true },
    { name: "Emma Wilson", gender: "women", country: "United Kingdom", isFallback: true },
    { name: "David Kim", gender: "men", country: "US", isFallback: true },
    { name: "Yuki Tanaka", gender: "women", country: "Indonesia", isFallback: true },
    { name: "Ahmed Al-Mansouri", gender: "men", country: "UAE", isFallback: true },
    { name: "Neha Gupta", gender: "women", country: "India", isFallback: true },
    { name: "Vikram Singh", gender: "men", country: "India", isFallback: true },
    { name: "Laura Fischer", gender: "women", country: "Germany", isFallback: true },
    { name: "Stefan Weber", gender: "men", country: "Germany", isFallback: true },
    { name: "Nia Siregar", gender: "women", country: "Indonesia", isFallback: true },
    { name: "Andi Wijaya", gender: "men", country: "Indonesia", isFallback: true },
    { name: "Lerato Mokoena", gender: "women", country: "SouthAfrica", isFallback: true },
    { name: "Sipho Khumalo", gender: "men", country: "SouthAfrica", isFallback: true },
    { name: "Folake Adeyemi", gender: "women", country: "Nigeria", isFallback: true },
    { name: "Tunde Balogun", gender: "men", country: "Nigeria", isFallback: true },
    { name: "Jessica Miller", gender: "women", country: "US", isFallback: true },
    { name: "Christopher Davis", gender: "men", country: "US", isFallback: true },
    { name: "Sophie Evans", gender: "women", country: "United Kingdom", isFallback: true },
    { name: "William Jones", gender: "men", country: "United Kingdom", isFallback: true },
    { name: "Camila Rocha", gender: "women", country: "Brazil", isFallback: true },
    { name: "Gustavo Lima", gender: "men", country: "Brazil", isFallback: true },
    { name: "Fatima Al-Zaabi", gender: "women", country: "UAE", isFallback: true },
    { name: "Rashid Al-Kaabi", gender: "men", country: "UAE", isFallback: true },
    { name: "Anjali Reddy", gender: "women", country: "India", isFallback: true },
    { name: "Arjun Mehta", gender: "men", country: "India", isFallback: true },
    { name: "Valeria Hernandez", gender: "women", country: "Mexico", isFallback: true },
    { name: "Alejandro Ruiz", gender: "men", country: "Mexico", isFallback: true },
    { name: "Anna Wagner", gender: "women", country: "Germany", isFallback: true },
    { name: "Thomas Schulz", gender: "men", country: "Germany", isFallback: true }
  ];

  // Map real names to personality presets
  const nameToPersonality = {
    "oladapo ogunsakin": 'boss',
    "Anthony Onyinkwa": 'expert',
    "victor e keyz 🎹🎺📉": 'analyst',
    "Stanley Ezeorjika 💰": 'boss',
    "Das Haruna Fearless": 'expert',
    "Boaster Friday": 'joker',
    "Boss  Mega ⚡⚡⚡": 'boss',
    "Lazy Dark 🌑💰💲": 'wit',
    "Elmer nunez 📉": 'analyst',
    "Sergio Vega munoz 🔥": 'boss',
    "David Magana 💹📉": 'analyst',
    "Andy Zensation 📊": 'analyst',
    "Valentina Orozco 😎": 'joker',
    "Trovis banks 🏦💰": 'boss',
    "Flash BE": 'expert',
    "Red Barron": 'wit',
    "Kullest Kidd 🪐": 'joker',
    "marvel Da' sauce": 'joker',
    "Ron  Thomson 🏍️": 'expert',
    "Jamie Terrell": 'newbie',
    "ashley muse": 'newbie',
    "jen lee": 'newbie',
    "Mona Dent": 'lurker',
    "Sym Ple": 'lurker',
    "Cherry Reichhart": 'thoughtful',
    "Trovao Duchness 🦊": 'joker',
    "Salman Rasheed": 'analyst',
    "Syed Ali Zohaib": 'expert',
    "Nieves yazita 🌹❣️": 'thoughtful',
    "Dominic Harley": 'wit',
    "Latex mt tozer": 'lurker',
    "Kluta wangempella ll": 'lurker',
    "Paul jande": 'newbie',
    "Bwalya Coxy": 'expert',
    "Regard Nyakane": 'analyst',
    "Tdk Mj": 'newbie',
    "Mbg Mook 🍒": 'joker',
    "Larry Verb Washington": 'expert',
    "jens kleinschmidt": 'analyst',
    "Oliver Meszaros": 'thoughtful',
    "Ben Leary": 'wit',
    "Nicholas Marchese": 'newbie',
    "Joe Cottrell": 'expert',
    "Jovan Mircetic": 'analyst',
    "Dvedat Demirci": 'boss',
    "Serhat Nuri Kaya": 'thoughtful',
    "Julibel Golilao": 'newbie'
  };

  // ---------- ARCHETYPE DEFINITIONS ----------
  const archetypeDefs = {
    watcher: { name: "watcher", activityMult: 0.15, traits: ["quiet","observant"], messageTypes: [MessageType.REACTION, MessageType.COMMUNITY] },
    active: { name: "active", activityMult: 1.0, traits: ["talkative","friendly"], messageTypes: Object.values(MessageType) },
    leader: { name: "leader", activityMult: 0.9, traits: ["confident","authority"], messageTypes: [MessageType.ADVICE, MessageType.FLEX, MessageType.HYPE] },
    sarcastic: { name: "sarcastic", activityMult: 0.7, traits: ["witty","sarcastic"], messageTypes: [MessageType.SARCASTIC, MessageType.REACTION, MessageType.FLEX] },
    analytical: { name: "analytical", activityMult: 0.8, traits: ["logical","detailed"], messageTypes: [MessageType.ANALYTICAL, MessageType.ADVICE, MessageType.QUESTION] },
    funny: { name: "funny", activityMult: 0.7, traits: ["humorous","joker"], messageTypes: [MessageType.FUNNY, MessageType.REACTION, MessageType.HYPE] }
  };

  // ---------- BUILD PERSONAS ----------
  const personas = [];
  let idCounter = 1;

  customPersonas.forEach((p, index) => {
    let personality;
    if (!p.isFallback && nameToPersonality[p.name]) {
      personality = personalityPresets[nameToPersonality[p.name]];
    } else {
      const presets = Object.values(personalityPresets);
      personality = presets[index % presets.length];
    }

    const arch = archetypeDefs[personality.archetype] || archetypeDefs.active;

    let typingBase;
    if (personality.experience === 'beginner') typingBase = [1800, 3500];
    else if (personality.experience === 'intermediate') typingBase = [900, 1800];
    else typingBase = [500, 1000];

    let grammar = personality.experience === 'beginner' ? 'informal' : (personality.experience === 'intermediate' ? 'mixed' : 'clean');
    let slang = personality.experience === 'beginner' ? 0.75 : (personality.experience === 'intermediate' ? 0.5 : 0.15);
    if (personality.archetype === 'sarcastic') slang = Math.min(1, slang + 0.2);
    if (personality.archetype === 'analytical') grammar = 'clean';

    const avatarUrl = getAvatarUrl(p.name, p.gender, p.country, p.isFallback);

    personas.push({
      id: `p_${idCounter++}`,
      name: p.name,
      avatar: avatarUrl,
      country: p.country,
      gender: p.gender,
      timezone: getTimezoneForCountry(p.country),
      type: personality.experience,
      intent: personality.intent,
      archetype: arch.name,
      activityMult: arch.activityMult,
      traits: arch.traits,
      allowedTypes: arch.messageTypes,
      typingSpeed: [typingBase[0] + index * 3, typingBase[1] + index * 8],
      grammar: grammar,
      slangLevel: Math.min(1, slang + (Math.random() * 0.15 - 0.075)),
      activityLevel: personality.experience === 'advanced' ? 'low' : (personality.experience === 'intermediate' ? 'medium' : 'high'),
      onlineHours: [7, 23],
      messageBank: {}
    });
  });

  // ---------- FULL PHRASE BANKS ----------
  const globalPhraseBank = {
    question: [
      "how do you enter this trade?", "is this signal safe?", "what timeframe?", "anyone tested this strategy?", "how long have you been trading?",
      "what's the win rate?", "minimum deposit?", "can I use demo first?", "is this OTC or real market?", "which pair is best today?",
      "how do I set stop loss?", "when is the next signal?", "do you trade full time?", "what broker do you use?", "is this app legit?",
      "how to withdraw profits?", "any proof of payments?", "how much capital needed?", "can I copy trades?", "what's the risk per trade?",
      "do you have a Telegram group?", "how accurate are signals?", "is this suitable for beginners?", "what session do you trade?",
      "any free signals first?", "how to read the chart?", "what indicators do you use?", "do you trade news?", "what's the max drawdown?",
      "is this martingale?", "how many signals per day?", "do you trade weekends?", "what's the best time to trade?", "can I use mobile app?",
      "how fast is withdrawal?", "do you offer coaching?", "what's your favorite pair?", "how do you handle losses?", "do you use leverage?",
      "what's your average profit?", "is there a signal history?", "how do I know when to exit?", "do you trade during news?",
      "what's your win streak?", "can I start with $50?", "how to manage emotions?", "do you recommend any books?", "what's your daily goal?",
      "how to avoid revenge trading?", "do you use price action?", "is this a scam?", "how long to become profitable?",
      "can I see your trading account?", "do you have a verified track record?", "what's the difference between OTC and real?",
      "how do I improve my accuracy?", "what's the spread like?", "does this work on mobile?", "anyone else in this trade?",
      "should I wait for confirmation?", "what's your risk reward ratio?", "how many pips do you target?", "do you use trailing stop?",
      "what's your success rate this month?", "can I trade this on weekends?", "is this a scalp or swing?", "what's the expected duration?",
      "do you have a discord?", "how do you manage drawdown?", "what's the psychology behind this entry?", "any news events to watch?"
    ],
    result: [
      "just won this 🔥", "loss but next one coming", "easy win guys", "took profit at +87%", "hit TP perfectly", "small loss, sticking to plan",
      "recovered yesterday's loss", "three wins in a row", "this signal is fire", "broke even today", "scalped a quick 70%", "missed entry but it won",
      "took partial profits", "let it run to full TP", "closed early but still green", "tight stop saved me", "overtraded and lost",
      "discipline pays off", "followed the rules and won", "impulsive trade lost", "patience is key", "waited for confirmation and won",
      "entered too early, lost", "double bottom worked perfectly", "trend continuation win", "caught the reversal", "got stopped out by 1 pip",
      "that was close", "hit my daily target", "two losses, one win, still up", "good risk management", "didn't trade today, saved capital",
      "overtrading is real, took a break", "won on EUR/USD", "GBP/USD gave a nice move", "USD/JPY was choppy", "traded the news, won",
      "avoided the news, glad I did", "followed the trend, easy win", "counter-trend trade, lost", "waited for pullback, perfect entry",
      "used a tight stop, got stopped", "wider stop would have won", "took a small loss, preserved capital", "scalped 5 pips", "swing trade hit TP",
      "held overnight, won", "closed before weekend", "happy with the result", "just hit +92% on EUR/USD", "GBP/USD +78%", "USD/JPY +85%",
      "AUD/USD +73%", "EUR/GBP +81%", "USD/CHF +79%", "NZD/USD +77%", "US30 +88%", "GER40 +82%", "win streak: 4", "finally a green day",
      "recovered last week's loss", "stuck to the plan and it paid off", "no more FOMO", "trust the process", "this is the way",
      "slow and steady", "compounding works", "just banked +120 pips", "target hit! 🎯", "risk 1% made 3%", "ez money this morning",
      "lost 2% but I'm calm", "won 5 trades in a row!", "that was a perfect setup", "price did exactly what I expected",
      "I'm done for the day, green", "biggest win this month!", "small win > small loss", "compounding baby!"
    ],
    reaction: [
      "nice!", "🔥🔥", "that was clean", "good stuff", "well done", "congrats", "awesome", "solid trade", "keep it up", "impressive",
      "let's gooo", "beautiful", "perfect entry", "you're on fire", "respect", "💪", "👏", "🙌", "legend", "killing it", "great job",
      "amazing", "wow", "incredible", "superb", "excellent", "fantastic", "brilliant", "outstanding", "top notch", "love to see it",
      "that's how it's done", "inspiring", "motivating", "proud of you", "keep grinding", "stay consistent", "you got this",
      "next level", "beast mode", "unstoppable", "champion", "goat", "clean execution", "textbook trade", "masterclass", "flawless",
      "this is why we trade", "cheers mate", "big win", "ez money", "free pips", "another one", "add to the collection", "banked",
      "secured", "locked in", "print it", "cash out", "good trade", "nice call", "well played", "gg", "wp", "sheesh! 🥶",
      "no way! 🔥", "I saw that move too", "you're a beast", "respect the discipline", "trading goals", "love the consistency",
      "that's what I'm talking about", "bro you're different", "teach me 🙏", "insane accuracy", "keep cooking"
    ],
    advice: [
      "wait for confirmation", "don't rush entry", "follow rules", "always use stop loss", "manage risk first", "don't revenge trade",
      "stick to the plan", "patience is key", "never risk more than 2%", "trade with the trend", "avoid news spikes", "use proper lot size",
      "keep a trading journal", "review your losses", "don't overtrade", "take breaks", "emotions are the enemy", "trust the process",
      "learn from mistakes", "stay disciplined", "consistency over home runs", "protect your capital", "cut losses quickly",
      "let winners run", "don't chase the market", "wait for your setup", "quality over quantity", "know when to sit out",
      "don't trade tired", "have a routine", "backtest your strategy", "forward test first", "use demo to practice",
      "understand market structure", "learn support and resistance", "master one pair first", "don't jump between strategies",
      "keep it simple", "overtrading is the enemy", "focus on process, not profit", "risk only what you can afford to lose",
      "never trade under pressure", "set daily loss limit", "take profits regularly", "don't be greedy", "the market will always be there",
      "there's always another trade", "don't marry a position", "be flexible", "adapt to market conditions", "know when to switch pairs",
      "session matters", "liquidity is key", "avoid exotic pairs", "major pairs are more predictable", "watch the 1H candle close",
      "check higher timeframe trend", "don't trade during rollover", "use a demo first", "paper trade until consistent",
      "journal every trade", "review your losers", "find your edge", "stick to your system", "don't listen to FOMO"
    ],
    hype: [
      "this thing too sweet 🔥", "we eating today", "steady wins", "market is giving", "easy money", "let's get this bread",
      "profits printing", "green days only", "no losses today", "winning streak", "unstoppable", "locked in", "focused", "dialed in",
      "in the zone", "crushing it", "dominating", "on a roll", "can't be stopped", "this is our year", "making moves", "stacking wins",
      "pips for days", "money machine", "account growing", "compounding", "snowball effect", "momentum", "full steam ahead",
      "no looking back", "leveling up", "to the moon", "rocket ship", "all gas no brakes", "bull market vibes", "trend is your friend",
      "riding the wave", "catching knives (not today)", "precision entries", "no slippage", "perfect execution", "timing on point",
      "analysis paid off", "homework done", "preparation meets opportunity", "luck is for amateurs", "let's gooo!", "another green day",
      "bank account looking healthy", "we don't miss", "easy work", "that's my strategy", "trust the plan", "grinding to the top",
      "building wealth slowly", "compounding is king", "this is just the beginning"
    ],
    greeting: [
      "hey everyone", "good morning", "what's up", "hello traders", "good evening", "hi all", "morning", "evening", "yo",
      "how's everyone doing?", "happy trading", "weekend soon", "ready for the session", "let's make some pips", "greetings",
      "good afternoon", "hope everyone is well", "welcome new members", "great to see activity", "blessed day", "profitable day ahead",
      "stay positive", "good vibes only", "let's get it", "what's good fam", "how we feeling today?", "anyone trading?",
      "who's ready for London session?", "NY open soon", "Asian session quiet", "just woke up, time to trade", "coffee first, then charts",
      "checking in", "how's the market treating you?", "any big news today?", "gm traders", "gn guys", "afternoon everyone",
      "hope you're all green", "just got in, what's the move?", "anyone scalping today?", "London open soon, be ready",
      "NY session about to pop", "Friday vibes, don't overtrade", "weekend prep, review your week"
    ],
    confused: [
      "please explain", "I am new here", "how to start?", "any tutorial?", "what does OTC mean?", "how to read signal?",
      "confused about entry", "where can I learn?", "is this automated?", "do I need experience?", "can someone guide me?",
      "I don't understand the chart", "what's a candlestick?", "how do I deposit?", "is there a demo?",
      "what's the difference between buy and sell?", "how do I set take profit?", "what is a pip?", "how much is 1 lot?",
      "do I need to download software?", "can I use my phone?", "is there a minimum trade size?", "how do I know if signal is valid?",
      "what if I miss the entry?", "can I trade without verification?", "how do I contact support?", "I'm lost", "this is overwhelming",
      "where do I begin?", "can someone break it down for me?", "ELI5 please", "what's the first step?", "how do I fund my account?",
      "which broker is best for beginners?", "do I need a VPN?", "is my country restricted?", "what are the trading hours?",
      "can I trade on weekends?", "how do I read the economic calendar?", "I don't get it", "this is confusing",
      "what does that indicator mean?", "why did price reverse?", "is that a support level?", "how do you calculate lot size?",
      "what's leverage?", "I'm so lost", "anyone have a beginner guide?", "I need help with the platform"
    ],
    flex: [
      "just flipped this 🔥", "called that move", "too easy", "another bag", "EZ profit", "that's how it's done", "I told you all",
      "no sweat", "watch and learn", "this is light work", "trading like a boss", "can't stop winning", "my strategy is gold",
      "don't doubt me", "another win in the books", "clean sweep today", "haters will say it's fake", "results don't lie",
      "walking the walk", "prove them wrong", "silence the doubters", "account speaks for itself", "leveled up", "next tier unlocked",
      "elite status", "built different", "different breed", "they ain't ready", "on a whole 'nother level", "top of the leaderboard",
      "who's next?", "challenge accepted", "anyone else catch that move?", "I'm just getting started", "wait till you see my next trade",
      "consistency is king", "I don't gamble, I calculate", "risk management on point", "💰💰💰", "easy money this week",
      "my system is unstoppable", "back to back wins", "10 wins 0 losses", "who else caught that?", "I'm on fire",
      "trading is simple when you follow rules"
    ],
    community: [
      "anyone from Brazil?", "where is everyone from?", "nice to see global traders", "we all learning together", "support each other",
      "good vibes only", "let's grow together", "share your wins", "we got this", "teamwork makes the dream work", "community strong",
      "love this group", "helpful people here", "appreciate the insights", "learning a lot", "great atmosphere", "no negativity",
      "positive energy", "one family", "traders helping traders", "this is what it's about", "knowledge shared", "everyone starts somewhere",
      "no question is stupid", "ask away", "we were all beginners once", "stay humble", "help others when you can", "pay it forward",
      "good karma", "what goes around comes around", "shoutout to the admin", "thanks for the signals", "this group is gold",
      "appreciate everyone", "let's all succeed together", "great teamwork today", "proud of this community"
    ],
    testimonial: [
      "I was skeptical at first but this signal is legit. Just hit +89% on EUR/USD 🔥",
      "Finally a group that actually delivers. Withdrew my first profit today. Thanks!",
      "Been following for 2 weeks. Accuracy is real. Keep it up!", "Honestly the best signal community I've joined. No BS.",
      "Just wanted to share my result. +76% on GBP/USD. Screenshot attached 👇", "If you're new, trust the process. I'm up 3 days in a row.",
      "I'm not a bot lol. Real person here. This works.", "Took me a while to trust it, but now I'm consistent. Thanks team.",
      "For anyone doubting, just demo first. You'll see.", "I've been in many groups. This one is different. Signals are on point.",
      "This is my third withdrawal this month. Can't thank you enough.", "I started with $100 and now I'm at $450 in two weeks. Slow and steady.",
      "The support team is also super helpful. Answered all my questions.", "I love the community here. Everyone is so supportive.",
      "I was about to give up trading until I found this group.", "These signals combined with my own analysis are deadly.",
      "I'm not a pro trader but I'm making consistent profits now.", "The accuracy is way higher than any other free signal I've tried.",
      "Just hit 10 wins in a row! This is insane.", "I'm recommending this to all my friends. Legit.",
      "Finally a signal service that doesn't disappear after a week.", "The transparency is refreshing. Keep doing what you're doing.",
      "I've learned so much just by watching the chat.", "This group changed my perspective on trading.",
      "I'm a full-time trader now thanks to the skills I learned here.", "Withdrew $500 yesterday. Thank you!",
      "Signal hit TP in 2 minutes. Wow.", "Best $50 I ever spent on education.", "My account grew 200% in one month.",
      "I'm finally profitable after years.", "This group gave me the confidence to trade live.", "No more gambling. I have a real edge now.",
      "I was about to quit. You guys saved me."
    ],
    join: [
      "just joined the group! 👋", "hello everyone, new here!", "happy to be part of this community 🚀", "joined! looking forward to learning.",
      "new member here. excited to trade with you all.", "hey guys, just got added. what's up?", "finally in the chat! let's get it 💪",
      "hello world! ready to make some pips.", "greetings from [country]. newbie here!", "added by support. thanks for having me.",
      "new trader here. be gentle 😅", "just signed up. any tips for a beginner?", "excited to start this journey with you all!",
      "long time lurker, finally joined.", "heard great things about this group. happy to be here.", "let's make some money together!",
      "ready to learn from the best.", "I'm here to soak up all the knowledge.", "hope to contribute as I learn.", "thanks for the add!",
      "what's good fam, just joined", "another newbie here", "just got in, let's get this bread", "hey everyone, excited to be here",
      "joined after watching the testimonials"
    ],
    sarcastic: [
      "oh wow, another winner 😏", "sure, that definitely works... not", "easy money they said", "I'm sure this time it's different",
      "great, another loss, just what I needed", "my stop loss is my best friend", "trading is so relaxing they said",
      "of course it reversed right after I entered", "classic", "yeah, because that always works", "must be nice to never lose",
      "another perfect entry... not", "I love losing money, said no one ever", "this market is a joke"
    ],
    funny: [
      "my trading strategy: buy high, sell low 🤡", "I'm not losing, I'm just investing in experience",
      "my stop loss is my wife's patience", "trading is easy, just buy the dip and watch it dip further",
      "I'm in a committed relationship with my losses", "profit? never heard of her", "I put the 'fun' in 'funds'",
      "my account looks like a ski slope 🎿", "I thought I was buying the dip, but it was a cliff", "my strategy is called 'hope'",
      "I'm not a trader, I'm a professional donation sender", "my chart looks like a heartbeat"
    ],
    analytical: [
      "based on the 4H chart, we might see a retracement", "RSI is showing divergence", "support at 1.0850, resistance at 1.0920",
      "volume confirms the move", "looking at the order flow, smart money is buying", "fib levels suggest a pullback to 0.618",
      "market structure is bullish above the trendline", "watch for a break of the consolidation", "MACD histogram is flattening, possible reversal",
      "Bollinger bands are squeezing, breakout soon", "AUD/USD showing bullish engulfing on daily", "EUR/GBP respecting the 200 EMA",
      "watch the US30 for a double bottom"
    ]
  };

  const regionalPhrases = {
    Nigeria: ["how far", "this thing legit?", "make I try am", "abeg", "no wahala", "I dey observe", "na wa", "oya", "chop life", "e choke", "na so", "wetin dey happen?", "I go follow", "e be like say", "no shaking"],
    "United Kingdom": ["cheers", "proper", "mate", "innit", "sorted", "brilliant", "lovely", "fancy that", "spot on", "cracking", "bloody hell", "chuffed", "gobsmacked", "knackered", "taking the piss"],
    UAE: ["inshallah", "mashallah", "yalla", "habibi", "wallah", "akeed", "tamam", "maafi mushkila", "shukran", "afwan", "alhamdulillah", "insha'Allah", "sabah al khair", "masa al khair", "khalas"],
    US: ["y'all", "dope", "lit", "bet", "for real", "no cap", "facts", "sheesh", "vibe", "lowkey", "hella", "finna", "ion know", "deadass", "say less"],
    India: ["namaste", "bhai", "accha", "theek hai", "arre", "yaar", "sahi hai", "kya baat", "badhiya", "ekdum", "kya scene hai?", "mast", "jugaad", "chalo", "fatafat"],
    Brazil: ["boa", "valeu", "beleza", "e aí", "top", "show", "legal", "maneiro", "da hora", "fechou", "tamo junto", "partiu", "galera", "tranquilo", "demorou"],
    SouthAfrica: ["howzit", "sharp", "lekker", "yebo", "shap", "aweh", "dankie", "eish", "jol", "bru", "now now", "just now", "kiff", "dop", "braai"],
    Germany: ["genau", "super", "alles klar", "danke", "bitte", "prima", "mensch", "krass", "geil", "läuft", "servus", "moin", "naja", "doch", "schon"],
    Indonesia: ["mantap", "siap", "terima kasih", "bro", "anjay", "wih", "gokil", "asik", "oke", "santuy", "gas", "cuy", "wkwk", "sabar", "semangat"],
    Mexico: ["órale", "ándale", "qué padre", "wey", "neta", "chido", "no manches", "a huevo", "chingón", "padrísimo", "qué onda", "güey", "chale", "ándale pues", "simón"]
  };

  // Populate message banks
  personas.forEach(p => {
    const bank = { ...globalPhraseBank };
    if (regionalPhrases[p.country]) {
      bank.greeting = [...bank.greeting, ...regionalPhrases[p.country].slice(0,5)];
      bank.reaction = [...bank.reaction, ...regionalPhrases[p.country].slice(2,7)];
    }
    if (p.intent === 'learner') bank.question = [...bank.question, ...globalPhraseBank.confused.slice(0,10)];
    else if (p.intent === 'flex') { bank.flex = [...bank.flex, ...globalPhraseBank.result.slice(5,15)]; bank.hype = [...bank.hype, ...globalPhraseBank.flex]; }
    else if (p.intent === 'authority') bank.advice = [...bank.advice, ...globalPhraseBank.advice];
    if (p.archetype === 'sarcastic') bank.sarcastic = globalPhraseBank.sarcastic;
    if (p.archetype === 'funny') bank.funny = globalPhraseBank.funny;
    if (p.archetype === 'analytical') bank.analytical = globalPhraseBank.analytical;
    p.messageBank = bank;
  });

  // ---------- AUTO-DISCOVERY MEDIA SYSTEM ----------
  const MEDIA_CACHE = {};

  function probeMediaExists(personaId, personaName, type, index, extension) {
    const cacheKey = `${personaId}|${type}|${index}`;
    if (MEDIA_CACHE.hasOwnProperty(cacheKey)) {
      return Promise.resolve(MEDIA_CACHE[cacheKey]);
    }
    
    const normalized = normalizeNameForMedia(personaName);
    const url = `assets/${type}/${normalized}_${index}.${extension}`;
    
    return new Promise(resolve => {
      if (type === 'images') {
        const img = new Image();
        img.onload = () => { MEDIA_CACHE[cacheKey] = true; resolve(true); };
        img.onerror = () => { MEDIA_CACHE[cacheKey] = false; resolve(false); };
        img.src = url;
      } else {
        fetch(url, { method: 'HEAD' })
          .then(res => { MEDIA_CACHE[cacheKey] = res.ok; resolve(res.ok); })
          .catch(() => { MEDIA_CACHE[cacheKey] = false; resolve(false); });
      }
    });
  }

  async function buildGlobalMediaPool() {
    const pool = [];
    const maxFiles = CONFIG.MAX_FILES_PER_PERSONA;
    
    for (const p of personas) {
      const normalized = normalizeNameForMedia(p.name);
      
      for (let i = 1; i <= maxFiles; i++) {
        const exists = await probeMediaExists(p.id, p.name, 'images', i, 'jpg');
        if (exists) {
          pool.push({
            personaId: p.id,
            personaName: p.name,
            type: 'images',
            filename: `${normalized}_${i}.jpg`,
            url: `assets/images/${normalized}_${i}.jpg`,
            mediaType: 'image'
          });
        }
      }
      
      for (let i = 1; i <= maxFiles; i++) {
        const exists = await probeMediaExists(p.id, p.name, 'voices', i, 'webm');
        if (exists) {
          pool.push({
            personaId: p.id,
            personaName: p.name,
            type: 'voices',
            filename: `${normalized}_${i}.webm`,
            url: `assets/voices/${normalized}_${i}.webm`,
            mediaType: 'audio'
          });
        }
      }
      
      for (let i = 1; i <= maxFiles; i++) {
        const exists = await probeMediaExists(p.id, p.name, 'videos', i, 'mp4');
        if (exists) {
          pool.push({
            personaId: p.id,
            personaName: p.name,
            type: 'videos',
            filename: `${normalized}_${i}.mp4`,
            url: `assets/videos/${normalized}_${i}.mp4`,
            mediaType: 'video'
          });
        }
      }
    }
    
    return pool;
  }

  // ---------- SESSION MEDIA TRACKING ----------
  let sentMedia = {};
  let sessionMediaCount = 0;
  let sessionStartTime = Date.now();
  let sessionHasMedia = false;

  function resetSessionMediaIfExpired() {
    if (Date.now() - sessionStartTime > CONFIG.SESSION_RESET_TIMEOUT) {
      sentMedia = {};
      sessionMediaCount = 0;
      sessionHasMedia = false;
      sessionStartTime = Date.now();
      log('🔄 Session media tracking reset (timeout)');
    }
  }

  function getSentSet(personaId, type) {
    if (!sentMedia[personaId]) sentMedia[personaId] = { images: new Set(), voices: new Set(), videos: new Set() };
    return sentMedia[personaId][type];
  }

  function markMediaSent(personaId, type, filename) {
    getSentSet(personaId, type).add(filename);
  }

  function isMediaSent(personaId, type, filename) {
    return getSentSet(personaId, type).has(filename);
  }

  async function pickUnusedMedia(preferredPersonaId = null, preferredTypes = ['images','videos','voices']) {
    resetSessionMediaIfExpired();
    if (sessionMediaCount >= CONFIG.MAX_MEDIA_PER_SESSION) {
      log('📦 Media limit reached for this session');
      return null;
    }

    const pool = await buildGlobalMediaPool();
    const unusedPool = pool.filter(item => !isMediaSent(item.personaId, item.type, item.filename));
    
    if (unusedPool.length === 0) {
      log('📭 No unused media available in global pool');
      return null;
    }

    let filtered = unusedPool.filter(item => preferredTypes.includes(item.type));
    if (filtered.length === 0) filtered = unusedPool;

    if (preferredPersonaId && Math.random() < 0.7) {
      const personaItems = filtered.filter(item => item.personaId === preferredPersonaId);
      if (personaItems.length > 0) filtered = personaItems;
    }

    const chosen = pick(filtered);
    markMediaSent(chosen.personaId, chosen.type, chosen.filename);
    sessionMediaCount++;
    if (!sessionHasMedia) sessionHasMedia = true;
    log(`📎 Attaching media: ${chosen.url} (from ${chosen.personaName}) [${sessionMediaCount}/${CONFIG.MAX_MEDIA_PER_SESSION}]`);
    return chosen;
  }

  // ---------- SIMULATION STATE ----------
  let activeTimeouts = [], lastMessageType = null, lastPersonaId = null, simulationActive = false, tradeResultInterval = null;
  const recentMessages = [];
  const chatAPI = window.chatAPI || {};

  function isPersonaOnline(p){ try{ const h = new Date(new Date().toLocaleString('en-US',{timeZone:p.timezone})).getHours(); return h>=p.onlineHours[0] && h<p.onlineHours[1]; }catch{ return true; } }
  function getActivePersonas(){ return personas.filter(p=>isPersonaOnline(p) && (Math.random() < (1 - CONFIG.WATCHER_ACTIVITY_PENALTY * (p.archetype === 'watcher' ? 1 : 0)))); }
  function pickDifferentPersona(){ const active = getActivePersonas(); if(!active.length) return null; let f = active.filter(p=>p.id!==lastPersonaId); if(!f.length) f=active; return pick(f); }

  function applyTypos(text){
    if(Math.random() > 0.2) return text;
    const words = text.split(' ');
    return words.map(w => {
      if(w.length < 4 || Math.random() > 0.1) return w;
      const pos = Math.floor(Math.random() * (w.length - 1));
      const chars = w.split('');
      [chars[pos], chars[pos+1]] = [chars[pos+1], chars[pos]];
      return chars.join('');
    }).join(' ');
  }

  function generateMessage(persona, forcedType=null){
    let type = forcedType;
    if(!type){
      const allowed = persona.allowedTypes;
      if(lastMessageType && conversationFlow[lastMessageType]){
        const possible = conversationFlow[lastMessageType].filter(t => allowed.includes(t) && persona.messageBank[t]?.length);
        if(possible.length) type = pick(possible);
      }
      if(!type) type = pick(allowed.filter(t => persona.messageBank[t]?.length) || [MessageType.GREETING]);
    }
    if(!persona.messageBank[type]?.length) type = pick(Object.keys(persona.messageBank));
    let text = pick(persona.messageBank[type]);
    if(persona.slangLevel > 0.6 && Math.random() > 0.5) text = text.replace(/going to/g,'gonna').replace(/want to/g,'wanna');
    if(persona.grammar === 'informal' && Math.random() > 0.6) text = text.replace(/you are/g,'you\'re').replace(/I am/g,'I\'m');
    if(Math.random() > 0.4){
      if(persona.archetype === 'sarcastic') text += ' 😏';
      else if(persona.archetype === 'funny') text += ' 😂';
      else if(persona.archetype === 'analytical') text += ' 📊';
      else text += ' ' + pick(['👍','😊','💪','🔥']);
    }
    lastMessageType = type;
    return { text: applyTypos(text), type };
  }

  function getTypingDelay(p, len){ return Math.min(randomBetween(p.typingSpeed[0], p.typingSpeed[1]) * len, 6000); }
  function showTyping(p, typingType = 'text'){ if(chatAPI.showTypingForPersona) chatAPI.showTypingForPersona(p, typingType); }
  function hideTyping(){ if(chatAPI.hideTyping) chatAPI.hideTyping(); }
  function isGeneralChatActive() { return window.__activeChatRoom === 'general' && chatAPI.isChatRoomActive?.(); }

  function getLastReplyTarget(excludePersonaId = null) {
    const target = [...recentMessages].reverse().find(m => m.text && m.personaId !== excludePersonaId);
    if (!target) return null;
    return { senderName: target.senderName, text: target.text.substring(0, 50) };
  }

  function buildReplyText(lastText) {
    const lowerText = (lastText || "").toLowerCase();
    if(lowerText.includes("win") || lowerText.includes("profit") || lowerText.includes("%") || lowerText.includes("tp")){
      return pick(["nice win! 🔥", "congrats on that profit", "that's what I'm talking about", "let's gooo", "🚀🚀", "well played"]);
    } else if(lowerText.includes("loss") || lowerText.includes("lost") || lowerText.includes("stop") || lowerText.includes("missed")){
      return pick(["tough one mate", "next trade will be better", "happens to everyone", "keep your head up", "you'll get the next one", "part of the game"]);
    } else if(lowerText.includes("?") || lowerText.includes("how") || lowerText.includes("what") || lowerText.includes("when")){
      return pick(["good question", "I was wondering the same", "anyone have an answer?", "would like to know too", "curious about that as well"]);
    } else if(lowerText.includes("signal") || lowerText.includes("entry") || lowerText.includes("trade")){
      return pick(["following this 📈", "already in", "looks solid", "agree with the setup", "I'm watching this too"]);
    } else if(lowerText.includes("testimonial") || lowerText.includes("proof") || lowerText.includes("withdrawal")){
      return pick(["nice! keep it up", "love to see it", "inspiring", "motivating", "this is the way"]);
    }
    return pick(["exactly!", "well said", "facts 💯", "this 👆", "couldn't agree more", "🔥🔥", "for real", "no cap"]);
  }

  async function sendPersonaMessageOriginal(persona, replyTo=null){
    if (!isGeneralChatActive()) return;
    if(persona.archetype === 'watcher' && Math.random() > 0.15) return;
    const isTestimonial = Math.random() < CONFIG.TESTIMONIAL_CHANCE && persona.messageBank[MessageType.TESTIMONIAL];
    let { text, type } = generateMessage(persona, isTestimonial ? MessageType.TESTIMONIAL : null);
    const now = new Date(); const timeStr = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});

    let mediaItem = null;
    const shouldConsiderMedia = (type === MessageType.TESTIMONIAL || type === MessageType.RESULT || type === MessageType.FLEX || type === MessageType.HYPE);
    const forceAttach = (!sessionHasMedia && sessionMediaCount < CONFIG.MIN_MEDIA_PER_SESSION);
    if (shouldConsiderMedia && (forceAttach || Math.random() < CONFIG.MEDIA_ATTACH_CHANCE)) {
      const preferredTypes = (type === MessageType.TESTIMONIAL || type === MessageType.RESULT) 
        ? ['images','videos','voices'] 
        : ['images','videos'];
      mediaItem = await pickUnusedMedia(persona.id, preferredTypes);
    }

    let typingType = 'text';
    if (mediaItem && mediaItem.mediaType === 'audio') {
      typingType = 'audio';
    }
    showTyping(persona, typingType);

    const msgData = {
      senderName: persona.name,
      senderAvatar: persona.avatar,
      text: text,
      time: timeStr,
      personaId: persona.id,
      messageType: type,
      experience: persona.type,
      archetype: persona.archetype
    };

    if (mediaItem) {
      msgData.mediaType = mediaItem.mediaType;
      msgData.mediaUrl = mediaItem.url;
      if (mediaItem.personaId !== persona.id) {
        const attribution = pick([
          `📸 Shared by ${mediaItem.personaName}:`,
          `🎤 From ${mediaItem.personaName}:`,
          `📹 ${mediaItem.personaName} sent this:`
        ]);
        msgData.text = `${attribution} ${text}`;
      }
    }

    const replyTarget = replyTo || getLastReplyTarget(persona.id);
    if(replyTarget) msgData.replyTo = replyTarget;

    setTimeout(() => {
      hideTyping();
      if(chatAPI.addIncomingMessage){
        const el = chatAPI.addIncomingMessage(msgData);
        if(el) {
          recentMessages.push({ id: persona.id+'_'+Date.now(), personaId: persona.id, senderName: persona.name, text: msgData.text, element: el });
          if(recentMessages.length>30) recentMessages.shift();
        }
      }
      lastPersonaId = persona.id;
      log(`${persona.name} (${persona.archetype}): ${msgData.text} ${mediaItem ? '[media]' : ''}`);
    }, getTypingDelay(persona, text.length));
  }

  function forceReplyToLastAIMessage() {
    if(!simulationActive || !isGeneralChatActive() || Math.random() > CONFIG.REPLY_CHANCE) return;
    const lastAIMessage = [...recentMessages].reverse().find(m => m.personaId !== 'user');
    if(!lastAIMessage) return;
    const persona = pickDifferentPersona();
    if(!persona) return;
    const replyText = buildReplyText(lastAIMessage.text);
    const now = new Date(); const timeStr = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
    const msgData = {
      senderName: persona.name,
      senderAvatar: persona.avatar,
      text: replyText,
      time: timeStr,
      personaId: persona.id,
      replyTo: { senderName: lastAIMessage.senderName, text: lastAIMessage.text.substring(0, 50) }
    };
    log(`🤖 ${persona.name} forced reply to AI ${lastAIMessage.senderName}`);
    if(chatAPI.addIncomingMessage) chatAPI.addIncomingMessage(msgData);
    lastPersonaId = persona.id;
  }

  const sendPersonaMessage = function(persona, replyTo=null) {
    sendPersonaMessageOriginal(persona, replyTo);
    setTimeout(() => { forceReplyToLastAIMessage(); }, randomBetween(2000, 4500));
  };

  function simulateJoin(){
    if (!isGeneralChatActive()) return;
    const p = pick(personas.filter(p => !p.isFallback || Math.random() > 0.5));
    if(!p) return;
    const joinText = pick(globalPhraseBank.join).replace('[country]', p.country);
    const now = new Date(); const timeStr = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
    if(chatAPI.addSystemMessage) chatAPI.addSystemMessage({ text: `🎉 ${p.name} ${joinText}`, time: timeStr });
    setTimeout(()=>{ if(!simulationActive) return; showTyping(p); setTimeout(()=>{ hideTyping(); if(chatAPI.addIncomingMessage) chatAPI.addIncomingMessage({ senderName:p.name, senderAvatar:p.avatar, text: pick(["thanks for the warm welcome!","excited to be here","hello everyone!"]), time: new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}), personaId:p.id }); },1500); },3000);
  }

  function triggerBurst(){
    const count = randomBetween(2, CONFIG.MAX_BURST_MESSAGES);
    let sent = 0;
    const int = setInterval(()=>{
      if(sent>=count){ clearInterval(int); return; }
      const p = pickDifferentPersona();
      if(p && !(p.archetype === 'watcher' && Math.random() > 0.2)){
        const {text} = generateMessage(p);
        showTyping(p);
        setTimeout(()=>{ hideTyping(); sendPersonaMessage(p); }, getTypingDelay(p, text.length));
        sent++;
      } else { sent++; }
    }, randomBetween(800, 2000));
    activeTimeouts.push(int);
  }

  function simulationTick(){
    if(!simulationActive || !isGeneralChatActive()) return;
    if(Math.random() < CONFIG.JOIN_CHANCE) simulateJoin();
    if(Math.random() < CONFIG.BURST_CHANCE) triggerBurst();
    else {
      const p = pickDifferentPersona();
      if(p && !(p.archetype === 'watcher' && Math.random() > 0.2)){
        const {text} = generateMessage(p);
        showTyping(p);
        activeTimeouts.push(setTimeout(()=>{ hideTyping(); sendPersonaMessage(p); }, getTypingDelay(p, text.length)+randomBetween(1000,4000)));
      }
    }
    activeTimeouts.push(setTimeout(simulationTick, CONFIG.BASE_INTERVAL+randomBetween(-2000,5000)));
  }

  function injectTradeResult(){
    if (!isGeneralChatActive()) return;
    const pair = pick(["EUR/USD","GBP/USD","USD/JPY","AUD/USD","EUR/GBP","USD/CHF","NZD/USD","US30","GER40"]);
    const percent = pick(["+92%","+87%","+78%","+95%","+83%","+91%","+76%","+88%","+84%","+79%","+96%","+81%","+73%","+89%"]);
    if(Math.random() > 0.5){
      const p = pickDifferentPersona();
      if(p && !(p.archetype === 'watcher' && Math.random() > 0.2)){
        const text = pick([`just closed ${pair} at ${percent} 🎯`,`${pair} hit TP ${percent}`,`easy ${percent} on ${pair}`]);
        const now = new Date(); const timeStr = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
        if(chatAPI.addIncomingMessage) {
          const el = chatAPI.addIncomingMessage({ senderName: p.name, senderAvatar: p.avatar, text, time: timeStr, personaId: p.id, messageType: MessageType.RESULT });
          if (el) { recentMessages.push({ id: p.id+'_'+Date.now(), personaId: p.id, senderName: p.name, text, element: el }); if(recentMessages.length>30) recentMessages.shift(); }
        }
        lastPersonaId = p.id; lastMessageType = MessageType.RESULT;
        return;
      }
    }
    const text = `📊 Signal Result: ${pair} ${percent} ✅`;
    const now = new Date(); const timeStr = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
    if(chatAPI.addSystemMessage) chatAPI.addSystemMessage({ text, time: timeStr });
  }

  function startSimulation(){ if(simulationActive) return; simulationActive=true; lastMessageType=null; lastPersonaId=null; log('🚀 Simulation started'); simulationTick(); }
  function stopSimulation(){ simulationActive=false; activeTimeouts.forEach(clearTimeout); activeTimeouts=[]; hideTyping(); log('🛑 Simulation stopped'); }
  function startTradeResultInjection(){ if(tradeResultInterval) clearInterval(tradeResultInterval); tradeResultInterval = setInterval(()=>{ if(!simulationActive||!isGeneralChatActive()) return; if(Math.random()<CONFIG.TRADE_RESULT_CHANCE) injectTradeResult(); }, CONFIG.TRADE_RESULT_INTERVAL); }

  const originalStartSimulation = startSimulation;
  startSimulation = function() {
    if(simulationActive) return;
    originalStartSimulation();
    setTimeout(() => {
      if(simulationActive && isGeneralChatActive()) {
        let count = 0;
        const interval = setInterval(() => {
          if(count >= 3 || !simulationActive) { clearInterval(interval); return; }
          const p = pickDifferentPersona();
          if(p) { const {text} = generateMessage(p); showTyping(p); setTimeout(() => { hideTyping(); sendPersonaMessage(p); }, getTypingDelay(p, text.length)); }
          count++;
        }, 2500);
      }
    }, 2000);
  };

  function syncSimulationState() {
    const active = isGeneralChatActive();
    if (active && !simulationActive) { startSimulation(); startTradeResultInjection(); }
    else if (!active && simulationActive) { stopSimulation(); }
  }

  window.addEventListener('chat-room-changed', () => {
    sentMedia = {}; sessionMediaCount = 0; sessionHasMedia = false; sessionStartTime = Date.now();
    syncSimulationState();
  });
  setInterval(syncSimulationState, 1000);
  syncSimulationState();

  window.AIPersonaSimulator = { isActive: ()=>simulationActive, getPersonas: ()=>personas, injectTradeResult: ()=>injectTradeResult() };

  window.onUserMessage = function(msg) {
    recentMessages.push({ id: 'user_'+Date.now(), personaId:'user', senderName:msg.senderName, text:msg.text, element:null });
    if(recentMessages.length > 30) recentMessages.shift();
  };

  log(`🤖 AI Persona Engine v11.0 loaded with ${personas.length} custom personas. Auto-discovery media active.`);
})();
