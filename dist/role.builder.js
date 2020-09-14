var Utils = require('lib.utils');

function design(maxEnergy) {
  const baseCost  = (1*100)+(1*50)+(1*50);
  const unitCost  = baseCost;
  let energy      = maxEnergy - baseCost;
  let units       = Math.max(0,Math.floor(energy/unitCost));
  let workBits    = units;
  let carrBits    = units + Math.floor((energy-(units*unitCost))/100);
  let moveBits    = units + Math.floor((energy-(units*unitCost)-((carrBits-workBits)*50))/50);
  console.log("workBits: "+workBits+", carrBits: "+carrBits+", moveBits: "+moveBits);
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
var roleBuilder = {
  spawn: function(base) {
    let spawn   = Game.spawns[base];
    let energy  = spawn.room.energyAvailable;
    let newName = Utils.nameCreep('builder',base);
    let inheritance = claimInheritance(newName);
    if (!inheritance || !inheritance.design) {
      inheritance.design = design(energy);
    }
    let spawnCost   = inheritance.design.reduce((s,e) => s+BODYPART_COST[e], 0);
    if (!spawn.spawning && energy >= spawnCost) {
      let memory  = {role: 'builder', design: inheritance.design};
      console.log('Spawning Builder['+energy+']: ' + newName+"\ntemplate: "+JSON.stringify(inheritance.design)+"\nmemory: "+JSON.stringify(memory));
      spawn.spawnCreep(inheritance.design, newName, {memory: memory});
    }
  },
  /** @param {Creep} creep **/
  run: function(creep) {
    function findRepairable() {
      return creep.room.find(FIND_STRUCTURES, {
        filter: object => ((object.hits < 12000) && (object.hits < parseInt(object.hitsMax*0.75)))
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
      let targets = findRepairable();
      if (creep.store[RESOURCE_ENERGY] > 0 && targets.length > 0) {
        let target  = creep.pos.findClosestByPath(targets);
        if (creep.repair(target) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
        }
      }
    }
    function getEnergy() {
      let drops = creep.pos.findClosestByPath(creep.room.find(FIND_DROPPED_RESOURCES), {
        filter: (d) => { return (d.resourceType == RESOURCE_ENERGY) }
      });
      let containers = creep.room.find(FIND_STRUCTURES, {
        filter: (s) => { return((s.structureType == STRUCTURE_CONTAINER) && (s.store[RESOURCE_ENERGY] > 0)) }
      });
      let source = creep.pos.findClosestByPath(containers);
      if (drops) {
        if (creep.pickup(drops) == ERR_NOT_IN_RANGE) {
          creep.moveTo(drops);
        }
      } else if (containers.length>0) {
        if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
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
      } else if (findRepairable().length > 0) {
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
