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
var roleBuilder = {
  spawn: function(base,inheritance) {
    let spawn   = Game.spawns[base];
    let energy  = spawn.room.energyAvailable;
    let newName = Utils.nameCreep('builder',base);
    if (!inheritance || !inheritance.design) {
      console.log('Missing inheritance!');
      if (!inheritance) { inheritance = {}; }
      inheritance.design = design(energy);
    }
    let spawnCost   = inheritance.design.reduce((s,e) => s+BODYPART_COST[e], 0);
    if (energy >= spawnCost) {
      let memory  = {role: 'builder', design: inheritance.design};
      console.log('Spawning Builder['+energy+']: ' + newName+"\ntemplate: "+JSON.stringify(inheritance.design)+"\nmemory: "+JSON.stringify(memory));
      return spawn.spawnCreep(inheritance.design, newName, {memory: memory});
    }
    return 1;
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
