const towerAi = function() {
    let p = StructureTower.prototype;
    p.reactToTick = function() {
        if (!Memory.towers[this.id]) {
            Memory.towers[this.id] = {id: this.id, mission: undefined};
        }
        if (this._checkFinishMission()) {
            this._finishMission();
        }
        if (Memory.towers[this.id].mission === undefined && this.store.getUsedCapacity(RESOURCE_ENERGY) >= 10) {
            this._getMission();
        }
        if (Memory.towers[this.id].mission != undefined) {
            const target = Game.getObjectById(Memory.towers[this.id].subMission[0]);
            this[Memory.towers[this.id].subMission[1]](target);
        }
    }
    p._getMission = function() {
        for (let mission of Memory.rooms[this.room.name].missions.filter(m => m.creep === undefined &&
            m.subMissionsList.length == 1 && ['repair', 'rangedAttack', 'heal', 'attack'].includes(m.subMissionsList[0][1]), this)) {
            mission.creep = this.id;
            if (mission.subMissionsList[0][1] === 'rangedAttack') {
                mission.subMissionsList[0][1] = 'attack';
            }
            Memory.towers[this.id].mission = mission;
            Memory.towers[this.id].subMission = mission.subMissionsList.pop();
            break;
        }
    }
    p._checkFinishMission = function() {
        if (Memory.towers[this.id].mission != undefined && Memory.towers[this.id].subMission != undefined) {
            const target = Game.getObjectById(Memory.towers[this.id].subMission[0])
            if (target === null) {
                return true;
            }
            if (
                (this.store.getUsedCapacity(RESOURCE_ENERGY) === 0) ||
                (['heal', 'repair'].includes(Memory.towers[this.id].subMission[1]) && target.hits === target.hitsMax)
            ) {
                return true;
            }
        }
        return false;
    }
    p._finishMission = function() {
        Memory.rooms[this.room.name].missions = Memory.rooms[this.room.name].missions.filter(mission => !(mission.creep === this.id), this);
        Memory.towers[this.id].mission = undefined;
        Memory.towers[this.id].subMission = undefined;
    }
};
module.exports = towerAi;