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
    for (roomName in Game.rooms) {
        if (Memory.rooms[roomName] == undefined) Memory.rooms[roomName] = {missions: []};

    }
    if (!Memory.conquer) {
        Memory.conquer = true;
        missionCenter._createMission("W53N7",[
            new SubMission(new RoomPosition(23,33,"W51N6"), "moveTo"),
            new SubMission(new RoomPosition(14,47,"W50N6"), "moveTo"),
            new SubMission(new RoomPosition(14,47,"W50N5"), "moveTo"),
            new SubMission(new RoomPosition(10,14,"W50N4"), "moveTo"),
            new SubMission(Game.getObjectById("659ace83bf0ab100124fa759"), "build")
        ], 6, "worker");
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