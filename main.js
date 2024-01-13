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
    try{
        // if (!Memory.missionCreated) {
        //     missionCenter._createMission("W53N7", [
        //         new SubMission("659187f846d80fa3601ae462", "transfer", {ressource: RESOURCE_ENERGY}),
        //         new SubMission("6584d6fbe2a2f9f1be57bfec", "withdraw", {room:"W54N7", resource:RESOURCE_ENERGY}),
        //         new SubMission(new RoomPosition(35,27,"W54N7"), "moveTo")
        //     ], 7, "worker");
        //     Memory.missionCreated = true;
        // }
        memoryManagement.clean();
    }catch(err){console.log("memoryManagement clean "+err)}
    try{
        if (!Memory.keepMissions) {
            memoryManagement.clearAllMissions();
            Memory.keepMissions = true;
        }
        for (const link of _.filter(Game.structures, {structureType: STRUCTURE_LINK})) {
            link.reactToTick();
        }
    }catch(err){console.log("link tck " + err)}
    try{
        for (const creep of Object.values(Game.creeps)) {
            creep.reactToTick();
        }
    }catch(err){console.log("creep tck "+ err)}
    try{
        for (const tower of _.filter(Game.structures, {structureType: STRUCTURE_TOWER})) {
            tower.reactToTick();
        }
    }catch(err){console.log("tower tck "+err)}
    try{
        for (const spawn of Object.values(Game.spawns)) {
            spawn.reactToTick();
        }
    }catch(err){console.log("spawn tck "+err)}
    try{
        for (const roomName in Game.rooms) {
            missionCenter.updateList(roomName);
        }
    }catch(err){console.log("missionCenter tck "+err)}
    if (Game.cpu.bucket === 10000) {
        Game.cpu.generatePixel();
    }
}