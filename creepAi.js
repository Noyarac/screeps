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
        if (this.memory.subMission === undefined) {
            if (this.memory.mission === undefined) {
                if (this.store.getCapacity() !== null && (this.store.getUsedCapacity(RESOURCE_ENERGY) + this.store.getFreeCapacity() != this.store.getCapacity())) {
                    this.memory.mission = new Mission("unload", 5, "anyCreep", [this.room.find(FIND_STRUCTURES, {structureType: STRUCTURE_STORAGE})[0].id, "transfer", null])
                } else {
                    this._getMission();
                }
            }
            if (this.memory.mission != undefined) {
                if (this.memory.mission.target[1] === 'attack' && this.getActiveBodyparts(ATTACK) === 0 && this.getActiveBodyparts(RANGED_ATTACK) > 0) {
                    this.memory.mission.target[1] = 'rangedAttack';
                }
                if (['transfer', 'repair', 'build', 'upgradeController'].includes(this.memory.mission.target[1]) && this.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
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
        if (this.memory.subMission)
            this._autoAction()
    }
    p._autoAction = function() {
        const target = Game.getObjectById(this.memory.subMission[0]);
        if (this.memory.subMission[1] === "withdraw") {
            for (const resourceType of RESOURCES_ALL) {
                if (target.store.getUsedCapacity(resourceType)) {
                    this.memory.subMission[2] = resourceType;
                    break;
                }
            }
        }
        if (this.memory.subMission[1] === "transfer" && target.structureType === STRUCTURE_STORAGE) {
            for (const resourceType of RESOURCES_ALL) {
                if (this.store.getUsedCapacity(resourceType)) {
                    this.memory.subMission[2] = resourceType;
                    break;
                }
            }
        }
        if (this[this.memory.subMission[1]](target, this.memory.subMission[2]) === ERR_NOT_IN_RANGE)
            this.moveTo(target, {reusePath: 3})
    }
    p._getMission = function() {
        for (let mission of Memory.rooms[this.room.name].missions.filter(m => m.creep === undefined && m.type === this.memory.type && !(this.store.getFreeCapacity() < 50 && ["withdraw", "harvest"].includes(m.target[1])), this)) {
            mission.creep = this.name;
            this.memory.mission = mission;
            break;
        }
    }
    p._checkFinishSubMission = function() {
        const target = Game.getObjectById(this.memory.subMission[0])
        if (target === null) {
            return true;
        }
        if (
            (this.store.getUsedCapacity(this.memory.subMission[2]) === 0 && ['build', 'repair', 'transfer', 'upgradeController'].includes(this.memory.subMission[1])) ||
            (this.memory.subMission[1] === 'harvest' && (target.energy === 0 || this.store.getFreeCapacity() === 0)) ||
            (this.memory.subMission[1] === 'transfer' && target.store.getFreeCapacity(this.memory.subMission[2]) === 0) ||
            (this.memory.subMission[1] === 'repair' && (target.hits === target.hitsMax)) ||
            (this.memory.subMission[1] === 'build' && (!(Object.values(Game.constructionSites).includes(target)))) ||
            (['rangedAttack', 'attack'].includes(this.memory.subMission[1]) && target === null) ||
            (this.memory.subMission[1] === 'withdraw' && (target.store.getUsedCapacity(this.memory.subMission[2]) === 0 || this.store.getFreeCapacity() === 0)) ||
            (this.memory.subMission[1] === 'moveTo' && this.pos.isNearTo(target))
        ) {
            return true;
        }
        return false;
    }
    p._finishSubMission = function() {
        const target = Game.getObjectById(this.memory.subMission[0]); 
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
        const depart = (this.memory.mission.target) ? Game.getObjectById(this.memory.mission.target[0]) : this;
        const targets = (this.memory.mission.target && [STRUCTURE_CONTROLLER, STRUCTURE_CONTAINER].includes(depart.structureType)) ? depart.room.find(FIND_SOURCES_ACTIVE) : [...depart.room.find(FIND_STRUCTURES).filter(struct => {return (struct.structureType === STRUCTURE_CONTAINER) && struct.store.getUsedCapacity(RESOURCE_ENERGY) > 49}), ...depart.room.find(FIND_SOURCES_ACTIVE)]
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
};
module.exports = creepAi;