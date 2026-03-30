var MAP_CONFIG = {
  floors: 15,
  nodesPerFloor: 4,
  pathCount: 4
};

var NODE_TYPES = {
  fight: { icon: '\u2694\uFE0F', label: 'Fight' },
  elite: { icon: '\uD83D\uDD25', label: 'Elite' },
  rest: { icon: '\uD83C\uDFD5\uFE0F', label: 'Rest' },
  shop: { icon: '\uD83D\uDCB0', label: 'Shop' },
  event: { icon: '\u2753', label: 'Event' },
  treasure: { icon: '\uD83D\uDC8E', label: 'Treasure' },
  boss: { icon: '\uD83D\uDC80', label: 'Boss' }
};

// Normal enemy pools for map fights
var FIGHT_POOLS = [
  ['jaw_worm'],
  ['cultist'],
  ['red_louse', 'red_louse'],
  ['jaw_worm', 'red_louse'],
  ['fungi_beast', 'fungi_beast'],
  ['blue_slime', 'blue_slime', 'blue_slime'],
  ['looter']
];

var FIGHT_POOLS_EASY = [
  ['jaw_worm'],
  ['red_louse', 'red_louse'],
  ['fungi_beast', 'fungi_beast'],
  ['blue_slime', 'blue_slime']
];

var FIGHT_POOLS_MEDIUM = [
  ['cultist'],
  ['jaw_worm', 'red_louse'],
  ['blue_slime', 'blue_slime', 'blue_slime'],
  ['looter'],
  ['fungi_beast', 'red_louse']
];

var FIGHT_POOLS_HARD = [
  ['cultist', 'red_louse'],
  ['jaw_worm', 'jaw_worm'],
  ['fungi_beast', 'red_louse', 'red_louse'],
  ['looter', 'red_louse']
];

var ELITE_POOL = ['nob', 'lagavulin'];

function generateMap() {
  var floors = [];

  for (var f = 0; f < MAP_CONFIG.floors; f++) {
    var floor = [];
    var nodeCount = MAP_CONFIG.nodesPerFloor;

    for (var n = 0; n < nodeCount; n++) {
      var type = getNodeType(f);
      floor.push({
        type: type,
        x: n,
        floor: f,
        connections: [],
        visited: false,
        available: false
      });
    }
    floors.push(floor);
  }

  // Generate paths through the map
  for (var p = 0; p < MAP_CONFIG.pathCount; p++) {
    var currentNode = p % MAP_CONFIG.nodesPerFloor;
    for (var f2 = 0; f2 < MAP_CONFIG.floors - 1; f2++) {
      // Connect to next floor
      var nextNode = currentNode + Math.floor(Math.random() * 3) - 1;
      nextNode = Math.max(0, Math.min(MAP_CONFIG.nodesPerFloor - 1, nextNode));

      // Add connection if not already there
      var conn = floors[f2][currentNode].connections;
      if (conn.indexOf(nextNode) === -1) {
        conn.push(nextNode);
        conn.sort();
      }
      currentNode = nextNode;
    }
  }

  // Force last floor to be boss
  floors[MAP_CONFIG.floors - 1] = [{
    type: 'boss',
    x: 0,
    floor: MAP_CONFIG.floors - 1,
    connections: [],
    visited: false,
    available: false
  }];
  // Connect all second-to-last floor nodes to boss
  for (var n2 = 0; n2 < floors[MAP_CONFIG.floors - 2].length; n2++) {
    if (floors[MAP_CONFIG.floors - 2][n2].connections.length > 0 || hasPathTo(floors, MAP_CONFIG.floors - 2, n2)) {
      floors[MAP_CONFIG.floors - 2][n2].connections = [0];
    }
  }

  // Mark first floor as available
  for (var n3 = 0; n3 < floors[0].length; n3++) {
    if (floors[0][n3].connections.length > 0) {
      floors[0][n3].available = true;
    }
  }

  return {
    floors: floors,
    currentFloor: -1,
    currentNode: -1
  };
}

function hasPathTo(floors, floorIdx, nodeIdx) {
  if (floorIdx === 0) return true;
  for (var n = 0; n < floors[floorIdx - 1].length; n++) {
    if (floors[floorIdx - 1][n].connections.indexOf(nodeIdx) !== -1) {
      return true;
    }
  }
  return false;
}

function getNodeType(floor) {
  if (floor === 0) return 'fight'; // First floor always fight
  if (floor === MAP_CONFIG.floors - 2) return 'rest'; // Before boss always rest
  if (floor === MAP_CONFIG.floors - 1) return 'boss';

  var roll = Math.random();
  if (floor >= 5 && roll < 0.08) return 'elite';
  if (roll < 0.08 + 0.03) return 'treasure';
  if (roll < 0.08 + 0.03 + 0.05) return 'shop';
  if (roll < 0.08 + 0.03 + 0.05 + 0.12) return 'rest';
  if (roll < 0.08 + 0.03 + 0.05 + 0.12 + 0.22) return 'event';
  return 'fight';
}

function selectMapNode(floorIdx, nodeIdx) {
  var map = gameState.map;
  var node = map.floors[floorIdx][nodeIdx];

  if (!node.available) return;

  // Mark as visited
  node.visited = true;
  node.available = false;
  map.currentFloor = floorIdx;
  map.currentNode = nodeIdx;

  // Clear all availability
  for (var f = 0; f < map.floors.length; f++) {
    for (var n = 0; n < map.floors[f].length; n++) {
      map.floors[f][n].available = false;
    }
  }

  // Mark next floor connections as available
  if (node.connections.length > 0) {
    for (var c = 0; c < node.connections.length; c++) {
      var nextFloor = floorIdx + 1;
      if (nextFloor < map.floors.length) {
        map.floors[nextFloor][node.connections[c]].available = true;
      }
    }
  }

  // Hide map before transitioning
  hideOverlays();

  // Handle the node type
  switch (node.type) {
    case 'fight':
      var fightPool;
      if (floorIdx < 5) {
        fightPool = FIGHT_POOLS_EASY;
      } else if (floorIdx < 10) {
        fightPool = FIGHT_POOLS_MEDIUM;
      } else {
        fightPool = FIGHT_POOLS_HARD;
      }
      var pool = fightPool[Math.floor(Math.random() * fightPool.length)];
      initCombat(pool);
      break;
    case 'elite':
      var eliteRoll = Math.random();
      var eliteEnemies;
      if (eliteRoll < 0.33) {
        eliteEnemies = ['nob'];
      } else if (eliteRoll < 0.66) {
        eliteEnemies = ['lagavulin'];
      } else {
        eliteEnemies = ['sentry', 'sentry', 'sentry'];
      }
      initCombat(eliteEnemies);
      gameState.isEliteFight = true;
      break;
    case 'boss':
      var bossId = ENEMY_DATABASE['slime_boss'] ? 'slime_boss' : 'jaw_worm';
      initCombat([bossId]);
      gameState.isBossFight = true;
      break;
    case 'rest':
      gameState.phase = 'rest';
      renderCombat();
      showRestScreen();
      break;
    case 'shop':
      gameState.phase = 'shop';
      renderCombat();
      showShopScreen();
      break;
    case 'event':
      gameState.phase = 'event';
      renderCombat();
      showEventScreen();
      break;
    case 'treasure':
      gameState.phase = 'reward';
      // Give a random relic
      var relicChoices = getRandomRelics(1);
      if (relicChoices.length > 0) {
        gameState.player.relics.push(relicChoices[0]);
        log('Found ' + RELIC_DATABASE[relicChoices[0]].name + '!');
      }
      gameState.player.gold += 50 + Math.floor(Math.random() * 50);
      returnToMap();
      break;
  }
}

function returnToMap() {
  gameState.phase = 'map';
  saveGame();
  gameState.isEliteFight = false;
  gameState.isBossFight = false;

  // Check if all floors cleared (boss beaten)
  if (gameState.map.currentFloor >= MAP_CONFIG.floors - 1) {
    gameState.phase = 'victory';
    showGameOverScreen(true);
    return;
  }

  renderCombat();
  showMapScreen();
}
