const mem = {
    cleanFrequency: 500,
    initialize: function() {
        try{
            for (const spawn of Object.values(Game.spawns)) {
                spawn.memory.ttl ||= 0;
            }
            for (const name of ["towers", "links"]) {
                Memory[name] ||= new Object;
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
            const roomNames = Object.keys(Memory.rooms);
            for (const roomName of roomNames) {
                if (Game.rooms[roomName] == undefined) {
                    Memory.rooms[roomName] = undefined;
                }
            }
            if ((Game.time % this.cleanFrequency == 0) || force) {
                const oldCreepNames = Object.keys(Memory.creeps).map(x=>x);
                for (const creepName of oldCreepNames) {
                    if (Game.creeps[creepName] == undefined) delete Memory.creeps[creepName];
                }
                for (const type of ["towers", "links"]) {
                    const oldStructNames = Object.keys(Memory[type]).map(x=>x);
                    for (const structureId in oldStructNames) {
                        if (Game.getObjectById(structureId) == null) delete Memory[type][structureId];
                    }
                }
                const oldRoomNames = Object.keys(Game.rooms).map(x=>x);
                for (const roomName in oldRoomNames) {
                    if (Game.rooms[roomName] == undefined) {
                        Memory.rooms[roomName] = undefined;
                        continue;
                    }
                    const creepNameList = Object.keys(Game.creeps);
                    Memory.rooms[roomName].missions = Memory.rooms[roomName].missions.filter(mission =>
                        creepNameList.includes(mission.creep) ||
                        _.filter(Game.structures, {structureType: STRUCTURE_TOWER}).map(tower => tower.id).includes(mission.creep) ||
                        mission.creep === undefined)
                }
            }    
        }catch(err){
            console.log("memoryManagement clear " + err);
        }
    }
}
module.exports = mem;
