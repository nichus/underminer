var roleWorker = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        const Jobs = Object.freeze({
            HARVEST:    "harvest",
            STORE:      "store",
            BUILD:      "build",
            REPAIR:     "repair",
            UPGRADE:    "upgrade",
            IDLE:       "idle"
        });
        
        function getStructures() {
            return creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN      ||
                            structure.structureType == STRUCTURE_TOWER)     &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
                }
            });
        }
        function getConstructions() {
            return creep.room.find(FIND_CONSTRUCTION_SITES);
        }
        function canStore() {
            // console.log(creep.name+": "+creep.memory.job+", "+creep.store[RESOURCE_ENERGY]+", "+getStructures().length+", "+(creep.room.energyCapacityAvailable-creep.room.energyAvailable));
            return creep.memory.job == Jobs.STORE &&
                    creep.store[RESOURCE_ENERGY] > 0 &&
                    getStructures().length > 0 &&
                    creep.room.energyCapacityAvailable > creep.room.energyAvailable;
        }
        function canBuild() {
            return creep.memory.job == Jobs.BUILD &&
                    creep.store[RESOURCE_ENERGY] > 0 &&
                    getConstructions().length > 0;
        }
        function canUpgrade() {
            return creep.memory.job == Jobs.UPGRADE &&
                    creep.store[RESOURCE_ENERGY] > 0 &&
                    1 == 1;
        }
        function nextJob() {
            if ((creep.store[RESOURCE_ENERGY] == 0) || (creep.memory.job == Jobs.IDLE && creep.store.getFreeCapacity() > 0)) {
                creep.say('🔄 harvest');  
                return Jobs.HARVEST;
            } else if (creep.store[RESOURCE_ENERGY] > 0 && [ Jobs.STORE, Jobs.BUILD, Jobs.UPGRADE ].includes(creep.memory.job)) {
                if (canStore() || canBuild() || canUpgrade()) {
                    return creep.memory.job;
                } else {
                    return Jobs.Harvest;
                }
            } else if ((creep.memory.job == Jobs.IDLE) || (creep.memory.job == Jobs.HARVEST && creep.store.getFreeCapacity() == 0)) {
                if (creep.room.energyCapacityAvailable-creep.room.energyAvailable>0) {
                    creep.say('🔋 store')
                    return Jobs.STORE;
                } else if (getConstructions().length > 0) {
                    creep.say('🚧 build');
                    creep.memory.target=undefined;
                    return Jobs.BUILD;
                } else if (creep.room.find(FIND_STRUCTURES, { filter: object => ((object.hits < 100000) && (object.hits < parseInt(object.hitsMax*0.1))) }).length>0) {
                    creep.say('🔧 repair');
                    creep.memory.target=undefined;
                    return Jobs.REPAIR;
                } else {
                    // Nothing else to do with this energy, upgrade with it.
                    creep.say('⚡ upgrade');
                    return Jobs.UPGRADE;
                }
            } else if (typeof creep.memory.job !== 'undefined') {
                return creep.memory.job;
            } else {
                console.log("oopsie");
                console.log(creep.memory.job+", "+creep.store.getFreeCapacity());
                console.log(creep.store[RESOURCE_ENERGY]+", "+creep.memory.job+", "+ (creep.memory.job in [Jobs.STORE,Jobs.BUILD,Jobs.UPGRADE]));
                console.log(Jobs.BUILD, creep.memory.job);
                console.log(creep.memory.job == Jobs.BUILD);
                console.log([Jobs.STORE, Jobs.BUILD, Jobs.UPGRADE].includes(creep.memory.job));
                console.log("doodle");
            }
            console.log("NextJob defaulting to IDLE");
            return Jobs.IDLE;
        }
        
        if (typeof creep.memory.job === 'undefined' ) {
            console.log("resetting to IDLE");
            creep.memory.job = Jobs.IDLE;
        }

        creep.memory.job = nextJob();
        
        if (creep.memory.job == Jobs.HARVEST) {
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
            } else {
//            var sources = creep.room.find(FIND_SOURCES);
//                if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
//                    creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
//                }
            }
        } else if (creep.memory.job == Jobs.STORE) {
            var stores = getStructures();
            if(creep.transfer(stores[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(stores[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else if (creep.memory.job == Jobs.BUILD) {
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if (typeof creep.memory.target === 'undefined' || creep.memory.target >= targets.length) {
                    creep.memory.target = parseInt(targets.length*Math.random());
                }
                if(creep.build(targets[creep.memory.target]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[creep.memory.target], {visualizePathStyle: {stroke: '#aa00ff'}});
                }
            }
        } else if (creep.memory.job == Jobs.REPAIR) {
            var targets = creep.room.find(FIND_STRUCTURES, { filter: object => ((object.hits < 100000) && (object.hits < parseInt(object.hitsMax*0.1))) });
            if (typeof creep.memory.target === 'undefined' || creep.memory.target >= targets.length) {
                creep.memory.target = parseInt(targets.length*Math.random());
            }
            if (targets.length > 0) {
                if (creep.repair(targets[creep.memory.target]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[creep.memory.target]);
                }
            }
        } else if (creep.memory.job == Jobs.UPGRADE) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#00aaff'}});
            }
        }
    }
};

module.exports = roleWorker;
