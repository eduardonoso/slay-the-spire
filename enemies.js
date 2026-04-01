// Enemy Database - all enemy definitions
var ENEMY_DATABASE = {
  jaw_worm: {
    id: 'jaw_worm',
    name: 'Jaw Worm',
    sprite: '🐛',
    maxHp: [40, 44],
    getNextIntent: function(enemy, turnNumber) {
      var pattern = turnNumber % 3;
      if (pattern === 0) {
        return {
          type: 'attack',
          label: 'Attack 11',
          effects: [{ type: 'damage', value: 11 }]
        };
      } else if (pattern === 1) {
        return {
          type: 'buff',
          label: 'Bellow',
          effects: [
            { type: 'block', value: 6 },
            { type: 'applyBuff', status: 'strength', value: 3 }
          ]
        };
      } else {
        return {
          type: 'attack',
          label: 'Attack 7',
          effects: [{ type: 'damage', value: 7 }]
        };
      }
    }
  },
  cultist: {
    id: 'cultist',
    name: 'Cultist',
    sprite: '🧙',
    maxHp: [48, 54],
    getNextIntent: function(enemy, turnNumber) {
      if (turnNumber === 0) {
        return {
          type: 'buff',
          label: 'Incantation',
          effects: [{ type: 'applyBuff', status: 'strength', value: 3 }]
        };
      }
      return {
        type: 'attack',
        label: 'Attack 6',
        effects: [{ type: 'damage', value: 6 }]
      };
    }
  },
  red_louse: {
    id: 'red_louse',
    name: 'Red Louse',
    sprite: '🐞',
    maxHp: [10, 15],
    getNextIntent: function(enemy, turnNumber) {
      if (Math.random() < 0.75) {
        var dmg = 5 + Math.floor(Math.random() * 3); // 5-7
        return {
          type: 'attack',
          label: 'Attack ' + dmg,
          effects: [{ type: 'damage', value: dmg }]
        };
      } else {
        var blk = 3 + Math.floor(Math.random() * 5); // 3-7
        return {
          type: 'defend',
          label: 'Curl Up',
          effects: [{ type: 'block', value: blk }]
        };
      }
    }
  },
  nob: {
    id: 'nob',
    name: 'Gremlin Nob',
    sprite: '👹',
    maxHp: [82, 86],
    getNextIntent: function(enemy, turnNumber) {
      if (turnNumber === 0) {
        return {
          type: 'buff',
          label: 'Bellow',
          effects: [{ type: 'applyBuff', status: 'strength', value: 2 }, { type: 'applyBuff', status: 'enrage', value: 2 }]
        };
      }
      // Alternates between big attack and medium attack
      if (turnNumber % 2 === 1) {
        return {
          type: 'attack',
          label: 'Rush',
          effects: [{ type: 'damage', value: 14 }]
        };
      } else {
        return {
          type: 'attack',
          label: 'Skull Bash',
          effects: [{ type: 'damage', value: 6 }, { type: 'applyStatus', status: 'vulnerable', value: 2 }]
        };
      }
    }
  },
  lagavulin: {
    id: 'lagavulin',
    name: 'Lagavulin',
    sprite: '🐉',
    maxHp: [100, 110],
    getNextIntent: function(enemy, turnNumber) {
      // Sleeps for first 3 turns with 8 block, then attacks
      if (turnNumber < 3 && !enemy._awake) {
        return {
          type: 'defend',
          label: 'Sleeping',
          effects: [{ type: 'block', value: 8 }]
        };
      }
      enemy._awake = true;
      if (turnNumber % 3 === 0 || (turnNumber < 3 && enemy._awake)) {
        return {
          type: 'attack',
          label: 'Attack 18',
          effects: [{ type: 'damage', value: 18 }]
        };
      } else if (turnNumber % 3 === 1) {
        return {
          type: 'debuff',
          label: 'Siphon Soul',
          effects: [{ type: 'applyStatus', status: 'weak', value: 1 }, { type: 'applyDebuff', status: 'strength', value: -1 }]
        };
      } else {
        return {
          type: 'attack',
          label: 'Attack 18',
          effects: [{ type: 'damage', value: 18 }]
        };
      }
    }
  },
  sentry: {
    id: 'sentry',
    name: 'Sentry',
    sprite: '🗿',
    maxHp: [38, 42],
    getNextIntent: function(enemy, turnNumber) {
      if (turnNumber % 2 === 0) {
        return {
          type: 'attack',
          label: 'Attack 9',
          effects: [{ type: 'damage', value: 9 }]
        };
      } else {
        return {
          type: 'debuff',
          label: 'Bolt',
          effects: [{ type: 'addStatusCard', card: 'dazed', count: 2 }]
        };
      }
    }
  },
  slime_boss: {
    id: 'slime_boss',
    name: 'Slime Boss',
    sprite: '🟢',
    maxHp: [140, 140],
    getNextIntent: function(enemy, turnNumber) {
      if (turnNumber % 3 === 0) {
        return {
          type: 'attack',
          label: 'Slam',
          effects: [{ type: 'damage', value: 35 }]
        };
      } else if (turnNumber % 3 === 1) {
        return {
          type: 'buff',
          label: 'Preparing',
          effects: [{ type: 'applyBuff', status: 'strength', value: 3 }]
        };
      } else {
        return {
          type: 'debuff',
          label: 'Goop Spray',
          effects: [{ type: 'addStatusCard', card: 'slimed', count: 3 }]
        };
      }
    },
    onDamaged: function(enemy) {
      if (!enemy._hasSplit && enemy.currentHp <= enemy.maxHp / 2) {
        enemy._hasSplit = true;
        return 'split';
      }
      return null;
    }
  },
  medium_slime: {
    id: 'medium_slime',
    name: 'Med Slime',
    sprite: '🟡',
    maxHp: [65, 65],
    getNextIntent: function(enemy, turnNumber) {
      if (turnNumber % 2 === 0) {
        return {
          type: 'attack',
          label: 'Tackle',
          effects: [{ type: 'damage', value: 10 }]
        };
      } else {
        return {
          type: 'debuff',
          label: 'Lick',
          effects: [{ type: 'applyStatus', status: 'weak', value: 1 }]
        };
      }
    }
  },
  fungi_beast: {
    id: 'fungi_beast',
    name: 'Fungi Beast',
    sprite: '🍄',
    maxHp: [22, 28],
    getNextIntent: function(enemy, turnNumber) {
      if (turnNumber % 2 === 0) {
        return {
          type: 'attack',
          label: 'Bite',
          effects: [{ type: 'damage', value: 6 }, { type: 'applyStatus', status: 'vulnerable', value: 1 }]
        };
      } else {
        return {
          type: 'attack',
          label: 'Grow',
          effects: [{ type: 'damage', value: 4 }]
        };
      }
    },
    onDeath: function() {
      var wound = createCardInstance('wound');
      if (wound) gameState.player.discardPile.push(wound);
      log('Fungi Beast drops a Wound!');
    }
  },
  blue_slime: {
    id: 'blue_slime',
    name: 'Blue Slime',
    sprite: '🔵',
    maxHp: [12, 16],
    getNextIntent: function(enemy, turnNumber) {
      if (turnNumber % 2 === 0) {
        return {
          type: 'attack',
          label: 'Tackle',
          effects: [{ type: 'damage', value: 5 }]
        };
      } else {
        return {
          type: 'debuff',
          label: 'Goop',
          effects: [{ type: 'addStatusCard', card: 'slimed', count: 1 }]
        };
      }
    }
  },
  looter: {
    id: 'looter',
    name: 'Looter',
    sprite: '🥷',
    maxHp: [44, 48],
    getNextIntent: function(enemy, turnNumber) {
      if (turnNumber < 2) {
        return {
          type: 'attack',
          label: 'Mug',
          effects: [{ type: 'damage', value: 10 }]
        };
      } else if (turnNumber === 2) {
        return {
          type: 'buff',
          label: 'Smoke Bomb',
          effects: [{ type: 'escape' }]
        };
      } else {
        return {
          type: 'attack',
          label: 'Mug',
          effects: [{ type: 'damage', value: 10 }]
        };
      }
    }
  },
  acid_slime_m: {
    id: 'acid_slime_m',
    name: 'Acid Slime',
    sprite: '🟢',
    maxHp: [28, 32],
    getNextIntent: function(enemy, turnNumber) {
      var pattern = turnNumber % 3;
      if (pattern === 0) {
        return {
          type: 'attack',
          label: 'Tackle',
          effects: [{ type: 'damage', value: 10 }]
        };
      } else if (pattern === 1) {
        return {
          type: 'attack',
          label: 'Corrosive',
          effects: [{ type: 'damage', value: 8 }, { type: 'addStatusCard', card: 'slimed', count: 1 }]
        };
      } else {
        return {
          type: 'debuff',
          label: 'Lick',
          effects: [{ type: 'applyStatus', status: 'weak', value: 1 }]
        };
      }
    }
  },
  spike_slime_m: {
    id: 'spike_slime_m',
    name: 'Spike Slime',
    sprite: '🔴',
    maxHp: [28, 32],
    getNextIntent: function(enemy, turnNumber) {
      if (turnNumber % 2 === 0) {
        return {
          type: 'attack',
          label: 'Flame Tackle',
          effects: [{ type: 'damage', value: 8 }, { type: 'applyStatus', status: 'frail', value: 1 }]
        };
      } else {
        return {
          type: 'debuff',
          label: 'Lick',
          effects: [{ type: 'applyStatus', status: 'weak', value: 1 }]
        };
      }
    }
  },
  snecko: {
    id: 'snecko',
    name: 'Snecko',
    sprite: '🐍',
    maxHp: [46, 50],
    getNextIntent: function(enemy, turnNumber) {
      if (Math.random() < 0.7) {
        return {
          type: 'attack',
          label: 'Tail Whip',
          effects: [{ type: 'damage', value: 8 }, { type: 'applyStatus', status: 'vulnerable', value: 2 }]
        };
      } else {
        return {
          type: 'attack',
          label: 'Bite',
          effects: [{ type: 'damage', value: 15 }]
        };
      }
    }
  },
  book_of_stabbing: {
    id: 'book_of_stabbing',
    name: 'Book of Stabbing',
    sprite: '📖',
    maxHp: [160, 168],
    getNextIntent: function(enemy, turnNumber) {
      if (!enemy._stabCount) {
        enemy._stabCount = 2;
      }
      var stabCount = enemy._stabCount;
      var effects = [];
      for (var i = 0; i < stabCount; i++) {
        effects.push({ type: 'damage', value: 6 });
      }
      enemy._stabCount = stabCount + 1;
      return {
        type: 'attack',
        label: 'Multi-Stab x' + stabCount,
        effects: effects
      };
    }
  },
  the_guardian: {
    id: 'the_guardian',
    name: 'The Guardian',
    sprite: '🗿',
    maxHp: [240, 240],
    getNextIntent: function(enemy, turnNumber) {
      // Check for 50% HP threshold - gain 10 strength once
      if (!enemy._enraged && enemy.currentHp <= enemy.maxHp / 2) {
        enemy._enraged = true;
        if (!enemy.statusEffects.strength) enemy.statusEffects.strength = 0;
        enemy.statusEffects.strength += 10;
        log('The Guardian enters a rage! Strength +10!');
      }
      // Mode switch every 4 turns
      var mode = Math.floor(turnNumber / 4) % 2;
      var phase = turnNumber % 4;
      if (mode === 0) {
        // Offensive mode
        if (phase % 2 === 0) {
          return {
            type: 'attack',
            label: 'Fierce Bash',
            effects: [{ type: 'damage', value: 32 }]
          };
        } else {
          return {
            type: 'defend',
            label: 'Vent Steam',
            effects: [{ type: 'block', value: 9 }]
          };
        }
      } else {
        // Defensive mode
        if (phase % 2 === 0) {
          return {
            type: 'attack',
            label: 'Whirlwind',
            effects: [{ type: 'damage', value: 5 }, { type: 'damage', value: 5 }, { type: 'damage', value: 5 }, { type: 'damage', value: 5 }]
          };
        } else {
          return {
            type: 'buff',
            label: 'Charge Up',
            effects: [{ type: 'block', value: 9 }, { type: 'applyBuff', status: 'strength', value: 3 }]
          };
        }
      }
    }
  }
};

function randomInRange(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function createEnemyInstance(enemyId) {
  var template = ENEMY_DATABASE[enemyId];
  if (!template) return null;
  var maxHp = randomInRange(template.maxHp[0], template.maxHp[1]);
  var instance = {
    id: template.id,
    name: template.name,
    sprite: template.sprite,
    maxHp: maxHp,
    currentHp: maxHp,
    block: 0,
    statusEffects: {},
    currentIntent: null,
    getNextIntent: template.getNextIntent,
    dead: false
  };
  if (template.onDamaged) {
    instance.onDamaged = template.onDamaged;
  }
  if (template.onDeath) {
    instance.onDeath = template.onDeath;
  }
  return instance;
}
