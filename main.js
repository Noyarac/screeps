const memoryManagement = require("./memory_management");
memoryManagement.initialize()
const Mission = require("./Mission");
const mission_center = require("./mission_center");
const classesEnhancements = [
    require("./creep_ai"), 
    require("./tower_ai"), 
    require("./spawn_ai")
];
for (const groupe of classesEnhancements) {
    for (const [key, value] of Object.entries(groupe[1])) {
        groupe[0].prototype[key] = value;
    }
}
module.exports.loop = function () {
    for (const roomName in Game.rooms) {
        mission_center.update_list(roomName);
    }
    for (const creep of _.filter(Game.creeps, creep => !creep.spawning)) {
        creep.react_to_tick();
    }
    for (const tower of _.filter(Game.structures, {structureType: STRUCTURE_TOWER})) {
        tower.react_to_tick();
    }
    for (const spawn of Object.values(Game.spawns)) {
        spawn.react_to_tick();
    }
}