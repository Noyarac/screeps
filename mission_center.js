const Mission = require("./Mission");

const mission_center = {
    update_list: function(roomName) {
        for (const [a, b, c, d, e] of [
            [FIND_HOSTILE_CREEPS, "rangedAttack", 4, "fighter", null],
            [FIND_HOSTILE_STRUCTURES, "rangedAttack", 3, "fighter", null],
            [FIND_MY_STRUCTURES, "transfer", 2, "worker", struct =>
            (struct.structureType === STRUCTURE_SPAWN || struct.structureType === STRUCTURE_EXTENSION || struct.structureType === STRUCTURE_TOWER || struct.structureType === STRUCTURE_CONTAINER) && struct.store.getFreeCapacity(RESOURCE_ENERGY)],
            [FIND_MY_CONSTRUCTION_SITES, "build", 1, "worker", null],
            [FIND_STRUCTURES, "upgradeController", 0, "worker", structure => structure.structureType === STRUCTURE_CONTROLLER]
        ]) {
            this._createMission(roomName, a, b, c, d, e);
        }

        Memory.rooms[roomName].missions = Memory.rooms[roomName].missions.sort((a, b) => b.priority - a.priority);
    },
    _createMission: function(roomName, FIND_, actionString, priority, creepType, filterFunction = null, resource = RESOURCE_ENERGY) {
        let targets = Game.rooms[roomName].find(FIND_);
        if (filterFunction) targets = targets.filter(filterFunction, this)
        for (const target of targets) {
            const name = `${actionString} ${target.id}`;
            if (Memory.rooms[roomName].missions.filter(mission => mission.name === name && mission.creep === undefined).length === 0) {
                Memory.rooms[roomName].missions.push(new Mission(name, priority, creepType, [target.id, actionString, resource]))
            }
        }
    }
};

module.exports = mission_center;