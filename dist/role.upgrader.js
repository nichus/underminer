var roleUpgrader = {

    spawn: function(base) {
        function design(energy) {
            let d = {
                    200:    [WORK,MOVE,CARRY],
                    250:    [WORK,MOVE,CARRY,CARRY],
                    300:    [WORK,WORK,MOVE,CARRY],
                    350:    [WORK,WORK,MOVE,MOVE,CARRY],
                    400:    [WORK,WORK,MOVE,MOVE,MOVE,CARRY],
                    450:    [WORK,WORK,MOVE,MOVE,CARRY,CARRY,CARRY],
                    500:    [WORK,WORK,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY],
                    550:    [WORK,WORK,WORK,MOVE,MOVE,CARRY,CARRY,CARRY],
                    600:    [WORK,WORK,WORK,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY],
                    650:    [WORK,WORK,WORK,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY],
                    700:    [WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY],
                    750:    [WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY],
                    800:    [WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY]
            };
            return d[Math.min(800,parseInt(energy/50)*50)];
        }

        let energy = parseInt(Game.spawns[base].room.energyAvailable/50)*50;
        let newName = "u."+Game.time;
        if (!Game.spawns[base].spawning && energy == Game.spawns[base].room.energyCapacityAvailable) {
            console.log('Spawning new Upgrader: ' + newName);
            Game.spawns[base].spawnCreep(design(energy), newName, {memory: {role: 'upgrader'}});
        }
    },
    
    /** @param {Creep} creep **/
    run: function(creep) {

        function findRepairable() {
            return creep.room.find(FIND_STRUCTURES, { 
                filter: object => ((object.hits < 1200000) && (object.hits < parseInt(object.hitsMax*0.5)))
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
        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 charge');
	    }
	    if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
	        creep.memory.upgrading = true;
	        creep.say('⚡ upgrade');
	    }

	    if(creep.memory.upgrading) {
	        if (findRepairable().length > 0) {
                doRepairs();
            } else {
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#00aaff'}});
                }
	        }
	    } else {
	        getEnergy();
	    }
    }
};

module.exports = roleUpgrader;
