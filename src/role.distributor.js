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
    let spawnCost   = inheritance.design.reduce((s,e) => s+BODYPART_COST[e], 0);
    if (energy >= spawnCost) {
      let memory  = {role: 'distributor', design: inheritance.design};
      console.log('Spawning Distributor['+energy+']: ' + newName+"\ntemplate: "+ JSON.stringify(inheritance.design)+"\nmemory: "+JSON.stringify(memory));
      return spawn.spawnCreep(inheritance.design, newName, {memory: memory});
    }
    return 1;
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
