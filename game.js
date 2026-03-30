// Game State
var gameState = {
  phase: 'idle', // playerTurn, enemyTurn, reward, gameOver, victory, map, rest, shop, event
  player: {
    maxHp: 80,
    currentHp: 80,
    energy: 3,
    maxEnergy: 3,
    block: 0,
    statusEffects: {},
    drawPile: [],
    hand: [],
    discardPile: [],
    exhaustPile: [],
    deck: [], // master deck list
    potions: [null, null, null],
    powers: {},
    relics: [],
    relicCounters: {},
    gold: 0,
    cardRemovalsUsed: 0
  },
  enemies: [],
  turn: 0,
  handSize: 5,
  encounterIndex: 0,
  combatLog: [],
  selectedCard: null, // instanceId of selected card for targeting
  selectedPotion: null,
  map: null,
  isEliteFight: false,
  isBossFight: false,
  stats: {
    turnsPlayed: 0,
    cardsPlayed: 0,
    damageDealt: 0,
    damageTaken: 0,
    goldEarned: 0,
    floorsCleared: 0,
    enemiesKilled: 0
  }
};

// Fisher-Yates shuffle
function shuffleArray(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

function log(msg) {
  gameState.combatLog.push(msg);
  if (gameState.combatLog.length > 15) {
    gameState.combatLog.shift();
  }
}

// === COMBAT INIT ===
function initCombat(enemyIds) {
  // Accept string or array
  if (typeof enemyIds === 'string') enemyIds = [enemyIds];
  gameState.enemies = enemyIds.map(function(id) { return createEnemyInstance(id); });
  gameState.turn = 0;
  gameState.selectedCard = null;
  gameState.combatLog = [];

  // Put full deck into draw pile and shuffle
  gameState.player.drawPile = gameState.player.deck.map(function(card) {
    return createCardInstance(card.id);
  });
  shuffleArray(gameState.player.drawPile);
  gameState.player.hand = [];
  gameState.player.discardPile = [];
  gameState.player.exhaustPile = [];
  gameState.player.block = 0;
  gameState.player.statusEffects = {};
  gameState.player.powers = {};

  gameState.player._redSkullActive = false;
  gameState.player.penNibActive = false;

  triggerRelics('onCombatStart');

  if (gameState.enemies.length === 1) {
    log('A ' + gameState.enemies[0].name + ' appears!');
  } else {
    log(gameState.enemies.length + ' enemies appear!');
  }
  startPlayerTurn();
}

function startGame() {
  gameState.player.currentHp = gameState.player.maxHp;
  gameState.player.deck = createStarterDeck();
  gameState.player.gold = 0;
  gameState.player.relics = [];
  gameState.player.potions = [null, null, null];
  gameState.player.cardRemovalsUsed = 0;
  gameState.player.powers = {};
  gameState.map = generateMap();
  gameState.encounterIndex = 0;
  gameState.isEliteFight = false;
  gameState.isBossFight = false;
  gameState.stats = { turnsPlayed: 0, cardsPlayed: 0, damageDealt: 0, damageTaken: 0, goldEarned: 0, floorsCleared: 0, enemiesKilled: 0 };
  gameState.phase = 'map';
  hideOverlays();
  renderCombat();
  showMapScreen();
}

// === TURN MANAGEMENT ===
function startPlayerTurn() {
  gameState.turn++;
  gameState.stats.turnsPlayed++;
  gameState.phase = 'playerTurn';
  if (typeof showTurnBanner === 'function') showTurnBanner('Your Turn', 'player-turn');
  gameState.player.energy = gameState.player.maxEnergy;
  if (!gameState.player.powers.barricade) {
    gameState.player.block = 0;
  }
  gameState.selectedCard = null;

  // Tick down player status effects
  tickStatusEffects(gameState.player);

  // Trigger relic effects
  triggerRelics('onTurnStart');
  if (gameState.turn === 1) {
    triggerRelics('onFirstTurn');
  }

  // Trigger start-of-turn powers
  if (gameState.player.powers.demon_form) {
    gameState.player.statusEffects.strength = (gameState.player.statusEffects.strength || 0) + gameState.player.powers.demon_form;
    showFloatingOnPlayer('+' + gameState.player.powers.demon_form + ' Str', 'buff');
  }

  // Determine enemy intents
  for (var i = 0; i < gameState.enemies.length; i++) {
    var enemy = gameState.enemies[i];
    if (!enemy.dead) {
      enemy.currentIntent = enemy.getNextIntent(enemy, gameState.turn - 1);
    }
  }

  // Draw cards
  drawCards(gameState.handSize);

  // Curse triggers (after drawing)
  for (var ci = 0; ci < gameState.player.hand.length; ci++) {
    if (gameState.player.hand[ci].id === 'doubt') {
      gameState.player.statusEffects.weak = (gameState.player.statusEffects.weak || 0) + 1;
      log('Doubt inflicts Weak!');
    }
  }

  renderCombat();
}

function endPlayerTurn() {
  if (gameState.phase !== 'playerTurn') return;
  gameState.phase = 'enemyTurn';
  gameState.selectedCard = null;

  // Curse: Regret
  for (var ci2 = 0; ci2 < gameState.player.hand.length; ci2++) {
    if (gameState.player.hand[ci2].id === 'regret') {
      var regretDmg = gameState.player.hand.length;
      gameState.player.currentHp = Math.max(0, gameState.player.currentHp - regretDmg);
      log('Regret deals ' + regretDmg + ' damage!');
      if (gameState.player.currentHp <= 0) { onPlayerDeath(); return; }
    }
  }

  // Exhaust ethereal cards from hand
  var nonEthereal = [];
  for (var i = 0; i < gameState.player.hand.length; i++) {
    var c = gameState.player.hand[i];
    if (c.ethereal) {
      gameState.player.exhaustPile.push(c);
    } else {
      nonEthereal.push(c);
    }
  }
  gameState.player.hand = nonEthereal;

  // Discard remaining hand
  while (gameState.player.hand.length > 0) {
    gameState.player.discardPile.push(gameState.player.hand.pop());
  }

  // Remove temp buffs
  var player = gameState.player;
  for (var status in player.statusEffects) {
    if (status.indexOf('temp_') === 0) {
      var realStatus = status.substring(5);
      player.statusEffects[realStatus] = (player.statusEffects[realStatus] || 0) - player.statusEffects[status];
      if (player.statusEffects[realStatus] <= 0) delete player.statusEffects[realStatus];
      delete player.statusEffects[status];
    }
  }

  // Trigger end-of-turn relics
  triggerRelics('onEndTurn');

  // Trigger end-of-turn powers
  if (gameState.player.powers.metallicize) {
    gameState.player.block += gameState.player.powers.metallicize;
    showFloatingOnPlayer('+' + gameState.player.powers.metallicize, 'block');
  }

  renderCombat();
  executeEnemyTurns();
}

function usePotion(slotIndex, targetIndex) {
  if (gameState.phase !== 'playerTurn') return;
  var potion = gameState.player.potions[slotIndex];
  if (!potion) return;

  var potionData = POTION_DATABASE[potion.id];
  if (!potionData) return;

  // Check if needs target
  if (potionData.needsTarget && (targetIndex === undefined || targetIndex === null)) {
    // Enter potion targeting mode
    gameState.selectedPotion = slotIndex;
    gameState.selectedCard = null;
    renderCombat();
    return;
  }

  var target = null;
  if (potionData.needsTarget) {
    target = gameState.enemies[targetIndex];
    if (!target || target.dead) return;
  }

  // Resolve potion effects
  for (var i = 0; i < potionData.effects.length; i++) {
    resolveEffect(potionData.effects[i], gameState.player, target, null, 0);
  }

  // Remove potion
  gameState.player.potions[slotIndex] = null;
  gameState.selectedPotion = null;
  log('Used ' + potionData.name + '.');
  renderCombat();
}

// === CARD DRAWING ===
function drawCards(count) {
  for (var i = 0; i < count; i++) {
    if (gameState.player.drawPile.length === 0) {
      if (gameState.player.discardPile.length === 0) break;
      // Reshuffle discard into draw
      gameState.player.drawPile = gameState.player.discardPile.slice();
      gameState.player.discardPile = [];
      shuffleArray(gameState.player.drawPile);
      log('Deck reshuffled.');
    }
    if (gameState.player.drawPile.length > 0) {
      gameState.player.hand.push(gameState.player.drawPile.pop());
    }
  }
}

// === CARD PLAYING ===
function playCard(instanceId, targetIndex) {
  if (gameState.phase !== 'playerTurn') return;

  var cardIndex = -1;
  for (var i = 0; i < gameState.player.hand.length; i++) {
    if (gameState.player.hand[i].instanceId === instanceId) {
      cardIndex = i;
      break;
    }
  }
  if (cardIndex === -1) return;

  var card = gameState.player.hand[cardIndex];
  if (card.playable === false) return;
  if (card.playCondition && !card.playCondition(gameState.player.hand)) return;
  if (card.cost !== 'X' && gameState.player.energy < card.cost) return;

  var energySpent = card.cost;
  if (card.cost === 'X') { energySpent = gameState.player.energy; }

  var target = null;
  if (card.needsTarget) {
    if (targetIndex === undefined || targetIndex === null) return;
    target = gameState.enemies[targetIndex];
    if (!target || target.dead) return;
  }

  // Deduct energy
  gameState.player.energy -= energySpent;

  // Remove from hand
  gameState.player.hand.splice(cardIndex, 1);

  // Resolve effects
  for (var e = 0; e < card.effects.length; e++) {
    resolveEffect(card.effects[e], gameState.player, target, card, energySpent);
  }

  // Move to discard or exhaust
  if (card.exhaust) {
    gameState.player.exhaustPile.push(card);
  } else {
    gameState.player.discardPile.push(card);
  }

  // Trigger relic effects for attacks
  if (card.type === 'attack') {
    triggerRelics('onAttackPlayed');
  }

  // Trigger relic effects for skills
  if (card.type === 'skill') {
    triggerRelics('onSkillPlayed');
  }

  // Nob enrage: enemies with enrage status gain strength when player plays a skill
  if (card.type === 'skill') {
    for (var ne = 0; ne < gameState.enemies.length; ne++) {
      var enrageEnemy = gameState.enemies[ne];
      if (!enrageEnemy.dead && enrageEnemy.statusEffects.enrage) {
        enrageEnemy.statusEffects.strength = (enrageEnemy.statusEffects.strength || 0) + enrageEnemy.statusEffects.enrage;
        log(enrageEnemy.name + ' gains ' + enrageEnemy.statusEffects.enrage + ' Strength!');
      }
    }
  }

  gameState.selectedCard = null;
  log('Played ' + card.name + '.');
  gameState.stats.cardsPlayed++;
  if (typeof AudioManager !== 'undefined' && AudioManager.enabled) AudioManager.playCardSound();

  // Check for victory
  if (checkAllEnemiesDead()) {
    onCombatVictory();
    return;
  }

  renderCombat();
}

// === EFFECT RESOLUTION ===
function resolveEffect(effect, source, target, card, energySpent) {
  switch (effect.type) {
    case 'damage':
      if (target) {
        var dmg = calculateDamage(effect.value, source, target);
        var result = applyDamage(dmg, target);
        showDamageOnEnemy(target, result.hpLoss);
        if (result.hpLoss >= 10) {
          triggerScreenShake();
        }
      }
      break;

    case 'damageAll':
      for (var i = 0; i < gameState.enemies.length; i++) {
        var e = gameState.enemies[i];
        if (!e.dead) {
          var dmg2 = calculateDamage(effect.value, source, e);
          var result2 = applyDamage(dmg2, e);
          showDamageOnEnemy(e, result2.hpLoss);
        }
      }
      if (effect.value >= 10) triggerScreenShake();
      break;

    case 'block':
      var blockAmount = effect.value + (source.statusEffects.dexterity || 0);
      blockAmount = Math.max(0, blockAmount);
      source.block += blockAmount;
      if (source === gameState.player) {
        showFloatingOnPlayer('+' + blockAmount, 'block');
      }
      if (typeof AudioManager !== 'undefined' && AudioManager.enabled) AudioManager.playBlockSound();
      break;

    case 'applyStatus':
      if (target) {
        target.statusEffects[effect.status] = (target.statusEffects[effect.status] || 0) + effect.value;
      }
      break;

    case 'applyBuff':
      source.statusEffects[effect.status] = (source.statusEffects[effect.status] || 0) + effect.value;
      break;

    case 'drawCards':
      drawCards(effect.value);
      break;

    case 'gainEnergy':
      gameState.player.energy += effect.value;
      break;

    case 'heal':
      var healAmt = effect.value;
      gameState.player.currentHp = Math.min(gameState.player.maxHp, gameState.player.currentHp + healAmt);
      showFloatingOnPlayer('+' + healAmt, 'heal');
      if (typeof AudioManager !== 'undefined' && AudioManager.enabled) AudioManager.playHealSound();
      break;

    case 'losehp':
      gameState.player.currentHp -= effect.value;
      if (gameState.player.currentHp <= 0) gameState.player.currentHp = 0;
      showFloatingOnPlayer('-' + effect.value, 'damage');
      break;

    case 'conditional_damage':
      if (target) {
        var condValue = 0;
        if (effect.condition === 'block') condValue = source.block;
        var condDmg = calculateDamage(condValue * (effect.multiplier || 1), source, target);
        var condResult = applyDamage(condDmg, target);
        showDamageOnEnemy(target, condResult.hpLoss);
        if (condResult.hpLoss >= 10) triggerScreenShake();
      }
      break;

    case 'damageAllX':
      // For Whirlwind-type: deal damage X times to all enemies
      var times = energySpent || 0;
      for (var t = 0; t < times; t++) {
        for (var j = 0; j < gameState.enemies.length; j++) {
          var en = gameState.enemies[j];
          if (!en.dead) {
            var xDmg = calculateDamage(effect.value, source, en);
            var xRes = applyDamage(xDmg, en);
            showDamageOnEnemy(en, xRes.hpLoss);
          }
        }
      }
      if (times > 0) triggerScreenShake();
      break;

    case 'multiDamage':
      // For Twin Strike: deal damage multiple times
      if (target) {
        for (var h = 0; h < (effect.hits || 1); h++) {
          var mDmg = calculateDamage(effect.value, source, target);
          var mRes = applyDamage(mDmg, target);
          showDamageOnEnemy(target, mRes.hpLoss);
        }
        if (effect.value * (effect.hits || 1) >= 10) triggerScreenShake();
      }
      break;

    case 'heavyDamage':
      // Strength applies multiplied
      if (target) {
        var hBase = effect.value;
        var hStr = (source.statusEffects.strength || 0) * (effect.strengthMultiplier || 1);
        var hTotal = hBase + hStr;
        if (source.statusEffects.weak > 0) hTotal = Math.floor(hTotal * 0.75);
        if (target.statusEffects.vulnerable > 0) hTotal = Math.floor(hTotal * 1.5);
        hTotal = Math.max(0, hTotal);
        var hRes = applyDamage(hTotal, target);
        showDamageOnEnemy(target, hRes.hpLoss);
        if (hRes.hpLoss >= 10) triggerScreenShake();
      }
      break;

    case 'doubleBlock':
      source.block *= 2;
      showFloatingOnPlayer('+' + source.block, 'block');
      break;

    case 'exhaustRandom':
      // Exhaust a random non-status card from hand
      var hand = gameState.player.hand;
      if (hand.length > 0) {
        var ri = Math.floor(Math.random() * hand.length);
        var removed = hand.splice(ri, 1)[0];
        gameState.player.exhaustPile.push(removed);
        log('Exhausted ' + removed.name + '.');
      }
      break;

    case 'addCopy':
      // Add a copy of this card to discard pile
      if (card) {
        var copy = createCardInstance(card.id);
        gameState.player.discardPile.push(copy);
      }
      break;

    case 'tempBuff':
      // Temporary buff that wears off at end of turn
      source.statusEffects[effect.status] = (source.statusEffects[effect.status] || 0) + effect.value;
      source.statusEffects['temp_' + effect.status] = (source.statusEffects['temp_' + effect.status] || 0) + effect.value;
      break;

    case 'addPower':
      gameState.player.powers[effect.power] = (gameState.player.powers[effect.power] || 0) + effect.value;
      break;
  }
}

function calculateDamage(baseDamage, attacker, defender) {
  var damage = baseDamage;
  damage += (attacker.statusEffects.strength || 0);
  if (attacker.statusEffects.weak > 0) {
    damage = Math.floor(damage * 0.75);
  }
  if (defender.statusEffects.vulnerable > 0) {
    damage = Math.floor(damage * 1.5);
  }
  if (attacker === gameState.player && gameState.player.penNibActive) {
    damage *= 2;
    gameState.player.penNibActive = false;
  }
  return Math.max(0, damage);
}

function applyDamage(damage, target) {
  var blocked = Math.min(target.block, damage);
  target.block -= blocked;
  var hpLoss = damage - blocked;
  target.currentHp -= hpLoss;
  if (hpLoss > 0 && typeof AudioManager !== 'undefined' && AudioManager.enabled) AudioManager.playDamageSound(hpLoss);

  if (hpLoss > 0) {
    if (target === gameState.player) {
      gameState.stats.damageTaken += hpLoss;
    } else {
      gameState.stats.damageDealt += hpLoss;
    }
  }

  // Check for boss split mechanic (before death check)
  if (target.onDamaged && target.currentHp > 0) {
    var splitResult = target.onDamaged(target);
    if (splitResult === 'split') {
      target.dead = true;
      target.currentHp = 0;
      var slime1 = createEnemyInstance('medium_slime');
      var slime2 = createEnemyInstance('medium_slime');
      gameState.enemies.push(slime1);
      gameState.enemies.push(slime2);
      log(target.name + ' splits into two!');
    }
  }

  if (target.currentHp <= 0) {
    target.currentHp = 0;
    target.dead = true;
    gameState.stats.enemiesKilled++;
    if (target.onDeath) target.onDeath();
  }
  return { damage: damage, blocked: blocked, hpLoss: hpLoss };
}

// === STATUS EFFECTS ===
function tickStatusEffects(entity) {
  var toRemove = [];
  for (var status in entity.statusEffects) {
    if (status === 'strength' || status === 'enrage' || status === 'dexterity') continue; // permanent
    entity.statusEffects[status]--;
    if (entity.statusEffects[status] <= 0) {
      toRemove.push(status);
    }
  }
  for (var i = 0; i < toRemove.length; i++) {
    delete entity.statusEffects[toRemove[i]];
  }
}

// === ENEMY TURNS ===
function executeEnemyTurns() {
  if (typeof showTurnBanner === 'function') showTurnBanner('Enemy Turn', 'enemy-turn');
  var delay = 0;
  for (var i = 0; i < gameState.enemies.length; i++) {
    (function(index) {
      var enemy = gameState.enemies[index];
      if (enemy.dead) return;

      delay += 600;
      setTimeout(function() {
        // Reset block
        enemy.block = 0;

        // Tick status effects
        tickStatusEffects(enemy);

        // Execute intent
        var intent = enemy.currentIntent;
        if (intent) {
          for (var e = 0; e < intent.effects.length; e++) {
            resolveEnemyEffect(intent.effects[e], enemy);
          }
          log(enemy.name + ' uses ' + intent.label + '.');
        }

        renderCombat();

        // Check player death
        if (gameState.player.currentHp <= 0) {
          onPlayerDeath();
          return;
        }

        // If this is the last enemy, start next player turn
        var isLast = true;
        for (var j = index + 1; j < gameState.enemies.length; j++) {
          if (!gameState.enemies[j].dead) { isLast = false; break; }
        }
        if (isLast) {
          setTimeout(function() {
            startPlayerTurn();
          }, 400);
        }
      }, delay);
    })(i);
  }

  // If all enemies are dead (edge case)
  if (gameState.enemies.every(function(e) { return e.dead; })) {
    startPlayerTurn();
  }
}

function resolveEnemyEffect(effect, enemy) {
  switch (effect.type) {
    case 'damage':
      var dmg = calculateDamage(effect.value, enemy, gameState.player);
      var result = applyDamage(dmg, gameState.player);
      showFloatingOnPlayer('-' + result.hpLoss, 'damage');
      if (result.hpLoss >= 8) triggerScreenShake();
      break;

    case 'block':
      enemy.block += effect.value;
      break;

    case 'applyBuff':
      enemy.statusEffects[effect.status] = (enemy.statusEffects[effect.status] || 0) + effect.value;
      break;

    case 'applyStatus':
      gameState.player.statusEffects[effect.status] = (gameState.player.statusEffects[effect.status] || 0) + effect.value;
      break;

    case 'addStatusCard':
      for (var sc = 0; sc < (effect.count || 1); sc++) {
        var statusCard = createCardInstance(effect.card);
        if (statusCard) {
          gameState.player.discardPile.push(statusCard);
        }
      }
      log('Added ' + (effect.count || 1) + ' ' + effect.card + ' to discard.');
      break;

    case 'applyDebuff':
      gameState.player.statusEffects[effect.status] = (gameState.player.statusEffects[effect.status] || 0) + effect.value;
      if (gameState.player.statusEffects[effect.status] <= 0 && effect.status !== 'strength') {
        delete gameState.player.statusEffects[effect.status];
      }
      break;

    case 'escape':
      enemy.dead = true;
      enemy.currentHp = 0;
      var stolen = Math.min(gameState.player.gold || 0, 15);
      gameState.player.gold -= stolen;
      if (stolen > 0) log(enemy.name + ' steals ' + stolen + ' gold and escapes!');
      else log(enemy.name + ' escapes!');
      break;
  }
}

// === WIN/LOSE ===
function checkAllEnemiesDead() {
  return gameState.enemies.every(function(e) { return e.dead; });
}

function onCombatVictory() {
  gameState.phase = 'reward';
  if (typeof AudioManager !== 'undefined' && AudioManager.enabled) AudioManager.playVictorySound();
  triggerRelics('onCombatEnd');
  log('All enemies defeated!');

  // Give gold
  var goldReward = 10 + Math.floor(Math.random() * 15);
  if (gameState.isEliteFight) goldReward = 25 + Math.floor(Math.random() * 15);
  if (gameState.isBossFight) goldReward = 50 + Math.floor(Math.random() * 25);
  gameState.player.gold += goldReward;
  gameState.stats.goldEarned += goldReward;
  gameState.stats.floorsCleared++;
  log('Gained ' + goldReward + ' gold.');

  // 40% chance to get a potion
  if (Math.random() < 0.4) {
    var p = getRandomPotion();
    for (var i = 0; i < gameState.player.potions.length; i++) {
      if (gameState.player.potions[i] === null) {
        gameState.player.potions[i] = p;
        log('Found a ' + p.name + '!');
        break;
      }
    }
  }

  renderCombat();
  showRewardScreen();
}

function onPlayerDeath() {
  gameState.phase = 'gameOver';
  if (typeof AudioManager !== 'undefined' && AudioManager.enabled) AudioManager.playDeathSound();
  gameState.player.currentHp = 0;
  clearSave();
  renderCombat();
  showGameOverScreen(false);
}

function addCardToDeck(card) {
  gameState.player.deck.push(card);
}

function advanceEncounter() {
  // If elite fight, also offer relic
  if (gameState.isEliteFight) {
    var relicChoices = getRandomRelics(3);
    if (relicChoices.length > 0) {
      showRelicRewardScreen(relicChoices);
      return;
    }
  }
  returnToMap();
}

function restartGame() {
  _cardInstanceId = 0;
  clearSave();
  startGame();
  hideOverlays();
}

// Visual feedback stubs (implemented in ui.js)
function showDamageOnEnemy(enemy, amount) {
  if (typeof _showDamageOnEnemy === 'function') _showDamageOnEnemy(enemy, amount);
}
function showFloatingOnPlayer(text, type) {
  if (typeof _showFloatingOnPlayer === 'function') _showFloatingOnPlayer(text, type);
}
function triggerScreenShake() {
  if (typeof _triggerScreenShake === 'function') _triggerScreenShake();
}
function showRewardScreen() {
  if (typeof _showRewardScreen === 'function') _showRewardScreen();
}
function showGameOverScreen(victory) {
  if (typeof _showGameOverScreen === 'function') _showGameOverScreen(victory);
}
function hideOverlays() {
  if (typeof _hideOverlays === 'function') _hideOverlays();
}
function renderCombat() {
  if (typeof _renderCombat === 'function') _renderCombat();
}
function showMapScreen() {
  if (typeof _showMapScreen === 'function') _showMapScreen();
}
function showRestScreen() {
  if (typeof _showRestScreen === 'function') _showRestScreen();
}
function showShopScreen() {
  if (typeof _showShopScreen === 'function') _showShopScreen();
}
function showEventScreen() {
  if (typeof _showEventScreen === 'function') _showEventScreen();
}
function showRelicRewardScreen(relicIds) {
  if (typeof _showRelicRewardScreen === 'function') _showRelicRewardScreen(relicIds);
}

// === SAVE/LOAD SYSTEM ===
function saveGame() {
  try {
    var save = JSON.stringify(gameState, function(key, value) {
      if (typeof value === 'function') return undefined;
      return value;
    });
    localStorage.setItem('stsRun', save);
  } catch(e) {}
}

function loadGame() {
  try {
    var save = localStorage.getItem('stsRun');
    if (!save) return false;
    var loaded = JSON.parse(save);

    // Restore gameState
    for (var key in loaded) {
      gameState[key] = loaded[key];
    }

    // Re-attach functions to enemies
    for (var i = 0; i < gameState.enemies.length; i++) {
      var enemy = gameState.enemies[i];
      var template = ENEMY_DATABASE[enemy.id];
      if (template) {
        enemy.getNextIntent = template.getNextIntent;
        if (template.onDamaged) enemy.onDamaged = template.onDamaged;
        if (template.onDeath) enemy.onDeath = template.onDeath;
      }
    }

    return true;
  } catch(e) {
    localStorage.removeItem('stsRun');
    return false;
  }
}

function clearSave() {
  localStorage.removeItem('stsRun');
}

function hasSave() {
  return localStorage.getItem('stsRun') !== null;
}

function showStartScreen() {
  if (typeof _showStartScreen === 'function') _showStartScreen();
}
