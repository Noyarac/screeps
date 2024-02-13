module.exports = function() {
    let p = StructureSpawn.prototype;
    p.reactToTick = function() {
        try{
            const workersCount = this._countCreeps("worker");
            if (this.spawning) {
                const creep = Game.creeps[this.spawning.name];
                if (creep.memory.type == "mover") {
                    this.room.sources[creep.memory.sourceIndex][2] = creep.id;
                } else if (creep.memory.type == "harvester") {
                    this.room.sources[creep.memory.sourceIndex][3] = creep.id;
                }
            }
            if (Game.time % 3001 == 0) {
                if (this.room.storage) {
                    if (this.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < 2000) {
                        this.memory.targetedMaxCreep = Math.max(this.memory.targetedMaxCreep - 1, 1);
                    } else if (this.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 10000) {
                        this.memory.targetedMaxCreep = Math.min(this.memory.targetedMaxCreep + 1, 6);
                    }
                }
            }
            if (this._isAllowedToSpawn()) {
                const CREEP_LIFETIME = 1500;
                const BUFFER = 400;
                const PRICE_CAP = 2800
                const spawnDelay = ~~((CREEP_LIFETIME - BUFFER) / (this._countCreeps() + 1));
                this.memory.targetedMaxCreep = this.memory.targetedMaxCreep || this.estimateMaxCreep();
                const creepName = this.room.name + Game.time.toString();
                for (let [index, [sourceId, containerId, moverId, harvesterId]] of this.room.sources.entries()) {
                    const storage = this.room.storage || Game.getObjectById(this.room.memory.temporaryStorage)
                    if (storage && !moverId && containerId) {
                        const partQty = Math.ceil(Math.min(25, storage.pos.findPathTo(Game.getObjectById(containerId)).length * 2 / 5));
                        const status = this.spawnCreep([
                            ...new Array(partQty).fill(CARRY), 
                            ...new Array(Math.ceil(partQty/2)).fill(MOVE)
                        ], creepName, {memory: {type: "mover", home: this.id, sourceIndex: index}});
                        if (status === OK ) {
                            this.memory.ttl = Game.time + spawnDelay;
                            break;
                        } else {
                            console.log(`Error spawning mover creep: ${status}`)
                        }
                    }
                    if (storage && !harvesterId && containerId && moverId) {
                        const status = this.spawnCreep([
                            ...new Array(5).fill(WORK) 
                        ], creepName, {memory: {type: "harvester", home: this.id, sourceId: sourceId, sourceIndex: index}});
                        if (status === OK ) {
                            this.memory.ttl = Game.time + spawnDelay;
                            break;
                        } else {
                            console.log(`Error spawning harvester creep: ${status}`)
                        }
                    }
                }
        
                if (workersCount < this.memory.targetedMaxCreep) {
                    let [workQuantity, carryQuantity, moveQuantity] = Array(3).fill(~~(Math.min(PRICE_CAP, this.room.energyAvailable) / (BODYPART_COST[WORK] + BODYPART_COST[CARRY] + BODYPART_COST[MOVE])));
                    let energyRemaining = Math.min(PRICE_CAP, this.room.energyAvailable) % (BODYPART_COST[WORK] + BODYPART_COST[CARRY] + BODYPART_COST[MOVE]);
                    const extraMove = ~~(energyRemaining / 2 / BODYPART_COST[MOVE]);
                    moveQuantity += extraMove;
                    energyRemaining -= extraMove * BODYPART_COST[MOVE];
                    carryQuantity += ~~(energyRemaining / BODYPART_COST[CARRY]);
                    const status = this.spawnCreep([
                        ...new Array(workQuantity).fill(WORK), 
                        ...new Array(carryQuantity).fill(CARRY), 
                        ...new Array(moveQuantity).fill(MOVE)
                    ], creepName, {memory: {type: "worker", home: this.id}});
                    if (status === OK ) {
                        this.memory.ttl = Game.time + spawnDelay;
                    } else {
                        console.log(`Error spawning worker creep[${workQuantity} * WORK, ${carryQuantity} * CARRY, ${moveQuantity} * MOVE]: ${status}`)
                    }
                }
                // if (this._countCreeps("stealer") < 1) {
                //     const status = this.spawnCreep([
                //         ...new Array(8).fill(CARRY), 
                //         ...new Array(8).fill(MOVE)
                //     ], creepName, {memory: {type: "stealer", home: this.id}});
                //     if (status === OK ) {
                //         this.memory.ttl = Game.time + spawnDelay;
                //     } else {
                //         console.log(`Error spawning stealer creep: ${status}`)
                //     }

                // }
                // const targetedLinkOpQuantity = this.room.find(FIND_MY_STRUCTURES).filter(struct => struct.structureType === STRUCTURE_LINK && struct.memory.type === "sender").length;
                // if (this._countCreeps("linkOp") < targetedLinkOpQuantity && this.room.energyAvailable >= (BODYPART_COST[WORK] * 3 + BODYPART_COST[CARRY] * 1 + BODYPART_COST[MOVE] * 2)) {
                //     let status = this.spawnCreep([
                //         ...new Array(3).fill(WORK), 
                //         ...new Array(1).fill(CARRY), 
                //         ...new Array(2).fill(MOVE)
                //     ], creepName, {memory: {type: "linkOp", home: this.id}});
                //     if (status === OK ) {
                //         this.memory.ttl = Game.time + spawnDelay;
                //     } else {
                //         console.log(`Error spawning linkOp creep: ${status}`)
                //     }
                // }
                if (this._countCreeps("fighter") < 1  && this.room.energyAvailable >= (BODYPART_COST[TOUGH] * 8 + BODYPART_COST[MOVE] * 8 + BODYPART_COST[ATTACK] * 4)) {
                    let status = this.spawnCreep([
                            ...new Array(8).fill(TOUGH),
                            ...new Array(8).fill(MOVE),
                            ...new Array(4).fill(ATTACK) 
                        ], creepName, {memory: {type: "fighter", home: this.id}});
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
        return (Game.time > this.memory.ttl && this.room.energyAvailable >= SPAWN_ENERGY_START) ||
            (this._countCreeps("worker") == 0 && this.room.energyAvailable >= SPAWN_ENERGY_START) ||
            (this.room.energyAvailable == this.room.energyCapacityAvailable)
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
        let roomCreeps = _.filter(Game.creeps, creep => creep.memory.home === this.id);
        if (type) {
            roomCreeps = _.filter(roomCreeps, creep => creep.memory.type === type);
        }
        return roomCreeps.length + ((this.spawning) ? 1 : 0);
    }
}