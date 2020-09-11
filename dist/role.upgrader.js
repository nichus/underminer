var Utils = require('lib.utils');

function design(maxEnergy) {
  const baseCost  = (1*100)+(1*50)+(1*50);
  const unitCost  = (1*50)+(1*50);
  maxEnergy       = maxEnergy - baseCost;
  let units       = Math.max(0,Math.floor(maxEnergy/unitCost));
  let workBits    = 0;
  let carrBits    = units
  let moveBits    = units + (Math.floor((maxEnergy-(unitCost*units))/50));
  return [MOVE,CARRY,WORK].concat(Array(workBits).fill(WORK)).concat(Array(carrBits).fill(CARRY)).concat(Array(moveBits).fill(MOVE)).sort();
}
var roleUpgrader = {
    spawn: function(base) {
        let spawn     = Game.spawns[base];
        let energy    = spawn.room.energyAvailable;
        if (!spawn.spawning && energy == spawn.room.energyCapacityAvailable) {
            let template = design(energy);
            let newName = Utils.nameCreep('upgrader',base);
            console.log('Spawning Upgrader['+energy+']: ' + newName+"\ntemplate: "+JSON.stringify(template));
            spawn.spawnCreep(design(energy), newName, {memory: {role: 'upgrader'}});
        }
    },

    /** @param {Creep} creep **/
    run: function(creep) {

        function findRepairable() {
            return creep.room.find(FIND_STRUCTURES, { 
                filter: object => ((object.hits < 1200000) && (object.hits < parseInt(object.hitsMax*0.5)))
            });
        }
        function doRepairs() {
            let targets = findRepairable();
            if (creep.store[RESOURCE_ENERGY] > 0 && targets.length > 0) {
                let target  = creep.pos.findClosestByPath(targets);
                if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
        }
        function getEnergy() {
            let drops = creep.pos.findClosestByPath(creep.room.find(FIND_DROPPED_RESOURCES), {
                filter: (d) => { return (d.resourceType == RESOURCE_ENERGY) }
            });
            let containers = creep.room.find(FIND_STRUCTURES, { 
                filter: (s) => { return((s.structureType == STRUCTURE_CONTAINER) && (s.store[RESOURCE_ENERGY] > 0)) }
            });
            let source = creep.pos.findClosestByPath(containers);
            if (drops) {
                if (creep.pickup(drops) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(drops);
                }
            } else if (containers.length>0) {
                if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
        }
        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 charge');
	    }
	    if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
	        creep.memory.upgrading = true;
	        creep.say('⚡ upgrade');
	    }

	    if(creep.memory.upgrading) {
	        if (findRepairable().length > 0) {
                doRepairs();
            } else {
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#00aaff'}});
                }
	        }
	    } else {
	        getEnergy();
	    }
    }
};

module.exports = roleUpgrader;
