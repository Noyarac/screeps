const creep_ai = {
    react_to_tick: function() {
        this._check_finish_sub_mission()
        if (this.memory.sub_mission === undefined) {
            if (this.memory.mission === undefined)
                this._get_mission()
            if (this.memory.mission != undefined)
                this.memory.sub_mission = this.memory.mission.targets.pop()
        }
        if (this.memory.sub_mission != undefined)
            this._auto_action(this.memory.sub_mission)
    },
    _auto_action: function(target) {
        if (target === 0) {
            if (this.store.getUsedCapacity(RESOURCE_ENERGY)) {
                target = this.memory.mission.targets.pop();
            } else {
                target = this._find_source_spot();
            }
            if (target != null) this.memory.sub_mission = target
        }
        target = Game.getObjectById(target);
        let action = ()=>{};
        switch (true) {
            case target instanceof StructureRoad:
                action = creep => creep.repair(target);
                break;
            case target instanceof Creep:
                action = creep => creep.rangedAttack(target);
                break;
            case target instanceof Source:
                action = creep => creep.harvest(target);
                break;
            case target instanceof StructureSpawn:
            case target instanceof StructureExtension:
            case target instanceof StructureController:
                action = creep => creep.transfer(target, RESOURCE_ENERGY);
                break;
            case target instanceof ConstructionSite:
                action = creep => creep.build(target);
                break;
            case target === null:
                this._finish_sub_mission();
            default:
                console.log(`${this.name} ne sait pas quoi faire avec ${target}`)
        }
        if (action(this) === ERR_NOT_IN_RANGE)
            this.moveTo(target, {reusePath: 5, visualizePathStyle: {stroke: "#00ff00"}})
    },
    _get_mission: function() {
        const MY_TYPE = this.memory.type;
        for (let mission of Memory.missions.filter(m => m.creep === undefined && m.type === this.memory.type, this)) {
            mission.creep = this.name;
            this.memory.mission = mission;
            break;
        }
    },
    _check_finish_sub_mission: function() {
        const sub_mission = Game.getObjectById(this.memory.sub_mission)
        if (sub_mission) {
            switch (true) {
                case sub_mission instanceof StructureRoad:
                    if (sub_mission.hits === sub_mission.hitsMax || this.store.getFreeCapacity() === 0) this._finish_sub_mission();
                    break;
                case sub_mission instanceof Source:
                    if (sub_mission.energy === 0 || this.store.getFreeCapacity() === 0) this._finish_sub_mission()
                    break;
                case sub_mission instanceof StructureExtension:
                case sub_mission instanceof StructureSpawn:
                    if (this.store.getUsedCapacity() === 0 || sub_mission.store.getFreeCapacity(RESOURCE_ENERGY) === 0) this._finish_sub_mission()
                    break;
                case sub_mission instanceof StructureController:
                    if (this.store.getUsedCapacity() === 0) this._finish_sub_mission()
                    break;
                case sub_mission instanceof ConstructionSite:
                    if (!(Object.values(Game.constructionSites).includes(sub_mission)) || this.store.getUsedCapacity() === 0) this._finish_sub_mission()
                    break;
                case sub_mission === null:
                    this._finish_sub_mission();
                default:
                    break;
            }
        }
    },
    _finish_sub_mission: function() {
        this.memory.sub_mission = undefined;
        if (this.memory.mission.targets.length === 0) {
            Memory.missions = Memory.missions.filter(item => !(item.uid === this.memory.mission.uid && item.creep === this.name));
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