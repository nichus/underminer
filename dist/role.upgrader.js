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
function claimInheritance(child) {
  let prefix=child.match(/^.*-.*-/)[0];
  for (let name in Memory.creeps) {
    if (!Game.creeps[name] && name.startsWith(prefix)) {
      let memory = {
        design: Memory.creeps[name].design
      };
      console.log("Inheriting from: "+name);
      console.log(JSON.stringify(memory));
      delete Memory.creeps[name]
      return memory;
    }
  }
}
var roleUpgrader = {
  spawn: function(base) {
    let spawn   = Game.spawns[base];
    let energy  = spawn.room.energyAvailable;
    let newName = Utils.nameCreep('upgrader',base);
    let inheritance = claimInheritance(newName);
    if (!inheritance || !inheritance.design) {
      inheritance.design = design(energy);
    }
    let spawnCost   = inheritance.design.reduce((s,e) => s+BODYPART_COST[e], 0);
    if (!spawn.spawning && energy >= spawnCost) {
      let memory  = {role: 'upgrader', design: inheritance.design};
      console.log('Spawning Upgrader['+energy+']: ' + newName+"\ntemplate: "+JSON.stringify(inheritance.design)+"\nmemory: "+JSON.stringify(memory));
      spawn.spawnCreep(inheritance.design, newName, {memory: memory});
    }
  },

    /** @param {Creep} creep **/
    run: function(creep) {
    function findRepairable() {
      return creep.room.find(FIND_STRUCTURES, {
        filter: object => ((object.hits < 12000) && (object.hits < parseInt(object.hitsMax*0.5)))
      });
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
    if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.upgrading = false;
      creep.say('🔄 charge');
    } else if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
      creep.memory.upgrading = true;
      creep.say('⚡ upgrade');
    }

    if (creep.memory.upgrading) {
      if (findRepairable().length > 0) {
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

module.exports = roleUpgrader;
