StructureSpawn.prototype.createSourceHarv = function(energyInput, role, homeRoom, targetRoom = '', workingState = 0, additionalMemoryOptions = {}){
    //sourceInfo = {max:1500,refreashMax:300} // might get used for telling the body code if it is generating a harvester
    //for a source that is different from the norm like in unreserved rooms or invarder rooms
    const minCost = 200;
    const numberOfDistinctParts = 3;
    const maxCreepParts = 50;
    const maxWorkParts = 5; //min 100e, max 500e
    const maxCenterRoomWorkParts = 7; //min 100e, max 700e
    const maxCarryParts = 2; //min 50e, max 100e
    const maxMoveParts = 5; // min 50e, max 250e
    //minparts = 3, maxparts 12, 14
    //minenergy = 200, maxenergy 850, 1050
    //let numberOfParts = Math.min(Math.max(Math.floor(energyInput / minCost), 1), Math.floor(maxCreepParts / numberOfDistinctParts));
    //TODO: calculate total number of parts than split amoung parts
    const numberOfWorkParts = Math.min(Math.max(Math.floor(energyInput / 100), 1), maxWorkParts);
    const numberOfCarryParts = Math.min(Math.max(Math.floor(energyInput / 50), 1), maxCarryParts);
    const numberOfMoveParts = Math.min(Math.max(Math.floor(energyInput / 50), 1), maxMoveParts);
    //1500E, 3000E, 4000E; 2 E/tick/work; 300ticks
    //console.log(this.name + " Energy Used: " + energyInput + " Job: " + JSON.stringify(job));
    let body = [];
    /*if(numberOfParts >= 1)
    {
        for (let i = 0; i < numberOfParts; i++) {
            body.push(WORK);
        }
        for (let i = 0; i < numberOfParts; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < numberOfParts; i++) {
            body.push(MOVE);
        }
    }*/
    if(numberOfWorkParts >= 1)
    {
        for (let i = 0; i < numberOfWorkParts; i++) {
            body.push(WORK);
        }
    }
    if(numberOfCarryParts >= 1)
    {
        for (let i = 0; i < numberOfCarryParts; i++) {
            body.push(CARRY);
        }
    }
    if(numberOfMoveParts >= 1)
    {
        for (let i = 0; i < numberOfMoveParts; i++) {
            body.push(MOVE);
        }
    }
    
    
    let creepName = myUtilsConst.ALL_CREEP_ROLES_NAMES[role] + '' + Game.time + '_' + this.name +'_' + this.room.name;
    //myUtilsConst.ALL_CREEP_ROLES_NAMES[]
    let creepMemory = {
        creepRole: role,
        currentRole: role,
        homeRoom: homeRoom,
        targetRoom: (targetRoom !== undefined && targetRoom !== '') ? targetRoom : homeRoom,
        workingState: workingState
    };
    //console.log("additionalMemoryOptions: " + JSON.stringify(additionalMemoryOptions));
    if(additionalMemoryOptions)
    {
        for(let addedOption in additionalMemoryOptions)
        {
            //console.log("addedOption: " + JSON.stringify(addedOption));
            creepMemory[addedOption] = additionalMemoryOptions[addedOption];
        }
    }
    
    console.log(this.name + " name: " + JSON.stringify(creepName));
    console.log(this.name + " body: " + JSON.stringify(body));
    console.log(this.name + " part count WCM: " + JSON.stringify(numberOfWorkParts) + ", " + JSON.stringify(numberOfCarryParts) + ", " + JSON.stringify(numberOfMoveParts));
    console.log(this.name + " memory: " + JSON.stringify(creepMemory));
    
    return this.spawnCreep(body,creepName,{memory: creepMemory, directions: this.memory.nonCoreDirections});
};
