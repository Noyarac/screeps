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
            const target = Game.getObjectById(Memory.towers[this.id].mission.target[0]);
            this[Memory.towers[this.id].mission.target[1]](target, Memory.towers[this.id].mission.target[2]);
        }
    }
    p._getMission = function() {
        for (let mission of Memory.rooms[this.room.name].missions.filter(m => m.creep === undefined && ['repair', 'rangedAttack', 'heal', 'attack'].includes(m.target[1]), this)) {
            mission.creep = this.id;
            if (mission.target[1] === 'rangedAttack') {
                mission.target[1] = 'attack';
            }
            Memory.towers[this.id].mission = mission;
            break;
        }
    }
    p._checkFinishMission = function() {
        if (Memory.towers[this.id].mission) {
            const target = Game.getObjectById(Memory.towers[this.id].mission.target[0])
            if (target === null) {
                return true;
            }
            if (
                (this.store.getUsedCapacity(RESOURCE_ENERGY) === 0) ||
                (['heal', 'repair'].includes(Memory.towers[this.id].mission.target[1]) && target.hits === target.hitsMax) ||
                (Memory.towers[this.id].mission.target[1] === 'attack' && target == null)
            ) {
                return true;
            }
        }
        return false;
    }
    p._finishMission = function() {
        Memory.rooms[this.room.name].missions = Memory.rooms[this.room.name].missions.filter(mission => !(mission.creep === this.id), this);
        Memory.towers[this.id].mission = undefined;
    }
};
module.exports = towerAi;