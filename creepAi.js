module.exports = function() {
    let p = Creep.prototype;
    p.reactToTick = function() {
        try{
            if (this.spawning) { 
                return;
            }
            if (this.mission.isSubMissionOver) {
                this.mission.finishSubMission();
            }
            if (!this.mission.hasSubMission) {
                if (!this.memory.mission) {
                    if (this.store.getCapacity() && this.store.getUsedCapacity(RESOURCE_ENERGY) != this.store.getUsedCapacity()) {
                        if (this.room.name == "W52N9") {
                            this.mission.subMission = ["65b9857ac2f4e4619d0f0298", "transfer", this.room.name];
                        } else {
                            this.mission.subMission = [this.room.find(FIND_MY_STRUCTURES).filter(struct => [STRUCTURE_TERMINAL, STRUCTURE_STORAGE, STRUCTURE_CONTAINER].includes(struct.structureType)).sort((a,b) => (a.structureType < b.structureType) ? 1 : (a.structureType > b.structureType) ? -1 : 0)[0].id, "transfer", this.room.name];
                        }                    } else {
                        this._getMission();
                    }
                }
                if (this.memory.mission) {
                    if (this.memory.mission.subMissionsList.length > 0) {
                        if (['transfer', 'repair', 'build', 'upgradeController'].includes(this.memory.mission.subMissionsList[this.memory.mission.subMissionsList.length - 1][1]) && (this.store.getUsedCapacity(RESOURCE_ENERGY) === 0)) {
                            let sourceSpot = this._findSourceSpot();
                            if (sourceSpot) {
                                this.memory.mission.subMissionsList.push([sourceSpot, (Game.getObjectById(sourceSpot) instanceof Source ) ? 'harvest' : "withdraw", this.room.name, RESOURCE_ENERGY]);
                            }
                        }
                        this.mission.subMission = this.memory.mission.subMissionsList.pop();
                        if (this.mission.subMission[1] === 'attack' && this.getActiveBodyparts(ATTACK) === 0 && this.getActiveBodyparts(RANGED_ATTACK) > 0) {
                            this.mission.subMission[1] = 'rangedAttack';
                        }
                    }
                }
                //  else {
                    // this.mission.subMission = [this.memory.home, "moveTo", undefined, undefined];
                // }
            }
            if (this.mission.hasSubMission) {
                this._autoAction()
            }
        } catch(err) {
            console.log("creepAi, reactToTick: ", err);
        }
    }
    p._autoAction = function() {
        try {
            const actionString = this.memory.subMission[1];
            const target = (this.memory.subMission[0] instanceof Array) ? new RoomPosition(...this.memory.subMission[0]) : Game.getObjectById(this.memory.subMission[0]);  
            if (actionString === "withdraw" && target instanceof Tombstone) {
                for (const resourceType of RESOURCES_ALL) {
                    if (target.store.getUsedCapacity(resourceType) > 0) {
                        this.memory.subMission[3] = resourceType;
                        break;
                    }
                }
            }
            if (actionString === "transfer" && [STRUCTURE_TERMINAL, STRUCTURE_STORAGE, STRUCTURE_CONTAINER, STRUCTURE_FACTORY].includes(target.structureType)) {
                for (const resourceType of RESOURCES_ALL) {
                    if (this.store.getUsedCapacity(resourceType)) {
                        this.memory.subMission[3] = resourceType;
                        break;
                    }
                }
            }
            if (this[actionString](target, (target instanceof RoomPosition) ? undefined : this.memory.subMission[3]) === ERR_NOT_IN_RANGE) {
                this.moveTo(target, {reusePath: 7})
            }
        }
        catch(err) {
            console.log("Error creepAi " + err)
        }
    }
    p._getMission = function() {
        try{
            for (let mission of this.room.missions
                .filter(m => 
                    m.creep == undefined &&
                    (new Function("creep", m.type))(this) &&
                    m.subMissionsList.length > 0 &&
                    !((this.store.getFreeCapacity() / this.store.getCapacity() < 0.3) && ["harverst", "pickup", "withdraw"].includes(m.subMissionsList[m.subMissionsList.length - 1][1]))
                , this)) {
                mission.creep = this.name;
                this.memory.mission = mission;
                break;
            }
        }catch(err) {
            console.log("get mission", err);
        }
    }
    p._findSourceSpot = function () {
        try{
            let depart = this;
            for (i = this.memory.mission.subMissionsList.length -1; i >= 0 ; i--) {
                if (['transfer', 'repair', 'build', 'upgradeController'].includes(this.memory.mission.subMissionsList[i][1])) {
                    depart = Game.getObjectById(this.memory.mission.subMissionsList[i][0]);
                    break;
                }
            }
            if (depart == null) {
                return null;
            }
            const targets = ((depart != this) && [STRUCTURE_CONTROLLER, STRUCTURE_CONTAINER].includes(depart.structureType)) ?
                [...depart.room.find(FIND_MY_STRUCTURES).filter(struct => (struct.structureType === STRUCTURE_LINK) && (struct.memory.type === "receiver") && (struct.store.getUsedCapacity(RESOURCE_ENERGY) > 49)), ...depart.room.find(FIND_SOURCES_ACTIVE)] :
                [...depart.room.find(FIND_STRUCTURES).filter(struct => [STRUCTURE_CONTAINER, STRUCTURE_STORAGE].includes(struct.structureType) && (struct.store.getUsedCapacity(RESOURCE_ENERGY) > 49)), ...depart.room.find(FIND_SOURCES_ACTIVE)];
            const creepId = this.id;
            const closest = depart.pos.findClosestByPath(targets, {filter: source => {
                if (source.pos.findInRange(FIND_HOSTILE_CREEPS, 4).length > 0) {return false;}
                const AROUND = [-1, 0, 1];
                for (let x of AROUND) {
                    for (let y of AROUND) {
                        if (source.room.lookAt(source.pos.x + x, source.pos.y + y).reduce((walkable, obstactle) => {return walkable && !((OBSTACLE_OBJECT_TYPES.includes(obstactle.type) && !((obstactle.type === "creep")?obstactle.creep.id === creepId:false)) || (obstactle.terrain === "wall"))}, true)) {
                            return true
                        }
                    }
                }
                return false;
            }});
            return (closest != null) ? closest.id : null 
        }catch(err){
            console.log("find source spot", err)
        }
    }
    Object.defineProperty(p, "mission", {
        get: function() {
            this._mission = this._mission || {
                thisCreep: this,
                finishSubMission: function() {
                    try{
                        this.thisCreep.memory.scared = undefined;
                        this.subMission = undefined;
                        if (this.thisCreep.memory.mission) {
                            if (this.thisCreep.memory.mission.subMissionsList.length == 0) {
                                Game.rooms[this.thisCreep.memory.mission.room].missions = Game.rooms[this.thisCreep.memory.mission.room].missions.filter(mission => !(mission.creep === this.thisCreep.name), this);
                                this.thisCreep.memory.mission = undefined
                            } else {
                                this.subMission = this.thisCreep.memory.mission.subMissionsList.pop();
                            }
                        }
                    }catch(err){
                        console.log("finish sub mission", err);
                    }
                }
            };
            Object.defineProperty(this._mission, "isSubMissionOver", {
                configurable: true,
                get: function() {
                    if (!this.hasSubMission) {
                        return true
                    }
                    const actionString = this.subMission[1];
                    const target = (this.subMission[0] instanceof Array) ? new RoomPosition(...this.subMission[0]) : Game.getObjectById(this.subMission[0]);  
                    if (target === null) {
                        return true;
                    }
                    const targetClass = target.constructor;
                    const targetIsTombstone = targetClass === Tombstone;
                    const targetIsContainer = targetClass === StructureContainer;
                    const targetIsFactory = targetClass === StructureFactory;
                    const creepStoreIsFull = this.thisCreep.store.getFreeCapacity() === 0;
                    if (
                        (this.thisCreep.store.getUsedCapacity(this.subMission[3]) == 0 && !(targetIsTombstone || targetIsContainer) && ['build', 'repair', 'transfer', 'upgradeController'].includes(actionString)) ||
                        (actionString === 'harvest' && (target.energy === 0 || creepStoreIsFull)) ||
                        (actionString === 'transfer' && !targetIsContainer && (target.store.getFreeCapacity(this.subMission[3]) === 0 || this.thisCreep.store.getUsedCapacity(this.subMission[3]) == 0)) ||
                        (actionString === 'transfer' && (targetIsContainer || targetIsFactory) && (target.store.getFreeCapacity(this.subMission[3]) === 0 || this.thisCreep.store.getUsedCapacity(this.subMission[3]) === 0)) ||
                        (actionString === 'withdraw' && !targetIsTombstone && (target.store.getUsedCapacity(this.subMission[3]) === 0 || creepStoreIsFull)) ||
                        (actionString === 'withdraw' && targetIsTombstone && (target.store.getUsedCapacity() === 0 || creepStoreIsFull)) ||
                        (actionString === 'pickup' && (target.amount === 0 || creepStoreIsFull)) ||
                        (actionString === 'dismantle' && creepStoreIsFull) ||
                        (actionString === 'repair' && target.hits === target.hitsMax) ||
                        (actionString === 'build' && !Object.values(Game.constructionSites).includes(target)) ||
                        (actionString === 'moveTo' && this.thisCreep.pos.isNearTo(target)) ||
                        (actionString === 'reserveController' && target.owner != undefined)
                    ) {
                        return true;
                    }
                    return false;
                }
            })
            Object.defineProperty(this._mission, "hasSubMission", {
                configurable: true,
                get: function() {
                    return this.subMission != undefined
                }
            })
            Object.defineProperty(this._mission, "subMission", {
                configurable: true,
                get: function() {
                    return this.thisCreep.memory.subMission;
                },
                set: function(value) {
                    this.thisCreep.memory.subMission = value;
                }
            })
            return this._mission;
        }
    })
}