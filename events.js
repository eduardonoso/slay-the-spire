var EVENT_DATABASE = {
  big_fish: {
    name: 'Space Whale',
    description: 'A massive space whale drifts into your path, its bioluminescent skin pulsing.',
    art: '🐋',
    choices: [
      { text: 'Harvest Nutrients ({heal} 5 {hp})', effects: [{ type: 'heal', value: 5 }] },
      { text: 'Attempt Contact (Lose 5 {hp}, +1 {strength} this run)', effects: [{ type: 'losehp', value: 5 }, { type: 'buff', status: 'strength', value: 1 }] },
      { text: 'Fly Around', effects: [] }
    ]
  },
  mushrooms: {
    name: 'Fungal Cavern',
    description: 'Bioluminescent fungus grows in a maintenance shaft.',
    art: '🍄',
    choices: [
      { text: 'Consume Spores ({heal} 10 {hp})', effects: [{ type: 'heal', value: 10 }] },
      { text: 'Harvest for Sale (+20 {gold})', effects: [{ type: 'gold', value: 20 }] },
      { text: 'Seal Hatch', effects: [] }
    ]
  },
  shrine: {
    name: 'Ancient Terminal',
    description: 'A glowing terminal hums with alien code.',
    art: '🖥️',
    choices: [
      { text: 'Access Database (Gain random relic)', effects: [{ type: 'relic' }] },
      { text: 'Override Security (+100 {gold}, Lose 10 {hp})', effects: [{ type: 'gold', value: 100 }, { type: 'losehp', value: 10 }] },
      { text: 'Walk Away', effects: [] }
    ]
  },
  merchant: {
    name: 'Smuggler',
    description: 'A shady smuggler offers you a deal from behind a cargo crate.',
    art: '🧳',
    choices: [
      { text: 'Sell Blood Sample (Lose 10 {hp}, +50 {gold})', effects: [{ type: 'losehp', value: 10 }, { type: 'gold', value: 50 }] },
      { text: 'Buy Stim (Spend 30 {gold})', effects: [{ type: 'spendGold', value: 30 }, { type: 'potion' }] },
      { text: 'Decline', effects: [] }
    ]
  },
  campfire: {
    name: 'Emergency Bivouac',
    description: 'A makeshift camp with still-warm rations in an abandoned corridor.',
    art: '🔥',
    choices: [
      { text: 'Eat Rations ({heal} 15 {hp})', effects: [{ type: 'heal', value: 15 }] },
      { text: 'Scavenge Supplies (+30 {gold})', effects: [{ type: 'gold', value: 30 }] },
      { text: 'Move On', effects: [] }
    ]
  },
  fountain: {
    name: 'Coolant Fountain',
    description: 'Purified coolant flows from a recycler unit. It looks drinkable.',
    art: '⛲',
    choices: [
      { text: 'Drink Coolant ({heal} to full {hp})', effects: [{ type: 'healFull' }] },
      { text: 'Fill Canister (Gain Med Kit)', effects: [{ type: 'potion', potionId: 'health_potion' }] },
      { text: 'Pass By', effects: [] }
    ]
  },
  forge: {
    name: 'Engineering Bay',
    description: 'An old engineering bay with functioning fabrication tools.',
    art: '🔧',
    choices: [
      { text: 'Upgrade Reactor (+1 Max {energy}, Lose 15 {hp})', effects: [{ type: 'maxEnergy', value: 1 }, { type: 'losehp', value: 15 }] },
      { text: 'Salvage Parts (+40 {gold})', effects: [{ type: 'gold', value: 40 }] },
      { text: 'Leave Bay', effects: [] }
    ]
  },
  portal: {
    name: 'Wormhole',
    description: 'A shimmering wormhole pulses before your viewport.',
    art: '🌀',
    choices: [
      { text: 'Fly Through (+10 Max {hp}, random card added)', effects: [{ type: 'maxHp', value: 10 }, { type: 'randomCard' }] },
      { text: 'Plot Around', effects: [] }
    ]
  },
  golden_idol: {
    name: 'Alien Artifact',
    description: 'A glittering alien artifact sits on a pedestal, humming with unknown energy.',
    art: '🏆',
    choices: [
      { text: 'Take It (+250 {gold}, gain Curse)', effects: [{ type: 'gold', value: 250 }, { type: 'addCurse', curseId: 'regret' }] },
      { text: 'Leave It', effects: [] }
    ]
  },
  the_cleric: {
    name: 'Med Bay Officer',
    description: 'A medical officer offers services for credits.',
    art: '👨‍⚕️',
    choices: [
      { text: 'Full Treatment (Spend 35 {gold}, {heal} to full)', effects: [{ type: 'spendGold', value: 35 }, { type: 'healFull' }] },
      { text: 'Purge Malware (Spend 50 {gold}, remove a curse)', effects: [{ type: 'spendGold', value: 50 }, { type: 'removeCurse' }] },
      { text: 'Decline', effects: [] }
    ]
  },
  living_wall: {
    name: 'Sealed Bulkhead',
    description: 'A massive bulkhead blocks the corridor. It speaks through the intercom.',
    art: '🚪',
    choices: [
      { text: 'Jettison Module (Remove a card)', effects: [{ type: 'eventRemoveCard' }] },
      { text: 'Reconfigure (Transform a random card)', effects: [{ type: 'transformCard' }] },
      { text: 'Upgrade System (Upgrade a random card)', effects: [{ type: 'upgradeRandomCard' }] }
    ]
  },
  dead_adventurer: {
    name: 'Dead Crewmember',
    description: 'You find the remains of a fallen crewmember. Their kit looks intact.',
    art: '💀',
    choices: [
      { text: 'Search Body (50/50: loot or fight)', effects: [{ type: 'deadAdventurerSearch' }] },
      { text: 'Move On', effects: [] }
    ]
  },
  the_library: {
    name: 'Data Archive',
    description: 'Towering server racks line the walls. The air hums with data.',
    art: '💾',
    choices: [
      { text: 'Download Data (Choose a card to add)', effects: [{ type: 'libraryRead' }] },
      { text: 'Recharge ({heal} 20% Max {hp})', effects: [{ type: 'healPercent', value: 20 }] }
    ]
  },
  wheel_of_change: {
    name: 'Slot Machine',
    description: 'A mysterious slot machine covered in blinking lights stands in the rec room.',
    art: '🎰',
    choices: [
      { text: 'Pull the Lever (Random outcome)', effects: [{ type: 'spinWheel' }] },
      { text: 'Walk Away', effects: [] }
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
        log(T('heal') + 'ed ' + eff.value + ' ' + T('hp') + '.');
        break;
      case 'healFull':
        gameState.player.currentHp = gameState.player.maxHp;
        log('Fully ' + T('heal') + 'ed!');
        break;
      case 'losehp':
        gameState.player.currentHp = Math.max(1, gameState.player.currentHp - eff.value);
        break;
      case 'gold':
        gameState.player.gold = (gameState.player.gold || 0) + eff.value;
        log('Gained ' + eff.value + ' ' + T('gold') + '.');
        break;
      case 'spendGold':
        if ((gameState.player.gold || 0) < eff.value) {
          log('Not enough ' + T('gold') + '!');
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
          log('Added ' + rewards[0].name + ' to ' + T('deck') + '.');
        }
        break;
      case 'addCurse':
        var curseCard = createCardInstance(eff.curseId);
        if (curseCard) {
          gameState.player.deck.push(curseCard);
          log('A curse has been added to your ' + T('deck') + '!');
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
          log('Removed ' + removed.name + ' from your ' + T('deck') + '!');
        } else {
          log('No curses or statuses found in your ' + T('deck') + '.');
        }
        break;
      case 'healPercent':
        var percentHeal = Math.floor(gameState.player.maxHp * eff.value / 100);
        gameState.player.currentHp = Math.min(gameState.player.maxHp, gameState.player.currentHp + percentHeal);
        log(T('heal') + 'ed ' + percentHeal + ' ' + T('hp') + '.');
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
          log('Gained 30 ' + T('gold') + '.');
        } else {
          // Unlucky: fight 2 cultists
          log('The body was a trap! Rogue Androids ambush you!');
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
          log('The wheel lands on ' + T('gold') + '! Gained 100 ' + T('gold') + '!');
        } else if (spin < 0.5) {
          gameState.player.currentHp = Math.max(1, gameState.player.currentHp - 10);
          log('The wheel lands on pain! Lost 10 ' + T('hp') + '!');
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
        log('Removed ' + removed.name + ' from your ' + T('deck') + '.');
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
        log('Added ' + c.name + ' to ' + T('deck') + '.');
        hideOverlays();
        returnToMap();
      });
    })(card);

    cardsContainer.appendChild(el);
  }
}
