function defineRoad(start,end,vector) {
    for (i=start; !i.isEqualTo(end); i=new RoomPosition(i.x+vector[0],i.y+vector[1],i.roomName)) {
        const terrain = i.lookFor(LOOK_TERRAIN)[0];
        if (terrain != 'wall') {
            i.createConstructionSite(STRUCTURE_ROAD);
        }
    }
    const terrain = end.lookFor(LOOK_TERRAIN)[0];
    if (terrain != 'wall') {
        end.createConstructionSite(STRUCTURE_ROAD);
    }
}

function defineRing(pos,radius) {
    let x = pos.x;
    let y = pos.y;
    let roomName = pos.roomName;
    let start = 0, end = 0;
    
    // Top Left
    start = new RoomPosition(x-radius,y,roomName);
    end     = new RoomPosition(x,y+radius,roomName);
    defineRoad(start,end,[1,1]);
    
    // Top Right
    start   = new RoomPosition(x+radius,y,roomName);
    defineRoad(end,start,[1,-1]);
    
    // Bottom Right
    end     = new RoomPosition(x,y-radius,roomName);
    defineRoad(start,end,[-1,-1])
    
    // Bottom Left
    start   = new RoomPosition(x-radius,y,roomName);
    defineRoad(end,start,[-1,1]);
}
function cityPlanning() {
    let cs = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
    if (!cs.length) {
     //
    }
}
function cancelAll(creep) {
    let cs = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
    for (let i in cs) {
        cs[i].remove();
    }
}

function defineExtensions() {
    return [
            [-2,-2],
            [-1,-3],
            [0,-2],
            [1,-3],
            [2,-2]
        ];
}
var roleBuilder = {
    run: function(creep) {
        
	    if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
	        creep.memory.building = true;
	        creep.say('🚧 build');
	    }

	    if(creep.memory.building) {
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
	    }
	    else {
	        var sources = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE) &&
                            structure.store[RESOURCE_ENERGY] > 0
                        }
	        });
            if(creep.withdraw(sources[0],RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
	    }
        if (creep.memory.target) {
        } else {
            let spawnPos = Game.spawns['Spawn1'].pos;
            //cancelAll(creep);
            //defineRing(spawnPos,1);
            //defineRing(spawnPos,3);
            //defineRing(spawnPos,5);
            //defineRing(spawnPos,7);
            //defineRing(spawnPos,9);
            defineRing(spawnPos,11);
            defineRing(spawnPos,13);
 
            let extensions = defineExtensions();
            for (let i in extensions) {
                let iPos = new RoomPosition(spawnPos.x+extensions[i][0],spawnPos.y+extensions[i][1],spawnPos.roomName);
                const terrain = iPos.lookFor(LOOK_TERRAIN)[0];
                if (terrain!="wall") {
                    iPos.createConstructionSite(STRUCTURE_EXTENSION);
                }
            }
        }
    }
}
module.exports = roleBuilder;
