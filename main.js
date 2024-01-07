const memoryManagement = require("./memoryManagement");
memoryManagement.initialize();
const Mission = require("./Mission");
require("./linkAi")();
require("./towerAi")(); 
require("./creepAi")();
require("./spawnAi")();
const missionCenter = require("./missionCenter");

module.exports.loop = function () {
    memoryManagement.clean();
    // Conquer macro
    if (!Memory.keepMissions) {
        Memory.keepMissions = true;
        memoryManagement.clearAllMissions();
        missionCenter._createMission("W53N7", new RoomPosition(11,36,"W50N6"), "moveTo", 6, "worker");
        missionCenter._createMission("W50N6", new RoomPosition(11,31,"W51N4"), "moveTo", 6, "worker");
    }
    for (const link of _.filter(Game.structures, {structureType: STRUCTURE_LINK})) {
        link.reactToTick();
    }
    for (const creep of Object.values(Game.creeps)) {
        creep.reactToTick();
    }
    for (const tower of _.filter(Game.structures, {structureType: STRUCTURE_TOWER})) {
        tower.reactToTick();
    }
    for (const spawn of Object.values(Game.spawns)) {
        spawn.reactToTick();
    }
    for (const roomName in Game.rooms) {
        missionCenter.updateList(roomName);
    }
    if (Game.cpu.bucket === 10000) {
        Game.cpu.generatePixel();
    }
}