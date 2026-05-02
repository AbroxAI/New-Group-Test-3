// ====================== AI PERSONA ENGINE v16 (MINING ADAPTED) ======================
// Humanlike conversations about USDT mining, hash rates, rigs, daily earnings.
// Reads media manifest from window.MEDIA_MANIFEST (loaded via media-manifest.js)
// ===================================================================================

(function(){
  "use strict";

  const CONFIG = {
    BASE_INTERVAL: 14000,
    BURST_CHANCE: 0.07,
    MINING_RESULT_INTERVAL: 28000,
    MINING_RESULT_CHANCE: 0.55,
    TESTIMONIAL_CHANCE: 0.32,
    JOIN_CHANCE: 0.04,
    MAX_BURST_MESSAGES: 2,
    ENABLE_LOGGING: true,
    WATCHER_ACTIVITY_PENALTY: 0.65,
    REPLY_CHANCE: 0.42,
    REPLY_WITH_MEDIA_CHANCE: 0.12,
    MEDIA_COOLDOWN_MINUTES: 12
  };

  const MessageType = {
    QUESTION: "question",
    RESULT: "result",
    REACTION: "reaction",
    ADVICE: "advice",
    HYPE: "hype",
    GREETING: "greeting",
    CONFUSED: "confused",
    FLEX: "flex",
    COMMUNITY: "community",
    TESTIMONIAL: "testimonial",
    JOIN: "join",
    SARCASTIC: "sarcastic",
    FUNNY: "funny",
    ANALYTICAL: "analytical"
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
  const log = (...args) => CONFIG.ENABLE_LOGGING && console.log('[MINING AI]', ...args);

  function getTimezoneForCountry(country) {
    const map = {
      Nigeria: "Africa/Lagos", "United Kingdom": "Europe/London", UAE: "Asia/Dubai",
      US: "America/New_York", India: "Asia/Kolkata", Brazil: "America/Sao_Paulo",
      SouthAfrica: "Africa/Johannesburg", Germany: "Europe/Berlin",
      Indonesia: "Asia/Jakarta", Mexico: "America/Mexico_City"
    };
    return map[country] || "UTC";
  }

  function getAvatarUrl(displayName, gender, country, isFallback) {
    if (!isFallback) {
      let safeName = displayName
        .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
        .replace(/[^\w\s]/g, '')
        .trim()
        .replace(/\s+/g, '_')
        .toLowerCase();
      return 'assets/avatars/' + safeName + '.jpg';
    } else {
      const names = displayName.split(' ');
      const firstLetter = names[0]?.[0] || '';
      const lastLetter = names[names.length - 1]?.[0] || '';
      return `https://ui-avatars.com/api/?name=${firstLetter}+${lastLetter}&background=2f5b9c&color=fff&size=200&bold=true`;
    }
  }

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

  // ----- 150+ Personas (full list) -----
  const customPersonas = [
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

  const nameToPersonality = {
    "oladapo ogunsakin": 'boss', "Anthony Onyinkwa": 'expert', "victor e keyz 🎹🎺📉": 'analyst',
    "Stanley Ezeorjika 💰": 'boss', "Das Haruna Fearless": 'expert', "Boaster Friday": 'joker',
    "Boss  Mega ⚡⚡⚡": 'boss', "Lazy Dark 🌑💰💲": 'wit', "Elmer nunez 📉": 'analyst',
    "Sergio Vega munoz 🔥": 'boss', "David Magana 💹📉": 'analyst', "Andy Zensation 📊": 'analyst',
    "Valentina Orozco 😎": 'joker', "Trovis banks 🏦💰": 'boss', "Flash BE": 'expert',
    "Red Barron": 'wit', "Kullest Kidd 🪐": 'joker', "marvel Da' sauce": 'joker',
    "Ron  Thomson 🏍️": 'expert', "Jamie Terrell": 'newbie', "ashley muse": 'newbie',
    "jen lee": 'newbie', "Mona Dent": 'lurker', "Sym Ple": 'lurker', "Cherry Reichhart": 'thoughtful',
    "Trovao Duchness 🦊": 'joker', "Salman Rasheed": 'analyst', "Syed Ali Zohaib": 'expert',
    "Nieves yazita 🌹❣️": 'thoughtful', "Dominic Harley": 'wit', "Latex mt tozer": 'lurker',
    "Kluta wangempella ll": 'lurker', "Paul jande": 'newbie', "Bwalya Coxy": 'expert',
    "Regard Nyakane": 'analyst', "Tdk Mj": 'newbie', "Mbg Mook 🍒": 'joker',
    "Larry Verb Washington": 'expert', "jens kleinschmidt": 'analyst', "Oliver Meszaros": 'thoughtful',
    "Ben Leary": 'wit', "Nicholas Marchese": 'newbie', "Joe Cottrell": 'expert',
    "Jovan Mircetic": 'analyst', "Dvedat Demirci": 'boss', "Serhat Nuri Kaya": 'thoughtful',
    "Julibel Golilao": 'newbie', "Chidi Eze": 'newbie', "Carlos Mendez": 'expert'
  };

  const archetypeDefs = {
    watcher: { name: "watcher", activityMult: 0.15, traits: ["quiet","observant"], messageTypes: [MessageType.REACTION, MessageType.COMMUNITY] },
    active: { name: "active", activityMult: 1.0, traits: ["talkative","friendly"], messageTypes: Object.values(MessageType) },
    leader: { name: "leader", activityMult: 0.9, traits: ["confident","authority"], messageTypes: [MessageType.ADVICE, MessageType.FLEX, MessageType.HYPE] },
    sarcastic: { name: "sarcastic", activityMult: 0.7, traits: ["witty","sarcastic"], messageTypes: [MessageType.SARCASTIC, MessageType.REACTION, MessageType.FLEX] },
    analytical: { name: "analytical", activityMult: 0.8, traits: ["logical","detailed"], messageTypes: [MessageType.ANALYTICAL, MessageType.ADVICE, MessageType.QUESTION] },
    funny: { name: "funny", activityMult: 0.7, traits: ["humorous","joker"], messageTypes: [MessageType.FUNNY, MessageType.REACTION, MessageType.HYPE] }
  };

  // Build personas
  const personas = [];
  let idCounter = 1;
  for (const p of customPersonas) {
    let personalityKey = nameToPersonality[p.name] || 'active';
    let personality = personalityPresets[personalityKey] || personalityPresets.active;
    const arch = archetypeDefs[personality.archetype] || archetypeDefs.active;
    let typingBase = [1500, 2800];
    let grammar = 'mixed';
    let slang = 0.3;
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
      typingSpeed: [typingBase[0] + idCounter * 2, typingBase[1] + idCounter * 5],
      grammar: grammar,
      slangLevel: slang,
      activityLevel: 'medium',
      onlineHours: [7, 23],
      messageBank: {}
    });
  }

  // ----- MINING PHRASE BANKS (no trading) -----
  const globalPhraseBank = {
    question: [
      "how much USDT per day with Bronze tier?", "what's the minimum investment?", "does the Cosmic tier really give 22 USDT/day?",
      "how does hash rate affect earnings?", "can I withdraw daily?", "is the rig real or virtual?", "how many TH/s does the S21 Pro push?",
      "what's the ROI on 500 USDT?", "anyone using the Elite tier?", "how long until I break even?",
      "does the calculator include maintenance fees?", "can I upgrade my tier later?", "what happens if I stop paying?",
      "is there a demo mode?", "how to connect my wallet?", "which wallet is best for USDT (TRC20 or ERC20)?",
      "how fast are withdrawals?", "do you offer a referral bonus?", "can I see a live payout proof?",
      "what's the peak hashrate of this miner?", "how many rigs are active?", "is it really 99.9% uptime?"
    ],
    result: [
      "just mined 22 USDT today 🔥", "daily payout received: 66 USDT", "Cosmic tier doing work 💰", "my hash rate is steady at 312 TH/s",
      "withdrew 150 USDT this morning", "Electricity cost? negligible, hosted facility", "upgraded to Platinum, seeing 44 USDT/day",
      "compounding my earnings, up 15% this month", "just hit my first 1000 USDT mined total", "rig has been running 24/7 for 2 weeks",
      "no downtime, consistent payouts", "earning more than I expected", "the S21 Pro is a beast", "hash board 3 running at 105 TH/s",
      "daily profit target reached before noon", "stacking USDT every day", "passive income never felt so good"
    ],
    reaction: [
      "nice hashrate!", "🔥🔥 mining goals", "solid profit", "keep stacking USDT", "beautiful", "let's gooo", "love seeing the green",
      "respect the grind", "mining is the way", "passive income machine", "congrats on the payout", "that's what I'm talking about",
      "sheeesh", "you're killing it", "inspiring", "goals", "I need that tier", "how long have you been mining?"
    ],
    advice: [
      "compound your earnings", "reinvest daily profits", "monitor your hash rate", "stick with the Cosmic tier for best ROI",
      "don't withdraw every day if you want to grow", "use the calculator before investing", "trust the process, mining is long term",
      "keep your wallet secure", "never share your private keys", "admins never DM first", "start with Bronze to test",
      "upgrade gradually", "set a daily profit goal", "diversify across tiers", "check the history transactions for proof",
      "ask questions in chat, we're here to help", "the rig farm is real, check the live stats"
    ],
    hype: [
      "this mining farm is too sweet 🔥", "USDT printing machine", "consistent payouts", "best decision I made",
      "passive income unlocked", "stacking sats everyday", "never looking back", "mining is the future",
      "my rig never sleeps", "24/7 earnings", "this is the way", "thank you Neptune AI", "to the moon",
      "no more 9-5", "waking up to USDT", "life changer", "finally financial freedom"
    ],
    greeting: [
      "hey miners", "good morning mining fam", "what's up rig owners", "hello fellow earners", "how's the hash rate today?",
      "good evening", "who's mining right now?", "just checked my daily payout", "weekend mining is the best", "ready for another green day",
      "anyone else seeing steady returns?", "checking in from [country]", "hope everyone is earning well"
    ],
    confused: [
      "I'm new, how do I start mining?", "what's a hash rate?", "how do I connect my wallet?", "can I mine without buying hardware?",
      "explain the tiers please", "what does 'Cosmic' give me?", "is this cloud mining?", "how often are payouts?",
      "I deposited but no earnings yet", "where do I see my hash power?", "what's the minimum withdrawal?",
      "do I need to keep my computer on?", "I'm lost, please help", "how to upgrade my tier?", "why is my daily lower than the calculator?"
    ],
    flex: [
      "just mined another 350 USDT", "my Cosmic tier is paying for itself", "holding my USDT, not selling", "already recouped my investment",
      "watch and learn", "this is light work", "mining on autopilot", "stacking deep", "profit machine", "can't stop winning",
      "top earner this month", "hash rate maxed out", "leveled up to Legend tier", "anyone else in the top 10?"
    ],
    community: [
      "anyone from Brazil mining here?", "shoutout to all the miners", "we're all in this together", "love this community",
      "the support here is amazing", "no negativity, just mining", "who else is holding USDT?", "let's all get rich together",
      "teamwork makes the dream work", "grateful for this group", "mining family strong", "keep stacking, stay humble"
    ],
    testimonial: [
      "I started with 50 USDT two weeks ago. Now I'm at 150 USDT earned. This is legit!",
      "Was skeptical at first, but the daily payouts are real. Just withdrew 220 USDT.",
      "Best mining decision I ever made. Cosmic tier is a game changer.",
      "I've tried other cloud mining – this one actually delivers. Thank you Neptune AI.",
      "My friend recommended this. After 1 month, I've doubled my investment.",
      "The transparency is refreshing. Live hashrate stats, real rigs.",
      "I was about to give up on mining until I found this group.",
      "Finally a mining platform that doesn't run away with your money.",
      "The support team answered all my questions. Highly recommended.",
      "I'm a full-time crypto miner now thanks to Neptune AI.",
      "Withdrew 500 USDT yesterday. Seamless and fast.",
      "The calculator is accurate – I'm getting exactly 22 USDT/day on 50 USDT."
    ],
    join: [
      "just joined the mining family! 👋", "hello everyone, new miner here!", "excited to start mining USDT 🚀",
      "joined! looking forward to passive income.", "new member, just rented a Bronze rig.",
      "hey guys, got my first payout today!", "finally joined the chat. let's mine!",
      "just signed up. any tips for a beginner miner?", "ready to stack those USDT!",
      "long time lurker, finally mining.", "heard great things about Neptune AI. Let's go!"
    ],
    sarcastic: [
      "oh wow, another great mining day... obviously", "sure, my rig never goes down... right",
      "easy passive income they said", "another day, another USDT", "I love waiting for payouts",
      "my hash rate is clearly imaginary", "must be nice to have a Cosmic tier",
      "yeah, because mining never has issues",
      "great, my payout is late, just what I needed"
    ],
    funny: [
      "my mining strategy: invest and forget 🤡", "I'm not earning, I'm 'accumulating hash power'",
      "my rig is running on hopes and dreams", "profit? I barely know her",
      "I'm in a committed relationship with my USDT wallet",
      "my electric bill is zero (hosted facility), so jokes on you",
      "I put the 'mine' in 'mining'",
      "my hash rate is like my motivation – sometimes low"
    ],
    analytical: [
      "based on current hashrate, Cosmic tier yields 0.44 USDT per USDT per day",
      "the S21 Pro is hashing at 312.5 TH/s, efficiency 30 J/TH",
      "historical data shows 99.8% uptime over the last month",
      "compound reinvestment could 10x your capital in 3 months",
      "the math checks out: 50 USDT → 22 USDT/day = 44% daily ROI",
      "watched the rig temperature – stable at 68°C"
    ]
  };

  const regionalPhrases = {
    Nigeria: ["how far", "this mining thing legit?", "make I try am", "abeg", "no wahala", "I dey mine"],
    "United Kingdom": ["cheers", "proper mining", "mate", "sorted", "brilliant"],
    UAE: ["inshallah", "mashallah", "yalla", "habibi", "wallah"],
    US: ["y'all", "dope", "lit", "bet", "for real"],
    India: ["namaste", "bhai", "accha", "theek hai", "arre"],
    Brazil: ["boa", "valeu", "beleza", "e aí", "top"],
    SouthAfrica: ["howzit", "sharp", "lekker", "yebo", "shap"],
    Germany: ["genau", "super", "alles klar", "danke", "bitte"],
    Indonesia: ["mantap", "siap", "terima kasih", "bro", "anjay"],
    Mexico: ["órale", "ándale", "qué padre", "wey", "neta"]
  };

  // Populate message banks for each persona
  personas.forEach(p => {
    const bank = { ...globalPhraseBank };
    if (regionalPhrases[p.country]) {
      bank.greeting = [...bank.greeting, ...regionalPhrases[p.country].slice(0,5)];
      bank.reaction = [...bank.reaction, ...regionalPhrases[p.country].slice(2,7)];
    }
    if (p.intent === 'learner') bank.question = [...bank.question, ...globalPhraseBank.confused.slice(0,10)];
    else if (p.intent === 'flex') { bank.flex = [...bank.flex, ...globalPhraseBank.result]; bank.hype = [...bank.hype, ...globalPhraseBank.flex]; }
    else if (p.intent === 'authority') bank.advice = [...bank.advice, ...globalPhraseBank.advice];
    if (p.archetype === 'sarcastic') bank.sarcastic = globalPhraseBank.sarcastic;
    if (p.archetype === 'funny') bank.funny = globalPhraseBank.funny;
    if (p.archetype === 'analytical') bank.analytical = globalPhraseBank.analytical;
    p.messageBank = bank;
  });

  // ----- Media queue using external manifest (window.MEDIA_MANIFEST) -----
  const personaMediaQueue = new Map();
  const recentlyUsed = new Map();
  const personaLastMediaTime = new Map();

  function shuffleArray(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
  function cleanRecentlyUsed() { const now = Date.now(), cooldownMs = CONFIG.MEDIA_COOLDOWN_MINUTES * 60 * 1000; for (const [url, ts] of recentlyUsed.entries()) if (now - ts > cooldownMs) recentlyUsed.delete(url); }
  function pickMediaForPersona(personaId, preferredTypes = ['images','videos','voices']) {
    cleanRecentlyUsed();
    const lastMediaTime = personaLastMediaTime.get(personaId) || 0;
    if (Date.now() - lastMediaTime < 2 * 60 * 1000) return null;
    let queue = personaMediaQueue.get(personaId);
    if (!queue || !queue.length) return null;
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (!preferredTypes.includes(item.type)) continue;
      if (recentlyUsed.has(item.url)) continue;
      queue.splice(i, 1); queue.push(item);
      recentlyUsed.set(item.url, Date.now());
      personaLastMediaTime.set(personaId, Date.now());
      log(`🎯 Media: ${item.url}`);
      return item;
    }
    const oldest = queue[0];
    recentlyUsed.set(oldest.url, Date.now());
    personaLastMediaTime.set(personaId, Date.now());
    log(`⏳ Cooldown bypassed: ${oldest.url}`);
    return oldest;
  }

  function buildMediaQueues() {
    if (!window.MEDIA_MANIFEST) {
      log('❌ MEDIA_MANIFEST not found – media will not be sent');
      return;
    }
    personaMediaQueue.clear();
    for (const p of personas) {
      const entry = window.MEDIA_MANIFEST[p.name];
      if (!entry) continue;
      const items = [];
      (entry.images || []).forEach(fn => items.push({ personaId: p.id, personaName: p.name, type: 'images', url: 'assets/images/' + fn, mediaType: 'image' }));
      (entry.voices || []).forEach(fn => items.push({ personaId: p.id, personaName: p.name, type: 'voices', url: 'assets/voices/' + fn, mediaType: 'audio' }));
      (entry.videos || []).forEach(fn => items.push({ personaId: p.id, personaName: p.name, type: 'videos', url: 'assets/videos/' + fn, mediaType: 'video' }));
      if (items.length) personaMediaQueue.set(p.id, shuffleArray(items));
    }
    log(`✅ Media queues built. Personas with media: ${personaMediaQueue.size}`);
  }

  // Simulation state
  let activeTimeouts = [], lastMessageType = null, lastPersonaId = null, simulationActive = false, miningResultInterval = null;
  const recentMessages = [];
  const chatAPI = window.chatAPI || {};

  function isPersonaOnline(p){ try{ const h = new Date(new Date().toLocaleString('en-US',{timeZone:p.timezone})).getHours(); return h>=p.onlineHours[0] && h<p.onlineHours[1]; }catch{ return true; } }
  function getActivePersonas(){ return personas.filter(p=>isPersonaOnline(p) && (Math.random() < (1 - CONFIG.WATCHER_ACTIVITY_PENALTY * (p.archetype === 'watcher' ? 1 : 0)))); }
  function pickDifferentPersona(){ const active = getActivePersonas(); if(!active.length) return null; let f = active.filter(p=>p.id!==lastPersonaId); if(!f.length) f=active; return pick(f); }

  function applyTypos(text){
    if(Math.random() > 0.15) return text;
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
      else text += ' ' + pick(['👍','😊','💪','🔥','⛏️']);
    }
    lastMessageType = type;
    return { text: applyTypos(text), type };
  }

  function getTypingDelay(p, len){ return Math.min(randomBetween(p.typingSpeed[0], p.typingSpeed[1]) * len, 7000); }
  function showTyping(p, typingType = 'text'){ if(chatAPI.showTypingForPersona) chatAPI.showTypingForPersona(p, typingType); }
  function hideTyping(){ if(chatAPI.hideTyping) chatAPI.hideTyping(); }
  function isGeneralChatActive() { return window.__activeChatRoom === 'general' && chatAPI.isChatRoomActive?.(); }

  function getLastReplyTarget(excludePersonaId = null) {
    const target = [...recentMessages].reverse().find(m => m.text && m.personaId !== excludePersonaId);
    if (!target) return null;
    return { senderName: target.senderName, text: target.text.substring(0, 50), messageType: target.messageType };
  }

  function buildReplyText(lastText, targetMessageType) {
    const lowerText = (lastText || "").toLowerCase();
    if(lowerText.includes("mined") || lowerText.includes("usdt") || lowerText.includes("profit") || lowerText.includes("payout")){
      return pick(["nice earnings! 🔥", "congrats on the USDT", "that's what I'm talking about", "let's gooo", "🚀🚀", "keep mining"]);
    } else if(lowerText.includes("hash") || lowerText.includes("th/s") || lowerText.includes("rig")){
      return pick(["solid hashrate", "my rig is humming too", "nice specs", "S21 Pro is a beast", "hash power for days"]);
    } else if(lowerText.includes("?") || lowerText.includes("how") || lowerText.includes("what") || lowerText.includes("when")){
      return pick(["good question", "I was wondering the same", "anyone have an answer?", "would like to know too", "curious about that as well"]);
    } else if(lowerText.includes("tier") || lowerText.includes("cosmic") || lowerText.includes("bronze")){
      return pick(["Cosmic is the best ROI", "start with Bronze to test", "upgrading was my best move", "tiers really matter"]);
    } else if(targetMessageType === MessageType.TESTIMONIAL){
      return pick(["inspiring! 🙌", "keep mining!", "that's how it's done", "love to see this", "motivation right here"]);
    }
    return pick(["exactly!", "well said", "facts 💯", "this 👆", "couldn't agree more", "🔥🔥", "for real", "no cap"]);
  }

  async function sendPersonaMessageOriginal(persona, replyTo=null, forceNoMedia = false){
    if (!isGeneralChatActive()) return;
    if(persona.archetype === 'watcher' && Math.random() > 0.15) return;

    const isTestimonial = Math.random() < CONFIG.TESTIMONIAL_CHANCE && persona.messageBank[MessageType.TESTIMONIAL];
    let { text, type } = generateMessage(persona, isTestimonial ? MessageType.TESTIMONIAL : null);
    const now = new Date(); const timeStr = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});

    let mediaItem = null;
    const qualifiesForMedia = (type === MessageType.TESTIMONIAL || type === MessageType.RESULT || type === MessageType.FLEX || type === MessageType.HYPE);
    const isReplyToTestimonial = replyTo && replyTo.messageType === MessageType.TESTIMONIAL;

    if (!forceNoMedia && (qualifiesForMedia || isReplyToTestimonial)) {
      const preferredTypes = (type === MessageType.TESTIMONIAL || isReplyToTestimonial) ? ['images','videos','voices'] : ['images','videos'];
      mediaItem = pickMediaForPersona(persona.id, preferredTypes);
    }

    let typingType = mediaItem?.mediaType === 'audio' ? 'audio' : 'text';
    showTyping(persona, typingType);

    const msgData = {
      senderName: persona.name, senderAvatar: persona.avatar, text, time: timeStr,
      personaId: persona.id, messageType: type, experience: persona.type, archetype: persona.archetype
    };
    if (mediaItem) { msgData.mediaType = mediaItem.mediaType; msgData.mediaUrl = mediaItem.url; }

    const replyTarget = replyTo || getLastReplyTarget(persona.id);
    if(replyTarget) msgData.replyTo = replyTarget;

    setTimeout(() => {
      hideTyping();
      if(chatAPI.addIncomingMessage){
        const el = chatAPI.addIncomingMessage(msgData);
        if(el) {
          recentMessages.push({ id: persona.id+'_'+Date.now(), personaId: persona.id, senderName: persona.name, text: msgData.text, messageType: type, element: el });
          if(recentMessages.length>30) recentMessages.shift();
        }
      }
      lastPersonaId = persona.id;
      log(`${persona.name}: ${msgData.text} ${mediaItem ? '[media]' : ''}`);
    }, getTypingDelay(persona, text.length));
  }

  function forceReplyToLastAIMessage() {
    if(!simulationActive || !isGeneralChatActive() || Math.random() > CONFIG.REPLY_CHANCE) return;
    const lastAIMessage = [...recentMessages].reverse().find(m => m.personaId !== 'user');
    if(!lastAIMessage) return;
    const persona = pickDifferentPersona();
    if(!persona) return;

    const replyText = buildReplyText(lastAIMessage.text, lastAIMessage.messageType);
    const now = new Date(); const timeStr = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});

    let mediaItem = null;
    if (lastAIMessage.messageType === MessageType.TESTIMONIAL && Math.random() < CONFIG.REPLY_WITH_MEDIA_CHANCE) {
      mediaItem = pickMediaForPersona(persona.id, ['images']);
    }

    const msgData = {
      senderName: persona.name, senderAvatar: persona.avatar, text: replyText, time: timeStr, personaId: persona.id,
      replyTo: { senderName: lastAIMessage.senderName, text: lastAIMessage.text.substring(0, 50) }
    };
    if (mediaItem) { msgData.mediaType = mediaItem.mediaType; msgData.mediaUrl = mediaItem.url; }

    log(`🤖 ${persona.name} reply to ${lastAIMessage.senderName} ${mediaItem ? '[with image]' : ''}`);
    if(chatAPI.addIncomingMessage) chatAPI.addIncomingMessage(msgData);
    lastPersonaId = persona.id;
  }

  const sendPersonaMessage = function(persona, replyTo=null) {
    sendPersonaMessageOriginal(persona, replyTo);
    setTimeout(() => { forceReplyToLastAIMessage(); }, randomBetween(3000, 6000));
  };

  // Join notification (system message)
  function simulateJoin(){
    if (!isGeneralChatActive()) return;
    const p = pick(personas.filter(p => !p.isFallback || Math.random() > 0.5));
    if(!p) return;
    const joinText = pick(globalPhraseBank.join).replace('[country]', p.country);
    const now = new Date(); const timeStr = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
    if(chatAPI.addSystemMessage) chatAPI.addSystemMessage({ text: `🎉 ${p.name} ${joinText}`, time: timeStr });
    setTimeout(()=>{ if(!simulationActive) return; showTyping(p); setTimeout(()=>{ hideTyping(); if(chatAPI.addIncomingMessage) chatAPI.addIncomingMessage({ senderName:p.name, senderAvatar:p.avatar, text: pick(["thanks for the warm welcome!","excited to be mining here","hello everyone!"]), time: new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}), personaId:p.id }); },1500); },3000);
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

  function injectMiningResult(){
    if (!isGeneralChatActive()) return;
    const tier = pick(["Bronze","Silver","Gold","Platinum","Diamond","Master","Grandmaster","Elite","Legend","Mythic","Divine","Cosmic"]);
    const usdtAmount = pick(["22","44","66","88","110","132","154","176","198","220","242","264"]);
    if(Math.random() > 0.5){
      const p = pickDifferentPersona();
      if(p && !(p.archetype === 'watcher' && Math.random() > 0.2)){
        const text = pick([`just mined ${usdtAmount} USDT on ${tier} tier 🎯`,`${tier} payout: ${usdtAmount} USDT today`,`hash rate steady, +${usdtAmount} USDT`]);
        const now = new Date(); const timeStr = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
        if(chatAPI.addIncomingMessage) {
          const el = chatAPI.addIncomingMessage({ senderName: p.name, senderAvatar: p.avatar, text, time: timeStr, personaId: p.id, messageType: MessageType.RESULT });
          if (el) { recentMessages.push({ id: p.id+'_'+Date.now(), personaId: p.id, senderName: p.name, text, messageType: MessageType.RESULT, element: el }); if(recentMessages.length>30) recentMessages.shift(); }
        }
        lastPersonaId = p.id; lastMessageType = MessageType.RESULT;
        return;
      }
    }
    const text = `⛏️ Mining Update: ${Math.floor(Math.random() * 200 + 50)} USDT earned in the last hour across all rigs. 🚀`;
    const now = new Date(); const timeStr = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
    if(chatAPI.addSystemMessage) chatAPI.addSystemMessage({ text, time: timeStr });
  }

  function startSimulation(){ if(simulationActive) return; simulationActive=true; lastMessageType=null; lastPersonaId=null; log('🚀 Mining simulation started'); simulationTick(); }
  function stopSimulation(){ simulationActive=false; activeTimeouts.forEach(clearTimeout); activeTimeouts=[]; hideTyping(); log('🛑 Mining simulation stopped'); }
  function startMiningResultInjection(){ if(miningResultInterval) clearInterval(miningResultInterval); miningResultInterval = setInterval(()=>{ if(!simulationActive||!isGeneralChatActive()) return; if(Math.random()<CONFIG.MINING_RESULT_CHANCE) injectMiningResult(); }, CONFIG.MINING_RESULT_INTERVAL); }

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
    if (active && !simulationActive) { startSimulation(); startMiningResultInjection(); }
    else if (!active && simulationActive) { stopSimulation(); }
  }

  window.addEventListener('chat-room-changed', () => { syncSimulationState(); });
  setInterval(syncSimulationState, 1000);

  function initMedia() { buildMediaQueues(); }
  initMedia();
  syncSimulationState();

  window.AIPersonaSimulator = { isActive: ()=>simulationActive, getPersonas: ()=>personas, injectMiningResult: ()=>injectMiningResult() };
  window.onUserMessage = function(msg) {
    recentMessages.push({ id: 'user_'+Date.now(), personaId:'user', senderName:msg.senderName, text:msg.text, element:null });
    if(recentMessages.length > 30) recentMessages.shift();
  };

  log(`🤖 MINING AI Persona Engine v16 ready. Chat about USDT mining, hash rates, and daily profits.`);
})();
