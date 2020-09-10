var Utils = require('lib.utils');

function design(maxEnergy) {
  const baseCost  = (1*100)+(1*50)+(1*50);
  const unitCost  = (1*50)+(1*50);
  let maxEnergy   = maxEnergy - baseCost;
  let units       = Math.max(0,Math.floor(maxEnergy/unitCost));
  let workBits    = 0;
  let carrBits    = units
  let moveBits    = units + (Math.floor(maxEnergy-(unitCost*units)/50));
  return [MOVE,CARRY,WORK].concat(Array(workBits).fill(WORK)).concat(Array(carrBits).fill(CARRY)).concat(Array(moveBits).fill(MOVE));
}
var roleMule = {
  spawn: function(base) {
    let energy = parseInt(Game.spawns[base].room.energyAvailable/50)*50;
    let newName = "m."+Game.spawns[base].room.name+"."+Game.time;
    if (!Game.spawns[base].spawning && energy >= 200) {
      console.log('Spawning Mule['+energy+']: ' + newName);
      Game.spawns[base].spawnCreep(design(energy), newName, {memory: {role: 'mule'}});
    }
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
    }

    if (creep.memory.storing) {
      let target = Utils.getChargeTarget(creep.name);
      if (target!==null) {
        console.log(creep.name+": target="+target);
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, {visualizePathStyle: {stroke: '#aaffaa'}});
        }
      } else {
        let parks = creep.room.find(FIND_FLAGS);
        creep.moveTo(parks[0], {visualizePathStyle: {stroke: '#ffffaa'}});
      }
    } else {
      getEnergy();
    }
  }
};

module.exports = roleMule;
