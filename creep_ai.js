const creep_ai = {
    react_to_tick: function() {
        if (this.memory.sub_mission != undefined) {
            if (this._check_finish_sub_mission()) {
                this._finish_sub_mission();
            }
        }
        if (this.memory.sub_mission === undefined) {
            if (this.memory.mission === undefined) {
                this._get_mission();
            }
            if (this.memory.mission != undefined) {
                if (this.memory.mission.need_energy && this.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
                    this.memory.sub_mission = [this._find_source_spot(), 'harvest', RESOURCE_ENERGY];
                    if (this.memory.sub_mission[0] !== null) {
                        this.memory.mission.need_energy = false;
                    }
                } else {
                    this.memory.sub_mission = this.memory.mission.target;
                    this.memory.mission.target = undefined;
                    this.memory.mission.need_energy = false;
                }
            }
        }
        if (this.memory.sub_mission != undefined)
            this._auto_action()
    },
    _auto_action: function() {
        const target = Game.getObjectById(this.memory.sub_mission[0]);
        if (this[this.memory.sub_mission[1]](target, this.memory.sub_mission[2]) === ERR_NOT_IN_RANGE)
            this.moveTo(target, {reusePath: 5, visualizePathStyle: {stroke: "#00ff00"}})
    },
    _get_mission: function() {
        for (let mission of Memory.missions.filter(m => m.creep === undefined && m.type === this.memory.type, this)) {
            mission.creep = this.name;
            this.memory.mission = mission;
            break;
        }
    },
    _check_finish_sub_mission: function() {
        const target = Game.getObjectById(this.memory.sub_mission[0])
        if (target === null) {
            return true;
        }
        if (
            (this.store.getUsedCapacity(RESOURCE_ENERGY) === 0 && (this.memory.sub_mission[1] === 'build' || this.memory.sub_mission[1] === 'repair' || this.memory.sub_mission[1] === 'transfer' || this.memory.sub_mission[1] === 'upgradeController')) ||
            (this.memory.sub_mission[1] === 'harvest' && (target.energy === 0 || this.store.getFreeCapacity() === 0)) ||
            (this.memory.sub_mission[1] === 'transfer' && target.store.getFreeCapacity(this.memory.sub_mission[2]) === 0) ||
            (this.memory.sub_mission[1] === 'repair' && (target.hits === target.hitsMax)) ||
            (this.memory.sub_mission[1] === 'build' && (!(Object.values(Game.constructionSites).includes(target)))) ||
            (this.memory.sub_mission[1] === 'rangedAttack' && target === null)
        ) {
            return true;
        }
        return false;
    },
    _finish_sub_mission: function() {
        this.memory.sub_mission = undefined;
        if (this.memory.mission.target === undefined) {
            Memory.missions = Memory.missions.filter(mission => !(mission.creep === this.name), this);
            this.memory.mission = undefined
        }
    },
    _find_source_spot: function () {
        const CREEP_ID = this.id;
        const closest = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE, {filter: source => {
            if (source.pos.findInRange(FIND_HOSTILE_CREEPS, 4).length > 0) {return false;}
            const AROUND = [-1, 0, 1];
            for (let x of AROUND) {
                for (let y of AROUND) {
                    if (source.room.lookAt(source.pos.x + x, source.pos.y + y).reduce((walkable, obstactle) => {return walkable && !((OBSTACLE_OBJECT_TYPES.includes(obstactle.type) && !((obstactle.type === "creep")?obstactle.creep.id === CREEP_ID:false)) || obstactle.terrain === "wall")}, true)) {
                        return true
                    }
                }
            }
            return false;
        }});
        return (closest != null) ? closest.id : null 
    }

};
module.exports = creep_ai;