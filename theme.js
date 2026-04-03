// Dynamic Theme System — swap currentTheme to change all game text
var THEMES = {
  scifi: {
    // Gameplay keywords
    strength: 'Amplify',
    block: 'Firewall',
    damage: 'Damage',
    vulnerable: 'Compromised',
    weak: 'Malfunctioning',
    frail: 'Corrupted',
    dexterity: 'Reflex',
    exhaust: 'Purge',
    exhausted: 'Purged',
    draw: 'Upload',
    discard: 'Cache',
    heal: 'Repair',
    hp: 'Hull',
    gold: 'Credits',
    turn: 'Cycle',
    energy: 'Energy',
    ethereal: 'Volatile',
    regen: 'Nano-Repair',
    enrage: 'Overclock',
    hand: 'Hand',
    deck: 'Deck',

    // UI labels
    endTurn: 'END CYCLE',
    drawPile: 'Upload',
    discardPile: 'Cache',
    exhaustPile: 'Purge',
    viewDeck: 'View Deck',
    floorMap: 'Sector Map',
    settings: 'Settings',

    // Status tooltips
    strengthTip: 'Amplify: Deals additional attack damage',
    vulnerableTip: 'Compromised: Takes 50% more attack damage',
    weakTip: 'Malfunctioning: Deals 25% less attack damage',
    frailTip: 'Corrupted: Firewall from cards reduced by 25%',
    dexterityTip: 'Reflex: Additional Firewall from cards',
    regenTip: 'Nano-Repair: Repair N Hull at start of cycle',
    enrageTip: 'Overclock: Gains Amplify when player plays skills',

    // Status icons
    strengthIcon: '⚡',
    vulnerableIcon: '🎯',
    weakIcon: '⬇️',
    frailIcon: '🥶',
    dexterityIcon: '🎯',
    regenIcon: '🌱',
    enrageIcon: '😡',

    // Combat text
    enemiesAppear: ' appear!',
    enemyAppears: ' appears!',
    yourTurn: 'Your Cycle',
    enemyTurn: 'Enemy Cycle',
    victory: 'MISSION COMPLETE',
    defeat: 'SYSTEM FAILURE',
    actCleared: 'Sector Cleared!',

    // Shop
    shopTitle: 'Supply Depot',
    removeCard: 'Delete Program',
    rest: 'Crew Quarters',
    restHeal: 'Recharge',
    restUpgrade: 'Tinker',
  },

  fantasy: {
    // Gameplay keywords
    strength: 'Strength',
    block: 'Block',
    damage: 'Damage',
    vulnerable: 'Vulnerable',
    weak: 'Weak',
    frail: 'Frail',
    dexterity: 'Dexterity',
    exhaust: 'Exhaust',
    exhausted: 'Exhausted',
    draw: 'Draw',
    discard: 'Discard',
    heal: 'Heal',
    hp: 'HP',
    gold: 'Gold',
    turn: 'Turn',
    energy: 'Energy',
    ethereal: 'Ethereal',
    regen: 'Regen',
    enrage: 'Enrage',
    hand: 'Hand',
    deck: 'Deck',

    // UI labels
    endTurn: 'END TURN',
    drawPile: 'Draw',
    discardPile: 'Discard',
    exhaustPile: 'Exhaust',
    viewDeck: 'View Deck',
    floorMap: 'Floor Map',
    settings: 'Settings',

    // Status tooltips
    strengthTip: 'Strength: Deals additional attack damage',
    vulnerableTip: 'Vulnerable: Takes 50% more attack damage',
    weakTip: 'Weak: Deals 25% less attack damage',
    frailTip: 'Frail: Block from cards reduced by 25%',
    dexterityTip: 'Dexterity: Additional Block from cards',
    regenTip: 'Regen: Heal N HP at start of turn',
    enrageTip: 'Enrage: Gains Strength when player plays skills',

    // Status icons
    strengthIcon: '💪',
    vulnerableIcon: '🎯',
    weakIcon: '⬇️',
    frailIcon: '🥶',
    dexterityIcon: '🎯',
    regenIcon: '🌱',
    enrageIcon: '😡',

    // Combat text
    enemiesAppear: ' appear!',
    enemyAppears: ' appears!',
    yourTurn: 'Your Turn',
    enemyTurn: 'Enemy Turn',
    victory: 'VICTORY',
    defeat: 'DEFEAT',
    actCleared: 'Act Cleared!',

    // Shop
    shopTitle: 'Shop',
    removeCard: 'Remove Card',
    rest: 'Rest Site',
    restHeal: 'Rest',
    restUpgrade: 'Smith',
  }
};

var currentTheme = 'scifi';

// Theme lookup — returns themed text for a keyword
function T(key) {
  return (THEMES[currentTheme] && THEMES[currentTheme][key]) || (THEMES.fantasy && THEMES.fantasy[key]) || key;
}

// Template resolver — replaces {keyword} placeholders in text with themed values
function Td(text) {
  if (!text) return text;
  return text.replace(/\{(\w+)\}/g, function(match, key) {
    return T(key);
  });
}
