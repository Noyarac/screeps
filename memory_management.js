const mem = {
    clean_frequency: 500,
    initialize: function() {
        if (!Memory.towers) {
            Memory.towers = new Object;
        }
        for (const roomName in Game.rooms) {
            if (Memory.rooms[roomName] == undefined) Memory.rooms[roomName] = new Object;
            if (Memory.rooms[roomName].missions == undefined) Memory.rooms[roomName].missions = new Array;
        }
    },
    clear_all_mission: function() {
        Object.values(Game.creeps).forEach(creep => {creep.memory.mission = undefined; creep.memory.sub_mission = undefined});
        Object.keys(Memory.towers).forEach(towerId => {Memory.towers[towerId].mission = undefined;});
        for (const roomName in Game.rooms) {
            Memory.rooms[roomName].missions = new Array;
        }
    },
    clean: function() {
        if (!(Game.time % this.clean_frequency)) {
            for (const typee of ["creeps", "towers"]) {
                Object.keys(Memory[typee]).forEach(name => {if (!Game.getObjectById(name)) delete Memory[typee][name];})
            }
            for (const roomName in Game.rooms) {
                Memory.rooms[roomName].missions = Memory.rooms[roomName].missions.filter(mission =>
                    Object.keys(Game.creeps).includes(mission.creep) ||
                    _.filter(Game.structures, {structureType: STRUCTURE_TOWER}).map(tower => tower.id).includes(mission.creep) ||
                    mission.creep === undefined)
            }
        }    
    }
}
module.exports = mem;
