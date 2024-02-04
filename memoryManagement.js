const mem = {
    cleanFrequency: 53,
    initialize: function() {
        try{
            Memory.market = Memory.market || new Array;
            for (const spawn of Object.values(Game.spawns)) {
                spawn.memory.ttl = spawn.memory.ttl || 0;
            }
            for (const name of ["towers", "links"]) {
                Memory[name] = Memory[name] || new Object;
                }
            for (const room of Object.values(Game.rooms)) {
                room.memory;
            }
        } catch(err) {
            console.log("memoryManagement initialize:" + err);
        }
    },
    clearAllMissions: function() {
        try {
            Object.values(Game.creeps).forEach(creep => {creep.memory.mission = undefined; creep.memory.subMission = undefined});
            Object.keys(Memory.towers).forEach(towerId => {Memory.towers[towerId].mission = undefined;});
            for (const roomName in Game.rooms) {
                Memory.rooms[roomName].missions = new Array;
            }
        }catch(err){
            console.log("memoryManagement clearAllMissions " + err)
        }
    },
    clean: function(force = false) {
        try{
            if ((Game.time % this.cleanFrequency == 0) || force) {
                const oldCreepNames = Object.keys(Memory.creeps);
                for (const creepName of oldCreepNames) {
                    if (Game.creeps[creepName] == undefined) delete Memory.creeps[creepName];
                }
                for (const type of ["towers", "links"]) {
                    const oldStructNames = Object.keys(Memory[type]);
                    for (const structureId in oldStructNames) {
                        if (Game.getObjectById(structureId) == null) delete Memory[type][structureId];
                    }
                }
                const roomNames = Object.keys(Memory.rooms);
                const creepNameList = Object.keys(Memory.creeps);
                const towerNameList = Object.keys(Memory.towers);
                for (const roomName of roomNames) {
                    if (Game.rooms[roomName] == undefined) {
                        Memory.rooms[roomName] = undefined;
                        continue;
                    }
                    Memory.rooms[roomName].missions = Memory.rooms[roomName].missions.filter(mission =>
                        [...creepNameList, ...towerNameList, undefined].includes(mission.creep));
                }
            }    
        }catch(err){
            console.log("memoryManagement clear " + err);
        }
    }
}
module.exports = mem;
