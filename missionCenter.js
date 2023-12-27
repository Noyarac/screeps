const Mission = require("./Mission");

const missionCenter = {
    updateList: function(roomName) {
        for (const [a, b, c, d, e] of [
            [FIND_HOSTILE_CREEPS, "rangedAttack", 4, "fighter", null],
            [FIND_HOSTILE_STRUCTURES, "rangedAttack", 3, "fighter", null],
            [FIND_MY_STRUCTURES, "transfer", 2, "worker", struct =>
            (struct.structureType === STRUCTURE_SPAWN || struct.structureType === STRUCTURE_EXTENSION || struct.structureType === STRUCTURE_TOWER) && struct.store.getFreeCapacity(RESOURCE_ENERGY)],
            [FIND_STRUCTURES, "transfer", 2, "worker", struct =>
            struct.structureType === STRUCTURE_CONTAINER && struct.store.getFreeCapacity(RESOURCE_ENERGY)],
            [FIND_MY_CONSTRUCTION_SITES, "build", 1, "worker", null],
            [FIND_STRUCTURES, "repair", 1, "worker", struct => ([STRUCTURE_ROAD, STRUCTURE_CONTAINER].includes(struct.structureType)) && (struct.hitsMax - struct.hits > 0)],
            [FIND_MY_STRUCTURES, "repair", 1, "worker", struct => struct.hitsMax - struct.hits > 0],
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
            const missionName = `${actionString} ${target.id}`;
            if (Memory.rooms[roomName].missions.filter(mission => mission.name === missionName && mission.creep === undefined).length === 0 && this._stillInNeed(roomName, missionName, target, actionString)) {                
                Memory.rooms[roomName].missions.push(new Mission(missionName, priority, creepType, [target.id, actionString, resource]))
            }
        }
    },
    _stillInNeed: function(roomName, missionName, target, actionString) {
        if (!["transfer", "build"].includes(actionString)) {
            return true;
        }
        let energyComingSoon = Memory.rooms[roomName].missions
        .filter(mission => mission.name == missionName && mission.creep != null)
        .reduce((total, mission) => {
            if (Game.creeps[mission.creep]) {
                return total + Game.creeps[mission.creep].store.getUsedCapacity(RESOURCE_ENERGY)
            }
        }, 0);
        if (actionString == "transfer") {
            return target.store.getFreeCapacity(RESOURCE_ENERGY) - energyComingSoon > 0;
        }
        if (actionString == "build") {
            const constructionSite = target; 
            return constructionSite.progressTotal - constructionSite.progress - energyComingSoon > 0;
        }
        return true;
    }
};

module.exports = missionCenter;