// Enemy Database - all enemy definitions
var ENEMY_DATABASE = {
  jaw_worm: {
    id: 'jaw_worm',
    name: 'Space Slug',
    sprite: 'assets/enemies/space-slug.png',
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
          label: 'Power Up',
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
    name: 'Rogue Android',
    sprite: 'assets/enemies/rogue-android.png',
    maxHp: [48, 54],
    getNextIntent: function(enemy, turnNumber) {
      if (turnNumber === 0) {
        return {
          type: 'buff',
          label: 'Self-Upgrade',
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
    name: 'Space Flea',
    sprite: 'assets/enemies/space-flea.png',
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
    name: 'Enforcer Bot',
    sprite: 'assets/enemies/enforcer-bot.png',
    maxHp: [82, 86],
    getNextIntent: function(enemy, turnNumber) {
      if (turnNumber === 0) {
        return {
          type: 'buff',
          label: 'War Protocol',
          effects: [{ type: 'applyBuff', status: 'strength', value: 2 }, { type: 'applyBuff', status: 'enrage', value: 2 }]
        };
      }
      // Alternates between big attack and medium attack
      if (turnNumber % 2 === 1) {
        return {
          type: 'attack',
          label: 'Ram',
          effects: [{ type: 'damage', value: 14 }]
        };
      } else {
        return {
          type: 'attack',
          label: 'Concussion Blast',
          effects: [{ type: 'damage', value: 6 }, { type: 'applyStatus', status: 'vulnerable', value: 2 }]
        };
      }
    }
  },
  lagavulin: {
    id: 'lagavulin',
    name: 'Sentinel Drone',
    sprite: 'assets/enemies/sentinel-drone.png',
    maxHp: [100, 110],
    getNextIntent: function(enemy, turnNumber) {
      // Sleeps for first 3 turns with 8 block, then attacks
      if (turnNumber < 3 && !enemy._awake) {
        return {
          type: 'defend',
          label: 'Standby',
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
          label: 'System Drain',
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
    name: 'Turret',
    sprite: 'assets/enemies/turret.png',
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
          label: 'EMP Burst',
          effects: [{ type: 'addStatusCard', card: 'dazed', count: 2 }]
        };
      }
    }
  },
  slime_boss: {
    id: 'slime_boss',
    name: 'Plasma Blob',
    sprite: 'assets/enemies/plasma-blob.png',
    maxHp: [150, 150],
    getNextIntent: function(enemy, turnNumber) {
      if (turnNumber % 3 === 0) {
        return {
          type: 'attack',
          label: 'Plasma Crash',
          effects: [{ type: 'damage', value: 35 }]
        };
      } else if (turnNumber % 3 === 1) {
        return {
          type: 'buff',
          label: 'Charging',
          effects: [{ type: 'applyBuff', status: 'strength', value: 3 }]
        };
      } else {
        return {
          type: 'debuff',
          label: 'Plasma Spray',
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
    name: 'Plasma Fragment',
    sprite: 'assets/enemies/plasma-fragment.png',
    maxHp: [65, 65],
    getNextIntent: function(enemy, turnNumber) {
      if (turnNumber % 2 === 0) {
        return {
          type: 'attack',
          label: 'Impact',
          effects: [{ type: 'damage', value: 10 }]
        };
      } else {
        return {
          type: 'debuff',
          label: 'Corrode',
          effects: [{ type: 'applyStatus', status: 'weak', value: 1 }]
        };
      }
    }
  },
  fungi_beast: {
    id: 'fungi_beast',
    name: 'Spore Alien',
    sprite: 'assets/enemies/spore-alien.png',
    maxHp: [22, 28],
    getNextIntent: function(enemy, turnNumber) {
      if (turnNumber % 2 === 0) {
        return {
          type: 'attack',
          label: 'Acid Bite',
          effects: [{ type: 'damage', value: 6 }, { type: 'applyStatus', status: 'vulnerable', value: 1 }]
        };
      } else {
        return {
          type: 'attack',
          label: 'Germinate',
          effects: [{ type: 'damage', value: 4 }]
        };
      }
    },
    onDeath: function() {
      var wound = createCardInstance('wound');
      if (wound) gameState.player.discardPile.push(wound);
      log('Spore Alien drops a Hull Breach!');
    }
  },
  blue_slime: {
    id: 'blue_slime',
    name: 'Cryo Gel',
    sprite: 'assets/enemies/cryo-gel.png',
    maxHp: [12, 16],
    getNextIntent: function(enemy, turnNumber) {
      if (turnNumber % 2 === 0) {
        return {
          type: 'attack',
          label: 'Impact',
          effects: [{ type: 'damage', value: 5 }]
        };
      } else {
        return {
          type: 'debuff',
          label: 'Freeze',
          effects: [{ type: 'addStatusCard', card: 'slimed', count: 1 }]
        };
      }
    }
  },
  looter: {
    id: 'looter',
    name: 'Space Pirate',
    sprite: 'assets/enemies/space-pirate.png',
    maxHp: [44, 48],
    getNextIntent: function(enemy, turnNumber) {
      if (turnNumber < 2) {
        return {
          type: 'attack',
          label: 'Blaster Shot',
          effects: [{ type: 'damage', value: 10 }]
        };
      } else if (turnNumber === 2) {
        return {
          type: 'buff',
          label: 'Warp Out',
          effects: [{ type: 'escape' }]
        };
      } else {
        return {
          type: 'attack',
          label: 'Blaster Shot',
          effects: [{ type: 'damage', value: 10 }]
        };
      }
    }
  },
  acid_slime_m: {
    id: 'acid_slime_m',
    name: 'Toxic Gel',
    sprite: 'assets/enemies/toxic-gel.png',
    maxHp: [28, 32],
    getNextIntent: function(enemy, turnNumber) {
      var pattern = turnNumber % 3;
      if (pattern === 0) {
        return {
          type: 'attack',
          label: 'Impact',
          effects: [{ type: 'damage', value: 10 }]
        };
      } else if (pattern === 1) {
        return {
          type: 'attack',
          label: 'Acid Spray',
          effects: [{ type: 'damage', value: 8 }, { type: 'addStatusCard', card: 'slimed', count: 1 }]
        };
      } else {
        return {
          type: 'debuff',
          label: 'Corrode',
          effects: [{ type: 'applyStatus', status: 'weak', value: 1 }]
        };
      }
    }
  },
  spike_slime_m: {
    id: 'spike_slime_m',
    name: 'Volatile Gel',
    sprite: 'assets/enemies/volatile-gel.png',
    maxHp: [28, 32],
    getNextIntent: function(enemy, turnNumber) {
      if (turnNumber % 2 === 0) {
        return {
          type: 'attack',
          label: 'Burst',
          effects: [{ type: 'damage', value: 8 }, { type: 'applyStatus', status: 'frail', value: 1 }]
        };
      } else {
        return {
          type: 'debuff',
          label: 'Corrode',
          effects: [{ type: 'applyStatus', status: 'weak', value: 1 }]
        };
      }
    }
  },
  snecko: {
    id: 'snecko',
    name: 'Serpentoid',
    sprite: 'assets/enemies/serpentoid.png',
    maxHp: [46, 50],
    getNextIntent: function(enemy, turnNumber) {
      if (Math.random() < 0.7) {
        return {
          type: 'attack',
          label: 'Tail Lash',
          effects: [{ type: 'damage', value: 8 }, { type: 'applyStatus', status: 'vulnerable', value: 2 }]
        };
      } else {
        return {
          type: 'attack',
          label: 'Fangs',
          effects: [{ type: 'damage', value: 15 }]
        };
      }
    }
  },
  book_of_stabbing: {
    id: 'book_of_stabbing',
    name: 'Murder-Bot Manual',
    sprite: 'assets/enemies/murder-bot-manual.png',
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
        label: 'Multi-Drill x' + stabCount,
        effects: effects
      };
    }
  },
  awakened_one: {
    id: 'awakened_one',
    name: 'Overlord AI',
    sprite: 'assets/enemies/overlord-ai.png',
    maxHp: [300, 300],
    getNextIntent: function(enemy, turnNumber) {
      // Initialize phase tracking
      if (!enemy._phase) enemy._phase = 1;
      if (!enemy._phasePattern) enemy._phasePattern = 0;

      // Phase transition at 50% HP
      if (enemy._phase === 1 && enemy.currentHp <= enemy.maxHp / 2) {
        enemy._phase = 2;
        enemy._phasePattern = 0;
        // Gain 10 Strength, heal 50 HP on transition
        if (!enemy.statusEffects.strength) enemy.statusEffects.strength = 0;
        enemy.statusEffects.strength += 10;
        enemy.currentHp = Math.min(enemy.maxHp, enemy.currentHp + 50);
        log('The Overlord AI awakens! Strength +10, healed 50 HP!');
        return {
          type: 'buff',
          label: 'Awakened!',
          effects: [{ type: 'applyBuff', status: 'strength', value: 0 }]
        };
      }

      if (enemy._phase === 1) {
        // Phase 1: Slash → Soul Strike → Rebirth
        var p1 = enemy._phasePattern % 3;
        enemy._phasePattern++;
        if (p1 === 0) {
          return {
            type: 'attack',
            label: 'Laser Slash 20',
            effects: [{ type: 'damage', value: 20 }]
          };
        } else if (p1 === 1) {
          return {
            type: 'attack',
            label: 'Data Storm 6x4',
            effects: [
              { type: 'damage', value: 6 },
              { type: 'damage', value: 6 },
              { type: 'damage', value: 6 },
              { type: 'damage', value: 6 }
            ]
          };
        } else {
          return {
            type: 'buff',
            label: 'Self-Repair',
            effects: [
              { type: 'heal', value: 10 },
              { type: 'applyBuff', status: 'strength', value: 2 }
            ]
          };
        }
      } else {
        // Phase 2: Dark Echo → Void → Wrath
        var p2 = enemy._phasePattern % 3;
        enemy._phasePattern++;
        if (p2 === 0) {
          return {
            type: 'attack',
            label: 'Dark Pulse 25',
            effects: [
              { type: 'damage', value: 25 },
              { type: 'applyStatus', status: 'weak', value: 2 }
            ]
          };
        } else if (p2 === 1) {
          return {
            type: 'attack',
            label: 'Gravity Well 15',
            effects: [
              { type: 'damage', value: 15 },
              { type: 'applyStatus', status: 'vulnerable', value: 2 }
            ]
          };
        } else {
          return {
            type: 'attack',
            label: 'Overload 40',
            effects: [{ type: 'damage', value: 40 }]
          };
        }
      }
    }
  },
  nemesis: {
    id: 'nemesis',
    name: 'Bounty Hunter',
    sprite: 'assets/enemies/bounty-hunter.png',
    maxHp: [180, 185],
    getNextIntent: function(enemy, turnNumber) {
      // Every 4th turn (0-indexed: turn 3, 7, 11...): intangible
      if (turnNumber > 0 && turnNumber % 4 === 3) {
        enemy._intangible = true;
        return {
          type: 'buff',
          label: 'Intangible',
          effects: [{ type: 'block', value: 999 }]
        };
      }
      // Cycle: Scythe → Debilitate → Attack
      var cycle = turnNumber % 3;
      if (turnNumber > 0 && (turnNumber - 1) % 4 === 3) {
        // Adjust cycle after intangible turn
        cycle = (turnNumber - Math.floor(turnNumber / 4)) % 3;
      }
      if (cycle === 0) {
        return {
          type: 'attack',
          label: 'Plasma Scythe 45',
          effects: [{ type: 'damage', value: 45 }]
        };
      } else if (cycle === 1) {
        return {
          type: 'debuff',
          label: 'Disruptor',
          effects: [
            { type: 'applyStatus', status: 'weak', value: 3 },
            { type: 'applyStatus', status: 'vulnerable', value: 3 }
          ]
        };
      } else {
        return {
          type: 'attack',
          label: 'Attack 25',
          effects: [{ type: 'damage', value: 25 }]
        };
      }
    }
  },
  the_guardian: {
    id: 'the_guardian',
    name: 'Defense Mainframe',
    sprite: 'assets/enemies/defense-mainframe.png',
    maxHp: [240, 240],
    getNextIntent: function(enemy, turnNumber) {
      // Check for 50% HP threshold - gain 10 strength once
      if (!enemy._enraged && enemy.currentHp <= enemy.maxHp / 2) {
        enemy._enraged = true;
        if (!enemy.statusEffects.strength) enemy.statusEffects.strength = 0;
        enemy.statusEffects.strength += 10;
        log('Defense Mainframe enters overdrive! Strength +10!');
      }
      // Mode switch every 4 turns
      var mode = Math.floor(turnNumber / 4) % 2;
      var phase = turnNumber % 4;
      if (mode === 0) {
        // Offensive mode
        if (phase % 2 === 0) {
          return {
            type: 'attack',
            label: 'Hydraulic Slam',
            effects: [{ type: 'damage', value: 32 }]
          };
        } else {
          return {
            type: 'defend',
            label: 'Vent Coolant',
            effects: [{ type: 'block', value: 9 }]
          };
        }
      } else {
        // Defensive mode
        if (phase % 2 === 0) {
          return {
            type: 'attack',
            label: 'Turret Barrage',
            effects: [{ type: 'damage', value: 5 }, { type: 'damage', value: 5 }, { type: 'damage', value: 5 }, { type: 'damage', value: 5 }]
          };
        } else {
          return {
            type: 'buff',
            label: 'Recharge',
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
