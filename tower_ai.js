const tower_ai = {
    memory: Memory.towers[this.id],
    react_to_tick: function() {
        if (!Object.values(Memory.towers).includes(this)) {
            Memory.towers[this.id] = this;
        }
        if (this.memory.mission === undefined && this.store.getUsedCapacity(RESOURCE_ENERGY) >= 10) {
            this._get_mission();
        }
        if (this.memory.mission != undefined) {
            const target = Game.getObjectById(this.memory.mission.target[0]);
            this[this.memory.mission.target[1]](target, this.memory.mission.target[2])
            if (this._check_finish_mission()) {
                this._finish_mission();
            }
        }
    },
    _get_mission: function() {
        for (let mission of Memory.missions.filter(m => m.creep === undefined && (
            m.target[1] === 'repair' ||
            m.target[1] === 'rangedAttack' ||
            m.target[1] === 'heal'
            ), this)) {
            mission.creep = this.id;
            this.memory.mission = mission;
            break;
        }
    },
    _check_finish_mission: function() {
        const target = Game.getObjectById(this.memory.mission.target[0])
        if (target === null) {
            return true;
        }
        if (
            (this.store.getUsedCapacity(RESOURCE_ENERGY) === 0 && (this.memory.mission.target[1] === 'rangedAttack' || this.memory.mission.target[1] === 'repair' || this.memory.mission.target === 'heal')) ||
            (this.memory.mission.target[1] === 'heal' && target.hits === target.hitsMax) ||
            (this.memory.mission.target[1] === 'repair' && target.hits === target.hitsMax) ||
            (this.memory.mission.target[1] === 'rangedAttack' && target === null)
        ) {
            return true;
        }
        return false;
    },
    _finish_mission: function() {
        Memory.missions = Memory.missions.filter(mission => !(mission.creep === this.name), this);
        this.memory.mission = undefined
    },

}
module.exports = tower_ai;