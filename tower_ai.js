const tower_ai = {
    memory: Memory.towers[this.id],
    react_to_tick: function() {
        if (!Memory.towers[this.id]) {
            Memory.towers[this.id] = {id: this.id, mission: undefined};
        }
        if (this._check_finish_mission()) {
            this._finish_mission();
        }
        if (Memory.towers[this.id].mission === undefined && this.store.getUsedCapacity(RESOURCE_ENERGY) >= 10) {
            this._get_mission();
        }
        if (Memory.towers[this.id].mission != undefined) {
            const target = Game.getObjectById(Memory.towers[this.id].mission.target[0]);
            this[Memory.towers[this.id].mission.target[1]](target, Memory.towers[this.id].mission.target[2])
        }
    },
    _get_mission: function() {
        for (let mission of Memory.missions.filter(m => m.creep === undefined && (
            m.target[1] === 'repair' ||
            m.target[1] === 'rangedAttack' ||
            m.target[1] === 'heal'
            ), this)) {
            mission.creep = this.id;
            Memory.towers[this.id].mission = mission;
            break;
        }
    },
    _check_finish_mission: function() {
        if (Memory.towers[this.id].mission) {
            const target = Game.getObjectById(Memory.towers[this.id].mission.target[0])
            if (target === null) {
                return true;
            }
            if (
                (this.store.getUsedCapacity(RESOURCE_ENERGY) === 0) ||
                (Memory.towers[this.id].mission.target[1] === 'heal' && target.hits === target.hitsMax) ||
                (Memory.towers[this.id].mission.target[1] === 'repair' && target.hits === target.hitsMax) ||
                (Memory.towers[this.id].mission.target[1] === 'rangedAttack' && target === null)
            ) {
                return true;
            }
        }
        return false;
    },
    _finish_mission: function() {
        Memory.missions = Memory.missions.filter(mission => !(mission.creep === this.id), this);
        Memory.towers[this.id].mission = undefined
    },

}
module.exports = tower_ai;