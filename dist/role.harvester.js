function design(maxEnergy) {
  const baseCost  = (2*100)+(1*100);
  maxEnergy       = maxEnergy - baseCost;
  let workBits    = Math.min(3,Math.max(0, Math.floor(maxEnergy/100)));
  return [MOVE,WORK,WORK].concat(Array(workBits).fill(WORK));
}
var roleHarvester = {
  spawn: function(base) {
    let energy = Game.spawns[base].room.energyAvailable;
    let newName = "h."+Game.spawns[base].room.name+"."+Game.time;
    if (!Game.spawns[base].spawning && energy >= 250) {
      console.log('Spawning new harvester: ' + newName);
      Game.spawns[base].spawnCreep(design(energy), newName, {memory: {role: 'harvester'}});
    }
  },
  /** @param {Creep} creep **/
  run: function(creep) {
    let containers = creep.room.find(FIND_STRUCTURES, {
      filter: (s) => { return((s.structureType == STRUCTURE_CONTAINER) && (s.store[RESOURCE_ENERGY] < s.storeCapacity)) }
    });
    let container = creep.pos.findClosestByPath(containers);
    if (containers.length>0) {
      if (creep.pos.getRangeTo(container) == 0) {
        let source = creep.pos.findClosestByPath(FIND_SOURCES);
        creep.harvest(source);
      } else {
        creep.moveTo(container);
      }
    }
  }
};

module.exports = roleHarvester;
