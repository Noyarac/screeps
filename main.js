const creep_ai = require("./creep_ai");
const tower_ai = require("./tower_ai");
const spawn_ai = require("./spawn_ai");
const mission_center = require("./mission_center");
const Mission = require("./Mission");
if (Memory.missions === undefined) Memory.missions = new Array;
if (Memory.towers === undefined) Memory.towers = new Array;

for (const [key, value] of Object.entries(creep_ai)) {
    Creep.prototype[key] = value;
}
for (const [key, value] of Object.entries(tower_ai)) {
    StructureTower.prototype[key] = value;
}
for (const [key, value] of Object.entries(spawn_ai)) {
    Spawn.prototype[key] = value;
}

module.exports.loop = function () {
    if (Memory.resetMission) {
        Memory.missions = new Array;
        Object.values(Memory.creeps).forEach(creep => {creep.mission = undefined; creep.sub_mission = undefined});
        Memory.resetMission = false;
    }
    mission_center.update_list();
    for (const creep of Object.values(Game.creeps).filter(item => !item.spawning)) {
        creep.react_to_tick();
    }
    for (const tower of Object.values(Game.structures).filter(item => item.structureType == STRUCTURE_TOWER)) {
        tower.react_to_tick();
    }
    for (const spawn of Object.values(Game.spawns)) {
        spawn.react_to_tick();
    }
    if (!(Game.time % 500)) {
        let keys = Object.keys(Memory.creeps);
        for (const creep of keys) {
            if (!(Game.creeps[creep])) delete Memory.creeps[creep];
        }
        keys = Object.keys(Game.creeps);
        Memory.missions = Memory.missions.filter(mission => keys.includes(mission.creep) || mission.creep === undefined)
        Memory.missions = Memory.missions.filter(mission => !(mission.target[1] == 'rangedAttack' && Game.getObjectById(mission.target[0]) == null));
    }
}