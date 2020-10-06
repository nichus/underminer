const utils = {
  TASKS: Object.freeze({
    HARVEST: 'harvest',
    STORE: 'store',
    DISTRIBUTE: 'distribute',
    BUILD: 'build',
    REPAIR: 'repair',
    UPGRADE: 'upgrade',
    IDLE: 'idle'
  }),
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
    /*
    if (! Memory.rooms[creep.room.name].storage ) {
      Memory.rooms[creep.room.name].storage = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType == STRUCTURE_STORAGE && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
        }
      })[0].id;
    }
    let source = Game.getObjectById(Memory.rooms[creep.room.name].storage);
    */
    if (! creep.memory.storage ) {
      creep.memory.storage = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType == STRUCTURE_STORAGE && structure.store.getUsedCapacity(RESOURCE_ENERGY) >= 0);
        }
      })[0].id;
    }
    let source = Game.getObjectById(creep.memory.storage);
    let drops = creep.pos.findClosestByPath(creep.room.find(FIND_DROPPED_RESOURCES), {
        filter: (d) => { return (d.resourceType == RESOURCE_ENERGY) }
    });
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
    } else if (source) {
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
