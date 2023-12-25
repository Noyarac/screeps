const Mission = require("./Mission");

/**
 * @type {{update_list: function(): void, clear_all_mission: function(): void}}
 */
const mission_center = {
    clear_all_mission: function() {
        Object.values(Game.creeps).forEach(creep => {creep.memory.mission = undefined; creep.memory.sub_mission = undefined});
        Memory.missions = undefined;
    },
    update_list: function () {
        this._menace();
        this._spawn_needs();
        this._controller_needs();
        this._construction_needs();
        this._repair_needs();
        Memory.missions = Memory.missions.sort((a, b) => b.priority - a.priority);
    },
    _repair_needs: function() {
        for (const room of Object.values(Game.rooms)) {
            for (const road of room.find(FIND_STRUCTURES).filter(structure => {return structure.structureType === STRUCTURE_ROAD && structure.hits < structure.hitsMax})) {
                const name = `repair ${road.id}`;
                const mission = new Mission(name, 1, "worker", [road.id, 'repair'], true);
                if (Memory.missions.filter(mission => mission.name === name && mission.creep === undefined).length === 0) {
                    Memory.missions.push(mission);
                }
            }
        }
    },
    _menace: function() {
        for (const spawn of Object.values(Game.spawns)) {
            let targets = spawn.room.find(FIND_HOSTILE_CREEPS);
            for (const target of targets) {
                const name = `fight ${target.id}`;
                if (Memory.missions.filter(mission => mission.name === name && mission.creep === undefined).length === 0) {
                    Memory.missions.push(new Mission(name, 4, "fighter", [target.id, 'rangedAttack']))
                }
            }
            targets = spawn.room.find(FIND_HOSTILE_STRUCTURES);
            for (const target of targets) {
                const name = `fight ${target.id}`;
                if (Memory.missions.filter(mission => mission.name === name && mission.creep === undefined).length === 0) {
                    Memory.missions.push(new Mission(name, 3, "fighter", [target.id, 'rangedAttack']))
                }
            }
        }
    },
    _construction_needs: function() {
        for (const construction_site of Object.values(Game.constructionSites)) {
            const name = `build ${construction_site.id}`;
            const mission = new Mission(name, 1, "worker", [construction_site.id, 'build'], true);
            if (Memory.missions.filter(mission => {return mission.name === name && mission.creep === undefined}).length === 0) {
                Memory.missions.push(mission);
            }
        }
    },
    _controller_needs: function () {
        for (const spawn of Object.values(Game.spawns)) {
            const controllers = spawn.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_CONTROLLER}});
            for (const controller of controllers) {
                if (Memory.missions.filter(mission => mission.name === `Controller ${controller.id}` && mission.creep === undefined).length === 0) {
                    Memory.missions.push(new Mission(`Controller ${controller.id}`, 0, "worker", [controller.id, 'upgradeController', RESOURCE_ENERGY], true));
                }
            }
        }
    },
    _spawn_needs: function () {
        const spawns = Object.values(Game.structures).filter(struct =>
            (struct.structureType === STRUCTURE_SPAWN || struct.structureType === STRUCTURE_EXTENSION) && this._still_in_need(struct)
        , this)
        for (const spawn of spawns) {
            let name = `${spawn.name}`;
            let mission = new Mission(name, 2, "worker", [spawn.id, 'transfer', RESOURCE_ENERGY], true);
            if (Memory.missions.filter(mission => mission.name === name && mission.creep === undefined).length === 0)
                Memory.missions.push(mission)
        }
    },
    _still_in_need: function(target){
        let energy_in_progress = 0;
        const missions_in_progress = Memory.missions.filter(mission => ((mission.target === undefined) ? null : mission.target[0]) === target.id && mission.creep != undefined);
        for (const mission of missions_in_progress) {
            if (Game.creeps[mission.creep])
                energy_in_progress += Game.creeps[mission.creep].body.reduce((total, bodyObj) => {total += (bodyObj.type === CARRY) ? 50 : 0; return total}, 0)
        }
        return target.store.getFreeCapacity(RESOURCE_ENERGY) - energy_in_progress > 0;
    }
};

module.exports = mission_center;