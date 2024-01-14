require("./Room")();
const memoryManagement = require("./memoryManagement");
memoryManagement.initialize();
const Mission = require("./Mission");
const SubMission = require("./SubMission");
require("./linkAi")();
require("./towerAi")(); 
require("./creepAi")();
require("./spawnAi")();
const missionCenter = require("./missionCenter");

module.exports.loop = function () {
    memoryManagement.clean();
    if (!Memory.keepMissions) {
        memoryManagement.clearAllMissions();
        Memory.keepMissions = true;
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