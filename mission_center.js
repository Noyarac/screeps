const Mission = require("./Mission");

/**
 * @type {{update_list: function(): void, _spawn_needs: function(): void}}
 */
const mission_center = {
    update_list: function () {
        this._menace();
        this._spawn_needs();
        this._controller_needs();
        this._construction_needs();
        Memory.missions = Memory.missions.sort((a, b) => b.priority - a.priority);
    },
    _menace: function() {
        for (const spawn of Object.values(Game.spawns)) {
            let targets = spawn.room.find(FIND_HOSTILE_CREEPS);
            for (const target of targets) {
                const uid = `fight ${target.id}`;
                if (Memory.missions.filter(mission => mission.uid === uid && mission.creep === undefined).length === 0) {
                    Memory.missions.push(new Mission(uid, 4, "fighter", [target.id]))
                }
            }
            targets = spawn.room.find(FIND_HOSTILE_STRUCTURES);
            for (const target of targets) {
                const uid = `fight ${target.id}`;
                if (Memory.missions.filter(mission => mission.uid === uid && mission.creep === undefined).length === 0) {
                    Memory.missions.push(new Mission(uid, 3, "fighter", [target.id]))
                }
            }
        }
    },
    _construction_needs: function() {
        for (const construction_site of Object.values(Game.constructionSites)) {
            const uid = `build ${construction_site.id}`;
            const mission = new Mission(uid, 1, "worker", [construction_site.id, 0]);
            if (Memory.missions.filter(mission => mission.uid === uid && mission.creep === undefined).length === 0) {
                Memory.missions.push(mission);
            }
        }
    },
    _controller_needs: function () {
        for (const spawn of Object.values(Game.spawns)) {
            const controllers = spawn.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_CONTROLLER}});
            for (const controller of controllers) {
                if (Memory.missions.filter(mission => mission.uid === controller.id && mission.creep === undefined).length === 0) {
                    Memory.missions.push(new Mission(controller.id, 0, "worker", [controller.id, 0]));
                }
            }
        }
    },
    _spawn_needs: function () {
        const spawns = Object.values(Game.structures).filter(struct =>
            (struct.structureType === STRUCTURE_SPAWN || struct.structureType === STRUCTURE_EXTENSION) && this._still_in_need(struct)
        , this)
        for (const spawn of spawns) {
            let uid = `${spawn.name}`;
            let mission = new Mission(uid, 2, "worker", [spawn.id, 0]);
            if (Memory.missions.filter(mission => mission.uid === uid && mission.creep === undefined).length === 0)
                Memory.missions.push(mission)
        }
    },
    _still_in_need: function(target){
        let energy_in_progress = 0;
        const missions_in_progress = Memory.missions.filter(mission => mission.targets[0] === target.id && mission.creep != undefined);
        for (const mission of missions_in_progress) {
            if (Game.creeps[mission.creep])
                energy_in_progress += Game.creeps[mission.creep].body.reduce((total, bodyObj) => {total += (bodyObj.type === CARRY) ? 50 : 0; return total}, 0)
        }
        return target.store.getFreeCapacity(RESOURCE_ENERGY) - energy_in_progress > 0;
    },
    _find_source_spot: function (struct) {
        const AROUND = [-1, 0, 1];
        const sources = struct.room.find(FIND_SOURCES_ACTIVE).filter(source => source.pos.findInRange(FIND_HOSTILE_CREEPS, 4).length === 0);
        for (const source of sources) {
            for (let x of AROUND) {
                for (let y of AROUND) {
                    if (source.room.lookAt(source.pos.x + x, source.pos.y + y).reduce((walkable, obstactle) => walkable && !(OBSTACLE_OBJECT_TYPES.includes(obstactle.type) || obstactle.terrain === "wall"), true))
                        return [source.id, x, y]
                }
            }
        }
        return [null, null, null];
    }
};

module.exports = mission_center;