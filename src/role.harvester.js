var Utils = require('lib.utils');

function design(maxEnergy) {
  const baseCost  = (2*100)+(1*100);
  maxEnergy       = maxEnergy - baseCost;
  let workBits    = Math.min(4,Math.max(0, Math.floor(maxEnergy/100)));
  return [MOVE,WORK,WORK].concat(Array(workBits).fill(WORK)).sort();
}

var roleHarvester = {
  spawn: function(base,inheritance) {
    let spawn   = Game.spawns[base];
    let energy  = spawn.room.energyAvailable;
    let newName = Utils.nameCreep('harvester',base);
    if (!inheritance || !inheritance.design) {
      console.log('Missing inheritance!');
      if (!inheritance) { inheritance = {}; }
      inheritance.design = design(energy);
    }
    let spawnCost   = inheritance.design.reduce((s,e) => s+BODYPART_COST[e], 0);
    if (energy >= spawnCost) {
      let memory  = {role: 'harvester', container: inheritance.container, design: inheritance.design};
      console.log('Spawning Harvester['+energy+']: ' + newName+"\ntemplate: "+ JSON.stringify(inheritance.design)+"\nmemory: "+JSON.stringify(memory));
      return spawn.spawnCreep(inheritance.design, newName, {memory: memory});
    }
    return 1;
  },
  /** @param {Creep} creep **/
  run: function(creep) {
    let container = creep.memory.container;
    if (typeof container === 'undefined') {
      const containers = creep.room.find(FIND_STRUCTURES, {
        filter: (s) => { return((s.structureType == STRUCTURE_CONTAINER) && (s.store[RESOURCE_ENERGY] < s.storeCapacity)) }
      });
      container = creep.pos.findClosestByPath(containers);
    } else {
      container = Game.getObjectById(container);
    }
    if (creep.pos.getRangeTo(container) == 0) {
      let source = creep.pos.findClosestByPath(FIND_SOURCES);
      creep.harvest(source);
    } else {
      creep.moveTo(container);
    }
  }
};

module.exports = roleHarvester;
