var POTION_DATABASE = {
  health_potion: {
    id: 'health_potion', name: 'Health Potion', art: '❤️',
    description: 'Heal 24 HP.', rarity: 'common',
    effects: [{ type: 'heal', value: 24 }], needsTarget: false
  },
  fire_potion: {
    id: 'fire_potion', name: 'Fire Potion', art: '🧪',
    description: 'Deal 20 damage.', rarity: 'common',
    effects: [{ type: 'damage', value: 20 }], needsTarget: true
  },
  block_potion: {
    id: 'block_potion', name: 'Block Potion', art: '🛡️',
    description: 'Gain 12 Block.', rarity: 'common',
    effects: [{ type: 'block', value: 12 }], needsTarget: false
  },
  strength_potion: {
    id: 'strength_potion', name: 'Strength Potion', art: '💪',
    description: 'Gain 2 Strength.', rarity: 'uncommon',
    effects: [{ type: 'applyBuff', status: 'strength', value: 2 }], needsTarget: false
  },
  weak_potion: {
    id: 'weak_potion', name: 'Weak Potion', art: '☠️',
    description: 'Apply 3 Weak.', rarity: 'common',
    effects: [{ type: 'applyStatus', status: 'weak', value: 3 }], needsTarget: true
  },
  energy_potion: {
    id: 'energy_potion', name: 'Energy Potion', art: '⚡',
    description: 'Gain 2 Energy.', rarity: 'uncommon',
    effects: [{ type: 'gainEnergy', value: 2 }], needsTarget: false
  },
  dexterity_potion: {
    id: 'dexterity_potion', name: 'Dexterity Potion', art: '🎯',
    description: 'Gain 2 Dexterity.', rarity: 'uncommon',
    effects: [{ type: 'applyBuff', status: 'dexterity', value: 2 }], needsTarget: false
  },
  explosive_potion: {
    id: 'explosive_potion', name: 'Explosive Potion', art: '💣',
    description: 'Deal 10 damage to ALL enemies.', rarity: 'common',
    effects: [{ type: 'damageAll', value: 10 }], needsTarget: false
  },
  regen_potion: {
    id: 'regen_potion', name: 'Regen Potion', art: '🌱',
    description: 'Gain 5 Regen.', rarity: 'uncommon',
    effects: [{ type: 'applyBuff', status: 'regen', value: 5 }], needsTarget: false
  }
};

var POTION_POOL = ['health_potion', 'fire_potion', 'block_potion', 'strength_potion', 'weak_potion', 'energy_potion', 'dexterity_potion', 'explosive_potion', 'regen_potion'];

function getRandomPotion() {
  var id = POTION_POOL[Math.floor(Math.random() * POTION_POOL.length)];
  return { id: id, name: POTION_DATABASE[id].name, art: POTION_DATABASE[id].art, description: POTION_DATABASE[id].description };
}
