// Card Database - all card definitions
var CARD_DATABASE = {
  strike: {
    id: 'strike',
    name: 'Strike',
    type: 'attack',
    cost: 1,
    art: '⚔️',
    description: 'Deal 6 damage.',
    effects: [{ type: 'damage', value: 6 }],
    rarity: 'starter',
    needsTarget: true
  },
  defend: {
    id: 'defend',
    name: 'Defend',
    type: 'skill',
    cost: 1,
    art: '🛡️',
    description: 'Gain 5 Block.',
    effects: [{ type: 'block', value: 5 }],
    rarity: 'starter',
    needsTarget: false
  },
  bash: {
    id: 'bash',
    name: 'Bash',
    type: 'attack',
    cost: 2,
    art: '🔨',
    description: 'Deal 8 damage. Apply 2 Vulnerable.',
    effects: [
      { type: 'damage', value: 8 },
      { type: 'applyStatus', status: 'vulnerable', value: 2 }
    ],
    rarity: 'starter',
    needsTarget: true
  },
  cleave: {
    id: 'cleave',
    name: 'Cleave',
    type: 'attack',
    cost: 1,
    art: '🪓',
    description: 'Deal 9 damage to ALL enemies.',
    effects: [{ type: 'damageAll', value: 9 }],
    rarity: 'common',
    needsTarget: false
  },
  pommel_strike: {
    id: 'pommel_strike',
    name: 'Pommel Strike',
    type: 'attack',
    cost: 1,
    art: '👊',
    description: 'Deal 9 damage. Draw 1 card.',
    effects: [
      { type: 'damage', value: 9 },
      { type: 'drawCards', value: 1 }
    ],
    rarity: 'common',
    needsTarget: true
  },
  shrug_it_off: {
    id: 'shrug_it_off',
    name: 'Shrug It Off',
    type: 'skill',
    cost: 1,
    art: '💪',
    description: 'Gain 8 Block. Draw 1 card.',
    effects: [
      { type: 'block', value: 8 },
      { type: 'drawCards', value: 1 }
    ],
    rarity: 'common',
    needsTarget: false
  },
  inflame: {
    id: 'inflame',
    name: 'Inflame',
    type: 'power',
    cost: 1,
    art: '🔥',
    description: 'Gain 2 Strength.',
    effects: [{ type: 'applyBuff', status: 'strength', value: 2 }],
    rarity: 'uncommon',
    needsTarget: false
  },
  uppercut: {
    id: 'uppercut',
    name: 'Uppercut',
    type: 'attack',
    cost: 2,
    art: '🥊',
    description: 'Deal 13 damage. Apply 1 Weak. Apply 1 Vulnerable.',
    effects: [
      { type: 'damage', value: 13 },
      { type: 'applyStatus', status: 'weak', value: 1 },
      { type: 'applyStatus', status: 'vulnerable', value: 1 }
    ],
    rarity: 'uncommon',
    needsTarget: true
  },
  bludgeon: {
    id: 'bludgeon',
    name: 'Bludgeon',
    type: 'attack',
    cost: 3,
    art: '💥',
    description: 'Deal 32 damage.',
    effects: [{ type: 'damage', value: 32 }],
    rarity: 'rare',
    needsTarget: true
  },

  // === Phase 2: 0-cost combo cards ===
  anger: {
    id: 'anger', name: 'Anger', type: 'attack', cost: 0, art: '😠',
    description: 'Deal 6 damage. Add a copy to discard.',
    effects: [{ type: 'damage', value: 6 }, { type: 'addCopy' }],
    rarity: 'common', needsTarget: true
  },
  flex: {
    id: 'flex', name: 'Flex', type: 'skill', cost: 0, art: '💪',
    description: 'Gain 2 Strength this turn only.',
    effects: [{ type: 'tempBuff', status: 'strength', value: 2 }],
    rarity: 'common', needsTarget: false
  },
  clash: {
    id: 'clash', name: 'Clash', type: 'attack', cost: 0, art: '⚡',
    description: 'Deal 14 damage. Only playable if hand is all Attacks.',
    effects: [{ type: 'damage', value: 14 }],
    rarity: 'common', needsTarget: true,
    playCondition: function(hand) { return hand.every(function(c) { return c.type === 'attack'; }); }
  },

  // === Phase 2: Exhaust cards ===
  offering: {
    id: 'offering', name: 'Offering', type: 'skill', cost: 0, art: '🩸',
    description: 'Lose 6 HP. Gain 2 Energy. Draw 3 cards. Exhaust.',
    effects: [{ type: 'losehp', value: 6 }, { type: 'gainEnergy', value: 2 }, { type: 'drawCards', value: 3 }],
    rarity: 'uncommon', needsTarget: false, exhaust: true
  },
  true_grit: {
    id: 'true_grit', name: 'True Grit', type: 'skill', cost: 1, art: '🪨',
    description: 'Gain 7 Block. Exhaust a random card from hand.',
    effects: [{ type: 'block', value: 7 }, { type: 'exhaustRandom' }],
    rarity: 'common', needsTarget: false
  },
  seeing_red: {
    id: 'seeing_red', name: 'Seeing Red', type: 'skill', cost: 1, art: '👁️',
    description: 'Gain 2 Energy. Exhaust.',
    effects: [{ type: 'gainEnergy', value: 2 }],
    rarity: 'uncommon', needsTarget: false, exhaust: true
  },

  // === Phase 2: Block cards ===
  body_slam: {
    id: 'body_slam', name: 'Body Slam', type: 'attack', cost: 1, art: '🏋️',
    description: 'Deal damage equal to your Block.',
    effects: [{ type: 'conditional_damage', condition: 'block', multiplier: 1 }],
    rarity: 'common', needsTarget: true
  },
  iron_wave: {
    id: 'iron_wave', name: 'Iron Wave', type: 'attack', cost: 1, art: '🌊',
    description: 'Gain 5 Block. Deal 5 damage.',
    effects: [{ type: 'block', value: 5 }, { type: 'damage', value: 5 }],
    rarity: 'common', needsTarget: true
  },
  entrench: {
    id: 'entrench', name: 'Entrench', type: 'skill', cost: 2, art: '🏰',
    description: 'Double your current Block.',
    effects: [{ type: 'doubleBlock' }],
    rarity: 'uncommon', needsTarget: false
  },

  // === Phase 2: Draw/pile cards ===
  battle_trance: {
    id: 'battle_trance', name: 'Battle Trance', type: 'skill', cost: 0, art: '🧘',
    description: 'Draw 3 cards. You cannot draw additional cards this turn.',
    effects: [{ type: 'drawCards', value: 3 }, { type: 'setFlag', flag: 'noDraw' }],
    rarity: 'uncommon', needsTarget: false
  },

  // === Phase 2: Damage scaling ===
  heavy_blade: {
    id: 'heavy_blade', name: 'Heavy Blade', type: 'attack', cost: 2, art: '🗡️',
    description: 'Deal 14 damage. Strength x3.',
    effects: [{ type: 'heavyDamage', value: 14, strengthMultiplier: 3 }],
    rarity: 'common', needsTarget: true
  },
  twin_strike: {
    id: 'twin_strike', name: 'Twin Strike', type: 'attack', cost: 1, art: '✂️',
    description: 'Deal 5 damage twice.',
    effects: [{ type: 'multiDamage', value: 5, hits: 2 }],
    rarity: 'common', needsTarget: true
  },
  whirlwind: {
    id: 'whirlwind', name: 'Whirlwind', type: 'attack', cost: 'X', art: '🌀',
    description: 'Deal 5 damage to ALL enemies X times.',
    effects: [{ type: 'damageAllX', value: 5 }],
    rarity: 'uncommon', needsTarget: false
  },

  // === Phase 2: Powers ===
  metallicize: {
    id: 'metallicize', name: 'Metallicize', type: 'power', cost: 1, art: '⚙️',
    description: 'At end of turn, gain 3 Block.',
    effects: [{ type: 'addPower', power: 'metallicize', value: 3 }],
    rarity: 'uncommon', needsTarget: false
  },
  demon_form: {
    id: 'demon_form', name: 'Demon Form', type: 'power', cost: 3, art: '😈',
    description: 'At start of turn, gain 2 Strength.',
    effects: [{ type: 'addPower', power: 'demon_form', value: 2 }],
    rarity: 'rare', needsTarget: false
  },
  barricade: {
    id: 'barricade', name: 'Barricade', type: 'power', cost: 3, art: '🏗️',
    description: 'Block no longer expires at start of turn.',
    effects: [{ type: 'addPower', power: 'barricade', value: 1 }],
    rarity: 'rare', needsTarget: false
  },

  // === Phase 3: New cards ===
  thunderclap: {
    id: 'thunderclap', name: 'Thunderclap', type: 'attack', cost: 1, art: '⚡',
    description: 'Deal 4 damage to ALL enemies. Apply 1 Vulnerable to ALL.',
    effects: [{ type: 'damageAll', value: 4 }, { type: 'applyStatusAll', status: 'vulnerable', value: 1 }],
    rarity: 'common', needsTarget: false
  },
  headbutt: {
    id: 'headbutt', name: 'Headbutt', type: 'attack', cost: 1, art: '🤕',
    description: 'Deal 9 damage. Put a card from discard on top of draw pile.',
    effects: [{ type: 'damage', value: 9 }, { type: 'headbutt' }],
    rarity: 'common', needsTarget: true
  },
  armaments: {
    id: 'armaments', name: 'Armaments', type: 'skill', cost: 1, art: '🔧',
    description: 'Gain 5 Block. Upgrade a random card in hand for this combat.',
    effects: [{ type: 'block', value: 5 }, { type: 'tempUpgrade' }],
    rarity: 'common', needsTarget: false
  },
  warcry: {
    id: 'warcry', name: 'Warcry', type: 'skill', cost: 0, art: '📣',
    description: 'Draw 2 cards. Put a card from hand on top of draw pile. Exhaust.',
    effects: [{ type: 'drawCards', value: 2 }, { type: 'putBack' }],
    rarity: 'common', needsTarget: false, exhaust: true
  },
  sentinel: {
    id: 'sentinel', name: 'Sentinel', type: 'skill', cost: 1, art: '🛡️',
    description: 'Gain 5 Block. If Exhausted, gain 2 Energy.',
    effects: [{ type: 'block', value: 5 }],
    rarity: 'common', needsTarget: false,
    onExhaust: { type: 'gainEnergy', value: 2 }
  },
  rampage: {
    id: 'rampage', name: 'Rampage', type: 'attack', cost: 1, art: '🔨',
    description: 'Deal 8 damage. Damage increases by 5 each play.',
    effects: [{ type: 'rampage', value: 8, increment: 5 }],
    rarity: 'uncommon', needsTarget: true
  },
  pummel: {
    id: 'pummel', name: 'Pummel', type: 'attack', cost: 1, art: '👊',
    description: 'Deal 2 damage 4 times.',
    effects: [{ type: 'multiDamage', value: 2, hits: 4 }],
    rarity: 'uncommon', needsTarget: true
  },
  disarm: {
    id: 'disarm', name: 'Disarm', type: 'skill', cost: 1, art: '🚫',
    description: 'Reduce enemy Strength by 2. Exhaust.',
    effects: [{ type: 'reduceStrength', value: 2 }],
    rarity: 'uncommon', needsTarget: true, exhaust: true
  },
  power_through: {
    id: 'power_through', name: 'Power Through', type: 'skill', cost: 1, art: '💪',
    description: 'Add 2 Wounds to hand. Gain 15 Block.',
    effects: [{ type: 'addWounds', value: 2 }, { type: 'block', value: 15 }],
    rarity: 'uncommon', needsTarget: false
  },
  shockwave: {
    id: 'shockwave', name: 'Shockwave', type: 'skill', cost: 2, art: '🌊',
    description: 'Apply 3 Weak and 3 Vulnerable to ALL enemies. Exhaust.',
    effects: [{ type: 'applyStatusAll', status: 'weak', value: 3 }, { type: 'applyStatusAll', status: 'vulnerable', value: 3 }],
    rarity: 'uncommon', needsTarget: false, exhaust: true
  },
  feel_no_pain: {
    id: 'feel_no_pain', name: 'Feel No Pain', type: 'power', cost: 1, art: '😤',
    description: 'Whenever a card is Exhausted, gain 3 Block.',
    effects: [{ type: 'addPower', power: 'feelNoPain', value: 3 }],
    rarity: 'uncommon', needsTarget: false
  },
  limit_break: {
    id: 'limit_break', name: 'Limit Break', type: 'skill', cost: 1, art: '💥',
    description: 'Double your Strength. Exhaust.',
    effects: [{ type: 'limitBreak' }],
    rarity: 'rare', needsTarget: false, exhaust: true
  },
  reaper: {
    id: 'reaper', name: 'Reaper', type: 'attack', cost: 2, art: '💀',
    description: 'Deal 4 damage to ALL enemies. Heal HP equal to unblocked damage dealt.',
    effects: [{ type: 'reaper', value: 4 }],
    rarity: 'rare', needsTarget: false
  },
  corruption: {
    id: 'corruption', name: 'Corruption', type: 'power', cost: 3, art: '🖤',
    description: 'Skills cost 0 but Exhaust when played.',
    effects: [{ type: 'addPower', power: 'corruption', value: 1 }],
    rarity: 'rare', needsTarget: false
  },
  impervious: {
    id: 'impervious', name: 'Impervious', type: 'skill', cost: 2, art: '🏰',
    description: 'Gain 30 Block. Exhaust.',
    effects: [{ type: 'block', value: 30 }],
    rarity: 'rare', needsTarget: false, exhaust: true
  },

  // === Status cards (added by enemies) ===
  dazed: {
    id: 'dazed', name: 'Dazed', type: 'status', cost: 0, art: '💫',
    description: 'Unplayable. Ethereal.',
    effects: [], rarity: 'status', needsTarget: false,
    playable: false, ethereal: true
  },
  wound: {
    id: 'wound', name: 'Wound', type: 'status', cost: 0, art: '🩹',
    description: 'Unplayable.',
    effects: [], rarity: 'status', needsTarget: false,
    playable: false
  },
  slimed: {
    id: 'slimed', name: 'Slimed', type: 'status', cost: 1, art: '🟢',
    description: 'Exhaust.',
    effects: [], rarity: 'status', needsTarget: false,
    exhaust: true
  },

  // === Curse cards ===
  regret: {
    id: 'regret', name: 'Regret', type: 'curse', cost: 0, art: '😰',
    description: 'Unplayable. End of turn: lose 1 HP per card in hand.',
    effects: [], rarity: 'curse', needsTarget: false,
    playable: false
  },
  parasite: {
    id: 'parasite', name: 'Parasite', type: 'curse', cost: 0, art: '🦠',
    description: 'Unplayable. If removed, heal 6 HP.',
    effects: [], rarity: 'curse', needsTarget: false,
    playable: false
  },
  doubt: {
    id: 'doubt', name: 'Doubt', type: 'curse', cost: 0, art: '😟',
    description: 'Unplayable. Start of turn: gain 1 Weak.',
    effects: [], rarity: 'curse', needsTarget: false,
    playable: false
  }
};

// Starter deck composition
var STARTER_DECK = [
  'strike', 'strike', 'strike', 'strike', 'strike',
  'defend', 'defend', 'defend', 'defend',
  'bash'
];

// Reward pool by rarity
var REWARD_POOL = {
  common: ['cleave', 'pommel_strike', 'shrug_it_off', 'anger', 'flex', 'clash', 'true_grit', 'body_slam', 'iron_wave', 'twin_strike', 'heavy_blade', 'thunderclap', 'headbutt', 'armaments', 'warcry', 'sentinel'],
  uncommon: ['inflame', 'uppercut', 'offering', 'seeing_red', 'entrench', 'battle_trance', 'whirlwind', 'metallicize', 'rampage', 'pummel', 'disarm', 'power_through', 'shockwave', 'feel_no_pain'],
  rare: ['bludgeon', 'demon_form', 'barricade', 'limit_break', 'reaper', 'corruption', 'impervious']
};

var _cardInstanceId = 0;

function createCardInstance(cardId) {
  var template = CARD_DATABASE[cardId];
  if (!template) return null;
  var instance = {};
  for (var key in template) {
    instance[key] = template[key];
  }
  instance.instanceId = cardId + '_' + (++_cardInstanceId);
  return instance;
}

function createStarterDeck() {
  return STARTER_DECK.map(function(cardId) {
    return createCardInstance(cardId);
  });
}

function getRandomRewardCards(count) {
  var cards = [];
  var act = (typeof gameState !== 'undefined' && gameState.act) ? gameState.act : 1;
  for (var i = 0; i < count; i++) {
    var roll = Math.random();
    var rarity;
    if (act >= 2) {
      // Act 2: favor uncommon and rare cards more
      if (roll < 0.35) rarity = 'common';
      else if (roll < 0.78) rarity = 'uncommon';
      else rarity = 'rare';
    } else {
      if (roll < 0.55) rarity = 'common';
      else if (roll < 0.88) rarity = 'uncommon';
      else rarity = 'rare';
    }

    var pool = REWARD_POOL[rarity];
    var cardId = pool[Math.floor(Math.random() * pool.length)];

    // Avoid duplicates in the reward selection
    var attempts = 0;
    while (cards.some(function(c) { return c.id === cardId; }) && attempts < 10) {
      roll = Math.random();
      if (act >= 2) {
        if (roll < 0.35) rarity = 'common';
        else if (roll < 0.78) rarity = 'uncommon';
        else rarity = 'rare';
      } else {
        if (roll < 0.55) rarity = 'common';
        else if (roll < 0.88) rarity = 'uncommon';
        else rarity = 'rare';
      }
      pool = REWARD_POOL[rarity];
      cardId = pool[Math.floor(Math.random() * pool.length)];
      attempts++;
    }

    cards.push(createCardInstance(cardId));
  }
  return cards;
}

function getEliteRewardCards(count) {
  var cards = [];
  for (var i = 0; i < count; i++) {
    var roll = Math.random();
    var rarity;
    // Elite rewards: better rarity weights (more uncommon/rare)
    if (roll < 0.25) rarity = 'common';
    else if (roll < 0.65) rarity = 'uncommon';
    else rarity = 'rare';

    var pool = REWARD_POOL[rarity];
    var cardId = pool[Math.floor(Math.random() * pool.length)];

    // Avoid duplicates in the reward selection
    var attempts = 0;
    while (cards.some(function(c) { return c.id === cardId; }) && attempts < 10) {
      roll = Math.random();
      if (roll < 0.25) rarity = 'common';
      else if (roll < 0.65) rarity = 'uncommon';
      else rarity = 'rare';
      pool = REWARD_POOL[rarity];
      cardId = pool[Math.floor(Math.random() * pool.length)];
      attempts++;
    }

    cards.push(createCardInstance(cardId));
  }
  return cards;
}
