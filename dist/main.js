var roleHarvester   = require('role.harvester');
var roleUpgrader    = require('role.upgrader');
var roleBuilder     = require('role.builder');
var roleWorker      = require('role.worker');
var roleMule        = require('role.mule');
var spawner         = require('spawner');

function creeps_by_role(spawner,role) {
    return _.filter(Game.spawns[spawner].room.find(FIND_MY_CREEPS), c => c.memory.role == role);
}

module.exports.loop = function () {

    for (let base in Game.spawns) {
        let towers = Game.spawns[base].room.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_TOWER});
        for (id in towers) {
          let tower = towers[id];
          if (tower.store[RESOURCE_ENERGY] > tower.store.getFreeCapacity(RESOURCE_ENERGY)) {
            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (object) => (object.hits < 250000) && (object.hits < parseInt(object.hitsMax*0.75))
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

        let harvesters  = creeps_by_role(base,"harvester");
        let workers     = creeps_by_role(base,"worker");
        let builders    = creeps_by_role(base,"builder");
        let upgraders   = creeps_by_role(base,"upgrader");
        let mules       = creeps_by_role(base,"mule");

        if (harvesters.length < 2) {
            roleHarvester.spawn(base);
        } else if (mules.length < 2) {
            roleMule.spawn(base);
        } else if (builders.length < 2) {
            roleBuilder.spawn(base);
        } else if (upgraders.length < 0) {
            roleUpgrader.spawn(base);
        }

        for (var name in Memory.creeps) {
          if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
          }
        }

        if(Game.spawns[base].spawning) {
            let spawningCreep = Game.creeps[Game.spawns[base].spawning.name];
            Game.spawns[base].room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                Game.spawns[base].pos.x + 1,
                Game.spawns[base].pos.y,
                {align: 'left', opacity: 0.8});
        }
    }

    for (let name in Game.creeps) {
        let creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'mule') {
            roleMule.run(creep);
        }
        /*
        if (creep.memory.role == 'worker') {
            roleWorker.run(creep);
        }
        */
    }
}
