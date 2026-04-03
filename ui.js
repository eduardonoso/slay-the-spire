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
      // Calculate intent value from effects
      var intentValue = _getIntentValue(enemy.currentIntent, enemy);
      intent.textContent = intentIcon + ' ' + enemy.currentIntent.label + (intentValue ? ' ' + intentValue : '');
      // Intent tooltip (custom styled)
      (function(tip, el) {
        el.addEventListener('mouseenter', function() { _showTooltipAt(tip, el); });
        el.addEventListener('mouseleave', _hideTooltip);
      })(getIntentTooltip(enemy.currentIntent, enemy), intent);
      slot.appendChild(intent);
    }

    // Sprite
    var sprite = document.createElement('div');
    sprite.className = 'enemy-sprite';
    // Stagger idle animation per enemy
    sprite.style.animationDelay = (i * 0.4) + 's';
    // Spawn animation on combat start
    if (gameState.turn <= 1 && !enemy.dead) {
      sprite.classList.add('spawning');
      sprite.style.animationDelay = (i * 0.15) + 's';
    }
    if (enemy.sprite && enemy.sprite.indexOf('assets/') === 0) {
      sprite.innerHTML = '<img src="' + enemy.sprite + '" alt="" class="enemy-sprite-img">';
    } else {
      sprite.textContent = enemy.sprite;
    }
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
  window._animateHand = false;
}

// === DRAG AND DROP ===
var _dragState = { dragging: false, card: null, el: null, clone: null, startX: 0, startY: 0, lastHover: null };

function _findDropTarget(x, y) {
  var el = document.elementFromPoint(x, y);
  while (el) {
    if (el.classList && el.classList.contains('enemy-slot') && !el.classList.contains('defeated')) {
      return { type: 'enemy', index: parseInt(el.getAttribute('data-enemy-index')), el: el };
    }
    if (el.id === 'player-area' || el.id === 'player-avatar') {
      return { type: 'player', el: el };
    }
    el = el.parentElement;
  }
  return null;
}

function _clearDragHighlights() {
  var hovered = document.querySelectorAll('.drag-over');
  for (var i = 0; i < hovered.length; i++) hovered[i].classList.remove('drag-over');
}

function _startDrag(e, card, el) {
  if (gameState.phase !== 'playerTurn') return;
  _dragState.startX = e.clientX;
  _dragState.startY = e.clientY;
  _dragState.card = card;
  _dragState.el = el;
  _dragState.dragging = false;
}

function _moveDrag(e) {
  if (!_dragState.card) return;
  var dx = e.clientX - _dragState.startX;
  var dy = e.clientY - _dragState.startY;

  if (!_dragState.dragging) {
    if (Math.abs(dx) + Math.abs(dy) < 10) return;
    // Enter drag mode
    _dragState.dragging = true;
    _dragState.el.classList.add('dragging');
    hideCardTooltip();
    gameState.selectedCard = null;

    // Create clone
    var clone = _dragState.el.cloneNode(true);
    clone.className = 'card drag-clone type-' + _dragState.card.type;
    if (_dragState.card.upgraded) clone.classList.add('upgraded');
    var rect = _dragState.el.getBoundingClientRect();
    clone.style.width = rect.width + 'px';
    clone.style.height = rect.height + 'px';
    clone.style.left = rect.left + 'px';
    clone.style.top = rect.top + 'px';
    document.getElementById('game-container').appendChild(clone);
    _dragState.clone = clone;
    _dragState.offsetX = e.clientX - rect.left;
    _dragState.offsetY = e.clientY - rect.top;
  }

  // Move clone
  if (_dragState.clone) {
    _dragState.clone.style.left = (e.clientX - _dragState.offsetX) + 'px';
    _dragState.clone.style.top = (e.clientY - _dragState.offsetY) + 'px';
  }

  // Highlight drop targets
  _clearDragHighlights();
  var target = _findDropTarget(e.clientX, e.clientY);
  if (target) target.el.classList.add('drag-over');
  _dragState.lastHover = target;
}

function _endDrag(e) {
  if (!_dragState.card) return;
  var wasDragging = _dragState.dragging;
  var card = _dragState.card;

  // Cleanup
  if (_dragState.clone) {
    _dragState.clone.parentNode.removeChild(_dragState.clone);
  }
  if (_dragState.el) {
    _dragState.el.classList.remove('dragging');
  }
  _clearDragHighlights();

  var target = _dragState.lastHover;
  // Reset state
  _dragState.card = null;
  _dragState.el = null;
  _dragState.clone = null;
  _dragState.dragging = false;
  _dragState.lastHover = null;

  if (!wasDragging) return; // Let click handler fire

  // Play card on drop target
  if (target) {
    if (target.type === 'enemy') {
      playCard(card.instanceId, target.index);
    } else if (target.type === 'player' && !card.needsTarget) {
      playCard(card.instanceId, null);
    }
  }
  // If no target, card just returns to hand (re-render happens automatically)
}

// Global mouse/touch listeners for drag (only added once)
if (!window._dragListenersAdded) {
  document.addEventListener('mousemove', function(e) { _moveDrag(e); });
  document.addEventListener('mouseup', function(e) { _endDrag(e); });
  document.addEventListener('touchmove', function(e) {
    if (_dragState.card) {
      e.preventDefault();
      _moveDrag(e.touches[0]);
    }
  }, { passive: false });
  document.addEventListener('touchend', function(e) {
    if (_dragState.card) {
      var touch = e.changedTouches[0];
      // Update last hover before ending
      _dragState.lastHover = _findDropTarget(touch.clientX, touch.clientY);
      _endDrag(touch);
    }
  });
  window._dragListenersAdded = true;
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

  // Deal animation with stagger (only on fresh draw, not re-renders)
  if (window._animateHand) {
    el.style.animationDelay = (index * 0.06) + 's';
    el.classList.add('dealing');
  }

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
  art.innerHTML = _cardArtHTML(card.art);
  el.appendChild(art);

  // Description
  var desc = document.createElement('div');
  desc.className = 'card-description';
  desc.textContent = Td(card.description);
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
        if (_dragState.dragging) return; // Don't fire click after drag
        onCardClick(c);
      });
    })(card);
  }

  // Drag handler
  if (canPlay) {
    (function(c, element) {
      element.addEventListener('mousedown', function(e) {
        e.preventDefault();
        _startDrag(e, c, element);
      });
      element.addEventListener('touchstart', function(e) {
        _startDrag(e.touches[0], c, element);
      }, { passive: true });
    })(card, el);
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
    '<div class="card-art">' + _cardArtHTML(card.art) + '</div>' +
    '<div class="card-description">' + Td(card.description) + '</div>' +
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
    goldEl.textContent = '\uD83D\uDCB0 ' + (player.gold || 0) + ' ' + T('gold');
  }
}

function renderPileInfo() {
  var drawEl = document.getElementById('draw-pile-count');
  drawEl.textContent = T('drawPile') + ': ' + gameState.player.drawPile.length;
  drawEl.style.cursor = 'pointer';
  drawEl.onclick = function() { showPileViewer(T('drawPile') + ' Pile', gameState.player.drawPile); };

  var discardEl = document.getElementById('discard-pile-count');
  discardEl.textContent = T('discardPile') + ': ' + gameState.player.discardPile.length;
  discardEl.style.cursor = 'pointer';
  discardEl.onclick = function() { showPileViewer(T('discardPile') + ' Pile', gameState.player.discardPile); };

  var exhaustEl = document.getElementById('exhaust-pile-count');
  if (exhaustEl) {
    exhaustEl.textContent = T('exhaustPile') + ': ' + gameState.player.exhaustPile.length;
    exhaustEl.style.display = gameState.player.exhaustPile.length > 0 ? '' : 'none';
    exhaustEl.style.cursor = 'pointer';
    exhaustEl.onclick = function() { showPileViewer(T('exhaustPile') + ' Pile', gameState.player.exhaustPile); };
  }

  // Update end turn button text
  var endTurnBtn = document.getElementById('end-turn-btn');
  if (endTurnBtn) endTurnBtn.textContent = T('endTurn');
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
    el.textContent = 'SECTOR ' + act + ' - DECK ' + gameState.map.currentFloor + ' / ' + MAP_CONFIG.floors;
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
    // Custom tooltip on hover
    (function(s, v, el) {
      el.addEventListener('mouseenter', function() {
        var tip = getStatusTooltip(s);
        if (s === 'regen') tip = tip.replace('N', v);
        _showTooltipAt(tip, el);
      });
      el.addEventListener('mouseleave', _hideTooltip);
    })(status, value, badge);
    container.appendChild(badge);
  }

  return container;
}

// === ENEMY ATTACK ANIMATION ===
function _triggerEnemyAttack(enemyIndex) {
  var slots = document.querySelectorAll('.enemy-slot');
  if (!slots[enemyIndex]) return;
  var sprite = slots[enemyIndex].querySelector('.enemy-sprite');
  if (!sprite) return;
  sprite.classList.remove('attacking');
  void sprite.offsetWidth; // Force reflow
  sprite.classList.add('attacking');
  setTimeout(function() { sprite.classList.remove('attacking'); }, 400);
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
  if (window._screenShakeEnabled === false) return;
  var container = document.getElementById('game-container');
  container.classList.add('shake');
  setTimeout(function() {
    container.classList.remove('shake');
  }, 300);
}

// === TOOLTIP HELPERS ===
function _showTooltipAt(text, anchorEl) {
  var tooltip = document.getElementById('tooltip');
  if (!tooltip) return;
  tooltip.textContent = text;
  tooltip.style.display = 'block';
  var rect = anchorEl.getBoundingClientRect();
  var containerRect = document.getElementById('game-container').getBoundingClientRect();
  tooltip.style.left = (rect.left - containerRect.left + rect.width / 2) + 'px';
  tooltip.style.top = (rect.top - containerRect.top - 30) + 'px';
}

function _hideTooltip() {
  var tooltip = document.getElementById('tooltip');
  if (tooltip) tooltip.style.display = 'none';
}

// === SCREEN EFFECTS ===
function _triggerScreenEffect(type) {
  if (window._screenEffectsEnabled === false) return;
  var el = document.getElementById('screen-effect');
  if (!el) return;
  el.className = '';
  void el.offsetWidth;
  el.className = 'screen-fx screen-fx-' + type;
  setTimeout(function() { el.className = ''; }, 600);
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
  art.innerHTML = _cardArtHTML(card.art);
  el.appendChild(art);

  var desc = document.createElement('div');
  desc.className = 'card-description';
  desc.textContent = Td(card.description);
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
      title.textContent = T('victory') + '!';
      title.className = 'overlay-title victory';
      subtitle.textContent = 'You saved the station! The Overlord AI has been shut down.';
    } else {
      title.textContent = T('actCleared');
      title.className = 'overlay-title victory';
      subtitle.textContent = 'Advancing to next sector...';
    }
  } else {
    title.textContent = T('defeat');
    title.className = 'overlay-title defeat';
    var act2 = gameState.act || 1;
    var floorText = gameState.map ? 'Sector ' + act2 + ' deck ' + gameState.map.currentFloor : 'encounter ' + (gameState.encounterIndex + 1);
    subtitle.textContent = 'Ship destroyed on ' + floorText + '.';
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
    '<div class="stat-row"><span>Decks Cleared</span><span>' + (s.floorsCleared || 0) + '</span></div>' +
    '<div class="stat-row"><span>Enemies Killed</span><span>' + (s.enemiesKilled || 0) + '</span></div>' +
    '<div class="stat-row"><span>Cards Played</span><span>' + (s.cardsPlayed || 0) + '</span></div>' +
    '<div class="stat-row"><span>Turns Taken</span><span>' + (s.turnsPlayed || 0) + '</span></div>' +
    '<div class="stat-row"><span>Damage Dealt</span><span>' + (s.damageDealt || 0) + '</span></div>' +
    '<div class="stat-row"><span>Damage Taken</span><span>' + (s.damageTaken || 0) + '</span></div>' +
    '<div class="stat-row"><span>Credits Earned</span><span>' + (s.goldEarned || 0) + '</span></div>' +
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
  var screens = ['reward-screen', 'game-over-screen', 'map-screen', 'rest-screen', 'shop-screen', 'event-screen', 'relic-reward-screen', 'upgrade-screen', 'remove-screen', 'pile-viewer', 'start-screen', 'tutorial-screen', 'card-preview', 'act-transition', 'settings-screen'];
  for (var i = 0; i < screens.length; i++) {
    var el = document.getElementById(screens[i]);
    if (el) el.classList.add('hidden');
  }
}

// === HELPERS ===
function _getIntentValue(intent, enemy) {
  if (!intent.effects || !intent.effects.length) return '';
  var str = (enemy.statusEffects && enemy.statusEffects.strength) || 0;
  var isWeak = (enemy.statusEffects && enemy.statusEffects.weak > 0);
  var totalDmg = 0;
  var hitCount = 0;
  var blockVal = 0;
  for (var i = 0; i < intent.effects.length; i++) {
    var eff = intent.effects[i];
    if (eff.type === 'attack' || eff.type === 'damage') {
      var dmg = (eff.damage || eff.value || 0) + str;
      if (isWeak) dmg = Math.floor(dmg * 0.75);
      dmg = Math.max(0, dmg);
      totalDmg += dmg;
      hitCount++;
    } else if (eff.type === 'block') {
      blockVal += (eff.value || 0);
    }
  }
  if (hitCount > 1) return totalDmg + ' (' + Math.round(totalDmg / hitCount) + '×' + hitCount + ')';
  if (hitCount === 1) return '' + totalDmg;
  if (blockVal > 0) return '' + blockVal;
  return '';
}

function _cardArtHTML(art) {
  if (art && art.indexOf('assets/') === 0) {
    return '<img src="' + art + '" alt="" class="card-art-img">';
  }
  return art || '';
}

function getIntentIcon(type) {
  switch (type) {
    case 'attack': return '⚔️';
    case 'defend': return '🛡️';
    case 'buff': return '✨';
    case 'debuff': return '💀';
    default: return '❓';
  }
}

function getIntentTooltip(intent, enemy) {
  var val = enemy ? _getIntentValue(intent, enemy) : '';
  switch (intent.type) {
    case 'attack':
      return val ? 'Attack for ' + val + ' damage' : 'Will attack';
    case 'defend':
      return val ? 'Will gain ' + val + ' ' + T('block') : 'Will gain ' + T('block');
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
    case 'vulnerable': return T('vulnerableIcon');
    case 'weak': return T('weakIcon');
    case 'strength': return T('strengthIcon');
    case 'enrage': return T('enrageIcon');
    case 'dexterity': return T('dexterityIcon');
    case 'frail': return T('frailIcon');
    case 'regen': return T('regenIcon');
    default: return '';
  }
}

function getStatusTooltip(status) {
  switch (status) {
    case 'vulnerable': return T('vulnerableTip');
    case 'weak': return T('weakTip');
    case 'strength': return T('strengthTip');
    case 'enrage': return T('enrageTip');
    case 'dexterity': return T('dexterityTip');
    case 'frail': return T('frailTip');
    case 'regen': return T('regenTip');
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
    mapTitle.textContent = '[ SECTOR ' + act + ' — NAVIGATION ]';
    mapTitle.style.cssText = 'color:#00ffcc;font-family:Courier New,monospace;letter-spacing:3px;font-size:20px;text-shadow:0 0 10px rgba(0,255,204,0.4);';
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
    floorLabel.textContent = (f === 0) ? '▶' : (f < 10 ? '0' + f : f);
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

      var nodeInfo = NODE_TYPES[node.type];
      if (nodeInfo && nodeInfo.img) {
        nodeEl.innerHTML = '<img src="' + nodeInfo.img + '" class="map-node-img" alt="' + (nodeInfo.label || '') + '">';
      } else {
        nodeEl.textContent = nodeInfo ? nodeInfo.icon : '?';
      }
      nodeEl.title = nodeInfo ? nodeInfo.label : '';

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
          line.setAttribute('stroke', isVisited ? 'rgba(0,255,204,0.4)' : 'rgba(0,255,204,0.12)');
          line.setAttribute('stroke-width', isVisited ? '2' : '1');
          if (!isVisited) line.setAttribute('stroke-dasharray', '4,4');

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
  info.innerHTML = '⚡ HULL ' + gameState.player.currentHp + '/' + gameState.player.maxHp +
    ' │ ' + T('gold') + ': ' + (gameState.player.gold || 0) +
    ' │ PROGRAMS: ' + gameState.player.deck.length;

  var deckBtn = document.createElement('button');
  deckBtn.className = 'btn btn-secondary';
  deckBtn.style.cssText = 'margin-top:10px;font-size:13px;padding:6px 18px;';
  deckBtn.textContent = T('viewDeck') + ' (' + gameState.player.deck.length + ')';
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

  // Update rest screen title dynamically
  var restTitle = screen.querySelector('.overlay-title');
  if (restTitle) restTitle.textContent = T('rest');

  var options = document.getElementById('rest-options');
  options.innerHTML = '';

  // Rest option
  var healAmount = Math.floor(gameState.player.maxHp * 0.3);
  var restBtn = document.createElement('button');
  restBtn.className = 'btn btn-primary';
  restBtn.style.cssText = 'margin:8px;';
  restBtn.textContent = T('restHeal') + ' (' + T('heal') + ' ' + healAmount + ' ' + T('hp') + ')';
  restBtn.addEventListener('click', function() {
    gameState.player.currentHp = Math.min(gameState.player.maxHp, gameState.player.currentHp + healAmount);
    log(T('restHeal') + '. ' + T('heal') + 'ed ' + healAmount + ' ' + T('hp') + '.');
    returnToMap();
  });
  options.appendChild(restBtn);

  // Smith (upgrade) option
  var hasUpgradeable = gameState.player.deck.some(function(c) { return canUpgrade(c); });
  var smithBtn = document.createElement('button');
  smithBtn.className = 'btn btn-primary';
  smithBtn.style.cssText = 'margin:8px;';
  smithBtn.textContent = T('restUpgrade') + ' (Upgrade a card)';
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
      '<div class="card-art">' + _cardArtHTML(card.art) + '</div>' +
      '<div class="card-description">' + Td(card.description) + '</div>' +
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
    '<div class="card-art">' + _cardArtHTML(card.art) + '</div>' +
    '<div class="card-description">' + Td(card.description) + '</div>';

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
    '<div class="card-art">' + _cardArtHTML(card.art) + '</div>' +
    '<div class="card-description">' + Td(upgrade.description) + '</div>';

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
    if (subtitle) subtitle.textContent = 'Click a module to upgrade it:';
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

  // Update shop title dynamically
  var shopTitle = screen.querySelector('.overlay-title');
  if (shopTitle) shopTitle.textContent = T('shopTitle');

  var shop = generateShop();
  gameState.currentShop = shop;

  renderShopItems();
}

function renderShopItems() {
  var shop = gameState.currentShop;
  var goldEl = document.getElementById('shop-gold');
  goldEl.textContent = '\uD83D\uDCB0 ' + (gameState.player.gold || 0) + ' ' + T('gold');

  var container = document.getElementById('shop-items');
  container.innerHTML = '';

  // Cards
  for (var i = 0; i < shop.cards.length; i++) {
    if (shop.cards[i].sold) continue;
    var item = shop.cards[i];
    var el = document.createElement('div');
    el.className = 'shop-item shop-card-item';
    var canAfford = gameState.player.gold >= item.price;

    // Full card template matching hand cards
    var cardDiv = document.createElement('div');
    cardDiv.className = 'card type-' + item.card.type + ' shop-card' +
      (item.card.upgraded ? ' upgraded' : '');
    cardDiv.innerHTML = '<div class="card-cost">' + (item.card.cost === 'X' ? 'X' : item.card.cost) + '</div>' +
      '<div class="card-name">' + item.card.name + '</div>' +
      '<div class="card-type-label">' + item.card.type + '</div>' +
      '<div class="card-art">' + _cardArtHTML(item.card.art) + '</div>' +
      '<div class="card-description">' + Td(item.card.description) + '</div>' +
      _getRarityDotHTML(item.card);
    el.appendChild(cardDiv);

    var priceDiv = document.createElement('div');
    priceDiv.className = 'shop-price' + (canAfford ? '' : ' too-expensive');
    priceDiv.textContent = item.price + ' \uD83D\uDCB0';
    el.appendChild(priceDiv);

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
    '<div class="shop-item-name">' + T('removeCard') + '</div>' +
    '<div class="shop-item-desc">Remove a card from your ' + T('deck').toLowerCase() + '</div>' +
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
      '<div class="card-art">' + _cardArtHTML(card.art) + '</div>' +
      '<div class="card-description">' + Td(card.description) + '</div>' +
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
      '<div class="card-art">' + _cardArtHTML(card.art) + '</div>' +
      '<div class="card-description">' + Td(card.description) + '</div>' +
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

// === TOP BAR BUTTONS ===
document.getElementById('map-btn').addEventListener('click', function() {
  // Only show map if not already on map and game has started
  if (!gameState.map) return;
  var mapScreen = document.getElementById('map-screen');
  if (!mapScreen.classList.contains('hidden')) {
    _hideOverlays();
    _renderCombat();
    return;
  }
  _showMapScreen();
});

document.getElementById('deck-btn').addEventListener('click', function() {
  if (!gameState.player || !gameState.player.deck) return;
  var pileViewer = document.getElementById('pile-viewer');
  if (!pileViewer.classList.contains('hidden')) {
    _hideOverlays();
    _renderCombat();
    return;
  }
  showPileViewer('Your Deck', gameState.player.deck);
});

document.getElementById('settings-btn').addEventListener('click', function() {
  var settingsScreen = document.getElementById('settings-screen');
  if (!settingsScreen.classList.contains('hidden')) {
    closeSettings();
    return;
  }
  showSettings();
});

function showSettings() {
  var screen = document.getElementById('settings-screen');
  screen.classList.remove('hidden');

  var content = document.getElementById('settings-content');
  content.innerHTML = '';

  // Sound toggle
  var soundRow = document.createElement('div');
  soundRow.className = 'settings-row';
  soundRow.innerHTML = '<label>Sound Effects</label>';
  var soundToggle = document.createElement('button');
  soundToggle.className = 'settings-toggle' + (typeof AudioManager !== 'undefined' && AudioManager.enabled ? ' active' : '');
  soundToggle.addEventListener('click', function() {
    if (typeof AudioManager === 'undefined') return;
    AudioManager.enabled = !AudioManager.enabled;
    soundToggle.className = 'settings-toggle' + (AudioManager.enabled ? ' active' : '');
  });
  soundRow.appendChild(soundToggle);
  content.appendChild(soundRow);

  // Screen shake toggle
  var shakeRow = document.createElement('div');
  shakeRow.className = 'settings-row';
  shakeRow.innerHTML = '<label>Screen Shake</label>';
  var shakeToggle = document.createElement('button');
  window._screenShakeEnabled = window._screenShakeEnabled !== false;
  shakeToggle.className = 'settings-toggle' + (window._screenShakeEnabled ? ' active' : '');
  shakeToggle.addEventListener('click', function() {
    window._screenShakeEnabled = !window._screenShakeEnabled;
    shakeToggle.className = 'settings-toggle' + (window._screenShakeEnabled ? ' active' : '');
  });
  shakeRow.appendChild(shakeToggle);
  content.appendChild(shakeRow);

  // Screen effects toggle
  var fxRow = document.createElement('div');
  fxRow.className = 'settings-row';
  fxRow.innerHTML = '<label>Screen Effects</label>';
  var fxToggle = document.createElement('button');
  window._screenEffectsEnabled = window._screenEffectsEnabled !== false;
  fxToggle.className = 'settings-toggle' + (window._screenEffectsEnabled ? ' active' : '');
  fxToggle.addEventListener('click', function() {
    window._screenEffectsEnabled = !window._screenEffectsEnabled;
    fxToggle.className = 'settings-toggle' + (window._screenEffectsEnabled ? ' active' : '');
    // Toggle CRT scanlines
    var gc = document.getElementById('game-container');
    if (gc) gc.classList.toggle('no-screen-fx', !window._screenEffectsEnabled);
  });
  fxRow.appendChild(fxToggle);
  content.appendChild(fxRow);

  // Tutorial reset
  var tutRow = document.createElement('div');
  tutRow.className = 'settings-row';
  tutRow.innerHTML = '<label>Reset Tutorial</label>';
  var tutBtn = document.createElement('button');
  tutBtn.className = 'btn btn-secondary';
  tutBtn.style.cssText = 'font-size:12px;padding:4px 12px;min-height:auto;';
  tutBtn.textContent = 'Reset';
  tutBtn.addEventListener('click', function() {
    localStorage.removeItem('stsTutorialSeen');
    tutBtn.textContent = 'Done!';
    setTimeout(function() { tutBtn.textContent = 'Reset'; }, 1500);
  });
  tutRow.appendChild(tutBtn);
  content.appendChild(tutRow);
}

function closeSettings() {
  document.getElementById('settings-screen').classList.add('hidden');
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
    continueBtn.textContent = '▶ CONTINUE MISSION';
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
  seedInput.placeholder = 'MISSION SEED (OPTIONAL)';
  seedInput.maxLength = 20;
  seedContainer.appendChild(seedInput);
  options.appendChild(seedContainer);

  var newBtn = document.createElement('button');
  newBtn.className = 'btn btn-secondary';
  newBtn.style.cssText = 'margin:8px;display:block;width:250px;';
  newBtn.textContent = '+ NEW MISSION';
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
    hsDiv.textContent = '★ HIGH SCORE: ' + highScore;
    options.appendChild(hsDiv);
  }
}

// === START GAME ===
if (hasSave()) {
  _showStartScreen();
} else {
  startGame();
}
