var Utils = require('lib.utils');

function design(maxEnergy) {
  const baseCost  = (1*100)+(1*50)+(1*50);
  const unitCost  = (1*50)+(1*50);
  const avlEnergy = maxEnergy - baseCost;
  const units       = Math.min(5, Math.max(0,Math.floor(avlEnergy/unitCost)));
  const carrBits = units;
  const moveBits = units + (avlEnergy - (units * unitCost)) > 50 ? 1 : 0;
  return [MOVE, CARRY, WORK].concat(new Array(carrBits).fill(CARRY)).concat(new Array(moveBits).fill(MOVE)).sort();
}

var roleDistributor = {
  spawn: function(base,inheritance) {
    let spawn     = Game.spawns[base];
    let energy    = spawn.room.energyAvailable;
    let newName   = Utils.nameCreep('distributor',base);
    if (!inheritance || !inheritance.design) {
      console.log("Missing Inheritance!");
      if (!inheritance) { inheritance = {} }
      inheritance.design = design(energy);
    }

    // eslint-disable-next-line
    const spawnCost = inheritance.design.reduce((s,e) => s+BODYPART_COST[e], 0);
    const newMemory = {role: 'distributor', design: inheritance.design};
    if (energy >= spawnCost) {
      console.log('Spawning Distributor['+energy+']: ' + newName+"\ntemplate: "+ JSON.stringify(inheritance.design)+"\nmemory: "+JSON.stringify(newMemory));
      return spawn.spawnCreep(inheritance.design, newName, {memory: newMemory});
    }

    const tempDesign = design(energy);
    console.log('Spawning Distributor[' + energy + ']: ' + newName + '\ntemplate: ' + JSON.stringify(tempDesign) +
      '\nmemory: ' + JSON.stringify(newMemory));
    return spawn.spawnCreep(tempDesign, newName, {memory: newMemory});
  },
  /** @param {Creep} creep **/
  run: function(creep) {
    if (creep.memory.storing && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.storing = false;
      creep.say('🔄 charge');
    }
    if (!creep.memory.storing && creep.store.getFreeCapacity() == 0) {
      creep.memory.storing = true;
      creep.say('⚡  hauling');
    }

    if (creep.memory.storing) {
      let ext = creep.pos.findClosestByPath(Utils.getChargeExtension(creep.room.name));
      let spn = creep.pos.findClosestByPath(Utils.getChargeSpawner(creep.room.name));
      let twr = creep.pos.findClosestByPath(Utils.getChargeTower(creep.room.name));
      let target = [ext,spn,twr].filter((i) => {return i != null;})[0];
      if (target!==null) {
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {visualizePathStyle: {stroke: '#aaffaa'}});
        }
      } else {
        let parks = creep.room.find(FIND_FLAGS);
        creep.moveTo(parks[0], {visualizePathStyle: {stroke: '#ffffaa'}});
      }
    } else {
      Utils.fetchEnergy(creep.name);
    }
  }
};

module.exports = roleDistributor;
