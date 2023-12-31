const memoryManagement = require("./memoryManagement");
memoryManagement.initialize();
const Mission = require("./Mission");
const missionCenter = require("./missionCenter");
require("./towerAi")(); 
require("./creepAi")();
require("./spawnAi")();
module.exports.loop = function () {
    memoryManagement.clean();
    for (const roomName in Game.rooms) {
        missionCenter.updateList(roomName);
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
    if (Game.cpu.bucket === 10000) {
        Game.cpu.generatePixel();
    }
}