const Mission = require("./Mission");
const creepAi = function() {
    let p = Creep.prototype;
    p.reactToTick = function() {
        if (this.spawning) { 
            return;
        }
        if (this.memory.subMission != undefined) {
            if (this._checkFinishSubMission()) {
                this._finishSubMission();
            }
        }
        if (!this.memory.subMission) {
            if (this.memory.mission === undefined) {
                if (this.store.getCapacity() !== null && (this.store.getUsedCapacity(RESOURCE_ENERGY) + this.store.getFreeCapacity() != this.store.getCapacity())) {
                    this.memory.mission = new Mission("unload", 5, "anyCreep", [this.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_STORAGE}})[0].id, "transfer", null])
                } else {
                    this._getMission();
                }
            }
            if (this.memory.mission != undefined) {
                if (this.memory.mission.target) {
                    if (this.memory.mission.target[1] === 'attack' && this.getActiveBodyparts(ATTACK) === 0 && this.getActiveBodyparts(RANGED_ATTACK) > 0) {
                        this.memory.mission.target[1] = 'rangedAttack';
                    }
                    if (['transfer', 'repair', 'build', 'upgradeController'].includes(this.memory.mission.target[1]) && this.store.getUsedCapacity(RESOURCE_ENERGY) === 0 && this.memory.mission.name !== "unload") {
                        let sourceSpot = this._findSourceSpot();
                        if (sourceSpot) {
                            this.memory.subMission = [sourceSpot, (Game.getObjectById(sourceSpot) instanceof Source ) ? 'harvest' : "withdraw", RESOURCE_ENERGY];
                        }
                    } else {
                        this.memory.subMission = this.memory.mission.target;
                        this.memory.mission.target = undefined;
                    }
                }
            }
        }
        if (this.memory.subMission)
            this._autoAction()
    }
    p._autoAction = function() {
        try {
            const actionString = this.memory.subMission[1];
            const target = (this.memory.subMission[0] instanceof Array) ? new RoomPosition(...this.memory.subMission[0]) : Game.getObjectById(this.memory.subMission[0]);  
            if (actionString === "withdraw" && target instanceof Tombstone) {
                for (const resourceType of RESOURCES_ALL) {
                    if (target.store.getUsedCapacity(resourceType) > 0) {
                        this.memory.subMission[2] = resourceType;
                        break;
                    }
                }
            }
            if (actionString === "transfer" && target.structureType === STRUCTURE_STORAGE) {
                for (const resourceType of RESOURCES_ALL) {
                    if (this.store.getUsedCapacity(resourceType)) {
                        this.memory.subMission[2] = resourceType;
                        break;
                    }
                }
            }
            if (this[actionString](target, (target instanceof RoomPosition) ? undefined : this.memory.subMission[2]) === ERR_NOT_IN_RANGE) {
                const dangerousTarget = (target instanceof RoomPosition) ? target : target.pos;
                if (dangerousTarget.findInRange(FIND_HOSTILE_CREEPS, 5).length > 0) {
                    this.say("😨");
                    this.memory.mission.creep = undefined;
                    this.memory.mission = undefined;
                    this.memory.subMission = undefined;
                } else {
                    this.moveTo(target, {reusePath: 7})
                }
            }
        }
        catch(err) {
            console.log("Error creepAi " + err)
        }
    }
    p._getMission = function() {
        // moveTo only for ticksToLive > 1200
        for (let mission of Memory.rooms[this.room.name].missions.filter(m => m.creep === undefined && m.type === this.memory.type && !(this.ticksToLive < 1200 && ["moveTo"].includes(m.target[1])) && !(this.store.getFreeCapacity() < 50 && ["withdraw", "harvest"].includes(m.target[1])), this)) {
            mission.creep = this.name;
            this.memory.mission = mission;
            break;
        }
    }
    p._checkFinishSubMission = function() {
        const actionString = this.memory.subMission[1]; 
        const target = (this.memory.subMission[0] instanceof Array) ? new RoomPosition(...this.memory.subMission[0]) : Game.getObjectById(this.memory.subMission[0]);  
        if (target === null) {
            return true;
        }
        if (
            (this.store.getUsedCapacity(this.memory.subMission[2]) === 0 && !(target instanceof Tombstone || target instanceof StructureContainer) && ['build', 'repair', 'transfer', 'upgradeController'].includes(actionString)) ||
            (actionString === 'moveTo' && this.pos.isNearTo(target)) ||
            (actionString === 'reserveController' && (target.owner != undefined)) ||
            (actionString === 'harvest' && (target.energy === 0 || this.store.getFreeCapacity() === 0)) ||
            (actionString === 'pickup' && (target.amount === 0 || this.store.getFreeCapacity() === 0)) ||
            (actionString === 'transfer' && (target instanceof StructureContainer) && (target.store.getFreeCapacity() === 0 || this.store.getUsedCapacity() === 0)) ||
            (actionString === 'transfer' && !(target instanceof StructureContainer) && target.store.getFreeCapacity(this.memory.subMission[2]) === 0) ||
            (actionString === 'repair' && (target.hits === target.hitsMax)) ||
            (actionString === 'build' && (!(Object.values(Game.constructionSites).includes(target)))) ||
            (['rangedAttack', 'attack'].includes(actionString) && target === null) ||
            (actionString === 'withdraw' && (target instanceof Tombstone) && (target.store.getUsedCapacity() === 0 || this.store.getFreeCapacity() === 0)) ||
            (actionString === 'withdraw' && !(target instanceof Tombstone) && (target.store.getUsedCapacity(this.memory.subMission[2]) === 0 || this.store.getFreeCapacity() === 0))
        ) {
            return true;
        }
        return false;
    }
    p._finishSubMission = function() {
        this.memory.subMission = undefined;
        if (this.memory.mission != undefined) {
            if (this.memory.mission.target === undefined) {
                Memory.rooms[this.room.name].missions = Memory.rooms[this.room.name].missions.filter(mission => !(mission.creep === this.name), this);
                this.memory.mission = undefined
            } else {
                this.memory.subMission = this.memory.mission.target.map(x=>x);
                this.memory.mission.target = undefined;
            }
        }
    }
    p._findSourceSpot = function () {
        try {
            const depart = (this.memory.mission.target) ? Game.getObjectById(this.memory.mission.target[0]) : this;
            if (depart == null) {
                return null;
            }
            const targets = (this.memory.mission.target && [STRUCTURE_CONTROLLER, STRUCTURE_CONTAINER].includes(depart.structureType)) ?
                [...depart.room.find(FIND_MY_STRUCTURES).filter(struct => struct.structureType === STRUCTURE_LINK && struct.memory.type === "receiver" && struct.store.getUsedCapacity(RESOURCE_ENERGY) > 49), ...depart.room.find(FIND_SOURCES_ACTIVE)] :
                [...depart.room.find(FIND_STRUCTURES).filter(struct => [STRUCTURE_CONTAINER, STRUCTURE_STORAGE].includes(struct.structureType) && struct.store.getUsedCapacity(RESOURCE_ENERGY) > 49), ...depart.room.find(FIND_SOURCES_ACTIVE)];
            const creepId = this.id;
            const closest = depart.pos.findClosestByPath(targets, {filter: source => {
                if (source.pos.findInRange(FIND_HOSTILE_CREEPS, 4).length > 0) {return false;}
                const AROUND = [-1, 0, 1];
                for (let x of AROUND) {
                    for (let y of AROUND) {
                        if (source.room.lookAt(source.pos.x + x, source.pos.y + y).reduce((walkable, obstactle) => {return walkable && !((OBSTACLE_OBJECT_TYPES.includes(obstactle.type) && !((obstactle.type === "creep")?obstactle.creep.id === creepId:false)) || obstactle.terrain === "wall")}, true)) {
                            return true
                        }
                    }
                }
                return false;
            }});
            return (closest != null) ? closest.id : null 
        }
        catch(err) {
            console.log("Find source spot " + err);
        }
    }
};
module.exports = creepAi;