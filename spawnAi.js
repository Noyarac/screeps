const spawnAi = function() {
    let p = StructureSpawn.prototype;
    p.reactToTick = function() {
        if (this.memory.targetedMaxCreep === undefined) {
            this.memory.targetedMaxCreep = this.estimateMaxCreep();
        }
        const maxCreep = this.memory.targetedMaxCreep;
        const countWorkers = this._countCreeps("worker");
        if (this.room.energyAvailable >= 1200 && countWorkers < maxCreep)
            this.spawnCreep([
                ...new Array(6).fill(WORK), 
                ...new Array(6).fill(CARRY), 
                ...new Array(6).fill(MOVE)
            ], Game.time, {memory: {type: "worker"}})
        if (this.room.energyAvailable >= 800 && countWorkers < maxCreep)
            this.spawnCreep([
                ...new Array(4).fill(WORK), 
                ...new Array(4).fill(CARRY), 
                ...new Array(4).fill(MOVE)
            ], Game.time, {memory: {type: "worker"}})
        if (this.room.energyAvailable >= 550 && countWorkers < maxCreep)
            this.spawnCreep([
                ...new Array(3).fill(WORK), 
                ...new Array(2).fill(CARRY), 
                ...new Array(3).fill(MOVE)
            ], Game.time, {memory: {type: "worker"}})
        if (this.room.energyAvailable >= 300 && countWorkers < maxCreep)
            this.spawnCreep([
                ...new Array(1).fill(WORK), 
                ...new Array(2).fill(CARRY), 
                ...new Array(2).fill(MOVE)
            ], Game.time, {memory: {type: "worker"}})
        if (this.room.energyAvailable >= 780 && this._countCreeps("fighter") < 2)
            this.spawnCreep([
                ...new Array(5).fill(TOUGH),
                ...new Array(6).fill(ATTACK), 
                ...new Array(5).fill(MOVE)
            ], Game.time, {memory: {type: "fighter"}})
    }
    p.estimateMaxCreep = function () {
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
    }
    p._countCreeps = function(type) {
        const ROOM_NAME = this.room.name;
        const spwng = (this.spawning === null) ? 0 : 1;
        return Object.values(Game.creeps).filter(creep => creep.room.name === ROOM_NAME && creep.memory.type === type).length + spwng
    }
};

module.exports = spawnAi;