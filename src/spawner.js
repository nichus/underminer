/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('spawner');
 * mod.thing == 'a thing'; // true
 */

var spawner = {
    
    spawn: function() {
        for(let name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
    
        let workers = _.filter(Game.creeps, (creep) => creep.memory.role == 'worker');

        // console.log('Workers: ' + workers.length);

        function design(e) {
            let d = {
                    200:    [WORK,MOVE,CARRY],
                    250:    [WORK,MOVE,CARRY,CARRY],
                    300:    [WORK,MOVE,MOVE,CARRY,CARRY],
                    350:    [WORK,MOVE,MOVE,CARRY,CARRY,CARRY],
                    400:    [WORK,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY],
                    450:    [WORK,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY],
                    500:    [WORK,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY],
                    550:    [WORK,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY],
                    600:    [WORK,WORK,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY],
                    650:    [WORK,WORK,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY],
                    700:    [WORK,WORK,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY],
                    750:    [WORK,WORK,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY],
                    800:    [WORK,WORK,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY]
            };
            return d[Math.floor(e,500)];
        }
        if(workers.length < 7 && Game.spawns.Spawn1.room.energyAvailable > 200 && Game.spawns.Spawn1.room.energyAvailable==Game.spawns.Spawn1.room.energyCapacityAvailable) {
//        if(workers.length < 7 && Game.spawns.Spawn1.room.energyAvailable > 200) {
            let energy = parseInt(Game.spawns.Spawn1.room.energyAvailable/50)*50;
            let newName = 'Worker' + Game.time;
            console.log('Spawning new worker: ' + newName);
            Game.spawns['Spawn1'].spawnCreep(design(energy), newName, {memory: {role: 'worker'}});        
        }
    
        if(Game.spawns['Spawn1'].spawning) { 
            let spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
            Game.spawns['Spawn1'].room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                Game.spawns['Spawn1'].pos.x + 1, 
                Game.spawns['Spawn1'].pos.y, 
                {align: 'left', opacity: 0.8});
        }
    }
};

module.exports = spawner
