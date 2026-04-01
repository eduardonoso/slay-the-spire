var RELIC_DATABASE = {
  burning_blood: {
    id: 'burning_blood', name: 'Burning Blood', art: '🩸',
    description: 'Heal 6 HP at end of combat.',
    trigger: 'onCombatEnd'
  },
  vajra: {
    id: 'vajra', name: 'Vajra', art: '🔱',
    description: 'Start each combat with 1 Strength.',
    trigger: 'onCombatStart'
  },
  anchor: {
    id: 'anchor', name: 'Anchor', art: '⚓',
    description: 'Start each combat with 10 Block.',
    trigger: 'onCombatStart'
  },
  bag_of_preparation: {
    id: 'bag_of_preparation', name: 'Bag of Prep', art: '🎒',
    description: 'Draw 2 additional cards on turn 1.',
    trigger: 'onFirstTurn'
  },
  lantern: {
    id: 'lantern', name: 'Lantern', art: '🏮',
    description: 'Gain 1 Energy on turn 1.',
    trigger: 'onFirstTurn'
  },
  orichalcum: {
    id: 'orichalcum', name: 'Orichalcum', art: '🪨',
    description: 'End turn with 0 Block? Gain 6.',
    trigger: 'onEndTurn'
  },
  pen_nib: {
    id: 'pen_nib', name: 'Pen Nib', art: '🖋️',
    description: 'Every 10th attack deals double damage.',
    trigger: 'onAttackPlayed', counter: true
  },
  meat_on_bone: {
    id: 'meat_on_bone', name: 'Meat on Bone', art: '🍖',
    description: 'End combat below 50% HP? Heal 12.',
    trigger: 'onCombatEnd'
  },
  red_skull: {
    id: 'red_skull', name: 'Red Skull', art: '💀',
    description: 'Below 50% HP? +3 Strength.',
    trigger: 'onTurnStart'
  },
  blood_vial: {
    id: 'blood_vial', name: 'Blood Vial', art: '🧪',
    description: 'At start of combat, heal 2 HP.',
    trigger: 'onCombatStart'
  },
  preserved_insect: {
    id: 'preserved_insect', name: 'Preserved Insect', art: '🐛',
    description: 'Elites start with 25% less HP.',
    trigger: 'onCombatStart'
  },
  mango: {
    id: 'mango', name: 'Mango', art: '🥭',
    description: '+14 Max HP on pickup.',
    trigger: 'onPickup'
  },
  strawberry: {
    id: 'strawberry', name: 'Strawberry', art: '🍓',
    description: '+7 Max HP on pickup.',
    trigger: 'onPickup'
  },
  nunchaku: {
    id: 'nunchaku', name: 'Nunchaku', art: '🥢',
    description: 'Every 10 attacks, gain 1 Energy.',
    trigger: 'onAttackPlayed', counter: true
  },
  ornamental_fan: {
    id: 'ornamental_fan', name: 'Ornamental Fan', art: '🪭',
    description: 'Every 3 attacks, gain 4 Block.',
    trigger: 'onAttackPlayed', counter: true
  },
  kunai: {
    id: 'kunai', name: 'Kunai', art: '🗡️',
    description: 'Every 3 attacks, gain 1 Dexterity.',
    trigger: 'onAttackPlayed', counter: true
  },
  happy_flower: {
    id: 'happy_flower', name: 'Happy Flower', art: '🌻',
    description: 'Every 3 turns, gain 1 Energy.',
    trigger: 'onTurnStart', counter: true
  },
  oddly_smooth_stone: {
    id: 'oddly_smooth_stone', name: 'Smooth Stone', art: '🪨',
    description: 'Start combat with 1 Dexterity.',
    trigger: 'onCombatStart'
  },
  horn_cleat: {
    id: 'horn_cleat', name: 'Horn Cleat', art: '📯',
    description: 'Turn 2: gain 14 Block.',
    trigger: 'onTurnStart'
  },
  letter_opener: {
    id: 'letter_opener', name: 'Letter Opener', art: '✉️',
    description: 'Every 3 skills, deal 5 damage to all.',
    trigger: 'onSkillPlayed', counter: true
  },
  shuriken: {
    id: 'shuriken', name: 'Shuriken', art: '⭐',
    description: 'Every 3 attacks played, gain 1 Strength.',
    trigger: 'onAttackPlayed', counter: true
  },
  du_vu_doll: {
    id: 'du_vu_doll', name: 'Du-Vu Doll', art: '🪆',
    description: '+1 Strength for each Curse in deck.',
    trigger: 'onCombatStart'
  },
  centennial_puzzle: {
    id: 'centennial_puzzle', name: 'Centennial Puzzle', art: '🧩',
    description: 'First time you lose HP each combat, draw 3.',
    trigger: 'onLoseHP'
  },
  self_forming_clay: {
    id: 'self_forming_clay', name: 'Self-Forming Clay', art: '🏺',
    description: 'Whenever you lose HP, gain 3 Block next turn.',
    trigger: 'onLoseHP'
  },
  torii: {
    id: 'torii', name: 'Torii', art: '⛩️',
    description: 'Receive 5 or less attack damage? Reduce to 1.',
    trigger: 'onDamageReceived'
  },
  snecko_eye: {
    id: 'snecko_eye', name: 'Snecko Eye', art: '👁️',
    description: 'Draw 2 extra cards. Card costs randomized 0-3.',
    trigger: 'onTurnStart'
  },
  dead_branch: {
    id: 'dead_branch', name: 'Dead Branch', art: '🌿',
    description: 'Exhaust a card? Add random card to hand.',
    trigger: 'onExhaust'
  },
  ice_cream: {
    id: 'ice_cream', name: 'Ice Cream', art: '🍦',
    description: 'Energy carries over between turns.',
    trigger: 'passive'
  }
};

var RELIC_POOL = ['burning_blood', 'vajra', 'anchor', 'bag_of_preparation', 'lantern', 'orichalcum', 'pen_nib', 'meat_on_bone', 'red_skull', 'blood_vial', 'preserved_insect', 'mango', 'strawberry', 'nunchaku', 'ornamental_fan', 'kunai', 'happy_flower', 'oddly_smooth_stone', 'horn_cleat', 'letter_opener', 'shuriken', 'du_vu_doll', 'centennial_puzzle', 'self_forming_clay', 'torii', 'snecko_eye', 'dead_branch', 'ice_cream'];

function getRandomRelics(count) {
  var available = RELIC_POOL.filter(function(id) {
    return gameState.player.relics.indexOf(id) === -1;
  });
  shuffleArray(available);
  var result = [];
  for (var i = 0; i < Math.min(count, available.length); i++) {
    result.push(available[i]);
  }
  return result;
}

function triggerRelics(triggerPoint, context) {
  var relics = gameState.player.relics;
  for (var i = 0; i < relics.length; i++) {
    var relic = RELIC_DATABASE[relics[i]];
    if (!relic || relic.trigger !== triggerPoint) continue;

    switch (relic.id) {
      case 'burning_blood':
        var heal = Math.min(6, gameState.player.maxHp - gameState.player.currentHp);
        if (heal > 0) {
          gameState.player.currentHp += heal;
          log('Burning Blood heals ' + heal + ' HP.');
        }
        break;
      case 'vajra':
        gameState.player.statusEffects.strength = (gameState.player.statusEffects.strength || 0) + 1;
        break;
      case 'anchor':
        gameState.player.block += 10;
        break;
      case 'bag_of_preparation':
        drawCards(2);
        break;
      case 'lantern':
        gameState.player.energy += 1;
        break;
      case 'orichalcum':
        if (gameState.player.block === 0) {
          gameState.player.block += 6;
        }
        break;
      case 'pen_nib':
        // Counter tracked in gameState.player.relicCounters
        if (!gameState.player.relicCounters) gameState.player.relicCounters = {};
        gameState.player.relicCounters.pen_nib = (gameState.player.relicCounters.pen_nib || 0) + 1;
        if (gameState.player.relicCounters.pen_nib >= 10) {
          gameState.player.relicCounters.pen_nib = 0;
          gameState.player.penNibActive = true;
          log('Pen Nib activates! Next attack deals double!');
        }
        break;
      case 'meat_on_bone':
        if (gameState.player.currentHp < gameState.player.maxHp * 0.5) {
          var mealHeal = Math.min(12, gameState.player.maxHp - gameState.player.currentHp);
          gameState.player.currentHp += mealHeal;
          log('Meat on the Bone heals ' + mealHeal + ' HP.');
        }
        break;
      case 'red_skull':
        // Grant +3 strength if below 50% HP, but only once (tracked)
        if (gameState.player.currentHp < gameState.player.maxHp * 0.5) {
          if (!gameState.player._redSkullActive) {
            gameState.player.statusEffects.strength = (gameState.player.statusEffects.strength || 0) + 3;
            gameState.player._redSkullActive = true;
          }
        } else {
          if (gameState.player._redSkullActive) {
            gameState.player.statusEffects.strength = Math.max(0, (gameState.player.statusEffects.strength || 0) - 3);
            gameState.player._redSkullActive = false;
          }
        }
        break;
      case 'blood_vial':
        var bvHeal = Math.min(2, gameState.player.maxHp - gameState.player.currentHp);
        if (bvHeal > 0) {
          gameState.player.currentHp += bvHeal;
        }
        break;
      case 'preserved_insect':
        if (gameState.isEliteFight) {
          for (var ei = 0; ei < gameState.enemies.length; ei++) {
            var e = gameState.enemies[ei];
            var reduction = Math.floor(e.maxHp * 0.25);
            e.maxHp -= reduction;
            e.currentHp -= reduction;
          }
        }
        break;
      case 'oddly_smooth_stone':
        gameState.player.statusEffects.dexterity = (gameState.player.statusEffects.dexterity || 0) + 1;
        break;
      case 'nunchaku':
        if (!gameState.player.relicCounters) gameState.player.relicCounters = {};
        gameState.player.relicCounters.nunchaku = (gameState.player.relicCounters.nunchaku || 0) + 1;
        if (gameState.player.relicCounters.nunchaku >= 10) {
          gameState.player.relicCounters.nunchaku = 0;
          gameState.player.energy += 1;
          log('Nunchaku grants 1 Energy!');
        }
        break;
      case 'ornamental_fan':
        if (!gameState.player.relicCounters) gameState.player.relicCounters = {};
        gameState.player.relicCounters.ornamental_fan = (gameState.player.relicCounters.ornamental_fan || 0) + 1;
        if (gameState.player.relicCounters.ornamental_fan >= 3) {
          gameState.player.relicCounters.ornamental_fan = 0;
          gameState.player.block += 4;
          showFloatingOnPlayer('+4', 'block');
        }
        break;
      case 'kunai':
        if (!gameState.player.relicCounters) gameState.player.relicCounters = {};
        gameState.player.relicCounters.kunai = (gameState.player.relicCounters.kunai || 0) + 1;
        if (gameState.player.relicCounters.kunai >= 3) {
          gameState.player.relicCounters.kunai = 0;
          gameState.player.statusEffects.dexterity = (gameState.player.statusEffects.dexterity || 0) + 1;
          log('Kunai grants +1 Dexterity!');
        }
        break;
      case 'happy_flower':
        if (!gameState.player.relicCounters) gameState.player.relicCounters = {};
        gameState.player.relicCounters.happy_flower = (gameState.player.relicCounters.happy_flower || 0) + 1;
        if (gameState.player.relicCounters.happy_flower >= 3) {
          gameState.player.relicCounters.happy_flower = 0;
          gameState.player.energy += 1;
          log('Happy Flower grants 1 Energy!');
        }
        break;
      case 'horn_cleat':
        if (gameState.turn === 2) {
          gameState.player.block += 14;
          showFloatingOnPlayer('+14', 'block');
        }
        break;
      case 'letter_opener':
        if (!gameState.player.relicCounters) gameState.player.relicCounters = {};
        gameState.player.relicCounters.letter_opener = (gameState.player.relicCounters.letter_opener || 0) + 1;
        if (gameState.player.relicCounters.letter_opener >= 3) {
          gameState.player.relicCounters.letter_opener = 0;
          for (var li = 0; li < gameState.enemies.length; li++) {
            if (!gameState.enemies[li].dead) {
              var ld = applyDamage(5, gameState.enemies[li]);
              showDamageOnEnemy(gameState.enemies[li], ld.hpLoss);
            }
          }
        }
        break;
      case 'shuriken':
        if (!gameState.player.relicCounters) gameState.player.relicCounters = {};
        gameState.player.relicCounters.shuriken = (gameState.player.relicCounters.shuriken || 0) + 1;
        if (gameState.player.relicCounters.shuriken >= 3) {
          gameState.player.relicCounters.shuriken = 0;
          gameState.player.statusEffects.strength = (gameState.player.statusEffects.strength || 0) + 1;
          log('Shuriken grants +1 Strength!');
        }
        break;
      case 'du_vu_doll':
        var curseCount = 0;
        for (var dvi = 0; dvi < gameState.player.deck.length; dvi++) {
          if (gameState.player.deck[dvi].type === 'curse') curseCount++;
        }
        if (curseCount > 0) {
          gameState.player.statusEffects.strength = (gameState.player.statusEffects.strength || 0) + curseCount;
          log('Du-Vu Doll grants +' + curseCount + ' Strength!');
        }
        break;
      case 'centennial_puzzle':
        if (!gameState.centennialUsed) {
          gameState.centennialUsed = true;
          drawCards(3);
          log('Centennial Puzzle draws 3 cards!');
        }
        break;
      case 'self_forming_clay':
        gameState.player._selfFormingClayTriggered = true;
        break;
      case 'snecko_eye':
        drawCards(2);
        // Randomize costs handled in startPlayerTurn after drawing
        break;
    }
  }
}

function hasRelic(relicId) {
  return gameState.player.relics.indexOf(relicId) !== -1;
}
