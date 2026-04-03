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
  act: 1,
  act1Boss: null,
  score: 0,
  scoreBreakdown: {},
  seed: null,
  rng: null,
  _bossDamageTaken: 0,
  isEliteFight: false,
  isBossFight: false,
  _act2EliteHpBonus: false,
  _act3EliteHpBonus: false,
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

function addScore(amount, reason) {
  gameState.score = (gameState.score || 0) + amount;
  if (reason) {
    gameState.scoreBreakdown[reason] = (gameState.scoreBreakdown[reason] || 0) + amount;
    log('+' + amount + ' score (' + reason + ')');
  }
}

function calculateFinalScore(victory) {
  if (victory) {
    // HP remaining bonus
    var hpBonus = gameState.player.currentHp;
    if (hpBonus > 0) addScore(hpBonus, 'HP remaining');

    // Gold remaining bonus
    var goldBonus = Math.floor((gameState.player.gold || 0) / 10);
    if (goldBonus > 0) addScore(goldBonus, 'Gold remaining');

    // Deck bloat penalty
    var deckSize = gameState.player.deck.length;
    if (deckSize > 20) {
      var penalty = (deckSize - 20) * 2;
      addScore(-penalty, 'Deck bloat penalty');
    }

    // Speed bonus
    var speedBonus = Math.max(0, 200 - (gameState.stats.turnsPlayed || 0));
    if (speedBonus > 0) addScore(speedBonus, 'Speed bonus');
  }

  // Relics bonus (applies to both victory and defeat)
  var relicCount = gameState.player.relics.length;
  if (relicCount > 0) addScore(relicCount * 10, 'Relics collected');
}

// === COMBAT INIT ===
function initCombat(enemyIds) {
  // Accept string or array
  if (typeof enemyIds === 'string') enemyIds = [enemyIds];
  gameState.enemies = enemyIds.map(function(id) { return createEnemyInstance(id); });

  // Act 2 elite HP bonus: +20%
  if (gameState._act2EliteHpBonus) {
    for (var eb = 0; eb < gameState.enemies.length; eb++) {
      var bonus = Math.floor(gameState.enemies[eb].maxHp * 0.2);
      gameState.enemies[eb].maxHp += bonus;
      gameState.enemies[eb].currentHp += bonus;
    }
    gameState._act2EliteHpBonus = false;
  }
  // Act 3 elites get +40% HP bonus
  if (gameState._act3EliteHpBonus) {
    for (var eb3 = 0; eb3 < gameState.enemies.length; eb3++) {
      var bonus3 = Math.floor(gameState.enemies[eb3].maxHp * 0.4);
      gameState.enemies[eb3].maxHp += bonus3;
      gameState.enemies[eb3].currentHp += bonus3;
    }
    gameState._act3EliteHpBonus = false;
  }
  gameState.turn = 0;
  gameState.selectedCard = null;
  gameState.combatLog = [];
  gameState._bossDamageTaken = 0;

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
  gameState.player._flag_noDraw = false;
  gameState.centennialUsed = false;
  gameState.player._selfFormingClayTriggered = false;

  triggerRelics('onCombatStart');

  if (gameState.enemies.length === 1) {
    log('A ' + gameState.enemies[0].name + ' appears!');
  } else {
    log(gameState.enemies.length + ' enemies appear!');
  }
  startPlayerTurn();
}

function startGame(seedValue) {
  gameState.player.currentHp = gameState.player.maxHp;
  gameState.player.deck = createStarterDeck();
  gameState.player.gold = 0;
  gameState.player.relics = [];
  gameState.player.potions = [null, null, null];
  gameState.player.cardRemovalsUsed = 0;
  gameState.player.powers = {};
  gameState.act = 1;
  gameState.act1Boss = null;
  gameState._act2EliteHpBonus = false;
  gameState._act3EliteHpBonus = false;
  gameState.score = 0;
  gameState.scoreBreakdown = {};
  gameState._bossDamageTaken = 0;
  initSeed(seedValue);
  gameState.map = generateMap(1);
  gameState.encounterIndex = 0;
  gameState.isEliteFight = false;
  gameState.isBossFight = false;
  gameState.stats = { turnsPlayed: 0, cardsPlayed: 0, damageDealt: 0, damageTaken: 0, goldEarned: 0, floorsCleared: 0, enemiesKilled: 0 };
  gameState.phase = 'map';
  // Remove act-2/act-3 class if present
  var container = document.getElementById('game-container');
  if (container) {
    container.classList.remove('act-2');
    container.classList.remove('act-3');
  }
  hideOverlays();
  renderCombat();
  showMapScreen();
}

// === TURN MANAGEMENT ===
function startPlayerTurn() {
  gameState.turn++;
  gameState.stats.turnsPlayed++;
  gameState.phase = 'playerTurn';
  if (typeof showTurnBanner === 'function') showTurnBanner(T('yourTurn'), 'player-turn');
  // Capacitor: energy carries over (add maxEnergy instead of resetting)
  if (hasRelic('ice_cream')) {
    gameState.player.energy += gameState.player.maxEnergy;
  } else {
    gameState.player.energy = gameState.player.maxEnergy;
  }
  if (!gameState.player.powers.barricade) {
    gameState.player.block = 0;
  }

  // Reactive Armor: gain 3 block if triggered last turn
  if (gameState.player._selfFormingClayTriggered) {
    gameState.player.block += 3;
    showFloatingOnPlayer('+3', 'block');
    log('Reactive Armor grants 3 ' + T('block') + '.');
    gameState.player._selfFormingClayTriggered = false;
  }

  gameState.selectedCard = null;

  // Regen: heal at start of turn, then decrement
  if (gameState.player.statusEffects.regen > 0) {
    var regenAmt = gameState.player.statusEffects.regen;
    gameState.player.currentHp = Math.min(gameState.player.maxHp, gameState.player.currentHp + regenAmt);
    showFloatingOnPlayer('+' + regenAmt, 'heal');
    log(T('regen') + ' ' + T('heal') + 's ' + regenAmt + ' ' + T('hp') + '.');
    if (typeof AudioManager !== 'undefined' && AudioManager.enabled) AudioManager.playHealSound();
  }

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
    showFloatingOnPlayer('+' + gameState.player.powers.demon_form + ' ' + T('strength'), 'buff');
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

  // Chaos Visor: randomize all hand card costs 0-3
  if (hasRelic('snecko_eye')) {
    for (var si = 0; si < gameState.player.hand.length; si++) {
      var sCard = gameState.player.hand[si];
      if (sCard.cost !== undefined && sCard.cost !== 'X' && sCard.playable !== false) {
        sCard.cost = Math.floor(Math.random() * 4);
      }
    }
  }

  // Curse triggers (after drawing)
  for (var ci = 0; ci < gameState.player.hand.length; ci++) {
    if (gameState.player.hand[ci].id === 'doubt') {
      gameState.player.statusEffects.weak = (gameState.player.statusEffects.weak || 0) + 1;
      log('Doubt inflicts ' + T('weak') + '!');
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
      // Trigger onExhaust if the ethereal card has one
      if (c.onExhaust) {
        resolveEffect(c.onExhaust, gameState.player, null, c, 0);
      }
      // Feel No Pain trigger
      if (gameState.player.powers.feelNoPain) {
        gameState.player.block += gameState.player.powers.feelNoPain;
      }
      // Fabricator: add random card (will be discarded at end of turn)
      if (hasRelic('dead_branch')) {
        var dbKeysE = Object.keys(CARD_DATABASE);
        var dbValidE = [];
        for (var dbiE = 0; dbiE < dbKeysE.length; dbiE++) {
          var dbCardE = CARD_DATABASE[dbKeysE[dbiE]];
          if (dbCardE.type !== 'curse' && dbCardE.type !== 'status' && dbCardE.playable !== false) {
            dbValidE.push(dbKeysE[dbiE]);
          }
        }
        if (dbValidE.length > 0) {
          var dbRandE = dbValidE[Math.floor(Math.random() * dbValidE.length)];
          var dbNewE = createCardInstance(dbRandE);
          nonEthereal.push(dbNewE);
        }
      }
    } else {
      nonEthereal.push(c);
    }
  }
  gameState.player.hand = nonEthereal;

  // Discard remaining hand (retain cards stay)
  var retainedCards = [];
  for (var ri = 0; ri < gameState.player.hand.length; ri++) {
    if (gameState.player.hand[ri].retain) {
      retainedCards.push(gameState.player.hand[ri]);
    } else {
      gameState.player.discardPile.push(gameState.player.hand[ri]);
    }
  }
  gameState.player.hand = retainedCards;

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
  if (typeof AudioManager !== 'undefined' && AudioManager.enabled) AudioManager.playPotionSound();
  renderCombat();
}

// === CARD DRAWING ===
function drawCards(count) {
  if (gameState.player._flag_noDraw) return;
  window._animateHand = true;
  for (var i = 0; i < count; i++) {
    if (gameState.player.drawPile.length === 0) {
      if (gameState.player.discardPile.length === 0) break;
      // Reshuffle discard into draw
      gameState.player.drawPile = gameState.player.discardPile.slice();
      gameState.player.discardPile = [];
      shuffleArray(gameState.player.drawPile);
      log(T('deck') + ' reshuffled.');
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
  // Corruption makes skills cost 0
  var effectiveCost = card.cost;
  if (gameState.player.powers.corruption && card.type === 'skill' && card.cost !== 'X') {
    effectiveCost = 0;
  }
  if (effectiveCost !== 'X' && gameState.player.energy < effectiveCost) return;

  var energySpent = effectiveCost;
  if (card.cost === 'X') { energySpent = gameState.player.energy; }

  // Corruption: Skills cost 0 and exhaust
  var corruptionActive = gameState.player.powers.corruption && card.type === 'skill';

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

  // Determine if card should exhaust
  var shouldExhaust = card.exhaust || corruptionActive;

  // Move to discard or exhaust
  if (shouldExhaust) {
    gameState.player.exhaustPile.push(card);
    // Trigger onExhaust effect if card has one
    if (card.onExhaust) {
      resolveEffect(card.onExhaust, gameState.player, null, card, 0);
      log(card.name + ' triggers on-' + T('exhaust').toLowerCase() + ' effect!');
    }
    // Feel No Pain: gain block when a card is exhausted
    if (gameState.player.powers.feelNoPain) {
      var fnpBlock = gameState.player.powers.feelNoPain;
      gameState.player.block += fnpBlock;
      showFloatingOnPlayer('+' + fnpBlock, 'block');
    }
    // Fabricator: add random card to hand on exhaust
    if (hasRelic('dead_branch')) {
      var dbKeys = Object.keys(CARD_DATABASE);
      var dbValid = [];
      for (var dbi = 0; dbi < dbKeys.length; dbi++) {
        var dbCard = CARD_DATABASE[dbKeys[dbi]];
        if (dbCard.type !== 'curse' && dbCard.type !== 'status' && dbCard.playable !== false) {
          dbValid.push(dbKeys[dbi]);
        }
      }
      if (dbValid.length > 0) {
        var dbRandId = dbValid[Math.floor(Math.random() * dbValid.length)];
        var dbNewCard = createCardInstance(dbRandId);
        gameState.player.hand.push(dbNewCard);
        log('Fabricator adds ' + dbNewCard.name + ' to ' + T('hand') + '!');
      }
    }
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
        log(enrageEnemy.name + ' gains ' + enrageEnemy.statusEffects.enrage + ' ' + T('strength') + '!');
      }
    }
  }

  gameState.selectedCard = null;
  log('Played ' + card.name + '.');
  gameState.stats.cardsPlayed++;
  addScore(1, 'Cards played');
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
      if (source.statusEffects.frail > 0) {
        blockAmount = Math.floor(blockAmount * 0.75);
      }
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
        log(T('exhausted') + ' ' + removed.name + '.');
        // Trigger onExhaust if the exhausted card has one
        if (removed.onExhaust) {
          resolveEffect(removed.onExhaust, gameState.player, null, removed, 0);
          log(removed.name + ' triggers on-' + T('exhaust').toLowerCase() + ' effect!');
        }
        // Feel No Pain trigger
        if (gameState.player.powers.feelNoPain) {
          var fnpBlock2 = gameState.player.powers.feelNoPain;
          gameState.player.block += fnpBlock2;
          showFloatingOnPlayer('+' + fnpBlock2, 'block');
        }
        // Fabricator: add random card to hand on exhaust
        if (hasRelic('dead_branch')) {
          var dbKeys2 = Object.keys(CARD_DATABASE);
          var dbValid2 = [];
          for (var dbi2 = 0; dbi2 < dbKeys2.length; dbi2++) {
            var dbCard2 = CARD_DATABASE[dbKeys2[dbi2]];
            if (dbCard2.type !== 'curse' && dbCard2.type !== 'status' && dbCard2.playable !== false) {
              dbValid2.push(dbKeys2[dbi2]);
            }
          }
          if (dbValid2.length > 0) {
            var dbRandId2 = dbValid2[Math.floor(Math.random() * dbValid2.length)];
            var dbNewCard2 = createCardInstance(dbRandId2);
            gameState.player.hand.push(dbNewCard2);
            log('Fabricator adds ' + dbNewCard2.name + ' to ' + T('hand') + '!');
          }
        }
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

    case 'setFlag':
      gameState.player['_flag_' + effect.flag] = true;
      break;

    case 'applyStatusAll':
      for (var sa = 0; sa < gameState.enemies.length; sa++) {
        var sae = gameState.enemies[sa];
        if (!sae.dead) {
          sae.statusEffects[effect.status] = (sae.statusEffects[effect.status] || 0) + effect.value;
        }
      }
      break;

    case 'headbutt':
      if (gameState.player.discardPile.length > 0) {
        var hbIdx = Math.floor(Math.random() * gameState.player.discardPile.length);
        var hbCard = gameState.player.discardPile.splice(hbIdx, 1)[0];
        gameState.player.drawPile.push(hbCard);
        log('Put ' + hbCard.name + ' on top of ' + T('draw') + ' pile.');
      }
      break;

    case 'tempUpgrade':
      var upgradeable = [];
      for (var tu = 0; tu < gameState.player.hand.length; tu++) {
        var tuCard = gameState.player.hand[tu];
        if (!tuCard.upgraded && UPGRADE_DATABASE && UPGRADE_DATABASE[tuCard.id]) {
          upgradeable.push(tuCard);
        }
      }
      if (upgradeable.length > 0) {
        var tuTarget = upgradeable[Math.floor(Math.random() * upgradeable.length)];
        upgradeCard(tuTarget);
        log('Upgraded ' + tuTarget.name + '!');
      }
      break;

    case 'tempUpgradeAll':
      for (var tua = 0; tua < gameState.player.hand.length; tua++) {
        var tuaCard = gameState.player.hand[tua];
        if (!tuaCard.upgraded && typeof UPGRADE_DATABASE !== 'undefined' && UPGRADE_DATABASE[tuaCard.id]) {
          upgradeCard(tuaCard);
        }
      }
      log('Upgraded all cards in ' + T('hand') + '!');
      break;

    case 'putBack':
      var pbHand = gameState.player.hand;
      if (pbHand.length > 0) {
        var pbIdx = Math.floor(Math.random() * pbHand.length);
        var pbCard = pbHand.splice(pbIdx, 1)[0];
        gameState.player.drawPile.push(pbCard);
        log('Put ' + pbCard.name + ' on top of ' + T('draw') + ' pile.');
      }
      break;

    case 'addWounds':
      for (var aw = 0; aw < effect.value; aw++) {
        var woundCard = createCardInstance('wound');
        if (woundCard) {
          gameState.player.hand.push(woundCard);
        }
      }
      log('Added ' + effect.value + ' Wounds to ' + T('hand') + '.');
      break;

    case 'reduceStrength':
      if (target) {
        target.statusEffects.strength = (target.statusEffects.strength || 0) - effect.value;
        log(target.name + ' loses ' + effect.value + ' ' + T('strength') + '.');
      }
      break;

    case 'limitBreak':
      var currentStr = gameState.player.statusEffects.strength || 0;
      gameState.player.statusEffects.strength = currentStr * 2;
      log(T('strength') + ' doubled to ' + gameState.player.statusEffects.strength + '!');
      break;

    case 'reaper':
      var totalHealed = 0;
      for (var rp = 0; rp < gameState.enemies.length; rp++) {
        var rpEnemy = gameState.enemies[rp];
        if (!rpEnemy.dead) {
          var rpDmg = calculateDamage(effect.value, source, rpEnemy);
          var rpResult = applyDamage(rpDmg, rpEnemy);
          showDamageOnEnemy(rpEnemy, rpResult.hpLoss);
          totalHealed += rpResult.hpLoss;
        }
      }
      if (totalHealed > 0) {
        gameState.player.currentHp = Math.min(gameState.player.maxHp, gameState.player.currentHp + totalHealed);
        showFloatingOnPlayer('+' + totalHealed, 'heal');
        log(T('heal') + 'ed ' + totalHealed + ' ' + T('hp') + ' from Reaper.');
      }
      break;

    case 'rampage':
      if (target) {
        var rampageBonus = card ? (card._rampageDamage || 0) : 0;
        var rampageDmg = calculateDamage(effect.value + rampageBonus, source, target);
        var rampageResult = applyDamage(rampageDmg, target);
        showDamageOnEnemy(target, rampageResult.hpLoss);
        if (rampageResult.hpLoss >= 10) triggerScreenShake();
        if (card) {
          card._rampageDamage = rampageBonus + (effect.increment || 5);
        }
      }
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

  // Dampener Field: reduce unblocked damage of 2-5 to 1
  if (target === gameState.player && hasRelic('torii')) {
    if (hpLoss >= 2 && hpLoss <= 5) hpLoss = 1;
  }

  target.currentHp -= hpLoss;
  if (typeof AudioManager !== 'undefined' && AudioManager.enabled) {
    if (hpLoss > 0) {
      AudioManager.playDamageSound(hpLoss);
    } else if (damage > 0 && hpLoss === 0) {
      // Block absorbed all damage
      AudioManager.playShieldSound();
    }
  }

  if (hpLoss > 0) {
    if (target === gameState.player) {
      gameState.stats.damageTaken += hpLoss;
      gameState._bossDamageTaken += hpLoss;
    } else {
      gameState.stats.damageDealt += hpLoss;
    }
  }

  // Trigger onLoseHP relics when player takes HP damage
  if (target === gameState.player && hpLoss > 0) {
    triggerRelics('onLoseHP', { amount: hpLoss });
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
    if (target !== gameState.player) {
      addScore(10, 'Enemies killed');
      if (gameState.isEliteFight) addScore(30, 'Elite bonus');
      if (gameState.isBossFight) addScore(50, 'Boss bonus');
      if (typeof AudioManager !== 'undefined' && AudioManager.enabled) {
        AudioManager.playEnemyDeathSound();
      }
    }
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
  if (typeof showTurnBanner === 'function') showTurnBanner(T('enemyTurn'), 'enemy-turn');
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

        // Trigger attack animation
        if (typeof _triggerEnemyAttack === 'function') _triggerEnemyAttack(index);

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
      if (result.hpLoss > 0) {
        triggerScreenEffect('damage');
        if (result.hpLoss >= 8) triggerScreenShake();
      } else if (dmg > 0) {
        triggerScreenEffect('block-hit');
      }
      break;

    case 'block':
      enemy.block += effect.value;
      break;

    case 'applyBuff':
      enemy.statusEffects[effect.status] = (enemy.statusEffects[effect.status] || 0) + effect.value;
      break;

    case 'applyStatus':
      gameState.player.statusEffects[effect.status] = (gameState.player.statusEffects[effect.status] || 0) + effect.value;
      triggerScreenEffect(effect.status);
      break;

    case 'addStatusCard':
      for (var sc = 0; sc < (effect.count || 1); sc++) {
        var statusCard = createCardInstance(effect.card);
        if (statusCard) {
          gameState.player.discardPile.push(statusCard);
        }
      }
      log('Added ' + (effect.count || 1) + ' ' + effect.card + ' to ' + T('discard') + '.');
      break;

    case 'applyDebuff':
      gameState.player.statusEffects[effect.status] = (gameState.player.statusEffects[effect.status] || 0) + effect.value;
      if (gameState.player.statusEffects[effect.status] <= 0 && effect.status !== 'strength') {
        delete gameState.player.statusEffects[effect.status];
      }
      triggerScreenEffect(effect.status === 'strength' ? 'reduceStrength' : effect.status);
      break;

    case 'escape':
      enemy.dead = true;
      enemy.currentHp = 0;
      var stolen = Math.min(gameState.player.gold || 0, 15);
      gameState.player.gold -= stolen;
      if (stolen > 0) log(enemy.name + ' steals ' + stolen + ' ' + T('gold') + ' and escapes!');
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
  var goldReward = 10 + Math.floor(Math.random() * 11);
  if (gameState.isEliteFight) {
    // Elites give 25-40 base + 25-40 bonus gold
    goldReward = 25 + Math.floor(Math.random() * 16);
    var bonusGold = 25 + Math.floor(Math.random() * 16);
    goldReward += bonusGold;
  }
  if (gameState.isBossFight) goldReward = 50 + Math.floor(Math.random() * 25);
  gameState.player.gold += goldReward;
  gameState.stats.goldEarned += goldReward;
  gameState.stats.floorsCleared++;
  addScore(5, 'Floors cleared');
  log('Gained ' + goldReward + ' ' + T('gold') + '.');

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

  // Perfect boss kill bonus
  if (gameState.isBossFight && gameState._bossDamageTaken === 0) {
    addScore(100, 'Perfect boss kill');
  }

  renderCombat();
  // Elites get better card rewards (higher rarity weights)
  if (gameState.isEliteFight) {
    showEliteRewardScreen();
  } else {
    showRewardScreen();
  }
}

function onPlayerDeath() {
  gameState.phase = 'gameOver';
  if (typeof AudioManager !== 'undefined' && AudioManager.enabled) AudioManager.playDeathSound();
  gameState.player.currentHp = 0;
  calculateFinalScore(false);
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
  var container = document.getElementById('game-container');
  if (container) container.classList.remove('act-2');
  hideOverlays();
  showStartScreen();
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
function triggerScreenEffect(type) {
  if (typeof _triggerScreenEffect === 'function') _triggerScreenEffect(type);
}
function showRewardScreen() {
  if (typeof _showRewardScreen === 'function') _showRewardScreen();
}
function showEliteRewardScreen() {
  if (typeof _showEliteRewardScreen === 'function') _showEliteRewardScreen();
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

    // Restore seeded RNG
    if (gameState.seed !== null && gameState.seed !== undefined) {
      gameState.rng = mulberry32(gameState.seed);
      // Advance RNG to approximate state (maps already generated)
      var advanceCount = (gameState.act || 1) * MAP_CONFIG.floors * MAP_CONFIG.nodesPerFloor;
      for (var r = 0; r < advanceCount; r++) gameState.rng();
    }

    // Restore act visual theme if needed
    var container = document.getElementById('game-container');
    if (container) {
      container.classList.remove('act-2');
      container.classList.remove('act-3');
      if (gameState.act === 2) {
        container.classList.add('act-2');
      } else if (gameState.act === 3) {
        container.classList.add('act-3');
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
