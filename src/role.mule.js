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

var roleMule = {
  spawn: function(base,inheritance) {
    let spawn       = Game.spawns[base];
    let energy      = spawn.room.energyAvailable;
    let newName     = Utils.nameCreep('mule',base);
    if (!inheritance || !inheritance.design) {
      console.log('Missing Inheritance!');
      if (!inheritance) { inheritance = {}; }
      inheritance.design = design(energy);
    }
    let spawnCost   = inheritance.design.reduce((s,e) => s+BODYPART_COST[e], 0);
    if (energy >= spawnCost) {
      let memory  = { role: 'mule', container: inheritance.container, design: inheritance.design };
      //let memory   = { role: 'mule', container: inheritance.container };
      console.log('Spawning Mule['+energy+']: ' + newName+"\ntemplate: "+ JSON.stringify(inheritance.design)+"\nmemory: "+JSON.stringify(memory));
      return spawn.spawnCreep(inheritance.design, newName, {memory: memory});
    }
    return 1;
  },
  /** @param {Creep} creep **/
  run: function(creep) {
    if (creep.memory.storing && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.storing = false;
      creep.say('🔄 collect');
    }
    if (!creep.memory.storing && creep.store.getFreeCapacity() == 0) {
      creep.memory.storing = true;
      creep.say('⚡ deposit');
    }

    if (creep.memory.storing) {
      let target = creep.pos.findClosestByPath(creep.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return (structure.structureType == STRUCTURE_STORAGE && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
          }
        })
      );
      if (target!==null) {
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {visualizePathStyle: {stroke: '#aaffaa'}});
        }
      } else {
        let parks = creep.room.find(FIND_FLAGS);
        creep.moveTo(parks[0], {visualizePathStyle: {stroke: '#ffffaa'}});
      }
    } else {
      let drops = creep.pos.findClosestByPath(creep.room.find(FIND_DROPPED_RESOURCES), {
          filter: (d) => { return (d.resourceType == RESOURCE_ENERGY) }
      });
      let container = Game.getObjectById(creep.memory.container);
      if (drops) {
        if (creep.pickup(drops) == ERR_NOT_IN_RANGE) {
          creep.moveTo(drops,  {visualizePathStyle: {stroke: '#ffaa00'}});
        }
        if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          // do nothing;
        }
      } else {
        if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
      }
    }
  }
};

module.exports = roleMule;
