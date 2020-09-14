var utils = {
  getChargeTarget: function(creepName) {
    let creep = Game.creeps[creepName];
    return creep.pos.findClosestByPath(
              creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_EXTENSION  ||
                             structure.structureType == STRUCTURE_SPAWN      ||
                             structure.structureType == STRUCTURE_TOWER)     &&
                             structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
                }
              })
    );
  },
  getChargableStructures: function(roomName) {
    return Game.rooms[roomName].find(FIND_STRUCTURES, {
      filter: (structure) => {
        return ((structure.structureType == STRUCTURE_EXTENSION  ||
                 structure.structureType == STRUCTURE_SPAWN      ||
                 structure.structureType == STRUCTURE_TOWER)     &&
                 structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
      }
    });
  },
  getChargeExtension: function(roomName) {
    return Game.rooms[roomName].find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_EXTENSION && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
      }
    });
  },
  getChargeSpawner: function(roomName) {
    return Game.rooms[roomName].find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_SPAWN && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
      }
    });
  },
  getChargeTower: function(roomName) {
    return Game.rooms[roomName].find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
      }
    });
  },
  fetchEnergy: function(creepName) {
    let creep = Game.creeps[creepName];
    let drops = creep.pos.findClosestByPath(creep.room.find(FIND_DROPPED_RESOURCES), {
        filter: (d) => { return (d.resourceType == RESOURCE_ENERGY) }
    });
    let storage = creep.room.find(FIND_STRUCTURES, {
        filter: (s) => { return((s.structureType == STRUCTURE_STORAGE) && (s.store[RESOURCE_ENERGY] > 0)) }
    });
    let source = creep.pos.findClosestByPath(storage);
    if (drops) {
      if (creep.pickup(drops) == ERR_NOT_IN_RANGE) {
        creep.moveTo(drops,  {visualizePathStyle: {stroke: '#ffaa00'}});
      }
      let container = creep.pos.findClosestByPath(creep.room.find(FIND_STRUCTURES, {
          filter: (s) => { return((s.structureType == STRUCTURE_CONTAINER) && (s.store[RESOURCE_ENERGY] > 0)) }
      }));
      if ((creep.store.getFreeCapacity() > 0 ) && (creep.withdraw(container, RESOURCE_ENERGY) == 0)) {
        console.log('Stole a cookie from the jar');
      }
    } else if (storage.length>0) {
      if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
      }
    }
  },
  nameCreep: function(type,base) {
    let shortname = {distributor: 'd', harvester: 'h', mule: 'm', builder: 'b', upgrader: 'u'}[type];
    return shortname+"-"+Game.spawns[base].room.name+"-"+Game.time;
  }
};

module.exports = utils;
