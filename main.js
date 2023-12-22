const creep_ai = require("./creep_ai");
const spawn_ai = require("./spawn_ai");
var mission_center = require("./mission_center");
const Mission = require("./Mission");
if (Memory.missions === undefined) Memory.missions = new Array;

for (const [key, value] of Object.entries(creep_ai)) {
    Creep.prototype[key] = value;
}
for (const [key, value] of Object.entries(spawn_ai)) {
    Spawn.prototype[key] = value;
}

module.exports.loop = function () {
    mission_center.update_list();
    for (const creep of Object.values(Game.creeps).filter(item => !item.spawning)) {
        creep.react_to_tick();
    }
    for (const spawn of Object.values(Game.spawns)) {
        spawn.react_to_tick();
    }
    if (!(Game.time % 1500)) {
        const keys = Object.keys(Memory.creeps);
        for (const creep of keys) {
            if (!(Game.creeps[creep])) delete Memory.creeps[creep];
        }
        Memory.missions = Memory.missions.filter(mission => keys.includes(mission.creep) || mission.creep === undefined)
    }
}