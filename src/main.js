const roleDistributor = require('role.distributor');
const roleHarvester   = require('role.harvester');
const roleUpgrader    = require('role.upgrader');
const roleBuilder     = require('role.builder');
const roleMule        = require('role.mule');

require('version');
if (!Memory.SCRIPT_VERSION || Memory.SCRIPT_VERSION !== SCRIPT_VERSION) {
  Memory.SCRIPT_VERSION = SCRIPT_VERSION;
  console.log('Code Version Updated: ' + SCRIPT_VERSION);
}

const CREEP_COUNTS = Object.freeze({
  harvester: 1,
  mule: 1,
  distributor: 1,
  builder: 1,
  upgrader: 1
});
const SPAWN_PRIORITY = Object.freeze({
  distributor: 0,
  mule: 1,
  harvester: 2,
  builder: 3,
  upgrader: 4
});

/*
function creeps_by_role(spawner,role) {
    return _.filter(Game.spawns[spawner].room.find(FIND_MY_CREEPS), c => c.memory.role == role);
}
*/
function spawnCreep(base, roomCreeps, roomName) {
  const memories = Object.keys(Memory.creeps).sort(function (a,b) { return SPAWN_PRIORITY[Memory.creeps[a].role] - SPAWN_PRIORITY[Memory.creeps[b].role]});
  //console.log(JSON.stringify(memories));
  _.forEach(memories, function (memory) {
    //console.log('Looking at memory of: '+memory);
    let status = 2;
    if (memory.includes('-' + roomName + '-') && !roomCreeps.includes(memory)) {
      // console.log("Dead creep, and from this room, respawn");
      const inheritance = Memory.creeps[memory];
      if (inheritance.role === 'harvester') {
        status = roleHarvester.spawn(base, inheritance);
      } else if (inheritance.role === 'distributor') {
        status = roleDistributor.spawn(base, inheritance);
      } else if (inheritance.role === 'mule') {
        status = roleMule.spawn(base, inheritance);
      } else if (inheritance.role === 'builder') {
        status = roleBuilder.spawn(base, inheritance);
      } else if (inheritance.role === 'upgrader') {
        status = roleUpgrader.spawn(base, inheritance);
      } else {
        console.log('Unknown expired creep found(' + memory + '): ' + JSON.stringify(inheritance));
      }

      if (status === 0) {
        console.log('Deleting creep history for: ' + memory);
        delete Memory.creeps[memory];
      } else if (status === ERR_BUSY) {
        console.log("Spawner is busy");
      } else if (status === ERR_NOT_ENOUGH_ENERGY) {
        console.log("Not enough energy");
      } else if (status === ERR_INVALID_ARGS) {
        console.log("Invalid body design");
      }
    } else {
      /*
      console.log("Either not dead, or not from this room");
      if (roomCreeps.includes(memory)) {
        console.log("Dead Creep");
      }
      if (memory.includes('-'+roomName+'-')) {
        console.log("From this room");
      }
      */
    }
  });
}

module.exports.loop = function () {
  if (Game.cpu.bucket >= 7500) {
    Game.cpu.generatePixel();
  }

  for (const base in Game.spawns) {
    const roomName = Game.spawns[base].room.name;
    const towers = Game.spawns[base].room.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_TOWER});
    for (const id in towers) {
      const tower = towers[id];
      if (tower.store[RESOURCE_ENERGY] > tower.store.getFreeCapacity(RESOURCE_ENERGY)) {
        const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
          filter: object => ((object.hits < 300000) && (object.hits < Number.parseInt(object.hitsMax * 0.85, 10)))
        });
        if (closestDamagedStructure) {
          tower.repair(closestDamagedStructure);
        }
      }

      const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      if (closestHostile) {
        tower.attack(closestHostile);
      }
    }

    let creepTarget = 0;
    for (let type in CREEP_COUNTS) {
      creepTarget += CREEP_COUNTS[type];
    }

    const roomCreeps = [];
    for (let name in Game.creeps) {
      if (name.includes('-' + roomName + '-')) {
        roomCreeps.push(name);
        const role = Game.creeps[name].memory.role;
        if (role === 'harvester') {
          roleHarvester.run(Game.creeps[name]);
        } else if (role === 'distributor') {
          roleDistributor.run(Game.creeps[name]);
        } else if (role === 'mule') {
          roleMule.run(Game.creeps[name]);
        } else if (role === 'builder') {
          roleBuilder.run(Game.creeps[name]);
        } else if (role === 'upgrader') {
          roleUpgrader.run(Game.creeps[name]);
        } else {
          console.log('Creep[' + name + ']: unrecognized role: ' + role);
        }
      }
    }
//    console.log("Creeps: "+JSON.stringify(roomCreeps));
//    console.log("Target: "+creepTarget);

    if (Game.spawns[base].spawning) {
      const spawningCreep = Game.creeps[Game.spawns[base].spawning.name];
      Game.spawns[base].room.visual.text(
        '🛠️' + spawningCreep.memory.role,
        Game.spawns[base].pos.x + 1,
        Game.spawns[base].pos.y,
        {align: 'left', opacity: 0.8});
    } else if (roomCreeps.length < creepTarget) {
      console.log('Missing a creep');
      spawnCreep(base, roomCreeps, roomName);
      /*
      for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
          delete Memory.creeps[name];
          console.log('Clearing non-existing creep memory:', name);
        }
      }
      */
    }
  }

  /*
  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    if(creep.memory.role == 'harvester') {
      roleHarvester.run(creep);
    }
    if(creep.memory.role == 'distributor') {
      roleDistributor.run(creep);
    }
    if(creep.memory.role == 'mule') {
      roleMule.run(creep);
    }
    if(creep.memory.role == 'upgrader') {
      roleUpgrader.run(creep);
    }
    if(creep.memory.role == 'builder') {
      roleBuilder.run(creep);
    }
  }
  */
};
