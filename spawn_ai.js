const spawn_ai = {
    react_to_tick: function() {
        if (this.memory.targeted_max_creep === undefined) {
            this.memory.targeted_max_creep = this.estimate_max_creep();
        }
        const max_creep = this.memory.targeted_max_creep;
        const count_workers = this._count_creeps("worker");
        if (this.room.energyAvailable >= 500 && count_workers < max_creep)
            this.spawnCreep([
                ...new Array(3).fill(WORK), 
                ...new Array(2).fill(CARRY), 
                ...new Array(3).fill(MOVE)
            ], Game.time, {memory: {type: "worker"}})
        if (this.room.energyAvailable >= 300 && count_workers < max_creep)
            this.spawnCreep([
                ...new Array(1).fill(WORK), 
                ...new Array(2).fill(CARRY), 
                ...new Array(2).fill(MOVE)
            ], Game.time, {memory: {type: "worker"}})
        if (this.room.energyAvailable >= 900 && this._count_creeps("fighter") <= 3)
            this.spawnCreep([
                ...new Array(10).fill(TOUGH),
                ...new Array(5).fill(RANGED_ATTACK), 
                ...new Array(1).fill(MOVE)
            ], Game.time, {memory: {type: "fighter"}})
    },
    estimate_max_creep: function () {
        return Math.ceil(this.room.find(FIND_SOURCES_ACTIVE).reduce((results, source) => {
            for (let x of [-1, 0, 1]) {
                for (let y of [-1, 0, 1]) {
                    results += (source.room.lookAt(source.pos.x + x, source.pos.y + y).reduce((walkable, obstacle) => {
                        return walkable && !(OBSTACLE_OBJECT_TYPES.filter(obj => !(obj === "creep" || obj === "powerCreep")).includes(obstacle.type) || obstacle.terrain === "wall")
                    }, true)) ? 1 : 0
                }
            }
            return results    
        }, 0)*1.5);
    },
    _count_creeps: function(type) {
        const ROOM_NAME = this.room.name;
        const spwng = (this.spawning === null) ? 0 : 1;
        return Object.values(Game.creeps).filter(creep => creep.room.name === ROOM_NAME && creep.memory.type === type).length + spwng
    }
};

module.exports = spawn_ai;