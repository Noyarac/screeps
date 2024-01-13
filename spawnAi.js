const spawnAi = function() {
    let p = StructureSpawn.prototype;
    p.reactToTick = function() {
        try{
            const workersCount = this._countCreeps("worker");
            if (this._isAllowedToSpawn()) {
                const CREEP_LIFETIME = 1500;
                const BUFFER = 100 ;
                const spawnDelay = ~~((CREEP_LIFETIME - BUFFER) / this._countCreeps());
                this.memory.targetedMaxCreep = this.memory.targetedMaxCreep || this.estimateMaxCreep();
                if (workersCount < this.memory.targetedMaxCreep) {
                    let [workQuantity, carryQuantity, moveQuantity] = Array(3).fill(~~(this.room.energyAvailable / (BODYPART_COST[WORK] + BODYPART_COST[CARRY] + BODYPART_COST[MOVE])));
                    let energyRemaining = this.room.energyAvailable % (BODYPART_COST[WORK] + BODYPART_COST[CARRY] + BODYPART_COST[MOVE]);
                    const extraMove = ~~(energyRemaining / 2 / BODYPART_COST[MOVE]);
                    moveQuantity += extraMove;
                    energyRemaining -= extraMove * BODYPART_COST[MOVE];
                    carryQuantity += ~~(energyRemaining / BODYPART_COST[CARRY]);
                    const status = this.spawnCreep([
                        ...new Array(workQuantity).fill(WORK), 
                        ...new Array(carryQuantity).fill(CARRY), 
                        ...new Array(moveQuantity).fill(MOVE)
                    ], this.room.name + Game.time.toString(), {memory: {type: "worker"}});
                    if (status === OK ) {
                        this.memory.ttl = Game.time + spawnDelay;
                    } else {
                        console.log(`Error spawning worker creep[${workQuantity} * WORK, ${carryQuantity} * CARRY, ${moveQuantity} * MOVE]: ${status}`)
                    }
                }
                const targetedLinkOpQuantity = this.room.find(FIND_MY_STRUCTURES).filter(struct => struct.structureType === STRUCTURE_LINK && struct.memory.type === "sender").length;
                if (this._countCreeps("linkOp") < targetedLinkOpQuantity && this.room.energyAvailable >= (BODYPART_COST[WORK] * 3 + BODYPART_COST[CARRY] * 1 + BODYPART_COST[MOVE] * 2)) {
                    let status = this.spawnCreep([
                        ...new Array(3).fill(WORK), 
                        ...new Array(1).fill(CARRY), 
                        ...new Array(2).fill(MOVE)
                    ], this.room.name + Game.time.toString(), {memory: {type: "linkOp"}});
                    if (status === OK ) {
                        this.memory.ttl = Game.time + spawnDelay;
                    } else {
                        console.log(`Error spawning linkOp creep: ${status}`)
                    }
                }
                if (this._countCreeps("fighter") < 1  && this.room.energyAvailable >= (BODYPART_COST[TOUGH] * 8 + BODYPART_COST[MOVE] * 8 + BODYPART_COST[ATTACK] * 4)) {
                    let status = this.spawnCreep([
                            ...new Array(8).fill(TOUGH),
                            ...new Array(8).fill(MOVE),
                            ...new Array(4).fill(ATTACK) 
                        ], this.room.name + str(Game.time), {memory: {type: "fighter"}});
                    if (status === OK ) {
                        this.memory.ttl = Game.time + spawnDelay;
                    } else {
                        console.log(`Error spawning fighter creep: ${status}`)
                    }
                }
            }
        }catch(err){
            console.log("spawnAi reactToTick " + err);
        }
    }
    p._isAllowedToSpawn = function() {
        return [
            Game.time > this.memory.ttl,
            workersCount === 0 && this.room.energyAvailable >= SPAWN_ENERGY_START,
        ].some(x => x)
    }
    p.estimateMaxCreep = function () {
        return Math.ceil(this.room.find(FIND_SOURCES_ACTIVE).reduce((results, source) => {
            for (let x of [-1, 0, 1]) {
                for (let y of [-1, 0, 1]) {
                    results += (source.room.lookAt(source.pos.x + x, source.pos.y + y).reduce((walkable, obstacle) => {
                        return walkable && !(OBSTACLE_OBJECT_TYPES.filter(obj => !["creep", "powerCreep"].includes(obj)).includes(obstacle.type) || obstacle.terrain === "wall")
                    }, true)) ? 1 : 0
                }
            }
            return results    
        }, 0)*1.5);
    }
    p._countCreeps = function(type = undefined) {
        let roomCreeps = _.filter(Game.creeps, creep => creep.room.name === this.room.name);
        if (type) {
            roomCreeps = _.filter(roomCreeps, creep => creep.memory.type === type);
        }
        return roomCreeps.length + ((this.spawning) ? 1 : 0);
    }
};

module.exports = spawnAi;
