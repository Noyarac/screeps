const mem = {
    cleanFrequency: 500,
    initialize: function() {
        for (const name of ["towers", "links"]) {
            if (!Memory[name]) {
                Memory[name] = new Object;
            }
        }
        for (const roomName in Game.rooms) {
            if (Memory.rooms[roomName] == undefined) Memory.rooms[roomName] = new Object;
            if (Memory.rooms[roomName].missions == undefined) Memory.rooms[roomName].missions = new Array;
        }
    },
    clearAllMission: function() {
        Object.values(Game.creeps).forEach(creep => {creep.memory.mission = undefined; creep.memory.subMission = undefined});
        Object.keys(Memory.towers).forEach(towerId => {Memory.towers[towerId].mission = undefined;});
        for (const roomName in Game.rooms) {
            Memory.rooms[roomName].missions = new Array;
        }
    },
    clean: function(force = false) {
        if (!(Game.time % this.cleanFrequency) || force) {
            for (const creepName in Memory.creeps) {
                if (Game.creeps[creepName] == undefined) delete Memory.creeps[creepName];
            }
            for (const towerId in Memory.towers) {
                if (Game.getObjectById(towerId) == null) delete Memory.towers[towerId];
            }
            for (const roomName in Game.rooms) {
                const creepNameList = Object.keys(Game.creeps);
                Memory.rooms[roomName].missions = Memory.rooms[roomName].missions.filter(mission =>
                    creepNameList.includes(mission.creep) ||
                    _.filter(Game.structures, {structureType: STRUCTURE_TOWER}).map(tower => tower.id).includes(mission.creep) ||
                    mission.creep === undefined)
            }
        }    
    }
}
module.exports = mem;
