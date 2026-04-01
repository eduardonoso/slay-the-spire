// === UI RENDERING ===

function _getRarityDotHTML(card) {
  var r = card.rarity || 'common';
  if (r !== 'common' && r !== 'starter') {
    return '<div class="card-rarity ' + r + '"></div>';
  }
  return '';
}

// Track enemies that have already had their death animation played
var _dyingEnemyIds = {};

function _renderCombat() {
  renderEnemies();
  renderHand();
  renderPlayerStats();
  renderPileInfo();
  renderPotions();
  renderRelics();
  renderCombatLog();
  renderEncounterInfo();

  var btn = document.getElementById('end-turn-btn');
  btn.disabled = gameState.phase !== 'playerTurn';
}

function renderEnemies() {
  var area = document.getElementById('enemy-area');
  area.innerHTML = '';

  // Reset dying tracker when starting fresh combat (no dead enemies)
  var anyDead = false;
  for (var d = 0; d < gameState.enemies.length; d++) {
    if (gameState.enemies[d].dead) { anyDead = true; break; }
  }
  if (!anyDead) _dyingEnemyIds = {};

  for (var i = 0; i < gameState.enemies.length; i++) {
    var enemy = gameState.enemies[i];
    var slot = document.createElement('div');
    // Determine if this enemy just died (needs dying animation)
    var enemyUid = (enemy.name || '') + '_' + i;
    var justDied = enemy.dead && !_dyingEnemyIds[enemyUid];
    if (justDied) {
      _dyingEnemyIds[enemyUid] = true;
      slot.className = 'enemy-slot dying';
    } else {
      slot.className = 'enemy-slot' + (enemy.dead ? ' defeated' : '');
    }
    slot.setAttribute('data-enemy-index', i);

    // Intent
    if (!enemy.dead && enemy.currentIntent) {
      var intent = document.createElement('div');
      intent.className = 'enemy-intent intent-' + enemy.currentIntent.type;
      var intentIcon = getIntentIcon(enemy.currentIntent.type);
      intent.textContent = intentIcon + ' ' + enemy.currentIntent.label;
      // Intent tooltip
      var intentTip = getIntentTooltip(enemy.currentIntent);
      intent.title = intentTip;
      slot.appendChild(intent);
    }

    // Sprite
    var sprite = document.createElement('div');
    sprite.className = 'enemy-sprite';
    sprite.textContent = enemy.sprite;
    slot.appendChild(sprite);

    // Name
    var name = document.createElement('div');
    name.className = 'enemy-name';
    name.textContent = enemy.name;
    slot.appendChild(name);

    // HP Bar
    var hpContainer = document.createElement('div');
    hpContainer.className = 'hp-bar-container';
    var hpFill = document.createElement('div');
    var hpPercent = enemy.maxHp > 0 ? (enemy.currentHp / enemy.maxHp * 100) : 0;
    hpFill.className = 'hp-bar-fill' + (hpPercent < 30 ? ' low' : hpPercent < 60 ? ' medium' : '');
    hpFill.style.width = hpPercent + '%';
    hpContainer.appendChild(hpFill);
    slot.appendChild(hpContainer);

    // HP Text
    var hpText = document.createElement('div');
    hpText.className = 'hp-text';
    hpText.textContent = enemy.currentHp + '/' + enemy.maxHp;
    slot.appendChild(hpText);

    // Block
    if (enemy.block > 0) {
      var blockDiv = document.createElement('div');
      blockDiv.className = 'enemy-block';
      blockDiv.innerHTML = '<span>' + enemy.block + '</span>';
      slot.appendChild(blockDiv);
    }

    // Status Effects
    var statuses = renderStatusBadges(enemy.statusEffects);
    if (statuses) slot.appendChild(statuses);

    // Targeting for cards
    if (gameState.selectedCard && !enemy.dead) {
      slot.classList.add('targetable');
      (function(idx) {
        slot.addEventListener('click', function() {
          playCard(gameState.selectedCard, idx);
        });
      })(i);
    }

    // Targeting for potions
    if (gameState.selectedPotion !== null && gameState.selectedPotion !== undefined && !enemy.dead) {
      slot.classList.add('targetable');
      (function(idx) {
        slot.addEventListener('click', function() {
          usePotion(gameState.selectedPotion, idx);
        });
      })(i);
    }

    area.appendChild(slot);
  }
}

function renderHand() {
  var area = document.getElementById('hand-area');
  area.innerHTML = '';

  var hand = gameState.player.hand;
  var count = hand.length;

  for (var i = 0; i < count; i++) {
    var card = hand[i];
    var el = createCardElement(card, i, count);
    area.appendChild(el);
  }
}

function createCardElement(card, index, totalCards) {
  var el = document.createElement('div');
  var canPlay = gameState.phase === 'playerTurn' && (card.cost === 'X' || gameState.player.energy >= card.cost) && card.playable !== false;
  var isSelected = gameState.selectedCard === card.instanceId;

  el.className = 'card type-' + card.type +
    (canPlay ? '' : ' disabled') +
    (isSelected ? ' selected' : '') +
    (card.playable === false ? ' unplayable' : '') +
    (card.upgraded ? ' upgraded' : '');

  // Deal animation with stagger
  el.style.animationDelay = (index * 0.06) + 's';
  el.classList.add('dealing');

  // Dynamic overlap for large hands
  if (totalCards > 6) {
    var overlapMargin = -8 - (totalCards - 6) * 4;
    overlapMargin = Math.max(overlapMargin, -28);
    el.style.margin = '0 ' + overlapMargin + 'px';
  }

  // Fan rotation
  if (totalCards > 1) {
    var spread = Math.min(totalCards * 4, 35);
    var angle = -spread / 2 + (spread / (totalCards - 1)) * index;
    var yOffset = Math.abs(angle) * 0.5;
    el.style.transform = 'rotate(' + angle + 'deg) translateY(' + yOffset + 'px)';
    if (isSelected) {
      el.style.transform = 'rotate(' + angle + 'deg) translateY(-40px) scale(1.1)';
    }
  }

  // Cost
  var cost = document.createElement('div');
  cost.className = 'card-cost';
  cost.textContent = card.cost === 'X' ? 'X' : card.cost;
  el.appendChild(cost);

  // Name
  var name = document.createElement('div');
  name.className = 'card-name';
  name.textContent = card.name;
  el.appendChild(name);

  // Type label
  var typeLabel = document.createElement('div');
  typeLabel.className = 'card-type-label';
  typeLabel.textContent = card.type;
  el.appendChild(typeLabel);

  // Art
  var art = document.createElement('div');
  art.className = 'card-art';
  art.textContent = card.art;
  el.appendChild(art);

  // Description
  var desc = document.createElement('div');
  desc.className = 'card-description';
  desc.textContent = card.description;
  el.appendChild(desc);

  // Rarity indicator
  var rarity = card.rarity || 'common';
  if (rarity !== 'common' && rarity !== 'starter') {
    var rarityDot = document.createElement('div');
    rarityDot.className = 'card-rarity ' + rarity;
    el.appendChild(rarityDot);
  }

  // Click handler
  if (canPlay) {
    (function(c) {
      el.addEventListener('click', function(e) {
        e.stopPropagation();
        onCardClick(c);
      });
    })(card);
  }

  // Tooltip
  (function(c, element) {
    element.addEventListener('mouseenter', function() { showCardTooltip(c, element); });
    element.addEventListener('mouseleave', hideCardTooltip);
  })(card, el);

  // Mobile long-press preview
  var longPressTimer = null;
  (function(c, element) {
    element.addEventListener('touchstart', function(e) {
      longPressTimer = setTimeout(function() {
        longPressTimer = null;
        showCardPreview(c);
      }, 500);
    });
    element.addEventListener('touchend', function() {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });
    element.addEventListener('touchmove', function() {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });
  })(card, el);

  return el;
}

function showCardPreview(card) {
  var preview = document.getElementById('card-preview');
  if (!preview) return;

  preview.innerHTML = '';
  var el = document.createElement('div');
  el.className = 'card type-' + card.type + ' preview-card' + (card.upgraded ? ' upgraded' : '');
  el.innerHTML = '<div class="card-cost">' + card.cost + '</div>' +
    '<div class="card-name">' + card.name + '</div>' +
    '<div class="card-type-label">' + card.type + '</div>' +
    '<div class="card-art">' + card.art + '</div>' +
    '<div class="card-description">' + card.description + '</div>' +
    _getRarityDotHTML(card);
  preview.appendChild(el);
  preview.classList.remove('hidden');

  preview.addEventListener('click', function() {
    preview.classList.add('hidden');
  }, { once: true });
}

function onCardClick(card) {
  if (gameState.phase !== 'playerTurn') return;

  if (card.needsTarget) {
    // Toggle selection for targeting
    if (gameState.selectedCard === card.instanceId) {
      gameState.selectedCard = null; // deselect
    } else {
      gameState.selectedCard = card.instanceId;
    }
    _renderCombat();
  } else {
    // Play immediately (no target needed)
    gameState.selectedCard = null;
    playCard(card.instanceId, null);
  }
}

function renderPlayerStats() {
  var player = gameState.player;

  // Energy
  var energyEl = document.getElementById('energy-display');
  energyEl.textContent = player.energy + '/' + player.maxEnergy;

  // HP
  var hpPercent = player.maxHp > 0 ? (player.currentHp / player.maxHp * 100) : 0;
  var hpFill = document.getElementById('player-hp-fill');
  hpFill.style.width = hpPercent + '%';
  hpFill.className = 'hp-bar-fill' + (hpPercent < 30 ? ' low' : hpPercent < 60 ? ' medium' : '');

  // Critical HP flash
  var hpBarContainer = document.getElementById('player-hp').querySelector('.hp-bar-container');
  if (hpBarContainer) {
    if (hpPercent < 25) {
      hpFill.classList.add('critical');
    } else {
      hpFill.classList.remove('critical');
    }
  }

  var hpText = document.getElementById('player-hp-text');
  hpText.textContent = player.currentHp + '/' + player.maxHp;

  // Block
  var blockText = document.getElementById('player-block-text');
  blockText.textContent = player.block;
  document.getElementById('player-block').style.opacity = player.block > 0 ? '1' : '0.3';
  blockText.className = player.block > 0 ? 'block-badge' : '';

  // Status effects
  var statusArea = document.getElementById('player-status-effects');
  statusArea.innerHTML = '';
  var badges = renderStatusBadges(player.statusEffects);
  if (badges) statusArea.appendChild(badges);

  // Gold display
  var goldEl = document.getElementById('gold-display');
  if (goldEl) {
    goldEl.textContent = '\uD83D\uDCB0 ' + (player.gold || 0);
  }
}

function renderPileInfo() {
  var drawEl = document.getElementById('draw-pile-count');
  drawEl.textContent = 'Draw: ' + gameState.player.drawPile.length;
  drawEl.style.cursor = 'pointer';
  drawEl.onclick = function() { showPileViewer('Draw Pile', gameState.player.drawPile); };

  var discardEl = document.getElementById('discard-pile-count');
  discardEl.textContent = 'Discard: ' + gameState.player.discardPile.length;
  discardEl.style.cursor = 'pointer';
  discardEl.onclick = function() { showPileViewer('Discard Pile', gameState.player.discardPile); };

  var exhaustEl = document.getElementById('exhaust-pile-count');
  if (exhaustEl) {
    exhaustEl.textContent = 'Exhaust: ' + gameState.player.exhaustPile.length;
    exhaustEl.style.display = gameState.player.exhaustPile.length > 0 ? '' : 'none';
    exhaustEl.style.cursor = 'pointer';
    exhaustEl.onclick = function() { showPileViewer('Exhaust Pile', gameState.player.exhaustPile); };
  }
}

function renderPotions() {
  var area = document.getElementById('potion-slots');
  if (!area) return;
  area.innerHTML = '';

  for (var i = 0; i < gameState.player.potions.length; i++) {
    var slot = document.createElement('div');
    slot.className = 'potion-slot';
    var potion = gameState.player.potions[i];

    if (potion) {
      slot.classList.add('has-potion');
      slot.textContent = POTION_DATABASE[potion.id].art;
      // Custom tooltip on hover
      (function(potionData, potionEl) {
        potionEl.addEventListener('mouseenter', function() {
          var tooltip = document.getElementById('tooltip');
          if (!tooltip) return;
          tooltip.textContent = potionData.name + ': ' + potionData.description;
          tooltip.style.display = 'block';
          var rect = potionEl.getBoundingClientRect();
          var containerRect = document.getElementById('game-container').getBoundingClientRect();
          tooltip.style.left = (rect.left - containerRect.left + rect.width / 2) + 'px';
          tooltip.style.top = (rect.top - containerRect.top - 30) + 'px';
        });
        potionEl.addEventListener('mouseleave', function() {
          var tooltip = document.getElementById('tooltip');
          if (tooltip) tooltip.style.display = 'none';
        });
      })(potion, slot);

      if (gameState.phase === 'playerTurn') {
        (function(idx) {
          slot.addEventListener('click', function(e) {
            e.stopPropagation();
            var potionData = POTION_DATABASE[gameState.player.potions[idx].id];
            if (potionData.needsTarget) {
              gameState.selectedPotion = idx;
              gameState.selectedCard = null;
              _renderCombat();
            } else {
              usePotion(idx, null);
            }
          });
        })(i);
      }
    } else {
      slot.classList.add('empty');
      slot.textContent = '+';
    }

    area.appendChild(slot);
  }
}

function renderRelics() {
  var bar = document.getElementById('relic-bar');
  if (!bar) return;
  bar.innerHTML = '';
  var relics = gameState.player.relics;
  if (relics.length === 0) { bar.style.display = 'none'; return; }
  bar.style.display = 'flex';
  for (var i = 0; i < relics.length; i++) {
    var relic = RELIC_DATABASE[relics[i]];
    if (!relic) continue;
    var el = document.createElement('div');
    el.className = 'relic-icon';
    el.textContent = relic.art;
    // Custom tooltip on hover
    (function(relicData, relicEl) {
      relicEl.addEventListener('mouseenter', function() {
        var tooltip = document.getElementById('tooltip');
        if (!tooltip) return;
        tooltip.textContent = relicData.name + ': ' + relicData.description;
        tooltip.style.display = 'block';
        var rect = relicEl.getBoundingClientRect();
        var containerRect = document.getElementById('game-container').getBoundingClientRect();
        tooltip.style.left = (rect.left - containerRect.left + rect.width / 2) + 'px';
        tooltip.style.top = (rect.bottom - containerRect.top + 5) + 'px';
      });
      relicEl.addEventListener('mouseleave', function() {
        var tooltip = document.getElementById('tooltip');
        if (tooltip) tooltip.style.display = 'none';
      });
    })(relic, el);
    bar.appendChild(el);
  }
}

function renderCombatLog() {
  var logEl = document.getElementById('combat-log');
  var logs = gameState.combatLog.slice(-5);
  logEl.innerHTML = '';
  for (var i = 0; i < logs.length; i++) {
    var line = document.createElement('div');
    line.textContent = logs[i];
    line.style.opacity = 0.4 + (i / logs.length) * 0.6;
    logEl.appendChild(line);
  }
}

function renderEncounterInfo() {
  var el = document.getElementById('encounter-info');
  if (gameState.map) {
    var act = gameState.act || 1;
    el.textContent = 'ACT ' + act + ' - Floor ' + gameState.map.currentFloor + ' / ' + MAP_CONFIG.floors;
  }
}

function renderStatusBadges(statusEffects) {
  var keys = Object.keys(statusEffects);
  if (keys.length === 0) return null;

  var container = document.createElement('div');
  container.className = 'status-effects';

  for (var i = 0; i < keys.length; i++) {
    var status = keys[i];
    var value = statusEffects[status];
    if (value <= 0) continue;

    var badge = document.createElement('span');
    badge.className = 'status-badge ' + status;
    badge.textContent = getStatusIcon(status) + value;
    badge.title = getStatusTooltip(status);
    container.appendChild(badge);
  }

  return container;
}

// === FLOATING NUMBERS ===
function _showDamageOnEnemy(enemy, amount) {
  if (amount <= 0) return;
  var index = gameState.enemies.indexOf(enemy);
  var slots = document.querySelectorAll('.enemy-slot');
  if (!slots[index]) return;

  // Add hit animation to sprite
  var spriteEl = slots[index] ? slots[index].querySelector('.enemy-sprite') : null;
  if (spriteEl) {
    spriteEl.classList.remove('hit');
    void spriteEl.offsetWidth; // Force reflow to restart animation
    spriteEl.classList.add('hit');
  }

  var rect = slots[index].getBoundingClientRect();
  var containerRect = document.getElementById('game-container').getBoundingClientRect();

  createFloatingNumber(
    rect.left - containerRect.left + rect.width / 2,
    rect.top - containerRect.top + rect.height / 2,
    '-' + amount,
    'damage'
  );
}

function _showFloatingOnPlayer(text, type) {
  var playerArea = document.getElementById('player-area');
  var rect = playerArea.getBoundingClientRect();
  var containerRect = document.getElementById('game-container').getBoundingClientRect();

  createFloatingNumber(
    rect.left - containerRect.left + rect.width / 2,
    rect.top - containerRect.top,
    text,
    type
  );

  if (type === 'damage') {
    var avatar = document.getElementById('player-avatar');
    if (avatar) {
      avatar.classList.remove('hit');
      void avatar.offsetWidth; // Force reflow
      avatar.classList.add('hit');
    }
  }

  if (type === 'block') {
    var shieldEl = document.createElement('div');
    shieldEl.className = 'block-flash';
    shieldEl.textContent = '\uD83D\uDEE1\uFE0F';
    shieldEl.style.left = (rect.left - containerRect.left + rect.width / 2 - 16) + 'px';
    shieldEl.style.top = (rect.top - containerRect.top - 10) + 'px';
    var container = document.getElementById('game-container');
    container.appendChild(shieldEl);
    setTimeout(function() {
      if (shieldEl.parentNode) shieldEl.parentNode.removeChild(shieldEl);
    }, 500);
  }
}

function createFloatingNumber(x, y, text, type) {
  var el = document.createElement('div');
  el.className = 'floating-number ' + type;
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top = y + 'px';

  var container = document.getElementById('game-container');
  container.appendChild(el);

  setTimeout(function() {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 1000);
}

// === SCREEN SHAKE ===
function _triggerScreenShake() {
  var container = document.getElementById('game-container');
  container.classList.add('shake');
  setTimeout(function() {
    container.classList.remove('shake');
  }, 300);
}

// === OVERLAY SCREENS ===
function _showRewardScreen() {
  var screen = document.getElementById('reward-screen');
  screen.classList.remove('hidden');

  var cardsContainer = document.getElementById('reward-cards');
  cardsContainer.innerHTML = '';

  var rewards = getRandomRewardCards(3);
  for (var i = 0; i < rewards.length; i++) {
    var card = rewards[i];
    var el = createRewardCardElement(card);
    cardsContainer.appendChild(el);
  }
}

function createRewardCardElement(card) {
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

  // Rarity indicator
  var cardRarity = card.rarity || 'common';
  if (cardRarity !== 'common' && cardRarity !== 'starter') {
    var rarityDot = document.createElement('div');
    rarityDot.className = 'card-rarity ' + cardRarity;
    el.appendChild(rarityDot);
  }

  (function(c) {
    el.addEventListener('click', function() {
      addCardToDeck(c);
      log('Added ' + c.name + ' to deck.');
      _hideOverlays();
      advanceEncounter();
    });
  })(card);

  return el;
}

function skipReward() {
  _hideOverlays();
  advanceEncounter();
}

function _showEliteRewardScreen() {
  var screen = document.getElementById('reward-screen');
  screen.classList.remove('hidden');

  var cardsContainer = document.getElementById('reward-cards');
  cardsContainer.innerHTML = '';

  // Use elite reward cards with better rarity weights
  var rewards = getEliteRewardCards(3);
  for (var i = 0; i < rewards.length; i++) {
    var card = rewards[i];
    var el = createRewardCardElement(card);
    cardsContainer.appendChild(el);
  }
}

function _showGameOverScreen(victory) {
  var screen = document.getElementById('game-over-screen');
  screen.classList.remove('hidden');

  var title = document.getElementById('game-over-title');
  var subtitle = document.getElementById('game-over-subtitle');

  // Clear any previously inserted elements (score, stats, seed)
  var oldElements = screen.querySelectorAll('.score-display, .game-stats, .seed-display');
  for (var oi = 0; oi < oldElements.length; oi++) {
    oldElements[oi].parentNode.removeChild(oldElements[oi]);
  }

  if (victory) {
    var act = gameState.act || 1;
    if (act >= 3) {
      title.textContent = 'True Victory!';
      title.className = 'overlay-title victory';
      subtitle.textContent = 'You have conquered the Spire! The Awakened One has fallen.';
    } else {
      title.textContent = 'Victory!';
      title.className = 'overlay-title victory';
      subtitle.textContent = 'You conquered the Spire!';
    }
  } else {
    title.textContent = 'Defeat';
    title.className = 'overlay-title defeat';
    var act2 = gameState.act || 1;
    var floorText = gameState.map ? 'Act ' + act2 + ' floor ' + gameState.map.currentFloor : 'encounter ' + (gameState.encounterIndex + 1);
    subtitle.textContent = 'You have been slain on ' + floorText + '.';
  }

  // Score display
  var finalScore = gameState.score || 0;
  var highScore = parseInt(localStorage.getItem('stsHighScore') || '0', 10);
  var isNewHighScore = finalScore > highScore;
  if (isNewHighScore && finalScore > 0) {
    localStorage.setItem('stsHighScore', finalScore);
  }

  var scoreDiv = document.createElement('div');
  scoreDiv.className = 'score-display';
  scoreDiv.innerHTML = '<div class="score-total">' + finalScore + '</div>' +
    '<div class="score-label">FINAL SCORE</div>' +
    (isNewHighScore && finalScore > 0 ? '<div class="new-high-score">NEW HIGH SCORE!</div>' : '') +
    '<div class="high-score-compare">High Score: ' + Math.max(finalScore, highScore) + '</div>';

  // Score breakdown
  var breakdown = gameState.scoreBreakdown || {};
  var breakdownKeys = Object.keys(breakdown);
  if (breakdownKeys.length > 0) {
    var breakdownDiv = document.createElement('div');
    breakdownDiv.className = 'score-breakdown';
    for (var bi = 0; bi < breakdownKeys.length; bi++) {
      var reason = breakdownKeys[bi];
      var amount = breakdown[reason];
      var sign = amount >= 0 ? '+' : '';
      breakdownDiv.innerHTML += '<div class="score-row"><span>' + reason + '</span><span>' + sign + amount + '</span></div>';
    }
    scoreDiv.appendChild(breakdownDiv);
  }

  // Stats
  var statsDiv = document.createElement('div');
  statsDiv.className = 'game-stats';
  var s = gameState.stats || {};
  statsDiv.innerHTML =
    '<div class="stat-row"><span>Floors Cleared</span><span>' + (s.floorsCleared || 0) + '</span></div>' +
    '<div class="stat-row"><span>Enemies Killed</span><span>' + (s.enemiesKilled || 0) + '</span></div>' +
    '<div class="stat-row"><span>Cards Played</span><span>' + (s.cardsPlayed || 0) + '</span></div>' +
    '<div class="stat-row"><span>Turns Taken</span><span>' + (s.turnsPlayed || 0) + '</span></div>' +
    '<div class="stat-row"><span>Damage Dealt</span><span>' + (s.damageDealt || 0) + '</span></div>' +
    '<div class="stat-row"><span>Damage Taken</span><span>' + (s.damageTaken || 0) + '</span></div>' +
    '<div class="stat-row"><span>Gold Earned</span><span>' + (s.goldEarned || 0) + '</span></div>' +
    '<div class="stat-row"><span>Final Deck</span><span>' + gameState.player.deck.length + ' cards</span></div>';

  // Seed display
  var seedDiv = document.createElement('div');
  seedDiv.className = 'seed-display';
  var seedVal = gameState.seed !== null && gameState.seed !== undefined ? gameState.seed : '???';
  seedDiv.innerHTML = '<span class="seed-label">Seed: </span><span class="seed-value">' + seedVal + '</span>' +
    '<button class="seed-copy-btn" title="Copy seed">Copy</button>';

  // Insert elements before the button
  var btn = screen.querySelector('.btn');
  screen.insertBefore(scoreDiv, btn);
  screen.insertBefore(statsDiv, btn);
  screen.insertBefore(seedDiv, btn);

  // Copy seed handler
  var copyBtn = seedDiv.querySelector('.seed-copy-btn');
  copyBtn.addEventListener('click', function() {
    var seedText = String(seedVal);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(seedText).then(function() {
        copyBtn.textContent = 'Copied!';
        setTimeout(function() { copyBtn.textContent = 'Copy'; }, 1500);
      });
    } else {
      var ta = document.createElement('textarea');
      ta.value = seedText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      copyBtn.textContent = 'Copied!';
      setTimeout(function() { copyBtn.textContent = 'Copy'; }, 1500);
    }
  });
}

function _hideOverlays() {
  var screens = ['reward-screen', 'game-over-screen', 'map-screen', 'rest-screen', 'shop-screen', 'event-screen', 'relic-reward-screen', 'upgrade-screen', 'remove-screen', 'pile-viewer', 'start-screen', 'tutorial-screen', 'card-preview', 'act-transition'];
  for (var i = 0; i < screens.length; i++) {
    var el = document.getElementById(screens[i]);
    if (el) el.classList.add('hidden');
  }
}

// === HELPERS ===
function getIntentIcon(type) {
  switch (type) {
    case 'attack': return '⚔️';
    case 'defend': return '🛡️';
    case 'buff': return '✨';
    case 'debuff': return '💀';
    default: return '❓';
  }
}

function getIntentTooltip(intent) {
  switch (intent.type) {
    case 'attack':
      var dmgMatch = intent.label.match(/(\d+)/);
      return dmgMatch ? 'Attack for ' + dmgMatch[1] + ' damage' : 'Will attack';
    case 'defend':
      return 'Will gain Block';
    case 'buff':
      return 'Will buff itself';
    case 'debuff':
      return 'Will apply a debuff';
    default:
      return intent.label || 'Unknown action';
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'vulnerable': return '💔';
    case 'weak': return '🔻';
    case 'strength': return '💪';
    case 'enrage': return '🔥';
    case 'dexterity': return '🎯';
    case 'frail': return '🥶';
    case 'regen': return '🌱';
    default: return '';
  }
}

function getStatusTooltip(status) {
  switch (status) {
    case 'vulnerable': return 'Vulnerable: Takes 50% more attack damage';
    case 'weak': return 'Weak: Deals 25% less attack damage';
    case 'strength': return 'Strength: Deals additional attack damage';
    case 'enrage': return 'Enrage: Gains Strength when player plays skills';
    case 'dexterity': return 'Dexterity: Additional Block from cards';
    case 'frail': return 'Frail: Block from cards reduced by 25%';
    case 'regen': return 'Regen: Heal N HP at start of turn';
    default: return '';
  }
}

// === CLICK OUTSIDE TO DESELECT ===
document.addEventListener('click', function(e) {
  if ((gameState.selectedCard || gameState.selectedPotion !== null) && !e.target.closest('.card') && !e.target.closest('.enemy-slot') && !e.target.closest('.potion-slot')) {
    gameState.selectedCard = null;
    gameState.selectedPotion = null;
    _renderCombat();
  }
});

// === MAP SCREEN ===
function _showMapScreen() {
  _hideOverlays();
  var screen = document.getElementById('map-screen');
  screen.classList.remove('hidden');

  // Update map title to show act
  var mapTitle = screen.querySelector('.overlay-title');
  if (mapTitle) {
    var act = gameState.act || 1;
    mapTitle.textContent = 'Act ' + act + ' Floor Map';
  }

  var container = document.getElementById('map-container');
  container.innerHTML = '';

  var map = gameState.map;

  // Render floors bottom to top
  for (var f = map.floors.length - 1; f >= 0; f--) {
    var floorDiv = document.createElement('div');
    floorDiv.className = 'map-floor';

    var floorLabel = document.createElement('div');
    floorLabel.className = 'map-floor-label';
    // Floor 0 is the start node — don't number it
    floorLabel.textContent = (f === 0) ? '' : f;
    floorDiv.appendChild(floorLabel);

    var nodesDiv = document.createElement('div');
    nodesDiv.className = 'map-nodes';

    for (var n = 0; n < map.floors[f].length; n++) {
      var node = map.floors[f][n];
      var nodeEl = document.createElement('div');
      var hasConnections = node.connections.length > 0 || f === map.floors.length - 1;
      // Check if node is reachable (has connections from previous floor or is on first floor)
      var isReachable = hasConnections || hasPathTo(map.floors, f, n);

      nodeEl.className = 'map-node' +
        (node.visited ? ' visited' : '') +
        (node.available ? ' available' : '') +
        (!isReachable && !node.visited ? ' unreachable' : '') +
        (f === map.currentFloor && n === map.currentNode ? ' current' : '');

      nodeEl.textContent = NODE_TYPES[node.type] ? NODE_TYPES[node.type].icon : '?';
      nodeEl.title = NODE_TYPES[node.type] ? NODE_TYPES[node.type].label : '';

      if (node.available) {
        (function(floor, nodeIdx) {
          nodeEl.addEventListener('click', function() {
            selectMapNode(floor, nodeIdx);
          });
        })(f, n);
      }

      nodesDiv.appendChild(nodeEl);
    }

    floorDiv.appendChild(nodesDiv);
    container.appendChild(floorDiv);
  }

  // Helpers for offset calculation
  function getOffsetTop(el, ancestor) {
    var top = 0;
    while (el && el !== ancestor) { top += el.offsetTop; el = el.offsetParent; }
    return top;
  }
  function getOffsetLeft(el, ancestor) {
    var left = 0;
    while (el && el !== ancestor) { left += el.offsetLeft; el = el.offsetParent; }
    return left;
  }

  // Set position for SVG overlay
  container.style.position = 'relative';

  // Draw connection lines using SVG overlay
  setTimeout(function() {
    // Remove old SVG if any
    var oldSvg = container.querySelector('.map-lines');
    if (oldSvg) oldSvg.parentNode.removeChild(oldSvg);

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'map-lines');
    svg.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;';
    svg.setAttribute('width', container.scrollWidth);
    svg.setAttribute('height', container.scrollHeight);

    var floorDivs = container.querySelectorAll('.map-floor');
    // floorDivs[0] = floor 15 (top), floorDivs[last] = floor 1 (bottom)
    // map data: floor f connects to floor f+1
    // In DOM: floor f is at index (map.floors.length - 1 - f)

    for (var fl = 0; fl < map.floors.length - 1; fl++) {
      var fromDomIdx = map.floors.length - 1 - fl;
      var toDomIdx = map.floors.length - 1 - (fl + 1);
      if (!floorDivs[fromDomIdx] || !floorDivs[toDomIdx]) continue;

      var fromNodes = floorDivs[fromDomIdx].querySelectorAll('.map-node');
      var toNodes = floorDivs[toDomIdx].querySelectorAll('.map-node');

      for (var ni = 0; ni < map.floors[fl].length; ni++) {
        var node = map.floors[fl][ni];
        if (!fromNodes[ni]) continue;

        for (var ci = 0; ci < node.connections.length; ci++) {
          var targetIdx = node.connections[ci];
          if (!toNodes[targetIdx]) continue;

          // Use offsetTop/offsetLeft relative to container for scroll-safe positioning
          var fromEl = fromNodes[ni];
          var toEl = toNodes[targetIdx];
          // Source is lower in DOM (higher floor number), target is above (lower floor number rendered higher)
          var x1 = getOffsetLeft(fromEl, container) + fromEl.offsetWidth / 2;
          var y1 = getOffsetTop(fromEl, container) + fromEl.offsetHeight / 2;
          var x2 = getOffsetLeft(toEl, container) + toEl.offsetWidth / 2;
          var y2 = getOffsetTop(toEl, container) + toEl.offsetHeight / 2;

          var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', x1);
          line.setAttribute('y1', y1);
          line.setAttribute('x2', x2);
          line.setAttribute('y2', y2);

          // Style based on visited state
          var isVisited = map.floors[fl][ni].visited && map.floors[fl + 1][targetIdx].visited;
          line.setAttribute('stroke', isVisited ? 'rgba(46,213,115,0.5)' : 'rgba(255,255,255,0.25)');
          line.setAttribute('stroke-width', isVisited ? '3' : '2');

          svg.appendChild(line);
        }
      }
    }

    container.appendChild(svg);

    // Scroll to current/available floor after lines are drawn and layout is stable
    var availableNode = container.querySelector('.map-node.available') || container.querySelector('.map-node.current');
    if (availableNode) {
      availableNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);

  // Player info
  var info = document.getElementById('map-player-info');
  info.innerHTML = '\u2764\uFE0F ' + gameState.player.currentHp + '/' + gameState.player.maxHp +
    ' | \uD83D\uDCB0 ' + (gameState.player.gold || 0) +
    ' | \uD83C\uDCCF ' + gameState.player.deck.length + ' cards';

  var deckBtn = document.createElement('button');
  deckBtn.className = 'btn btn-secondary';
  deckBtn.style.cssText = 'margin-top:10px;font-size:13px;padding:6px 18px;';
  deckBtn.textContent = 'View Deck (' + gameState.player.deck.length + ')';
  deckBtn.addEventListener('click', function() {
    showPileViewer('Your Deck', gameState.player.deck);
  });
  info.appendChild(document.createElement('br'));
  info.appendChild(deckBtn);

  // Seed display on map
  if (gameState.seed !== null && gameState.seed !== undefined) {
    var mapSeed = document.createElement('div');
    mapSeed.className = 'map-seed-display';
    mapSeed.textContent = 'Seed: ' + gameState.seed;
    info.appendChild(mapSeed);
  }

  // Show tutorial on first visit
  if (!localStorage.getItem('stsTutorialSeen')) {
    setTimeout(showTutorial, 500);
  }
}

// === REST SCREEN ===
function _showRestScreen() {
  _hideOverlays();
  var screen = document.getElementById('rest-screen');
  screen.classList.remove('hidden');

  var options = document.getElementById('rest-options');
  options.innerHTML = '';

  // Rest option
  var healAmount = Math.floor(gameState.player.maxHp * 0.3);
  var restBtn = document.createElement('button');
  restBtn.className = 'btn btn-primary';
  restBtn.style.cssText = 'margin:8px;';
  restBtn.textContent = 'Rest (Heal ' + healAmount + ' HP)';
  restBtn.addEventListener('click', function() {
    gameState.player.currentHp = Math.min(gameState.player.maxHp, gameState.player.currentHp + healAmount);
    log('Rested. Healed ' + healAmount + ' HP.');
    returnToMap();
  });
  options.appendChild(restBtn);

  // Smith (upgrade) option
  var hasUpgradeable = gameState.player.deck.some(function(c) { return canUpgrade(c); });
  var smithBtn = document.createElement('button');
  smithBtn.className = 'btn btn-primary';
  smithBtn.style.cssText = 'margin:8px;';
  smithBtn.textContent = 'Smith (Upgrade a card)';
  smithBtn.disabled = !hasUpgradeable;
  smithBtn.addEventListener('click', function() {
    _hideOverlays();
    showUpgradeScreen();
  });
  options.appendChild(smithBtn);
}

function showUpgradeScreen() {
  var screen = document.getElementById('upgrade-screen');
  screen.classList.remove('hidden');

  // Remove any previous preview button row
  var oldBtnRow = screen.querySelector('.upgrade-btn-row');
  if (oldBtnRow) oldBtnRow.parentNode.removeChild(oldBtnRow);

  var container = document.getElementById('upgrade-cards');
  container.innerHTML = '';
  container.style.cssText = '';
  var cancelBtnEl = screen.querySelector('button[onclick="cancelUpgrade()"]');
  if (cancelBtnEl) cancelBtnEl.style.display = '';

  for (var i = 0; i < gameState.player.deck.length; i++) {
    var card = gameState.player.deck[i];
    if (!canUpgrade(card)) continue;

    var el = document.createElement('div');
    el.className = 'card type-' + card.type + ' reward-card' +
      (card.upgraded ? ' upgraded' : '');
    el.innerHTML = '<div class="card-cost">' + card.cost + '</div>' +
      '<div class="card-name">' + card.name + '</div>' +
      '<div class="card-type-label">' + card.type + '</div>' +
      '<div class="card-art">' + card.art + '</div>' +
      '<div class="card-description">' + card.description + '</div>' +
      _getRarityDotHTML(card);

    (function(idx) {
      el.addEventListener('click', function() {
        showUpgradePreview(idx);
      });
    })(i);

    container.appendChild(el);
  }
}

function showUpgradePreview(deckIndex) {
  var card = gameState.player.deck[deckIndex];
  var upgrade = UPGRADE_DATABASE[card.id];
  if (!card || !upgrade) return;

  var screen = document.getElementById('upgrade-screen');
  var container = document.getElementById('upgrade-cards');
  container.innerHTML = '';

  // Change subtitle
  var subtitle = screen.querySelector('.overlay-subtitle');
  if (subtitle) subtitle.textContent = 'Upgrade Preview:';

  // Hide default cancel button during preview, switch to column layout
  var cancelBtnEl = screen.querySelector('button[onclick="cancelUpgrade()"]');
  if (cancelBtnEl) cancelBtnEl.style.display = 'none';
  container.style.cssText = 'display:block;text-align:center;max-width:700px;margin-bottom:20px;max-height:none;overflow:visible;';

  // Before/after container
  var previewDiv = document.createElement('div');
  previewDiv.className = 'upgrade-preview';

  // Before card
  var beforeCard = document.createElement('div');
  beforeCard.className = 'card type-' + card.type + ' upgrade-card-preview';
  beforeCard.innerHTML = '<div class="card-cost">' + card.cost + '</div>' +
    '<div class="card-name">' + card.name + '</div>' +
    '<div class="card-type-label">' + card.type + '</div>' +
    '<div class="card-art">' + card.art + '</div>' +
    '<div class="card-description">' + card.description + '</div>';

  // Arrow
  var arrow = document.createElement('div');
  arrow.className = 'upgrade-arrow';
  arrow.textContent = '\u27A1';

  // After card
  var afterCost = upgrade.cost !== undefined ? upgrade.cost : card.cost;
  var afterCard = document.createElement('div');
  afterCard.className = 'card type-' + card.type + ' upgrade-card-preview upgraded';
  afterCard.innerHTML = '<div class="card-cost">' + afterCost + '</div>' +
    '<div class="card-name">' + upgrade.name + '</div>' +
    '<div class="card-type-label">' + card.type + '</div>' +
    '<div class="card-art">' + card.art + '</div>' +
    '<div class="card-description">' + upgrade.description + '</div>';

  previewDiv.appendChild(beforeCard);
  previewDiv.appendChild(arrow);
  previewDiv.appendChild(afterCard);
  container.appendChild(previewDiv);

  // Buttons
  var btnRow = document.createElement('div');
  btnRow.className = 'upgrade-btn-row';
  btnRow.style.cssText = 'display:flex;gap:12px;margin-top:16px;justify-content:center;align-self:center;';

  var confirmBtn = document.createElement('button');
  confirmBtn.className = 'btn btn-primary';
  confirmBtn.style.cssText = 'height:44px;';
  confirmBtn.textContent = 'Upgrade';
  confirmBtn.addEventListener('click', function() {
    upgradeCard(gameState.player.deck[deckIndex]);
    log('Upgraded ' + gameState.player.deck[deckIndex].name + '!');
    _hideOverlays();
    returnToMap();
  });

  var backBtn = document.createElement('button');
  backBtn.className = 'btn btn-secondary';
  backBtn.style.cssText = 'height:44px;';
  backBtn.textContent = 'Back';
  backBtn.addEventListener('click', function() {
    if (subtitle) subtitle.textContent = 'Click a card to upgrade it:';
    showUpgradeScreen();
  });

  btnRow.appendChild(confirmBtn);
  btnRow.appendChild(backBtn);

  container.appendChild(btnRow);
}

function cancelUpgrade() {
  _hideOverlays();
  _showRestScreen();
}

// === SHOP SCREEN ===
function _showShopScreen() {
  _hideOverlays();
  var screen = document.getElementById('shop-screen');
  screen.classList.remove('hidden');

  var shop = generateShop();
  gameState.currentShop = shop;

  renderShopItems();
}

function renderShopItems() {
  var shop = gameState.currentShop;
  var goldEl = document.getElementById('shop-gold');
  goldEl.textContent = '\uD83D\uDCB0 ' + (gameState.player.gold || 0) + ' Gold';

  var container = document.getElementById('shop-items');
  container.innerHTML = '';

  // Cards
  for (var i = 0; i < shop.cards.length; i++) {
    if (shop.cards[i].sold) continue;
    var item = shop.cards[i];
    var el = document.createElement('div');
    el.className = 'shop-item';
    var canAfford = gameState.player.gold >= item.price;
    el.innerHTML = '<div class="shop-card-preview">' + item.card.art + '</div>' +
      '<div class="shop-item-name">' + item.card.name + '</div>' +
      '<div class="shop-item-desc">' + item.card.description + '</div>' +
      '<div class="shop-price' + (canAfford ? '' : ' too-expensive') + '">' + item.price + ' \uD83D\uDCB0</div>';

    if (canAfford) {
      (function(idx) {
        el.addEventListener('click', function() {
          if (buyCard(shop.cards[idx])) {
            shop.cards[idx].sold = true;
            renderShopItems();
          }
        });
      })(i);
      el.style.cursor = 'pointer';
    }
    container.appendChild(el);
  }

  // Potions
  for (var j = 0; j < shop.potions.length; j++) {
    if (shop.potions[j].sold) continue;
    var pItem = shop.potions[j];
    var pEl = document.createElement('div');
    pEl.className = 'shop-item';
    var pCanAfford = gameState.player.gold >= pItem.price;
    pEl.innerHTML = '<div class="shop-card-preview">' + pItem.potion.art + '</div>' +
      '<div class="shop-item-name">' + pItem.potion.name + '</div>' +
      '<div class="shop-item-desc">' + pItem.potion.description + '</div>' +
      '<div class="shop-price' + (pCanAfford ? '' : ' too-expensive') + '">' + pItem.price + ' \uD83D\uDCB0</div>';

    if (pCanAfford) {
      (function(idx) {
        pEl.addEventListener('click', function() {
          if (buyPotion(shop.potions[idx])) {
            shop.potions[idx].sold = true;
            renderShopItems();
          }
        });
      })(j);
      pEl.style.cursor = 'pointer';
    }
    container.appendChild(pEl);
  }

  // Card removal
  var removeEl = document.createElement('div');
  removeEl.className = 'shop-item shop-remove';
  var removeCanAfford = gameState.player.gold >= shop.removeCost;
  removeEl.innerHTML = '<div class="shop-card-preview">\uD83D\uDDD1\uFE0F</div>' +
    '<div class="shop-item-name">Remove a Card</div>' +
    '<div class="shop-item-desc">Remove a card from your deck</div>' +
    '<div class="shop-price' + (removeCanAfford ? '' : ' too-expensive') + '">' + shop.removeCost + ' \uD83D\uDCB0</div>';

  if (removeCanAfford) {
    removeEl.addEventListener('click', function() {
      _hideOverlays();
      showRemoveScreen();
    });
    removeEl.style.cursor = 'pointer';
  }
  container.appendChild(removeEl);
}

function showRemoveScreen() {
  var screen = document.getElementById('remove-screen');
  screen.classList.remove('hidden');

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
      '<div class="card-description">' + card.description + '</div>' +
      _getRarityDotHTML(card);

    (function(idx) {
      el.addEventListener('click', function() {
        if (removeCard(idx)) {
          _hideOverlays();
          _showShopScreen();
        }
      });
    })(i);

    container.appendChild(el);
  }
}

function cancelRemove() {
  _hideOverlays();
  _showShopScreen();
}

function closeShop() {
  _hideOverlays();
  returnToMap();
}

// === EVENT SCREEN ===
function _showEventScreen() {
  _hideOverlays();
  var screen = document.getElementById('event-screen');
  screen.classList.remove('hidden');

  var event = getRandomEvent();

  document.getElementById('event-art').textContent = event.art;
  document.getElementById('event-title').textContent = event.name;
  document.getElementById('event-description').textContent = event.description;

  var choices = document.getElementById('event-choices');
  choices.innerHTML = '';

  for (var i = 0; i < event.choices.length; i++) {
    var choice = event.choices[i];
    var btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.style.cssText = 'margin:6px;display:block;width:300px;';
    btn.textContent = choice.text;

    // Check if choice is affordable
    var affordable = true;
    for (var j = 0; j < choice.effects.length; j++) {
      if (choice.effects[j].type === 'spendGold' && (gameState.player.gold || 0) < choice.effects[j].value) {
        affordable = false;
      }
    }
    if (!affordable) {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    }

    (function(effects) {
      btn.addEventListener('click', function() {
        _hideOverlays();
        resolveEventChoice(effects);
      });
    })(choice.effects);

    choices.appendChild(btn);
  }
}

// === RELIC REWARD SCREEN ===
function _showRelicRewardScreen(relicIds) {
  _hideOverlays();
  var screen = document.getElementById('relic-reward-screen');
  screen.classList.remove('hidden');

  var container = document.getElementById('relic-choices');
  container.innerHTML = '';

  for (var i = 0; i < relicIds.length; i++) {
    var relic = RELIC_DATABASE[relicIds[i]];
    if (!relic) continue;

    var el = document.createElement('div');
    el.className = 'relic-choice';
    el.innerHTML = '<div class="relic-choice-icon">' + relic.art + '</div>' +
      '<div class="relic-choice-name">' + relic.name + '</div>' +
      '<div class="relic-choice-desc">' + relic.description + '</div>';

    (function(id) {
      el.addEventListener('click', function() {
        gameState.player.relics.push(id);
        log('Gained ' + RELIC_DATABASE[id].name + '!');
        if (typeof AudioManager !== 'undefined' && AudioManager.enabled) AudioManager.playRelicSound();
        // Apply immediate pickup effects
        if (RELIC_DATABASE[id].trigger === 'onPickup') {
          switch (id) {
            case 'mango':
              gameState.player.maxHp += 14;
              gameState.player.currentHp += 14;
              break;
            case 'strawberry':
              gameState.player.maxHp += 7;
              gameState.player.currentHp += 7;
              break;
          }
        }
        _hideOverlays();
        returnToMap();
      });
    })(relicIds[i]);

    container.appendChild(el);
  }
}

function skipRelicReward() {
  _hideOverlays();
  returnToMap();
}

// === PILE VIEWER ===
function showPileViewer(title, cards) {
  var screen = document.getElementById('pile-viewer');
  screen.classList.remove('hidden');

  document.getElementById('pile-viewer-title').textContent = title + ' (' + cards.length + ')';

  var container = document.getElementById('pile-viewer-cards');
  container.innerHTML = '';

  // Deck statistics for "Your Deck"
  if (title === 'Your Deck') {
    var stats = { attack: 0, skill: 0, power: 0, curse: 0, status: 0, totalCost: 0 };
    for (var si = 0; si < cards.length; si++) {
      var cardType = cards[si].type;
      stats[cardType] = (stats[cardType] || 0) + 1;
      stats.totalCost += (typeof cards[si].cost === 'number' ? cards[si].cost : 0);
    }
    var avgCost = cards.length > 0 ? (stats.totalCost / cards.length).toFixed(1) : '0.0';
    var statsDiv = document.createElement('div');
    statsDiv.className = 'deck-stats';
    var statsText = cards.length + ' cards | Avg cost: ' + avgCost;
    statsText += '\nAttacks: ' + (stats.attack || 0) + ' | Skills: ' + (stats.skill || 0) + ' | Powers: ' + (stats.power || 0);
    if (stats.curse > 0) statsText += ' | Curses: ' + stats.curse;
    if (stats.status > 0) statsText += ' | Status: ' + stats.status;
    statsDiv.textContent = statsText;
    container.appendChild(statsDiv);
  }

  // Sort alphabetically
  var sorted = cards.slice().sort(function(a, b) { return a.name.localeCompare(b.name); });

  for (var i = 0; i < sorted.length; i++) {
    var card = sorted[i];
    var el = document.createElement('div');
    el.className = 'card type-' + card.type + ' pile-card' +
      (card.upgraded ? ' upgraded' : '');
    el.innerHTML = '<div class="card-cost">' + card.cost + '</div>' +
      '<div class="card-name">' + card.name + '</div>' +
      '<div class="card-type-label">' + card.type + '</div>' +
      '<div class="card-art">' + card.art + '</div>' +
      '<div class="card-description">' + card.description + '</div>' +
      _getRarityDotHTML(card);
    container.appendChild(el);
  }
}

function closePileViewer() {
  document.getElementById('pile-viewer').classList.add('hidden');
}

// === CARD TOOLTIP ===
function showCardTooltip(card, cardEl) {
  var tooltip = document.getElementById('tooltip');
  if (!tooltip) return;

  var lines = [];
  for (var i = 0; i < card.effects.length; i++) {
    var eff = card.effects[i];
    if (eff.type === 'damage' || eff.type === 'damageAll') {
      // Calculate actual damage against each enemy
      for (var j = 0; j < gameState.enemies.length; j++) {
        var enemy = gameState.enemies[j];
        if (enemy.dead) continue;
        var dmg = calculateDamage(eff.value, gameState.player, enemy);
        var base = eff.value;
        if (dmg !== base) {
          lines.push(enemy.name + ': ' + dmg + ' dmg');
        }
      }
    }
  }

  if (lines.length === 0) {
    tooltip.style.display = 'none';
    return;
  }

  tooltip.textContent = lines.join(' | ');
  tooltip.style.display = 'block';

  var rect = cardEl.getBoundingClientRect();
  var containerRect = document.getElementById('game-container').getBoundingClientRect();
  tooltip.style.left = (rect.left - containerRect.left + rect.width / 2) + 'px';
  tooltip.style.top = (rect.top - containerRect.top - 30) + 'px';
}

function hideCardTooltip() {
  var tooltip = document.getElementById('tooltip');
  if (tooltip) tooltip.style.display = 'none';
}

// === KEYBOARD SHORTCUTS ===
document.addEventListener('keydown', function(e) {
  if (gameState.phase !== 'playerTurn') return;

  // Number keys 1-9 to select/play cards
  var key = e.key;
  if (key >= '1' && key <= '9') {
    var idx = parseInt(key) - 1;
    if (idx < gameState.player.hand.length) {
      onCardClick(gameState.player.hand[idx]);
    }
    return;
  }

  // Enter or 'e' to end turn
  if (key === 'Enter' || key === 'e') {
    e.preventDefault();
    endPlayerTurn();
    return;
  }

  // Escape to cancel selection
  if (key === 'Escape') {
    gameState.selectedCard = null;
    gameState.selectedPotion = null;
    _renderCombat();
    return;
  }
});

// === TURN BANNER ===
function showTurnBanner(text, type) {
  var banner = document.getElementById('turn-banner');
  if (!banner) return;
  banner.textContent = text;
  banner.className = 'turn-banner ' + type;
  setTimeout(function() {
    banner.classList.add('hidden');
  }, 1200);
}

// === MUTE TOGGLE ===
function toggleMute() {
  if (typeof AudioManager === 'undefined') return;
  AudioManager.enabled = !AudioManager.enabled;
  document.getElementById('mute-btn').textContent = AudioManager.enabled ? '🔊' : '🔇';
}

// === TUTORIAL ===
function showTutorial() {
  document.getElementById('tutorial-screen').classList.remove('hidden');
}

function closeTutorial() {
  document.getElementById('tutorial-screen').classList.add('hidden');
  localStorage.setItem('stsTutorialSeen', 'true');
}

// === START SCREEN ===
function _showStartScreen() {
  _hideOverlays();
  var screen = document.getElementById('start-screen');
  screen.classList.remove('hidden');

  var options = document.getElementById('start-options');
  options.innerHTML = '';

  if (hasSave()) {
    var continueBtn = document.createElement('button');
    continueBtn.className = 'btn btn-primary';
    continueBtn.style.cssText = 'margin:8px;display:block;width:250px;';
    continueBtn.textContent = 'Continue Run';
    continueBtn.addEventListener('click', function() {
      _hideOverlays();
      if (loadGame()) {
        gameState.phase = 'map';
        _renderCombat();
        _showMapScreen();
      } else {
        startGame();
      }
    });
    options.appendChild(continueBtn);
  }

  // Seed input
  var seedContainer = document.createElement('div');
  seedContainer.className = 'seed-input-container';
  var seedInput = document.createElement('input');
  seedInput.type = 'text';
  seedInput.id = 'seed-input';
  seedInput.className = 'seed-input';
  seedInput.placeholder = 'Enter seed (optional)';
  seedInput.maxLength = 20;
  seedContainer.appendChild(seedInput);
  options.appendChild(seedContainer);

  var newBtn = document.createElement('button');
  newBtn.className = 'btn btn-secondary';
  newBtn.style.cssText = 'margin:8px;display:block;width:250px;';
  newBtn.textContent = 'New Run';
  newBtn.addEventListener('click', function() {
    clearSave();
    _hideOverlays();
    var seedVal = seedInput.value.trim();
    startGame(seedVal || undefined);
  });
  options.appendChild(newBtn);

  // High score display
  var highScore = parseInt(localStorage.getItem('stsHighScore') || '0', 10);
  if (highScore > 0) {
    var hsDiv = document.createElement('div');
    hsDiv.className = 'start-high-score';
    hsDiv.textContent = 'High Score: ' + highScore;
    options.appendChild(hsDiv);
  }
}

// === START GAME ===
if (hasSave()) {
  _showStartScreen();
} else {
  startGame();
}
