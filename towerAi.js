const towerAi = function() {
    const p = StructureTower.prototype;
    p.reactToTick = function() {
        if (this._checkFinishMission()) {
            this._finishMission();
        }
        if (!this.memory.mission && this.store.getUsedCapacity(RESOURCE_ENERGY) >= 10) {
            this._getMission();
        }
        if (this.memory.mission && this.memory.subMission) {
            const target = Game.getObjectById(this.memory.subMission[0]);
            const actionString = this.memory.subMission[1];
            this[actionString](target);
        }
    }
    p._getMission = function() {
        for (let mission of this.room.missions.filter(m => m.creep === undefined &&
            m.subMissionsList.length == 1 && ['repair', 'rangedAttack', 'heal', 'attack'].includes(m.subMissionsList[0][1]), this)) {
            mission.creep = this.id;
            if (mission.subMissionsList[0][1] === 'rangedAttack') {
                mission.subMissionsList[0][1] = 'attack';
            }
            this.memory.mission = mission;
            this.memory.subMission = mission.subMissionsList.pop();
            break;
        }
    }
    p._checkFinishMission = function() {
        if (this.memory.mission != undefined && this.memory.subMission != undefined) {
            const target = Game.getObjectById(this.memory.subMission[0])
            if (target === null) {
                return true;
            }
            if (
                (this.store.getUsedCapacity(RESOURCE_ENERGY) === 0) ||
                (['heal', 'repair'].includes(this.memory.subMission[1]) && target.hits === target.hitsMax)
            ) {
                return true;
            }
        }
        return false;
    }
    p._finishMission = function() {
        this.room.missions = this.room.missions.filter(mission => !(mission.creep === this.id), this);
        this.memory.mission = undefined;
        this.memory.subMission = undefined;
    }
    Object.defineProperty(p, "memory", {
        get: function() {
            Memory.towers[this.id] ||= new Object;
            Memory.towers[this.id].id ||= this.id;
            return Memory.towers[this.id];
        },
        set: function(value) {
            Memory.towers[this.id] = value;
        }
    })
};
module.exports = towerAi;