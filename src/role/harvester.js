const Utils = require('lib.utils');

function design(maxEnergy) {
  const baseCost = (2 * BODYPART_COST[WORK]) + (1 * BODYPART_COST[MOVE]);
  const avlEnergy = maxEnergy - baseCost;
  const workBits = Math.min(5, Math.max(0, Math.floor(avlEnergy / BODYPART_COST[WORK])));
  return [MOVE, WORK, WORK].concat(new Array(workBits).fill(WORK)).sort();
}

const roleHarvester = {
  spawn: function(base, inheritance) {
    const spawn   = Game.spawns[base];
    const energy  = spawn.room.energyAvailable;
    const newName = Utils.nameCreep('harvester', base);
    if (!inheritance || !inheritance.design) {
      console.log('Missing inheritance!');
      if (!inheritance) {
        inheritance = {};
      }

      inheritance.design = design(energy);
    }

    // eslint-disable-next-line
    const spawnCost = inheritance.design.reduce((s, e) => s + BODYPART_COST[e], 0);
    const newMemory = {role: 'harvester', container: inheritance.container, design: inheritance.design};
    if (energy >= spawnCost) {
      console.log('Spawning Harvester[' + energy + ']: ' + newName + '\ntemplate: ' + JSON.stringify(inheritance.design) +
        '\nmemory: ' + JSON.stringify(newMemory));
      return spawn.spawnCreep(inheritance.design, newName, {memory: newMemory});
    }

    const tempDesign = design(energy);
    console.log('Spawning Harvester[' + energy + ']: ' + newName + '\ntemplate: ' + JSON.stringify(tempDesign) +
      '\nmemory: ' + JSON.stringify(newMemory));
    return spawn.spawnCreep(tempDesign, newName, {memory: newMemory});
  },
  /** @param {Creep} creep **/
  run: function(creep) {
    let container = creep.memory.container;
    if (typeof container === 'undefined') {
      const containers = creep.room.find(FIND_STRUCTURES, {
        filter: s => {
          return ((s.structureType === STRUCTURE_CONTAINER) && (s.store[RESOURCE_ENERGY] < s.storeCapacity));
        }
      });
      container = creep.pos.findClosestByPath(containers);
    } else {
      container = Game.getObjectById(container);
    }

    if (creep.pos.getRangeTo(container) === 0) {
      let source = creep.pos.findInRange(FIND_SOURCES, 1);
      if (source.length === 0) {
        source = creep.pos.findInRange(FIND_MINERALS, 1);
      }

      if (source.length !== 0 && (source[0].energy > 0 || source[0].mineralAmount > 0)) {
        creep.harvest(source[0]);
      }
    } else {
      creep.moveTo(container);
    }
  }
};

module.exports = roleHarvester;
