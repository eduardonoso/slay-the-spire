var RELIC_DATABASE = {
  burning_blood: {
    id: 'burning_blood', name: 'Nano Repair Kit', art: '🔋',
    description: 'Restore 6 {hp} at end of combat.',
    trigger: 'onCombatEnd'
  },
  vajra: {
    id: 'vajra', name: 'Combat Chip', art: '🔱',
    description: 'Start each combat with 1 {strength}.',
    trigger: 'onCombatStart'
  },
  anchor: {
    id: 'anchor', name: 'Gravity Anchor', art: '⚓',
    description: 'Start each combat with 10 {block}.',
    trigger: 'onCombatStart'
  },
  bag_of_preparation: {
    id: 'bag_of_preparation', name: 'Tactical Datapad', art: '📱',
    description: '{draw} 2 additional cards on {turn} 1.',
    trigger: 'onFirstTurn'
  },
  lantern: {
    id: 'lantern', name: 'Backup Battery', art: '🔋',
    description: 'Gain 1 {energy} on {turn} 1.',
    trigger: 'onFirstTurn'
  },
  orichalcum: {
    id: 'orichalcum', name: 'Auto-Shield', art: '🛡️',
    description: 'End {turn} with 0 {block}? Gain 6.',
    trigger: 'onEndTurn'
  },
  pen_nib: {
    id: 'pen_nib', name: 'Calibrator', art: '🎯',
    description: 'Every 10th attack deals double {damage}.',
    trigger: 'onAttackPlayed', counter: true
  },
  meat_on_bone: {
    id: 'meat_on_bone', name: 'Emergency Rations', art: '🍖',
    description: 'End combat below 50% {hp}? {heal} 12.',
    trigger: 'onCombatEnd'
  },
  red_skull: {
    id: 'red_skull', name: 'Danger Amplifier', art: '⚠️',
    description: 'Below 50% {hp}? +3 {strength}.',
    trigger: 'onTurnStart'
  },
  blood_vial: {
    id: 'blood_vial', name: 'Med Injector', art: '💉',
    description: 'At start of combat, {heal} 2 {hp}.',
    trigger: 'onCombatStart'
  },
  preserved_insect: {
    id: 'preserved_insect', name: 'EMP Device', art: '📡',
    description: 'Elites start with 25% less {hp}.',
    trigger: 'onCombatStart'
  },
  mango: {
    id: 'mango', name: 'Augment Module', art: '🧬',
    description: '+14 Max {hp} on pickup.',
    trigger: 'onPickup'
  },
  strawberry: {
    id: 'strawberry', name: 'Stim Pack', art: '💊',
    description: '+7 Max {hp} on pickup.',
    trigger: 'onPickup'
  },
  nunchaku: {
    id: 'nunchaku', name: 'Overcharger', art: '🔌',
    description: 'Every 10 attacks, gain 1 {energy}.',
    trigger: 'onAttackPlayed', counter: true
  },
  ornamental_fan: {
    id: 'ornamental_fan', name: 'Deflector Array', art: '📡',
    description: 'Every 3 attacks, gain 4 {block}.',
    trigger: 'onAttackPlayed', counter: true
  },
  kunai: {
    id: 'kunai', name: 'Targeting Laser', art: '🎯',
    description: 'Every 3 attacks, gain 1 {dexterity}.',
    trigger: 'onAttackPlayed', counter: true
  },
  happy_flower: {
    id: 'happy_flower', name: 'Solar Cell', art: '☀️',
    description: 'Every 3 {turn}s, gain 1 {energy}.',
    trigger: 'onTurnStart', counter: true
  },
  oddly_smooth_stone: {
    id: 'oddly_smooth_stone', name: 'Stabilizer', art: '⚖️',
    description: 'Start combat with 1 {dexterity}.',
    trigger: 'onCombatStart'
  },
  horn_cleat: {
    id: 'horn_cleat', name: 'Hull Plating', art: '🛡️',
    description: '{turn} 2: gain 14 {block}.',
    trigger: 'onTurnStart'
  },
  letter_opener: {
    id: 'letter_opener', name: 'Shock Coil', art: '⚡',
    description: 'Every 3 skills, deal 5 {damage} to all.',
    trigger: 'onSkillPlayed', counter: true
  },
  shuriken: {
    id: 'shuriken', name: 'Power Coupler', art: '🔗',
    description: 'Every 3 attacks, gain 1 {strength}.',
    trigger: 'onAttackPlayed', counter: true
  },
  du_vu_doll: {
    id: 'du_vu_doll', name: 'Chaos Engine', art: '🔧',
    description: '+1 {strength} per Curse in {deck}.',
    trigger: 'onCombatStart'
  },
  centennial_puzzle: {
    id: 'centennial_puzzle', name: 'Black Box', art: '📦',
    description: 'First {hp} loss each combat: {draw} 3.',
    trigger: 'onLoseHP'
  },
  self_forming_clay: {
    id: 'self_forming_clay', name: 'Reactive Armor', art: '🛡️',
    description: 'Lose {hp}? Gain 3 {block} next {turn}.',
    trigger: 'onLoseHP'
  },
  torii: {
    id: 'torii', name: 'Dampener Field', art: '🔰',
    description: 'Receive ≤5 {damage}? Reduce to 1.',
    trigger: 'onDamageReceived'
  },
  snecko_eye: {
    id: 'snecko_eye', name: 'Chaos Visor', art: '👁️',
    description: '{draw} 2 extra. Card costs randomized 0-3.',
    trigger: 'onTurnStart'
  },
  dead_branch: {
    id: 'dead_branch', name: 'Fabricator', art: '🏭',
    description: '{exhaust} a card? Add random card to {hand}.',
    trigger: 'onExhaust'
  },
  ice_cream: {
    id: 'ice_cream', name: 'Capacitor', art: '🔋',
    description: '{energy} carries over between {turn}s.',
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
          log('Nano Repair Kit restores ' + heal + ' ' + T('hp') + '.');
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
          log('Calibrator activates! Next attack deals double!');
        }
        break;
      case 'meat_on_bone':
        if (gameState.player.currentHp < gameState.player.maxHp * 0.5) {
          var mealHeal = Math.min(12, gameState.player.maxHp - gameState.player.currentHp);
          gameState.player.currentHp += mealHeal;
          log('Emergency Rations ' + T('heal') + 's ' + mealHeal + ' ' + T('hp') + '.');
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
          log('Overcharger grants 1 ' + T('energy') + '!');
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
          log('Targeting Laser grants +1 ' + T('dexterity') + '!');
        }
        break;
      case 'happy_flower':
        if (!gameState.player.relicCounters) gameState.player.relicCounters = {};
        gameState.player.relicCounters.happy_flower = (gameState.player.relicCounters.happy_flower || 0) + 1;
        if (gameState.player.relicCounters.happy_flower >= 3) {
          gameState.player.relicCounters.happy_flower = 0;
          gameState.player.energy += 1;
          log('Solar Cell grants 1 ' + T('energy') + '!');
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
          log('Power Coupler grants +1 ' + T('strength') + '!');
        }
        break;
      case 'du_vu_doll':
        var curseCount = 0;
        for (var dvi = 0; dvi < gameState.player.deck.length; dvi++) {
          if (gameState.player.deck[dvi].type === 'curse') curseCount++;
        }
        if (curseCount > 0) {
          gameState.player.statusEffects.strength = (gameState.player.statusEffects.strength || 0) + curseCount;
          log('Chaos Engine grants +' + curseCount + ' ' + T('strength') + '!');
        }
        break;
      case 'centennial_puzzle':
        if (!gameState.centennialUsed) {
          gameState.centennialUsed = true;
          drawCards(3);
          log('Black Box ' + T('draw') + 's 3 cards!');
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
