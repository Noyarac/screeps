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