var Utils = require('lib.utils');

function design(maxEnergy) {
  const baseCost = BODYPART_COST[WORK] + BODYPART_COST[CARRY] + BODYPART_COST[MOVE];
  const unitCost = baseCost;
  const   energy = maxEnergy - baseCost;
  const    units = Math.min(4, Math.max(0, Math.floor(energy / unitCost)));
  const workBits = units;
  const carrBits = Math.min(5, units + Math.max(0, Math.floor((energy - (units * unitCost)) / BODYPART_COST[WORK])));
  const moveBits = Math.min(6, units + Math.floor((energy-(units*unitCost)-((carrBits-workBits)*BODYPART_COST[CARRY]))/BODYPART_COST[CARRY]));
  console.log('workBits: ' + workBits + ', carrBits: ' + carrBits + ', moveBits: ' + moveBits);
  return [MOVE, CARRY, WORK].concat(new Array(workBits).fill(WORK)).concat(new Array(carrBits).fill(CARRY)).concat(new Array(moveBits).fill(MOVE)).sort();
}
var roleBuilder = {
  spawn: function(base, inheritance) {
    const spawn   = Game.spawns[base];
    const energy  = spawn.room.energyAvailable;
    const newName = Utils.nameCreep('builder', base);
    if (!inheritance || !inheritance.design) {
      console.log('Missing inheritance!');
      if (!inheritance) {
        inheritance = {};
      }

      inheritance.design = design(energy);
    }

    // eslint-disable-next-line
    const spawnCost = inheritance.design.reduce((s, e) => s+BODYPART_COST[e], 0);
    const newMemory = {role: 'builder', design: inheritance.design};
    if (energy >= spawnCost) {
      console.log('Spawning Builder[' + energy + ']: ' + newName + '\ntemplate: ' + JSON.stringify(inheritance.design) +
        '\nmemory: ' + JSON.stringify(newMemory));
      return spawn.spawnCreep(inheritance.design, newName, {memory: newMemory});
    }

    const tempDesign = design(energy);
    console.log('Spawning Builder[' + energy + ']: ' + newName + '\ntemplate: ' + JSON.stringify(tempDesign) +
      '\nmemory: ' + JSON.stringify(newMemory));
    return spawn.spawnCreep(tempDesign, newName, {memory: newMemory});
  },
  /** @param {Creep} creep **/
  run: function(creep) {
    function findRepairable(minHits,healthPercent) {
      return creep.room.find(FIND_STRUCTURES, {
        filter: object => ((object.hits < minHits) && (object.hits < parseInt(object.hitsMax*healthPercent)))
      });
    }
    function findRepairableWall(minHits,healthPercent) {
      return creep.room.find(FIND_STRUCTURES, {
        filter: object => ((object.hits < minHits) && (object.hits < parseInt(object.hitsMax*healthPercent)))
      });
    }
    function doBuilding() {
      var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#aa00ff'}});
        }
      }
    }
    function doRepairs() {
      let targets = findRepairable(250000,0.75);
      if (creep.store[RESOURCE_ENERGY] > 0 && targets.length > 0) {
        let target  = creep.pos.findClosestByPath(targets);
        if (creep.repair(target) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
        }
      }
    }
    if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.building = false;
      creep.say('🔄 charge');
    }
    if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
      creep.memory.building = true;
      creep.say('🚧 build');
    }

    if (creep.memory.building) {
      if (creep.room.find(FIND_CONSTRUCTION_SITES).length>0) {
        doBuilding();
      } else if (findRepairable(250000,0.75).length > 0) {
        doRepairs();
      } else {
        if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
          creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#00aaff'}});
        }
      }
    } else {
      Utils.fetchEnergy(creep.name);
    }
  }
};

module.exports = roleBuilder;
