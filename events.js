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
  },
  golden_idol: {
    name: 'Golden Idol',
    description: 'A glittering golden idol sits on a pedestal, beckoning you closer.',
    art: '\uD83C\uDFC6',
    choices: [
      { text: 'Take it (+250 Gold, gain Curse)', effects: [{ type: 'gold', value: 250 }, { type: 'addCurse', curseId: 'regret' }] },
      { text: 'Leave it', effects: [] }
    ]
  },
  the_cleric: {
    name: 'The Cleric',
    description: 'A robed figure offers spiritual services for a modest fee.',
    art: '\u26EA',
    choices: [
      { text: 'Heal (Spend 35 Gold, heal to full)', effects: [{ type: 'spendGold', value: 35 }, { type: 'healFull' }] },
      { text: 'Purify (Spend 50 Gold, remove a curse)', effects: [{ type: 'spendGold', value: 50 }, { type: 'removeCurse' }] },
      { text: 'Leave', effects: [] }
    ]
  },
  living_wall: {
    name: 'Living Wall',
    description: 'A massive wall of stone and vine blocks the path. It speaks to you.',
    art: '\uD83E\uDDF1',
    choices: [
      { text: 'Forget (Remove a card)', effects: [{ type: 'eventRemoveCard' }] },
      { text: 'Change (Transform a random card)', effects: [{ type: 'transformCard' }] },
      { text: 'Grow (Upgrade a random card)', effects: [{ type: 'upgradeRandomCard' }] }
    ]
  },
  dead_adventurer: {
    name: 'Dead Adventurer',
    description: 'You find the remains of a fallen adventurer. Their pack looks intact.',
    art: '\uD83D\uDC80',
    choices: [
      { text: 'Search the body (50/50: loot or fight)', effects: [{ type: 'deadAdventurerSearch' }] },
      { text: 'Leave', effects: [] }
    ]
  },
  the_library: {
    name: 'The Library',
    description: 'Towering bookshelves line the walls. The air smells of old parchment.',
    art: '\uD83D\uDCDA',
    choices: [
      { text: 'Read (Choose a card to add)', effects: [{ type: 'libraryRead' }] },
      { text: 'Sleep (Heal 20% Max HP)', effects: [{ type: 'healPercent', value: 20 }] }
    ]
  },
  wheel_of_change: {
    name: 'Wheel of Change',
    description: 'A mysterious wheel covered in arcane symbols stands before you.',
    art: '\uD83C\uDFA1',
    choices: [
      { text: 'Spin the wheel (Random outcome)', effects: [{ type: 'spinWheel' }] },
      { text: 'Walk away', effects: [] }
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
      case 'addCurse':
        var curseCard = createCardInstance(eff.curseId);
        if (curseCard) {
          gameState.player.deck.push(curseCard);
          log('A curse has been added to your deck!');
        }
        break;
      case 'removeCurse':
        var curseIdx = -1;
        for (var ci = 0; ci < gameState.player.deck.length; ci++) {
          if (gameState.player.deck[ci].type === 'curse' || gameState.player.deck[ci].type === 'status') {
            curseIdx = ci;
            break;
          }
        }
        if (curseIdx >= 0) {
          var removed = gameState.player.deck.splice(curseIdx, 1)[0];
          log('Removed ' + removed.name + ' from your deck!');
        } else {
          log('No curses or statuses found in your deck.');
        }
        break;
      case 'healPercent':
        var percentHeal = Math.floor(gameState.player.maxHp * eff.value / 100);
        gameState.player.currentHp = Math.min(gameState.player.maxHp, gameState.player.currentHp + percentHeal);
        log('Healed ' + percentHeal + ' HP.');
        break;
      case 'eventRemoveCard':
        // Opens the remove card screen for events
        showEventRemoveScreen();
        return; // Don't call returnToMap, the screen callback handles it
      case 'transformCard':
        if (gameState.player.deck.length > 0) {
          var tIdx = Math.floor(Math.random() * gameState.player.deck.length);
          var oldCard = gameState.player.deck.splice(tIdx, 1)[0];
          var newCards = getRandomRewardCards(1);
          if (newCards.length > 0) {
            gameState.player.deck.push(newCards[0]);
            log('Transformed ' + oldCard.name + ' into ' + newCards[0].name + '!');
          }
        }
        break;
      case 'upgradeRandomCard':
        var upgradeable = [];
        for (var ui = 0; ui < gameState.player.deck.length; ui++) {
          if (!gameState.player.deck[ui].upgraded && gameState.player.deck[ui].type !== 'curse') {
            upgradeable.push(ui);
          }
        }
        if (upgradeable.length > 0) {
          var uIdx = upgradeable[Math.floor(Math.random() * upgradeable.length)];
          upgradeCard(gameState.player.deck[uIdx]);
          log('Upgraded ' + gameState.player.deck[uIdx].name + '!');
        } else {
          log('No cards to upgrade.');
        }
        break;
      case 'deadAdventurerSearch':
        if (Math.random() < 0.5) {
          // Lucky: get relic + gold
          var advRelics = getRandomRelics(1);
          if (advRelics.length > 0) {
            gameState.player.relics.push(advRelics[0]);
            log('Found ' + RELIC_DATABASE[advRelics[0]].name + '!');
          }
          gameState.player.gold = (gameState.player.gold || 0) + 30;
          log('Gained 30 gold.');
        } else {
          // Unlucky: fight 2 cultists
          log('The body was a trap! Cultists ambush you!');
          initCombat(['cultist', 'cultist']);
          return; // Don't call returnToMap, combat handles it
        }
        break;
      case 'libraryRead':
        // Show a card choice screen (3 cards, pick 1)
        showLibraryCardChoice();
        return; // Don't call returnToMap, the screen callback handles it
      case 'spinWheel':
        var spin = Math.random();
        if (spin < 0.25) {
          gameState.player.gold = (gameState.player.gold || 0) + 100;
          log('The wheel lands on gold! Gained 100 gold!');
        } else if (spin < 0.5) {
          gameState.player.currentHp = Math.max(1, gameState.player.currentHp - 10);
          log('The wheel lands on pain! Lost 10 HP!');
        } else if (spin < 0.75) {
          var wheelRelics = getRandomRelics(1);
          if (wheelRelics.length > 0) {
            gameState.player.relics.push(wheelRelics[0]);
            log('The wheel lands on treasure! Gained ' + RELIC_DATABASE[wheelRelics[0]].name + '!');
          }
        } else {
          var wheelCards = getRandomRewardCards(1);
          if (wheelCards.length > 0) {
            gameState.player.deck.push(wheelCards[0]);
            log('The wheel lands on knowledge! Gained ' + wheelCards[0].name + '!');
          }
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

// === EVENT-SPECIFIC SCREENS ===

function showEventRemoveScreen() {
  hideOverlays();
  var screen = document.getElementById('remove-screen');
  screen.classList.remove('hidden');

  var subtitle = screen.querySelector('.overlay-subtitle');
  if (subtitle) subtitle.textContent = 'Click a card to remove it from your deck:';

  var container = document.getElementById('remove-cards');
  container.innerHTML = '';

  for (var i = 0; i < gameState.player.deck.length; i++) {
    var card = gameState.player.deck[i];
    var el = document.createElement('div');
    el.className = 'card type-' + card.type + ' reward-card' +
      (card.upgraded ? ' upgraded' : '');
    el.innerHTML = '<div class="card-cost">' + card.cost + '</div>' +
      '<div class="card-name">' + card.name + '</div>' +
      '<div class="card-type-label">' + card.type + '</div>' +
      '<div class="card-art">' + card.art + '</div>' +
      '<div class="card-description">' + card.description + '</div>';

    (function(idx) {
      el.addEventListener('click', function() {
        var removed = gameState.player.deck.splice(idx, 1)[0];
        log('Removed ' + removed.name + ' from your deck.');
        hideOverlays();
        returnToMap();
      });
    })(i);

    container.appendChild(el);
  }
}

function showLibraryCardChoice() {
  hideOverlays();
  var screen = document.getElementById('reward-screen');
  screen.classList.remove('hidden');

  var cardsContainer = document.getElementById('reward-cards');
  cardsContainer.innerHTML = '';

  var rewards = getRandomRewardCards(3);
  for (var i = 0; i < rewards.length; i++) {
    var card = rewards[i];
    var el = document.createElement('div');
    el.className = 'card type-' + card.type + ' reward-card' +
      (card.upgraded ? ' upgraded' : '');

    var cost = document.createElement('div');
    cost.className = 'card-cost';
    cost.textContent = card.cost;
    el.appendChild(cost);

    var name = document.createElement('div');
    name.className = 'card-name';
    name.textContent = card.name;
    el.appendChild(name);

    var typeLabel = document.createElement('div');
    typeLabel.className = 'card-type-label';
    typeLabel.textContent = card.type;
    el.appendChild(typeLabel);

    var art = document.createElement('div');
    art.className = 'card-art';
    art.textContent = card.art;
    el.appendChild(art);

    var desc = document.createElement('div');
    desc.className = 'card-description';
    desc.textContent = card.description;
    el.appendChild(desc);

    (function(c) {
      el.addEventListener('click', function() {
        gameState.player.deck.push(c);
        log('Added ' + c.name + ' to deck.');
        hideOverlays();
        returnToMap();
      });
    })(card);

    cardsContainer.appendChild(el);
  }
}
