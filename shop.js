function generateShop() {
  var cards = [];
  // 3 common, 1 uncommon, 1 rare card for sale
  var commonPool = REWARD_POOL.common.slice();
  shuffleArray(commonPool);
  for (var i = 0; i < 3 && i < commonPool.length; i++) {
    cards.push({
      card: createCardInstance(commonPool[i]),
      price: 50 + Math.floor(Math.random() * 30)
    });
  }
  var uncommonPool = REWARD_POOL.uncommon.slice();
  shuffleArray(uncommonPool);
  if (uncommonPool.length > 0) {
    cards.push({
      card: createCardInstance(uncommonPool[0]),
      price: 75 + Math.floor(Math.random() * 45)
    });
  }
  var rarePool = REWARD_POOL.rare.slice();
  shuffleArray(rarePool);
  if (rarePool.length > 0) {
    cards.push({
      card: createCardInstance(rarePool[0]),
      price: 150 + Math.floor(Math.random() * 50)
    });
  }

  // 1 potion
  var potions = [];
  potions.push({
    potion: getRandomPotion(),
    price: 30 + Math.floor(Math.random() * 20)
  });

  // Card removal cost
  var removeCost = 75 + (gameState.player.cardRemovalsUsed || 0) * 25;

  return {
    cards: cards,
    potions: potions,
    removeCost: removeCost
  };
}

function buyCard(shopItem) {
  if (gameState.player.gold < shopItem.price) return false;
  gameState.player.gold -= shopItem.price;
  gameState.player.deck.push(shopItem.card);
  log('Bought ' + shopItem.card.name + '.');
  return true;
}

function buyPotion(shopItem) {
  if (gameState.player.gold < shopItem.price) return false;
  for (var i = 0; i < gameState.player.potions.length; i++) {
    if (gameState.player.potions[i] === null) {
      gameState.player.gold -= shopItem.price;
      gameState.player.potions[i] = shopItem.potion;
      log('Bought ' + shopItem.potion.name + '.');
      return true;
    }
  }
  return false; // No empty potion slot
}

function removeCard(cardIndex) {
  var removeCost = 75 + (gameState.player.cardRemovalsUsed || 0) * 25;
  if (gameState.player.gold < removeCost) return false;
  if (cardIndex < 0 || cardIndex >= gameState.player.deck.length) return false;
  var removed = gameState.player.deck.splice(cardIndex, 1)[0];
  gameState.player.gold -= removeCost;
  gameState.player.cardRemovalsUsed = (gameState.player.cardRemovalsUsed || 0) + 1;
  log('Removed ' + removed.name + ' from deck.');
  if (removed.id === 'parasite') {
    gameState.player.currentHp = Math.min(gameState.player.maxHp, gameState.player.currentHp + 6);
    log('Parasite removed! Healed 6 HP.');
  }
  return true;
}

// Card upgrade system
var UPGRADE_DATABASE = {
  strike: { name: 'Strike+', description: 'Deal 9 damage.', effects: [{ type: 'damage', value: 9 }] },
  defend: { name: 'Defend+', description: 'Gain 8 Block.', effects: [{ type: 'block', value: 8 }] },
  bash: { name: 'Bash+', description: 'Deal 10 damage. Apply 3 Vulnerable.', effects: [{ type: 'damage', value: 10 }, { type: 'applyStatus', status: 'vulnerable', value: 3 }] },
  inflame: { name: 'Inflame+', description: 'Gain 3 Strength.', effects: [{ type: 'applyBuff', status: 'strength', value: 3 }] },
  cleave: { name: 'Cleave+', description: 'Deal 11 damage to ALL.', effects: [{ type: 'damageAll', value: 11 }] },
  pommel_strike: { name: 'Pommel Strike+', description: 'Deal 10 damage. Draw 2.', effects: [{ type: 'damage', value: 10 }, { type: 'drawCards', value: 2 }] },
  shrug_it_off: { name: 'Shrug It Off+', description: 'Gain 11 Block. Draw 1.', effects: [{ type: 'block', value: 11 }, { type: 'drawCards', value: 1 }] },
  iron_wave: { name: 'Iron Wave+', description: 'Gain 7 Block. Deal 7 damage.', effects: [{ type: 'block', value: 7 }, { type: 'damage', value: 7 }] },
  twin_strike: { name: 'Twin Strike+', description: 'Deal 7 damage twice.', effects: [{ type: 'multiDamage', value: 7, hits: 2 }] },
  uppercut: { name: 'Uppercut+', description: 'Deal 16 damage. Apply 2 Weak. Apply 2 Vulnerable.', effects: [{ type: 'damage', value: 16 }, { type: 'applyStatus', status: 'weak', value: 2 }, { type: 'applyStatus', status: 'vulnerable', value: 2 }] },
  bludgeon: { name: 'Bludgeon+', description: 'Deal 42 damage.', effects: [{ type: 'damage', value: 42 }] },
  anger: { name: 'Anger+', description: 'Deal 8 damage. Add a copy to discard.', effects: [{ type: 'damage', value: 8 }, { type: 'addCopy' }] },
  body_slam: { name: 'Body Slam+', description: 'Deal damage equal to Block. Costs 0.', cost: 0, effects: [{ type: 'conditional_damage', condition: 'block', multiplier: 1 }] },
  heavy_blade: { name: 'Heavy Blade+', description: 'Deal 14 damage. Strength x5.', effects: [{ type: 'heavyDamage', value: 14, strengthMultiplier: 5 }] },
  offering: { name: 'Offering+', description: 'Lose 6 HP. Gain 2 Energy. Draw 5 cards. Exhaust.', effects: [{ type: 'losehp', value: 6 }, { type: 'gainEnergy', value: 2 }, { type: 'drawCards', value: 5 }] },
  battle_trance: { name: 'Battle Trance+', description: 'Draw 4 cards.', effects: [{ type: 'drawCards', value: 4 }] },
  whirlwind: { name: 'Whirlwind+', description: 'Deal 8 damage to ALL X times.', effects: [{ type: 'damageAllX', value: 8 }] },
  entrench: { name: 'Entrench+', description: 'Double your Block. Costs 1.', cost: 1, effects: [{ type: 'doubleBlock' }] },
  metallicize: { name: 'Metallicize+', description: 'At end of turn, gain 4 Block.', effects: [{ type: 'addPower', power: 'metallicize', value: 4 }] },
  demon_form: { name: 'Demon Form+', description: 'At start of turn, gain 3 Strength.', effects: [{ type: 'addPower', power: 'demon_form', value: 3 }] },
  barricade: { name: 'Barricade+', description: 'Block no longer expires. Costs 2.', cost: 2, effects: [{ type: 'addPower', power: 'barricade', value: 1 }] },
  true_grit: { name: 'True Grit+', description: 'Gain 9 Block. Exhaust a random card.', effects: [{ type: 'block', value: 9 }, { type: 'exhaustRandom' }] },
  seeing_red: { name: 'Seeing Red+', description: 'Gain 3 Energy. Exhaust.', effects: [{ type: 'gainEnergy', value: 3 }] },
  thunderclap: { name: 'Thunderclap+', description: 'Deal 7 damage to ALL. Apply 1 Vulnerable to ALL.', effects: [{ type: 'damageAll', value: 7 }, { type: 'applyStatusAll', status: 'vulnerable', value: 1 }] },
  headbutt: { name: 'Headbutt+', description: 'Deal 12 damage. Put a card from discard on top of draw pile.', effects: [{ type: 'damage', value: 12 }, { type: 'headbutt' }] },
  armaments: { name: 'Armaments+', description: 'Gain 5 Block. Upgrade ALL cards in hand for this combat.', effects: [{ type: 'block', value: 5 }, { type: 'tempUpgradeAll' }] },
  warcry: { name: 'Warcry+', description: 'Draw 3 cards. Put a card from hand on top of draw pile. Exhaust.', effects: [{ type: 'drawCards', value: 3 }, { type: 'putBack' }] },
  sentinel: { name: 'Sentinel+', description: 'Gain 8 Block. If Exhausted, gain 3 Energy.', effects: [{ type: 'block', value: 8 }], onExhaust: { type: 'gainEnergy', value: 3 } },
  rampage: { name: 'Rampage+', description: 'Deal 8 damage. Damage increases by 8 each play.', effects: [{ type: 'rampage', value: 8, increment: 8 }] },
  pummel: { name: 'Pummel+', description: 'Deal 2 damage 5 times.', effects: [{ type: 'multiDamage', value: 2, hits: 5 }] },
  disarm: { name: 'Disarm+', description: 'Reduce enemy Strength by 3. Exhaust.', effects: [{ type: 'reduceStrength', value: 3 }] },
  power_through: { name: 'Power Through+', description: 'Add 2 Wounds to hand. Gain 20 Block.', effects: [{ type: 'addWounds', value: 2 }, { type: 'block', value: 20 }] },
  shockwave: { name: 'Shockwave+', description: 'Apply 5 Weak and 5 Vulnerable to ALL. Exhaust.', effects: [{ type: 'applyStatusAll', status: 'weak', value: 5 }, { type: 'applyStatusAll', status: 'vulnerable', value: 5 }] },
  feel_no_pain: { name: 'Feel No Pain+', description: 'Whenever a card is Exhausted, gain 4 Block.', effects: [{ type: 'addPower', power: 'feelNoPain', value: 4 }] },
  limit_break: { name: 'Limit Break+', description: 'Double your Strength.', effects: [{ type: 'limitBreak' }], exhaust: false },
  reaper: { name: 'Reaper+', description: 'Deal 5 damage to ALL. Heal HP equal to unblocked damage.', effects: [{ type: 'reaper', value: 5 }] },
  corruption: { name: 'Corruption+', description: 'Skills cost 0 but Exhaust. Costs 2.', cost: 2, effects: [{ type: 'addPower', power: 'corruption', value: 1 }] },
  impervious: { name: 'Impervious+', description: 'Gain 40 Block. Exhaust.', effects: [{ type: 'block', value: 40 }] }
};

function upgradeCard(cardInstance) {
  var upgrade = UPGRADE_DATABASE[cardInstance.id];
  if (!upgrade) return false;
  if (cardInstance.upgraded) return false;
  cardInstance.upgraded = true;
  cardInstance.name = upgrade.name;
  cardInstance.description = upgrade.description;
  cardInstance.effects = upgrade.effects;
  if (upgrade.cost !== undefined) cardInstance.cost = upgrade.cost;
  if (upgrade.onExhaust !== undefined) cardInstance.onExhaust = upgrade.onExhaust;
  if (upgrade.exhaust !== undefined) cardInstance.exhaust = upgrade.exhaust;
  return true;
}

function canUpgrade(cardInstance) {
  return UPGRADE_DATABASE[cardInstance.id] && !cardInstance.upgraded;
}
