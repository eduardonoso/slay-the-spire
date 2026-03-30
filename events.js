var EVENT_DATABASE = {
  big_fish: {
    name: 'Big Fish',
    description: 'A massive fish blocks your path.',
    art: '\uD83D\uDC1F',
    choices: [
      { text: 'Eat (Heal 5 HP)', effects: [{ type: 'heal', value: 5 }] },
      { text: 'Feed (Lose 5 HP, +1 Strength this run)', effects: [{ type: 'losehp', value: 5 }, { type: 'buff', status: 'strength', value: 1 }] },
      { text: 'Leave', effects: [] }
    ]
  },
  mushrooms: {
    name: 'Mushroom Field',
    description: 'Colorful mushrooms grow in a clearing.',
    art: '\uD83C\uDF44',
    choices: [
      { text: 'Eat (Heal 10 HP)', effects: [{ type: 'heal', value: 10 }] },
      { text: 'Stomp (+20 Gold)', effects: [{ type: 'gold', value: 20 }] },
      { text: 'Leave', effects: [] }
    ]
  },
  shrine: {
    name: 'Ancient Shrine',
    description: 'A glowing shrine hums with energy.',
    art: '\u26E9\uFE0F',
    choices: [
      { text: 'Pray (Gain random relic)', effects: [{ type: 'relic' }] },
      { text: 'Desecrate (+100 Gold, Lose 10 HP)', effects: [{ type: 'gold', value: 100 }, { type: 'losehp', value: 10 }] },
      { text: 'Leave', effects: [] }
    ]
  },
  merchant: {
    name: 'Wandering Merchant',
    description: 'A merchant offers you a deal.',
    art: '\uD83E\uDDF3',
    choices: [
      { text: 'Trade HP for Gold (Lose 10 HP, +50 Gold)', effects: [{ type: 'losehp', value: 10 }, { type: 'gold', value: 50 }] },
      { text: 'Buy Potion (Spend 30 Gold)', effects: [{ type: 'spendGold', value: 30 }, { type: 'potion' }] },
      { text: 'Leave', effects: [] }
    ]
  },
  campfire: {
    name: 'Abandoned Campfire',
    description: 'Warm embers still glow in an old campfire.',
    art: '\uD83D\uDD25',
    choices: [
      { text: 'Rest (Heal 15 HP)', effects: [{ type: 'heal', value: 15 }] },
      { text: 'Search (+30 Gold)', effects: [{ type: 'gold', value: 30 }] },
      { text: 'Leave', effects: [] }
    ]
  },
  fountain: {
    name: 'Crystal Fountain',
    description: 'Crystal clear water flows from an ornate fountain.',
    art: '\u26F2',
    choices: [
      { text: 'Drink (Heal to full HP)', effects: [{ type: 'healFull' }] },
      { text: 'Fill Flask (Gain Health Potion)', effects: [{ type: 'potion', potionId: 'health_potion' }] },
      { text: 'Leave', effects: [] }
    ]
  },
  forge: {
    name: 'Forgotten Forge',
    description: 'An ancient forge still radiates heat.',
    art: '\uD83D\uDD28',
    choices: [
      { text: 'Forge (+1 Max Energy, Lose 15 HP)', effects: [{ type: 'maxEnergy', value: 1 }, { type: 'losehp', value: 15 }] },
      { text: 'Scrap Metal (+40 Gold)', effects: [{ type: 'gold', value: 40 }] },
      { text: 'Leave', effects: [] }
    ]
  },
  portal: {
    name: 'Strange Portal',
    description: 'A shimmering portal pulses before you.',
    art: '\uD83C\uDF00',
    choices: [
      { text: 'Enter (+10 Max HP, random card added)', effects: [{ type: 'maxHp', value: 10 }, { type: 'randomCard' }] },
      { text: 'Avoid', effects: [] }
    ]
  }
};

var EVENT_POOL = Object.keys(EVENT_DATABASE);

function getRandomEvent() {
  var id = EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)];
  return EVENT_DATABASE[id];
}

function resolveEventChoice(effects) {
  for (var i = 0; i < effects.length; i++) {
    var eff = effects[i];
    switch (eff.type) {
      case 'heal':
        gameState.player.currentHp = Math.min(gameState.player.maxHp, gameState.player.currentHp + eff.value);
        log('Healed ' + eff.value + ' HP.');
        break;
      case 'healFull':
        gameState.player.currentHp = gameState.player.maxHp;
        log('Fully healed!');
        break;
      case 'losehp':
        gameState.player.currentHp = Math.max(1, gameState.player.currentHp - eff.value);
        break;
      case 'gold':
        gameState.player.gold = (gameState.player.gold || 0) + eff.value;
        log('Gained ' + eff.value + ' gold.');
        break;
      case 'spendGold':
        if ((gameState.player.gold || 0) < eff.value) {
          log('Not enough gold!');
          return;
        }
        gameState.player.gold -= eff.value;
        break;
      case 'buff':
        gameState.player.statusEffects[eff.status] = (gameState.player.statusEffects[eff.status] || 0) + eff.value;
        break;
      case 'relic':
        var relics = getRandomRelics(1);
        if (relics.length > 0) {
          gameState.player.relics.push(relics[0]);
          log('Gained ' + RELIC_DATABASE[relics[0]].name + '!');
        }
        break;
      case 'potion':
        var potionId = eff.potionId || POTION_POOL[Math.floor(Math.random() * POTION_POOL.length)];
        for (var j = 0; j < gameState.player.potions.length; j++) {
          if (gameState.player.potions[j] === null) {
            if (eff.potionId) {
              gameState.player.potions[j] = { id: eff.potionId, name: POTION_DATABASE[eff.potionId].name, art: POTION_DATABASE[eff.potionId].art, description: POTION_DATABASE[eff.potionId].description };
            } else {
              gameState.player.potions[j] = getRandomPotion();
            }
            log('Gained a potion!');
            break;
          }
        }
        break;
      case 'maxEnergy':
        gameState.player.maxEnergy += eff.value;
        break;
      case 'maxHp':
        gameState.player.maxHp += eff.value;
        gameState.player.currentHp += eff.value;
        break;
      case 'randomCard':
        var rewards = getRandomRewardCards(1);
        if (rewards.length > 0) {
          gameState.player.deck.push(rewards[0]);
          log('Added ' + rewards[0].name + ' to deck.');
        }
        break;
    }
  }
  // Check player death from event
  if (gameState.player.currentHp <= 0) {
    gameState.player.currentHp = 0;
    onPlayerDeath();
    return;
  }
  returnToMap();
}
