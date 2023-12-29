/* 
structureClass = StructureLink
minimunEnergyToTransfer = 300
filterFunction = (m) => m.target[1] === 'repair' || m.target[1] === 'rangedAttack' || m.target[1] === 'heal'
checkFinishMissionCondition = function() {
    (this.store.getUsedCapacity(RESOURCE_ENERGY) === 0) ||
    (Memory[p.structureType][this.id].mission.target[1] === 'heal' && target.hits === target.hitsMax) ||
    (Memory[p.structureType][this.id].mission.target[1] === 'repair' && target.hits === target.hitsMax) ||
    (Memory[p.structureType][this.id].mission.target[1] === 'rangedAttack' && target === null)
} 
*/
module.exports = function(structureClass, minimunEnergyToTransfer, getMissionFilterFunction, checkFinishMissionCondition) {
    let p = structureClass.prototype;
    p.minimunEnergyToTransfer = minimunEnergyToTransfer;
    p.reactToTick = function() {
        if (!Memory[p.structureType][this.id]) {
            Memory[p.structureType][this.id] = {id: this.id, mission: undefined};
        }
        if (this._checkFinishMission()) {
            this._finishMission();
        }
        if (Memory[p.structureType][this.id].mission === undefined && this.store.getUsedCapacity(RESOURCE_ENERGY) >= this.minimunEnergyToTransfer) {
            this._getMission();
        }
        if (Memory[p.structureType][this.id].mission != undefined) {
            const target = Game.getObjectById(Memory[p.structureType][this.id].mission.target[0]);
            this[Memory[p.structureType][this.id].mission.target[1]](target, Memory[p.structureType][this.id].mission.target[2])
        }
    }
    p._getMission = function() {
        for (let mission of Memory.rooms[this.room.name].missions.filter(m => m.creep === undefined && getMissionFilterFunction(m), this)) {
            mission.creep = this.id;
            Memory[p.structureType][this.id].mission = mission;
            break;
        }
    }
    p._checkFinishMission = function() {
        if (Memory[p.structureType][this.id].mission) {
            const target = Game.getObjectById(Memory[p.structureType][this.id].mission.target[0])
            if (target === null) {
                return true;
            }
            if (checkFinishMissionCondition()) {
                return true;
            }
        }
        return false;
    }
    p._finishMission = function() {
        Memory.rooms[this.room.name].missions = Memory.rooms[this.room.name].missions.filter(mission => !(mission.creep === this.id), this);
        Memory[p.structureType][this.id].mission = undefined
    }
}