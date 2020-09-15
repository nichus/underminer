var roleDistributor = require('role.distributor');
var roleHarvester   = require('role.harvester');
var roleUpgrader    = require('role.upgrader');
var roleBuilder     = require('role.builder');
var roleWorker      = require('role.worker');
var roleMule        = require('role.mule');
var spawner         = require('spawner');

const CREEP_COUNTS = Object.freeze({
  harvester: 2,
  mule: 2,
  distributor: 1,
  builder: 1,
  upgrader: 1
});

function creeps_by_role(spawner,role) {
    return _.filter(Game.spawns[spawner].room.find(FIND_MY_CREEPS), c => c.memory.role == role);
}
function spawnCreep(base,roomCreeps,roomName) {
  for (memory in Memory.creeps) {
    //console.log('Looking at memory of: '+memory);
    let status = 2;
    if (memory.includes('-'+roomName+'-') && !roomCreeps.includes(memory)) {
      //console.log("Dead creep, and from this room, respawn");
      let inheritance = Memory.creeps[memory];
      if (inheritance.role == 'harvester') {
        status = roleHarvester.spawn(base,inheritance);
      } else if (inheritance.role == 'distributor') {
        status = roleDistributor.spawn(base,inheritance);
      } else if (inheritance.role == 'mule') {
        status = roleMule.spawn(base,inheritance);
      } else if (inheritance.role == 'builder') {
        status = roleBuilder.spawn(base,inheritance);
      } else if (inheritance.role == 'upgrader') {
        status = roleUpgrader.spawn(base,inheritance);
      } else {
        console.log('Unknown expired creep found('+memory+'): '+JSON.stringify(inheritance));
      }
      if (status == 0) {
        console.log("Deleting creep history for: "+memory);
        delete Memory.creeps[memory];
        return
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
  }
}

module.exports.loop = function () {

  for (let base in Game.spawns) {
    let roomName = Game.spawns[base].room.name;
    let towers = Game.spawns[base].room.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_TOWER});
    for (id in towers) {
      let tower = towers[id];
      if (tower.store[RESOURCE_ENERGY] > tower.store.getFreeCapacity(RESOURCE_ENERGY)) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (object) => (object.hits < 300000) && (object.hits < parseInt(object.hitsMax*0.85))
        });
        if (closestDamagedStructure) {
          tower.repair(closestDamagedStructure);
        }
      }

      var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      if (closestHostile) {
        tower.attack(closestHostile);
      }
    }

    let creepTarget = 0;
    for (let type in CREEP_COUNTS) {
      creepTarget += CREEP_COUNTS[type];
    }
    let roomCreeps = [];
    for (let name in Game.creeps) {
      if (name.includes('-'+roomName+'-')) {
        roomCreeps.push(name);
        let role = Game.creeps[name].memory.role;
        if (role == 'harvester') {
          roleHarvester.run(Game.creeps[name]);
        } else if (role == 'distributor') {
          roleDistributor.run(Game.creeps[name]);
        } else if (role == 'mule') {
          roleMule.run(Game.creeps[name]);
        } else if (role == 'builder') {
          roleBuilder.run(Game.creeps[name]);
        } else if (role == 'upgrader') {
          roleUpgrader.run(Game.creeps[name]);
        } else {
          console.log('Creep['+name+']: unrecognized role: '+role);
        }
      }
    }
//    console.log("Creeps: "+JSON.stringify(roomCreeps));
//    console.log("Target: "+creepTarget);

    if (Game.spawns[base].spawning) {
      let spawningCreep = Game.creeps[Game.spawns[base].spawning.name];
      Game.spawns[base].room.visual.text(
          '🛠️' + spawningCreep.memory.role,
          Game.spawns[base].pos.x + 1,
          Game.spawns[base].pos.y,
          {align: 'left', opacity: 0.8});
    } else if (roomCreeps.length < creepTarget) {
      console.log("Missing a creep");
      spawnCreep(base,roomCreeps,roomName);
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
    //if (creep.memory.role == 'worker') {
    //  roleWorker.run(creep);
    //}
  }
  */
}
