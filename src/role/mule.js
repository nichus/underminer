var Utils = require('lib.utils');

function design(maxEnergy) {
  const baseCost  = BODYPART_COST[CARRY] + BODYPART_COST[MOVE] + BODYPART_COST[WORK];
  const unitCost  = BODYPART_COST[CARRY] + BODYPART_COST[MOVE];
  let   avlEnergy = maxEnergy - baseCost;
  const units     = Math.min(14, Math.max(0, Math.floor(avlEnergy / unitCost)));
  const carrBits  = units;
  avlEnergy -= ((units * unitCost) + (carrBits * BODYPART_COST[CARRY]));
  const moveBits  = units + Math.min(1, Math.floor(avlEnergy / BODYPART_COST[WORK]));
  const carrArray = new Array(carrBits).fill(CARRY);
  const moveArray = new Array(moveBits).fill(MOVE);
  return [MOVE, CARRY, WORK].concat(carrArray).concat(moveArray).sort();
}

const roleMule = {
  spawn(base, inheritance) {
    const spawn   = Game.spawns[base];
    const energy  = spawn.room.energyAvailable;
    const newName = Utils.nameCreep('mule', base);
    if (!inheritance || !inheritance.design) {
      console.log('Missing Inheritance!');
      if (!inheritance) {
        inheritance = {};
      }

      inheritance.design = design(energy);
    }

    // eslint-disable-next-line
    const spawnCost = inheritance.design.reduce((s,e) => s+BODYPART_COST[e], 0);
    const newMemory = {role: 'mule', container: inheritance.container, design: inheritance.design};
    if (energy >= spawnCost) {
      console.log('Spawning Mule[' + energy + ']: ' + newName + '\ntemplate: ' + JSON.stringify(inheritance.design) +
        '\nmemory: ' + JSON.stringify(newMemory));
      return spawn.spawnCreep(inheritance.design, newName, {memory: newMemory});
    }

    const tDesign = design(energy);
    console.log('Spawning Mule[' + energy + ']: ' + newName + '\ntemplate: ' + JSON.stringify(tDesign) +
      '\nmemory: ' + JSON.stringify(newMemory));
    return spawn.spawnCreep(tDesign, newName, {memory: newMemory});
  },
  /** @param {Creep} creep **/
  run(creep) {
    if (!creep.memory.storage) {
      creep.memory.storage = creep.room.find(FIND_STRUCTURES, {
        filter: structure => {
          return (structure.structureType === STRUCTURE_STORAGE);
        }
      })[0].id;
    }

    if (creep.memory.storing && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.storing = false;
      creep.say('🔄 collect');
    }

    if (!creep.memory.storing && creep.store.getFreeCapacity() === 0) {
      creep.memory.storing = true;
      creep.say('⚡ deposit');
    }

    if (creep.memory.storing) {
      const target = Game.getObjectById(creep.memory.storage);
      if (target !== null) {
        // for
        // const limit = target.store.getCapacity() * 0.5 - target.store.getUsedCapacity(RESOURCE_ENERGY);
        if (creep.pos.getRangeTo(target) <= 1) {
          creep.transfer(target, RESOURCE_ENERGY);
          creep.transfer(target, RESOURCE_KEANIUM);
          creep.transfer(target, RESOURCE_GHODIUM_OXIDE);
          creep.transfer(target, RESOURCE_ZYNTHIUM_HYDRIDE);
        } else {
          creep.moveTo(target, {visualizePathStyle: {stroke: '#aaffaa'}});
        }
      }
    } else {
      const drops = creep.pos.findClosestByPath(creep.room.find(FIND_DROPPED_RESOURCES), {
          // filter: (d) => { return (d.resourceType == RESOURCE_ENERGY) }
      });
      const container = Game.getObjectById(creep.memory.container);
      if (drops) {
        if (creep.pickup(drops) === ERR_NOT_IN_RANGE) {
          creep.moveTo(drops,  {visualizePathStyle: {stroke: '#ffaa00'}});
        }

        if (creep.pos.getRangeTo(container) <= 1) {
          creep.withdraw(container, RESOURCE_ENERGY);
          creep.withdraw(container, RESOURCE_KEANIUM);
        }
      } else if (creep.pos.getRangeTo(container) <= 1) {
        creep.withdraw(container, RESOURCE_ENERGY);
        creep.withdraw(container, RESOURCE_KEANIUM);
      } else {
        creep.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
      }
    }
  }
};

module.exports = roleMule;
