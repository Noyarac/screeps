const memoryManagement = require("./memoryManagement");
memoryManagement.initialize();
memoryManagement.clearAllMission();
const Mission = require("./Mission");
const missionCenter = require("./missionCenter");
const classesEnhancements = [
    require("./towerAi"), 
    require("./creepAi"),
    require("./spawnAi")
];
for (const groupe of classesEnhancements) {
    for (const [key, value] of Object.entries(groupe[1])) {
        groupe[0].prototype[key] = value;
    }
}
module.exports.loop = function () {
    memoryManagement.clean();
    for (const roomName in Game.rooms) {
        missionCenter.updateList(roomName);
    }
    for (const creep of _.filter(Game.creeps, creep => !creep.spawning)) {
        creep.reactToTick();
    }
    for (const tower of _.filter(Game.structures, {structureType: STRUCTURE_TOWER})) {
        tower.reactToTick();
    }
    for (const spawn of Object.values(Game.spawns)) {
        spawn.reactToTick();
    }
    if (Game.cpu.bucket === 10000) Game.cpu.generatePixel();
}