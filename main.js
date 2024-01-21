require("./Room")();
const SubMission = require("./SubMission");
const memoryManagement = require("./memoryManagement");
memoryManagement.initialize();
require("./linkAi")();
require("./towerAi")(); 
require("./creepAi")();
require("./spawnAi")();
const missionCenter = require("./missionCenter");
// TO CHANGE VERSION
// Memory.keepMissions = false;
// memoryManagement.clean(true);
const DEBUG  = false;
function chrono(label, reset = false) {
    if (!DEBUG) return;
    if (reset) {
        chrono.lastCall = Game.cpu.getUsed();
    }
    let answer = Game.cpu.getUsed() - chrono.lastCall;
    chrono.lastCall = Game.cpu.getUsed();
    console.log(label, answer.toFixed(2));
}

module.exports.loop = function () {
    chrono("\nInit", true);
    memoryManagement.clean();
    chrono("memoryManagement.clean(): ");
    if (!Memory.keepMissions) {
        memoryManagement.clearAllMissions();
        Memory.keepMissions = true;
    }
    chrono("memoryManagement.clearAllMissions(): ");
    if (Game.time % 311 == 0) {
        Memory.missionCreated = false;
    }
    if (!Memory.missionCreated && Game.getObjectById("5bbcaa279099fc012e630f31").energy == 0 && Game.getObjectById("5bbcaa279099fc012e630f30").energy == 0) {
        missionCenter._createMission("W53N7", [
            new SubMission(new RoomPosition(16, 11, "W53N7"), "moveTo"),
            new SubMission("657a52104a8d812d2c5d1f71", "withdraw", {resource: RESOURCE_ENERGY, room: "W53N8"}),
            new SubMission("657a52104a8d812d2c5d1f71", "withdraw", {resource: RESOURCE_GHODIUM_OXIDE, room: "W53N8"}),
            new SubMission("657a52104a8d812d2c5d1f71", "withdraw", {resource: RESOURCE_KEANIUM_OXIDE, room: "W53N8"}),
            new SubMission(new RoomPosition(9, 47, "W53N8"), "moveTo", {room: "W53N8"})
        ], 7, "return creep.ticksToLive > 400 && creep.ticksToLive < 800 && creep.getActiveBodyparts(CARRY) > 2 && creep.store.getUsedCapacity() == 0");
        missionCenter._createMission("W53N7", [
            new SubMission(new RoomPosition(5, 24, "W53N7"), "moveTo"),
            new SubMission("6584d6fbe2a2f9f1be57bfec", "withdraw", {resource: RESOURCE_ENERGY, room: "W54N7"}),
            new SubMission(new RoomPosition(47, 26, "W54N7"), "moveTo", {room: "W54N7"})
        ], 7, "return creep.ticksToLive > 400 && creep.getActiveBodyparts(CARRY) > 2 && creep.store.getUsedCapacity() == 0");
        Memory.missionCreated = true;
    }
    chrono("memoryManagement.clearAllMissions(): ");
    for (const link of _.filter(Game.structures, {structureType: STRUCTURE_LINK})) {
        link.reactToTick();
    }
    chrono("link.reactToTick(): ");
    for (const creep of Object.values(Game.creeps)) {
        creep.reactToTick();
    }
    chrono("creep.reactToTick(): ");
    for (const tower of _.filter(Game.structures, {structureType: STRUCTURE_TOWER})) {
        tower.reactToTick();
    }
    chrono("tower.reactToTick(): ");
    for (const spawn of Object.values(Game.spawns)) {
        spawn.reactToTick();
    }
    chrono("spawn.reactToTick(): ");
    for (const roomName in Game.rooms) {
        missionCenter.updateList(roomName);
        missionCenter.alertHostileCreep(roomName);
    }
    chrono("missionCenter.updateList(): ");
    if (Game.cpu.bucket === 10000) {
        Game.cpu.generatePixel();
    }
}