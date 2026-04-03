// Card Database - all card definitions
var CARD_DATABASE = {
  strike: {
    id: 'strike',
    name: 'Laser Blast',
    type: 'attack',
    cost: 1,
    art: 'assets/cards/laser-blast.png',
    description: 'Deal 6 damage.',
    effects: [{ type: 'damage', value: 6 }],
    rarity: 'starter',
    needsTarget: true
  },
  defend: {
    id: 'defend',
    name: 'Energy Shield',
    type: 'skill',
    cost: 1,
    art: 'assets/cards/energy-shield.png',
    description: 'Gain 5 {block}.',
    effects: [{ type: 'block', value: 5 }],
    rarity: 'starter',
    needsTarget: false
  },
  bash: {
    id: 'bash',
    name: 'Stun Grenade',
    type: 'attack',
    cost: 2,
    art: 'assets/cards/stun-grenade.png',
    description: 'Deal 8 damage. Apply 2 {vulnerable}.',
    effects: [
      { type: 'damage', value: 8 },
      { type: 'applyStatus', status: 'vulnerable', value: 2 }
    ],
    rarity: 'starter',
    needsTarget: true
  },
  cleave: {
    id: 'cleave',
    name: 'Plasma Sweep',
    type: 'attack',
    cost: 1,
    art: 'assets/cards/plasma-sweep.png',
    description: 'Deal 9 damage to ALL enemies.',
    effects: [{ type: 'damageAll', value: 9 }],
    rarity: 'common',
    needsTarget: false
  },
  pommel_strike: {
    id: 'pommel_strike',
    name: 'Pistol Whip',
    type: 'attack',
    cost: 1,
    art: 'assets/cards/pistol-whip.png',
    description: 'Deal 9 damage. {draw} 1 card.',
    effects: [
      { type: 'damage', value: 9 },
      { type: 'drawCards', value: 1 }
    ],
    rarity: 'common',
    needsTarget: true
  },
  shrug_it_off: {
    id: 'shrug_it_off',
    name: 'Deflector Boost',
    type: 'skill',
    cost: 1,
    art: 'assets/cards/deflector-boost.png',
    description: 'Gain 8 {block}. {draw} 1 card.',
    effects: [
      { type: 'block', value: 8 },
      { type: 'drawCards', value: 1 }
    ],
    rarity: 'common',
    needsTarget: false
  },
  inflame: {
    id: 'inflame',
    name: 'Overclock',
    type: 'power',
    cost: 1,
    art: 'assets/cards/overclock.png',
    description: 'Gain 2 {strength}.',
    effects: [{ type: 'applyBuff', status: 'strength', value: 2 }],
    rarity: 'uncommon',
    needsTarget: false
  },
  uppercut: {
    id: 'uppercut',
    name: 'Concussion Shot',
    type: 'attack',
    cost: 2,
    art: 'assets/cards/concussion-shot.png',
    description: 'Deal 13 damage. Apply 1 {weak}. Apply 1 {vulnerable}.',
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
    name: 'Orbital Strike',
    type: 'attack',
    cost: 3,
    art: 'assets/cards/orbital-strike.png',
    description: 'Deal 32 damage.',
    effects: [{ type: 'damage', value: 32 }],
    rarity: 'rare',
    needsTarget: true
  },

  // === Phase 2: 0-cost combo cards ===
  anger: {
    id: 'anger', name: 'Overcharge', type: 'attack', cost: 0, art: 'assets/cards/overcharge.png',
    description: 'Deal 6 damage. Add a copy to discard.',
    effects: [{ type: 'damage', value: 6 }, { type: 'addCopy' }],
    rarity: 'common', needsTarget: true
  },
  flex: {
    id: 'flex', name: 'Adrenaline Boost', type: 'skill', cost: 0, art: 'assets/cards/adrenaline-boost.png',
    description: 'Gain 2 {strength} this {turn} only.',
    effects: [{ type: 'tempBuff', status: 'strength', value: 2 }],
    rarity: 'common', needsTarget: false
  },
  clash: {
    id: 'clash', name: 'Full Burst', type: 'attack', cost: 0, art: 'assets/cards/full-burst.png',
    description: 'Deal 14 damage. Only playable if hand is all Attacks.',
    effects: [{ type: 'damage', value: 14 }],
    rarity: 'common', needsTarget: true,
    playCondition: function(hand) { return hand.every(function(c) { return c.type === 'attack'; }); }
  },

  // === Phase 2: Exhaust cards ===
  offering: {
    id: 'offering', name: 'Emergency Protocol', type: 'skill', cost: 0, art: 'assets/cards/emergency-protocol.png',
    description: 'Lose 6 {hp}. Gain 2 Energy. {draw} 3 cards. {exhaust}.',
    effects: [{ type: 'losehp', value: 6 }, { type: 'gainEnergy', value: 2 }, { type: 'drawCards', value: 3 }],
    rarity: 'uncommon', needsTarget: false, exhaust: true
  },
  true_grit: {
    id: 'true_grit', name: 'Jettison', type: 'skill', cost: 1, art: 'assets/cards/jettison.png',
    description: 'Gain 7 {block}. {exhaust} a random card from hand.',
    effects: [{ type: 'block', value: 7 }, { type: 'exhaustRandom' }],
    rarity: 'common', needsTarget: false
  },
  seeing_red: {
    id: 'seeing_red', name: 'Reactor Surge', type: 'skill', cost: 1, art: 'assets/cards/reactor-surge.png',
    description: 'Gain 2 Energy. {exhaust}.',
    effects: [{ type: 'gainEnergy', value: 2 }],
    rarity: 'uncommon', needsTarget: false, exhaust: true
  },

  // === Phase 2: Block cards ===
  body_slam: {
    id: 'body_slam', name: 'Jetpack Ram', type: 'attack', cost: 1, art: 'assets/cards/jetpack-ram.png',
    description: 'Deal damage equal to your {block}.',
    effects: [{ type: 'conditional_damage', condition: 'block', multiplier: 1 }],
    rarity: 'common', needsTarget: true
  },
  iron_wave: {
    id: 'iron_wave', name: 'Shield Bash', type: 'attack', cost: 1, art: 'assets/cards/shield-bash.png',
    description: 'Gain 5 {block}. Deal 5 damage.',
    effects: [{ type: 'block', value: 5 }, { type: 'damage', value: 5 }],
    rarity: 'common', needsTarget: true
  },
  entrench: {
    id: 'entrench', name: 'Reinforce Hull', type: 'skill', cost: 2, art: 'assets/cards/reinforce-hull.png',
    description: 'Double your current {block}.',
    effects: [{ type: 'doubleBlock' }],
    rarity: 'uncommon', needsTarget: false
  },

  // === Phase 2: Draw/pile cards ===
  battle_trance: {
    id: 'battle_trance', name: 'Combat Focus', type: 'skill', cost: 0, art: 'assets/cards/combat-focus.png',
    description: '{draw} 3 cards. You cannot {draw} additional cards this {turn}.',
    effects: [{ type: 'drawCards', value: 3 }, { type: 'setFlag', flag: 'noDraw' }],
    rarity: 'uncommon', needsTarget: false
  },

  // === Phase 2: Damage scaling ===
  heavy_blade: {
    id: 'heavy_blade', name: 'Power Drill', type: 'attack', cost: 2, art: 'assets/cards/power-drill.png',
    description: 'Deal 14 damage. {strength} x3.',
    effects: [{ type: 'heavyDamage', value: 14, strengthMultiplier: 3 }],
    rarity: 'common', needsTarget: true
  },
  twin_strike: {
    id: 'twin_strike', name: 'Double Tap', type: 'attack', cost: 1, art: 'assets/cards/double-tap.png',
    description: 'Deal 5 damage twice.',
    effects: [{ type: 'multiDamage', value: 5, hits: 2 }],
    rarity: 'common', needsTarget: true
  },
  whirlwind: {
    id: 'whirlwind', name: 'Ion Storm', type: 'attack', cost: 'X', art: 'assets/cards/ion-storm.png',
    description: 'Deal 5 damage to ALL enemies X times.',
    effects: [{ type: 'damageAllX', value: 5 }],
    rarity: 'uncommon', needsTarget: false
  },

  // === Phase 2: Powers ===
  metallicize: {
    id: 'metallicize', name: 'Auto-Repair', type: 'power', cost: 1, art: 'assets/cards/auto-repair.png',
    description: 'At end of {turn}, gain 3 {block}.',
    effects: [{ type: 'addPower', power: 'metallicize', value: 3 }],
    rarity: 'uncommon', needsTarget: false
  },
  demon_form: {
    id: 'demon_form', name: 'Rage Protocol', type: 'power', cost: 3, art: 'assets/cards/rage-protocol.png',
    description: 'At start of {turn}, gain 2 {strength}.',
    effects: [{ type: 'addPower', power: 'demon_form', value: 2 }],
    rarity: 'rare', needsTarget: false
  },
  barricade: {
    id: 'barricade', name: 'Fortress Mode', type: 'power', cost: 3, art: 'assets/cards/fortress-mode.png',
    description: '{block} no longer expires at start of {turn}.',
    effects: [{ type: 'addPower', power: 'barricade', value: 1 }],
    rarity: 'rare', needsTarget: false
  },

  // === Phase 3: New cards ===
  thunderclap: {
    id: 'thunderclap', name: 'EMP Blast', type: 'attack', cost: 1, art: 'assets/cards/emp-blast.png',
    description: 'Deal 4 damage to ALL enemies. Apply 1 {vulnerable} to ALL.',
    effects: [{ type: 'damageAll', value: 4 }, { type: 'applyStatusAll', status: 'vulnerable', value: 1 }],
    rarity: 'common', needsTarget: false
  },
  headbutt: {
    id: 'headbutt', name: 'Helmet Charge', type: 'attack', cost: 1, art: 'assets/cards/helmet-charge.png',
    description: 'Deal 9 damage. Put a card from discard on top of {draw} pile.',
    effects: [{ type: 'damage', value: 9 }, { type: 'headbutt' }],
    rarity: 'common', needsTarget: true
  },
  armaments: {
    id: 'armaments', name: 'Field Repair', type: 'skill', cost: 1, art: 'assets/cards/field-repair.png',
    description: 'Gain 5 {block}. Upgrade a random card in hand for this combat.',
    effects: [{ type: 'block', value: 5 }, { type: 'tempUpgrade' }],
    rarity: 'common', needsTarget: false
  },
  warcry: {
    id: 'warcry', name: 'Battle Comm', type: 'skill', cost: 0, art: 'assets/cards/battle-comm.png',
    description: '{draw} 2 cards. Put a card from hand on top of {draw} pile. {exhaust}.',
    effects: [{ type: 'drawCards', value: 2 }, { type: 'putBack' }],
    rarity: 'common', needsTarget: false, exhaust: true
  },
  sentinel: {
    id: 'sentinel', name: 'Bulkhead', type: 'skill', cost: 1, art: 'assets/cards/bulkhead.png',
    description: 'Gain 5 {block}. If {exhausted}, gain 2 Energy.',
    effects: [{ type: 'block', value: 5 }],
    rarity: 'common', needsTarget: false,
    onExhaust: { type: 'gainEnergy', value: 2 }
  },
  rampage: {
    id: 'rampage', name: 'Escalation Protocol', type: 'attack', cost: 1, art: 'assets/cards/escalation-protocol.png',
    description: 'Deal 8 damage. Damage increases by 5 each play.',
    effects: [{ type: 'rampage', value: 8, increment: 5 }],
    rarity: 'uncommon', needsTarget: true
  },
  pummel: {
    id: 'pummel', name: 'Rapid Fire', type: 'attack', cost: 1, art: 'assets/cards/rapid-fire.png',
    description: 'Deal 2 damage 4 times.',
    effects: [{ type: 'multiDamage', value: 2, hits: 4 }],
    rarity: 'uncommon', needsTarget: true
  },
  disarm: {
    id: 'disarm', name: 'Disable Targeting', type: 'skill', cost: 1, art: 'assets/cards/disable-targeting.png',
    description: 'Reduce enemy {strength} by 2. {exhaust}.',
    effects: [{ type: 'reduceStrength', value: 2 }],
    rarity: 'uncommon', needsTarget: true, exhaust: true
  },
  power_through: {
    id: 'power_through', name: 'Brace for Impact', type: 'skill', cost: 1, art: 'assets/cards/brace-for-impact.png',
    description: 'Add 2 Wounds to hand. Gain 15 {block}.',
    effects: [{ type: 'addWounds', value: 2 }, { type: 'block', value: 15 }],
    rarity: 'uncommon', needsTarget: false
  },
  shockwave: {
    id: 'shockwave', name: 'Disruption Wave', type: 'skill', cost: 2, art: 'assets/cards/disruption-wave.png',
    description: 'Apply 3 {weak} and 3 {vulnerable} to ALL enemies. {exhaust}.',
    effects: [{ type: 'applyStatusAll', status: 'weak', value: 3 }, { type: 'applyStatusAll', status: 'vulnerable', value: 3 }],
    rarity: 'uncommon', needsTarget: false, exhaust: true
  },
  feel_no_pain: {
    id: 'feel_no_pain', name: 'Feedback Loop', type: 'power', cost: 1, art: 'assets/cards/feedback-loop.png',
    description: 'Whenever a card is {exhausted}, gain 3 {block}.',
    effects: [{ type: 'addPower', power: 'feelNoPain', value: 3 }],
    rarity: 'uncommon', needsTarget: false
  },
  limit_break: {
    id: 'limit_break', name: 'System Override', type: 'skill', cost: 1, art: 'assets/cards/system-override.png',
    description: 'Double your {strength}. {exhaust}.',
    effects: [{ type: 'limitBreak' }],
    rarity: 'rare', needsTarget: false, exhaust: true
  },
  reaper: {
    id: 'reaper', name: 'Nano Leech', type: 'attack', cost: 2, art: 'assets/cards/nano-leech.png',
    description: 'Deal 4 damage to ALL enemies. {heal} {hp} equal to unblocked damage dealt.',
    effects: [{ type: 'reaper', value: 4 }],
    rarity: 'rare', needsTarget: false
  },
  corruption: {
    id: 'corruption', name: 'Malware', type: 'power', cost: 3, art: 'assets/cards/malware.png',
    description: 'Skills cost 0 but {exhaust} when played.',
    effects: [{ type: 'addPower', power: 'corruption', value: 1 }],
    rarity: 'rare', needsTarget: false
  },
  impervious: {
    id: 'impervious', name: 'Titanium Shell', type: 'skill', cost: 2, art: 'assets/cards/titanium-shell.png',
    description: 'Gain 30 {block}. {exhaust}.',
    effects: [{ type: 'block', value: 30 }],
    rarity: 'rare', needsTarget: false, exhaust: true
  },

  // === Status cards (added by enemies) ===
  dazed: {
    id: 'dazed', name: 'Scrambled', type: 'status', cost: 0, art: 'assets/cards/scrambled.png',
    description: 'Unplayable. {ethereal}.',
    effects: [], rarity: 'status', needsTarget: false,
    playable: false, ethereal: true
  },
  wound: {
    id: 'wound', name: 'Hull Breach', type: 'status', cost: 0, art: 'assets/cards/hull-breach.png',
    description: 'Unplayable.',
    effects: [], rarity: 'status', needsTarget: false,
    playable: false
  },
  slimed: {
    id: 'slimed', name: 'Corroded', type: 'status', cost: 1, art: 'assets/cards/corroded.png',
    description: '{exhaust}.',
    effects: [], rarity: 'status', needsTarget: false,
    exhaust: true
  },

  // === Curse cards ===
  regret: {
    id: 'regret', name: 'System Error', type: 'curse', cost: 0, art: 'assets/cards/system-error.png',
    description: 'Unplayable. End of {turn}: lose 1 {hp} per card in hand.',
    effects: [], rarity: 'curse', needsTarget: false,
    playable: false
  },
  parasite: {
    id: 'parasite', name: 'Malware Worm', type: 'curse', cost: 0, art: 'assets/cards/malware-worm.png',
    description: 'Unplayable. If removed, {heal} 6 {hp}.',
    effects: [], rarity: 'curse', needsTarget: false,
    playable: false
  },
  doubt: {
    id: 'doubt', name: 'Glitch', type: 'curse', cost: 0, art: 'assets/cards/glitch.png',
    description: 'Unplayable. Start of {turn}: gain 1 {weak}.',
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
    if (act >= 3) {
      // Act 3: heavily favor uncommon and rare cards
      if (roll < 0.20) rarity = 'common';
      else if (roll < 0.65) rarity = 'uncommon';
      else rarity = 'rare';
    } else if (act >= 2) {
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
      if (act >= 3) {
        if (roll < 0.20) rarity = 'common';
        else if (roll < 0.65) rarity = 'uncommon';
        else rarity = 'rare';
      } else if (act >= 2) {
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
