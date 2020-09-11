var Utils = require('lib.utils');

function design(maxEnergy) {
  const baseCost  = (1*100)+(1*50)+(1*50);
  const unitCost  = baseCost;
  let energy      = maxEnergy - baseCost;
  let units       = Math.max(0,Math.floor(energy/unitCost));
  let workBits    = units;
  let carrBits    = units + Math.floor((energy-(units*unitCost))/100);
  let moveBits    = units + Math.floor((energy-(units*unitCost)-((carrBits-workBits)*50))/50);
  console.log("workBits: "+workBits+", carrBits: "+carrBits+", moveBits: "+moveBits);
  return [MOVE,CARRY,WORK].concat(Array(workBits).fill(WORK)).concat(Array(carrBits).fill(CARRY)).concat(Array(moveBits).fill(MOVE)).sort();
}
var roleBuilder = {
    spawn: function(base) {
        let energy = parseInt(Game.spawns[base].room.energyAvailable/50)*50;
        if (!Game.spawns[base].spawning && energy == Game.spawns[base].room.energyCapacityAvailable) {
            let newName = Utils.nameCreep('builder',base);
            let template = design(energy);
            console.log('Spawning new builder: ' + newName+"\ntemplate: "+template);
            Game.spawns[base].spawnCreep(template, newName, {memory: {role: 'builder'}});
        }
    },
    /** @param {Creep} creep **/
    run: function(creep) {
        function findRepairable() {
            return creep.room.find(FIND_STRUCTURES, {
                filter: object => ((object.hits < 1200000) && (object.hits < parseInt(object.hitsMax*0.75)))
            });
        }
        function doBuilding() {
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#aa00ff'}});
                }
            }
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
	    if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('🔄 charge');
	    }
	    if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
	        creep.memory.building = true;
	        creep.say('🚧 build');
	    }

	    if(creep.memory.building) {
	        if (creep.room.find(FIND_CONSTRUCTION_SITES).length>0) {
                doBuilding();
	        } else if (findRepairable().length > 0) {
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

module.exports = roleBuilder;
