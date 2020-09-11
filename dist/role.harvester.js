var Utils = require('lib.utils');

function design(maxEnergy) {
  const baseCost  = (2*100)+(1*100);
  maxEnergy       = maxEnergy - baseCost;
  let workBits    = Math.min(3,Math.max(0, Math.floor(maxEnergy/100)));
  return [MOVE,WORK,WORK].concat(Array(workBits).fill(WORK)).sort();
}
function claimInheritance(child) {
  let prefix=child.match(/^.*-/)[0];
  for (let name in Memory.creeps) {
    if (!Game.creeps[name] && name.startsWith(prefix)) {
      let inherit = Memory.creeps[name].container;
      let memory = {
        container: inherit
      };
      delete Memory.creeps[name]
      console.log("Inheritinng from: "+name);
      console.log(JSON.stringify(memory));
      return memory.container;
    }
  }
}
var roleHarvester = {
  spawn: function(base) {
    let energy = Game.spawns[base].room.energyAvailable;

    if (!Game.spawns[base].spawning && energy >= 250) {
      let newName = Utils.nameCreep('harvester',base);
      let template = design(energy);
      let inheritance = claimInheritance(newName);
      let memory = {role: 'harvester', container: inheritance};
      console.log('Spawning Harvester['+energy+']: ' + newName+"\ntemplate: "+ JSON.stringify(template)+"\nmemory: "+JSON.stringify(memory));
      Game.spawns[base].spawnCreep(template, newName, {memory: memory});
    }
  },
  /** @param {Creep} creep **/
  run: function(creep) {
    let container = creep.memory.container;
    if (typeof container === 'undefined') {
      let containers = creep.room.find(FIND_STRUCTURES, {
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
